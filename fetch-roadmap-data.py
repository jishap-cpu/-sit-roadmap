"""
fetch-roadmap-data.py
---------------------
Reads the SIT roadmap Google Sheet using saved OAuth2 credentials
(same pattern as GDrive.py / GDriveAPI) and writes roadmap-data.json
into this folder so the GitHub Pages site can load live data.

Usage:
    python3 fetch-roadmap-data.py

Run this whenever the sheet changes, then:
    git add roadmap-data.json && git commit -m "Update roadmap data" && git push
"""

import pickle
import os
import json
from datetime import datetime

SHEET_URL   = "https://docs.google.com/spreadsheets/d/1UyHzvdtqED7Rz0fDtsvms0V7e_9kcnaDbYKaSaEO5IM/"
SHEET_GID   = 539542201
SCOPES      = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]

_DIR         = os.path.dirname(os.path.abspath(__file__))
TOKEN_PATH   = os.path.join(_DIR, "secrets", "token.pickle")
SECRET_PATH  = os.path.join(_DIR, "secrets", "uploadSecret.json")
OUTPUT_PATH  = os.path.join(_DIR, "roadmap-data.json")


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


# ── column helpers ────────────────────────────────────────────────────────────

def find_col(headers, names):
    for name in names:
        for i, h in enumerate(headers):
            if h.strip().lower() == name.lower():
                return i
    return -1


def parse_etc(raw):
    """Normalise date strings to YYYY-MM-DD (mirrors parseEtc in sit-roadmap-loader.js)."""
    import re
    s = str(raw).strip()
    if not s:
        return ""
    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        return s
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", s)
    if m:
        return f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"
    # Excel serial number
    if re.match(r"^\d+(\.\d+)?$", s):
        base = datetime(1899, 12, 30)
        from datetime import timedelta
        return (base + timedelta(days=int(float(s)))).strftime("%Y-%m-%d")
    try:
        return datetime.strptime(s, "%b %d, %Y").strftime("%Y-%m-%d")
    except Exception:
        pass
    try:
        return datetime.strptime(s, "%d-%b-%y").strftime("%Y-%m-%d")
    except Exception:
        pass
    return ""


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


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    try:
        import gspread
    except ImportError:
        print("ERROR: gspread not installed. Run:  pip3 install gspread google-auth google-auth-oauthlib")
        raise

    print(f"Authenticating with Google…")
    creds  = get_credentials()
    client = gspread.authorize(creds)

    print(f"Opening spreadsheet…")
    spreadsheet = client.open_by_url(SHEET_URL)

    # Find the worksheet by GID (same as GDrive.py open_by_url + worksheet)
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

    # Map columns (mirrors parseProgramMilestonesRows in sit-roadmap-loader.js)
    col = {
        "milestone":  find_col(headers, ["Milestones", "milestone", "name"]),
        "level":      find_col(headers, ["Level", "level"]),
        "ws":         find_col(headers, ["Workstream", "workstream", "stream"]),
        "pic":        find_col(headers, ["PIC", "pic", "owner"]),
        "status":     find_col(headers, ["Status", "status"]),
        "etc":        find_col(headers, ["ETC", "etc", "target"]),
        "dependency": find_col(headers, ["Dependency", "dependency", "depends on",
                                         "depends_on", "Depends On", "blocking", "blocker"]),
    }
    # Defaults if not found
    if col["milestone"] < 0: col["milestone"] = 0
    if col["level"]     < 0: col["level"]     = 1
    if col["ws"]        < 0: col["ws"]        = 2
    if col["pic"]       < 0: col["pic"]       = 3
    if col["status"]    < 0: col["status"]    = 4
    if col["etc"]       < 0: col["etc"]       = 6

    def get(row, key):
        idx = col[key]
        return row[idx].strip() if idx >= 0 and idx < len(row) else ""

    l1, l2 = [], []
    for row in rows:
        if not row or not any(r.strip() for r in row):
            continue
        milestone = get(row, "milestone")
        if not milestone:
            continue
        level      = get(row, "level").upper()
        status_raw = get(row, "status")
        item = {
            "label":      milestone,
            "ws":         get(row, "ws") or "—",
            "pic":        get(row, "pic") or "—",
            "date":       parse_etc(get(row, "etc")),
            "statusText": status_raw,
            "st":         normalize_status(status_raw),
            "dependency": get(row, "dependency"),
        }
        if level == "L1":
            l1.append(item)
        elif level == "L2":
            l2.append(item)

    output = {
        "generated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "l1": l1,
        "l2": l2,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nDone! Saved {len(l1)} L1 and {len(l2)} L2 milestones → roadmap-data.json")
    print("\nNext step — push to GitHub so the live page updates:")
    print('  git add roadmap-data.json && git commit -m "Update roadmap data" && git push')


if __name__ == "__main__":
    main()
