"""
fetch-roadmap-data.py
---------------------
Reads the SIT roadmap Google Sheet using saved OAuth2 credentials
(same pattern as GDrive.py / GDriveAPI) and writes:
  - roadmap-data.json   : current milestones with etcDelta fields
  - roadmap-history.json: running log of every ETA change ever detected

Usage:
    python3 fetch-roadmap-data.py

Run this whenever the sheet changes (or let the cron job do it hourly), then:
    git add roadmap-data.json roadmap-history.json && git commit -m "Update roadmap data" && git push
"""

import pickle
import os
import json
import re
from datetime import datetime, timedelta

SHEET_URL    = "https://docs.google.com/spreadsheets/d/1UyHzvdtqED7Rz0fDtsvms0V7e_9kcnaDbYKaSaEO5IM/"
SHEET_GID    = 539542201
SCOPES       = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]

_DIR          = os.path.dirname(os.path.abspath(__file__))
TOKEN_PATH    = os.path.join(_DIR, "secrets", "token.pickle")
SECRET_PATH   = os.path.join(_DIR, "secrets", "uploadSecret.json")
OUTPUT_PATH   = os.path.join(_DIR, "roadmap-data.json")
HISTORY_PATH  = os.path.join(_DIR, "roadmap-history.json")
BASELINE_PATH = os.path.join(_DIR, "roadmap-baseline.json")

# Keep at most this many history entries in the JSON file
MAX_HISTORY   = 500


# ── credentials (mirrors GDriveAPI._get_credentials) ─────────────────────────

def get_credentials():
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow

    creds = None
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "rb") as f:
            creds = pickle.load(f)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token…")
            creds.refresh(Request())
        else:
            print("No valid token found — starting OAuth2 login flow…")
            flow = InstalledAppFlow.from_client_secrets_file(SECRET_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, "wb") as f:
            pickle.dump(creds, f)
        print("Token saved to secrets/token.pickle")

    return creds


# ── column / date helpers ─────────────────────────────────────────────────────

def find_col(headers, names):
    for name in names:
        for i, h in enumerate(headers):
            if h.strip().lower() == name.lower():
                return i
    return -1


def parse_etc(raw):
    """Normalise date strings to YYYY-MM-DD (mirrors parseEtc in sit-roadmap-loader.js)."""
    s = str(raw).strip()
    if not s:
        return ""
    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        return s
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", s)
    if m:
        return f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"
    if re.match(r"^\d+(\.\d+)?$", s):
        base = datetime(1899, 12, 30)
        return (base + timedelta(days=int(float(s)))).strftime("%Y-%m-%d")
    for fmt in ("%b %d, %Y", "%d-%b-%y", "%B %d, %Y"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except Exception:
            pass
    return ""


def date_delta_days(old_date, new_date):
    """Return (new - old) in calendar days. Both are YYYY-MM-DD strings."""
    try:
        d_old = datetime.strptime(old_date, "%Y-%m-%d")
        d_new = datetime.strptime(new_date, "%Y-%m-%d")
        return (d_new - d_old).days
    except Exception:
        return None


def normalize_status(raw):
    s = str(raw).strip().lower()
    if not s:
        return "unspecified"
    if "complete" in s and "in progress" not in s:
        return "complete"
    if "block" in s:
        return "blocked"
    if "not start" in s:
        return "notstarted"
    if "progress" in s:
        return "progress"
    return "unspecified"


# ── ETA history helpers ───────────────────────────────────────────────────────

def load_previous_data():
    """Load existing roadmap-data.json; return dict keyed by label→date."""
    if not os.path.exists(OUTPUT_PATH):
        return {}
    try:
        with open(OUTPUT_PATH) as f:
            data = json.load(f)
        prev = {}
        for item in data.get("l1", []) + data.get("l2", []):
            label = item.get("label", "").strip()
            if label:
                prev[label] = {
                    "date":  item.get("date", ""),
                    "st":    item.get("st", ""),
                    "level": item.get("level", ""),
                }
        return prev
    except Exception:
        return {}


def load_history():
    """Load existing roadmap-history.json or return empty structure."""
    if not os.path.exists(HISTORY_PATH):
        return {"changes": []}
    try:
        with open(HISTORY_PATH) as f:
            return json.load(f)
    except Exception:
        return {"changes": []}


def detect_changes(prev, new_items, level, now_iso):
    """
    Compare new_items against prev snapshot.
    Returns list of change dicts for any ETA or status shifts.
    """
    changes = []
    for item in new_items:
        label = item["label"]
        new_date = item["date"]
        new_st   = item["st"]
        p = prev.get(label)

        if p is None:
            # Brand new milestone appeared
            if new_date:
                changes.append({
                    "label":       label,
                    "ws":          item["ws"],
                    "level":       level,
                    "change_type": "new_milestone",
                    "old_date":    None,
                    "new_date":    new_date,
                    "delta_days":  None,
                    "old_status":  None,
                    "new_status":  new_st,
                    "changed_at":  now_iso,
                })
            continue

        old_date = p["date"]
        old_st   = p["st"]
        eta_changed    = old_date != new_date and (old_date or new_date)
        status_changed = old_st   != new_st

        if eta_changed:
            delta = date_delta_days(old_date, new_date) if (old_date and new_date) else None
            changes.append({
                "label":       label,
                "ws":          item["ws"],
                "level":       level,
                "change_type": "eta_change",
                "old_date":    old_date or None,
                "new_date":    new_date or None,
                "delta_days":  delta,
                "old_status":  old_st,
                "new_status":  new_st,
                "changed_at":  now_iso,
            })

        if status_changed and not eta_changed:
            changes.append({
                "label":       label,
                "ws":          item["ws"],
                "level":       level,
                "change_type": "status_change",
                "old_date":    old_date or None,
                "new_date":    new_date or None,
                "delta_days":  None,
                "old_status":  old_st,
                "new_status":  new_st,
                "changed_at":  now_iso,
            })

    return changes


def load_baseline():
    """Load roadmap-baseline.json — maps label → first-ever recorded ETC date."""
    if not os.path.exists(BASELINE_PATH):
        return {}
    try:
        with open(BASELINE_PATH) as f:
            return json.load(f).get("milestones", {})
    except Exception:
        return {}


def save_baseline(baseline):
    with open(BASELINE_PATH, "w") as f:
        json.dump({"milestones": baseline}, f, indent=2)


def compute_etc_delta(prev, item):
    """
    Return the integer day delta since the last recorded ETC, or None.
    Positive = slipped, Negative = improved.
    """
    p = prev.get(item["label"])
    if not p:
        return None
    return date_delta_days(p["date"], item["date"])


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    try:
        import gspread
    except ImportError:
        print("ERROR: gspread not installed. Run:  pip3 install gspread google-auth google-auth-oauthlib")
        raise

    print("Authenticating with Google…")
    creds  = get_credentials()
    client = gspread.authorize(creds)

    print("Opening spreadsheet…")
    spreadsheet = client.open_by_url(SHEET_URL)

    worksheet = None
    for ws in spreadsheet.worksheets():
        if ws.id == SHEET_GID:
            worksheet = ws
            break

    if worksheet is None:
        worksheet = spreadsheet.sheet1
        print(f"Warning: tab with GID {SHEET_GID} not found — using first tab: '{worksheet.title}'")
    else:
        print(f"Reading tab: '{worksheet.title}'")

    data = worksheet.get_all_values()
    if not data:
        print("ERROR: Sheet returned empty data.")
        return

    headers = data[0]
    rows    = data[1:]
    print(f"Columns found: {headers}")

    col = {
        "milestone":  find_col(headers, ["Milestones", "milestone", "name"]),
        "level":      find_col(headers, ["Level", "level"]),
        "ws":         find_col(headers, ["Workstream", "workstream", "stream"]),
        "pic":        find_col(headers, ["PIC", "pic", "owner"]),
        "status":     find_col(headers, ["Status", "status"]),
        "startDate":  find_col(headers, ["Start Date", "start date", "start", "Start"]),
        "etc":        find_col(headers, ["ETC", "etc", "target"]),
        "dependency": find_col(headers, ["Dependency", "dependency", "depends on",
                                         "depends_on", "Depends On", "blocking", "blocker"]),
        "parent":     find_col(headers, ["Parent", "parent", "L1 Milestone", "L1 Group",
                                         "Group", "belongs_to", "Belongs To", "Parent Milestone"]),
    }
    if col["milestone"] < 0: col["milestone"] = 0
    if col["level"]     < 0: col["level"]     = 1
    if col["ws"]        < 0: col["ws"]        = 2
    if col["pic"]       < 0: col["pic"]       = 3
    if col["status"]    < 0: col["status"]    = 4
    if col["etc"]       < 0: col["etc"]       = 6
    # startDate and dependency stay -1 if not found

    def get(row, key):
        idx = col[key]
        return row[idx].strip() if idx >= 0 and idx < len(row) else ""

    # ── load previous snapshot for diff ──
    prev     = load_previous_data()
    baseline = load_baseline()
    now_iso  = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    l1, l2 = [], []
    for row in rows:
        if not row or not any(r.strip() for r in row):
            continue
        milestone = get(row, "milestone")
        if not milestone:
            continue
        level      = get(row, "level").upper()
        status_raw = get(row, "status")
        etc        = parse_etc(get(row, "etc"))
        start_raw  = get(row, "startDate")
        start_date = parse_etc(start_raw) if start_raw else ""
        # Baseline: record this milestone's ETC the very first time we see it
        if milestone not in baseline:
            if etc:  # only set baseline if we have a date
                baseline[milestone] = etc
                print(f"  Baseline set: {milestone[:50]} → {etc}")

        item = {
            "label":       milestone,
            "ws":          get(row, "ws") or "—",
            "pic":         get(row, "pic") or "—",
            "startDate":   start_date,
            "date":        etc,
            "initialDate": baseline.get(milestone, ""),
            "statusText":  status_raw,
            "st":          normalize_status(status_raw),
            "dependency":  get(row, "dependency"),
            "parent":      get(row, "parent"),
            "level":       level,
            "etcDelta":    compute_etc_delta(prev, {"label": milestone, "date": etc}),
        }
        if level == "L1":
            l1.append(item)
        elif level == "L2":
            l2.append(item)

    # ── detect changes ──
    all_changes = (
        detect_changes(prev, l1, "L1", now_iso) +
        detect_changes(prev, l2, "L2", now_iso)
    )

    if all_changes:
        print(f"\nDetected {len(all_changes)} change(s):")
        for c in all_changes:
            if c["change_type"] == "eta_change":
                d = c["delta_days"]
                arrow = f"+{d}d (slipped)" if d and d > 0 else (f"{d}d (improved)" if d and d < 0 else "date set/cleared")
                print(f"  ETA  [{c['level']}] {c['label']}: {c['old_date']} → {c['new_date']} ({arrow})")
            elif c["change_type"] == "status_change":
                print(f"  ST   [{c['level']}] {c['label']}: {c['old_status']} → {c['new_status']}")
            elif c["change_type"] == "new_milestone":
                print(f"  NEW  [{c['level']}] {c['label']}: ETC {c['new_date']}")
    else:
        print("\nNo ETA or status changes detected since last fetch.")

    # ── update history file ──
    history = load_history()
    history["changes"] = all_changes + history["changes"]   # newest first
    history["changes"] = history["changes"][:MAX_HISTORY]   # cap size
    history["last_updated"] = now_iso

    with open(HISTORY_PATH, "w") as f:
        json.dump(history, f, indent=2)
    print(f"History saved    → roadmap-history.json ({len(history['changes'])} total entries)")

    # ── write roadmap-baseline.json (first-ever ETAs, never overwritten) ──
    save_baseline(baseline)
    n_base = sum(1 for v in baseline.values() if v)
    print(f"Baseline saved   → roadmap-baseline.json ({n_base} milestones with initial ETA)")

    # ── write roadmap-data.json ──
    output = {
        "generated": now_iso,
        "l1": l1,
        "l2": l2,
    }
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nDone! Saved {len(l1)} L1 + {len(l2)} L2 milestones → roadmap-data.json")
    print("\nPush to GitHub:")
    print("  git add roadmap-data.json roadmap-history.json roadmap-baseline.json && git commit -m 'Update roadmap data' && git push")


if __name__ == "__main__":
    main()
