"""
generate-report.py
------------------
Generates an EOD summary report showing:
  - Milestones in the next 14 days (configurable via --days N)
  - Blocked milestones (any horizon)
  - ETA changes detected since the last N hours (default 24h)
  - Milestones completed recently

Reads from: roadmap-data.json + roadmap-history.json (both in this folder)

Usage:
    python3 generate-report.py              # next 14 days, changes in last 24h
    python3 generate-report.py --days 7     # next 7 days
    python3 generate-report.py --hours 48   # changes in last 48h
    python3 generate-report.py --out report.md  # save to custom file

Output:
    - Printed to console
    - Saved as EOD-report-YYYY-MM-DD.md (or --out path)
"""

import json
import os
import argparse
from datetime import datetime, timedelta, timezone

_DIR         = os.path.dirname(os.path.abspath(__file__))
DATA_PATH    = os.path.join(_DIR, "roadmap-data.json")
HISTORY_PATH = os.path.join(_DIR, "roadmap-history.json")


# ── helpers ───────────────────────────────────────────────────────────────────

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path) as f:
        return json.load(f)


def parse_date(s):
    if not s:
        return None
    try:
        return datetime.strptime(s.strip()[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except Exception:
        return None


def fmt_date(s):
    d = parse_date(s)
    if not d:
        return "TBD"
    return d.strftime("%b %d, %Y")


def fmt_delta(days):
    if days is None:
        return ""
    if days > 0:
        return f"+{days}d ⚠️  slipped"
    if days < 0:
        return f"{days}d ✅ improved"
    return "unchanged"


def status_icon(st):
    return {
        "blocked":    "🔴",
        "progress":   "🟡",
        "notstarted": "⬜",
        "complete":   "✅",
        "unspecified":"❓",
    }.get(st, "❓")


def status_label(st):
    return {
        "blocked":    "BLOCKED",
        "progress":   "In Progress",
        "notstarted": "Not Started",
        "complete":   "Complete",
        "unspecified":"Unknown",
    }.get(st, st)


def days_until(date_str, today):
    d = parse_date(date_str)
    if not d:
        return None
    return (d.date() - today.date()).days


# ── report builder ────────────────────────────────────────────────────────────

def build_report(horizon_days=14, history_hours=24):
    data    = load_json(DATA_PATH)
    history = load_json(HISTORY_PATH)

    now   = datetime.now(timezone.utc)
    today = now

    all_items = (
        [(m, "L1") for m in data.get("l1", [])] +
        [(m, "L2") for m in data.get("l2", [])]
    )

    # ── Categorise ──
    upcoming, blocked_all, completed_recent = [], [], []

    for m, level in all_items:
        m["_level"] = level
        st = m.get("st", "")
        d  = days_until(m.get("date", ""), today)

        if st == "complete":
            # completed in last 7 days
            if d is not None and d >= -7:
                completed_recent.append(m)
            continue

        if st == "blocked":
            blocked_all.append(m)

        if d is not None and 0 <= d <= horizon_days:
            upcoming.append((d, m))

    upcoming.sort(key=lambda x: x[0])

    # ── Recent ETA changes from history ──
    cutoff = now - timedelta(hours=history_hours)
    recent_changes = []
    for c in history.get("changes", []):
        try:
            changed_at = datetime.fromisoformat(c.get("changed_at", "").replace("Z", "+00:00"))
        except Exception:
            continue
        if changed_at >= cutoff:
            recent_changes.append(c)

    # ── Build markdown ──
    lines = []
    sep   = "─" * 60

    report_date = today.strftime("%A, %b %d, %Y")
    lines += [
        f"# 📋 EOD Roadmap Summary — {report_date}",
        f"_Generated {today.strftime('%H:%M UTC')} · data from Google Sheet_",
        "",
    ]

    # ── Section 1: Blocked ──
    lines += [f"## 🔴 Blocked Milestones ({len(blocked_all)} total)", sep]
    if blocked_all:
        for m in sorted(blocked_all, key=lambda x: x.get("date") or "9999"):
            etc  = fmt_date(m.get("date"))
            dep  = m.get("dependency", "").strip()
            dep_line = f"\n  ↳ Blocked by: _{dep}_" if dep else ""
            lines.append(
                f"- **[{m['_level']}] {m['label']}** — ETC: {etc} | {m.get('ws','—')}{dep_line}"
            )
    else:
        lines.append("_No blocked milestones_ ✅")
    lines.append("")

    # ── Section 2: Upcoming next N days ──
    window_end = (today + timedelta(days=horizon_days)).strftime("%b %d")
    lines += [
        f"## 📅 Next {horizon_days} Days ({today.strftime('%b %d')} – {window_end})",
        sep
    ]
    if upcoming:
        for days_left, m in upcoming:
            etc   = fmt_date(m.get("date"))
            icon  = status_icon(m.get("st"))
            slbl  = status_label(m.get("st"))
            delta = m.get("etcDelta")
            delta_str = f" · _{fmt_delta(delta)}_" if delta else ""
            due_str   = "**TODAY**" if days_left == 0 else (f"in {days_left}d" if days_left > 0 else f"{abs(days_left)}d overdue ‼️")
            lines.append(
                f"- {icon} **[{m['_level']}] {m['label']}** — {etc} ({due_str}) | "
                f"{m.get('ws','—')} | {slbl}{delta_str}"
            )
    else:
        lines.append(f"_No milestones with an ETC in the next {horizon_days} days._")
    lines.append("")

    # ── Section 3: ETA Changes ──
    lines += [
        f"## 📊 ETA Changes (last {history_hours}h)",
        sep
    ]
    if recent_changes:
        for c in recent_changes:
            ct = c.get("change_type", "")
            if ct == "eta_change":
                delta = c.get("delta_days")
                lines.append(
                    f"- **[{c.get('level','?')}] {c['label']}** | "
                    f"{fmt_date(c.get('old_date'))} → {fmt_date(c.get('new_date'))} "
                    f"({fmt_delta(delta)}) | {c.get('ws','—')}"
                )
            elif ct == "status_change":
                lines.append(
                    f"- **[{c.get('level','?')}] {c['label']}** | "
                    f"Status: {c.get('old_status','?')} → **{c.get('new_status','?')}** | {c.get('ws','—')}"
                )
            elif ct == "new_milestone":
                lines.append(
                    f"- 🆕 **[{c.get('level','?')}] {c['label']}** added — ETC: "
                    f"{fmt_date(c.get('new_date'))} | {c.get('ws','—')}"
                )
    else:
        lines.append(f"_No ETA or status changes detected in the last {history_hours}h._")
    lines.append("")

    # ── Section 4: Recently Completed ──
    lines += ["## ✅ Recently Completed (last 7 days)", sep]
    if completed_recent:
        for m in sorted(completed_recent, key=lambda x: x.get("date") or ""):
            lines.append(f"- **[{m['_level']}] {m['label']}** — {m.get('ws','—')}")
    else:
        lines.append("_No milestones completed in the last 7 days._")
    lines.append("")

    # ── Section 5: Quick stats ──
    total      = len(all_items)
    n_complete = sum(1 for m, _ in all_items if m.get("st") == "complete")
    n_blocked  = len(blocked_all)
    n_progress = sum(1 for m, _ in all_items if m.get("st") == "progress")
    pct        = round(n_complete / total * 100) if total else 0

    lines += [
        "## 📈 Overall Status",
        sep,
        f"| Metric | Value |",
        f"|---|---|",
        f"| Total milestones | {total} |",
        f"| Complete | {n_complete} ({pct}%) |",
        f"| In Progress | {n_progress} |",
        f"| Blocked | {n_blocked} |",
        f"| Upcoming ({horizon_days}d window) | {len(upcoming)} |",
        "",
        f"_Data last fetched: {data.get('generated','unknown')}_",
    ]

    return "\n".join(lines)


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate EOD roadmap summary report")
    parser.add_argument("--days",  type=int, default=14,   help="Upcoming window in days (default 14)")
    parser.add_argument("--hours", type=int, default=24,   help="ETA change lookback in hours (default 24)")
    parser.add_argument("--out",   type=str, default=None, help="Output markdown file path")
    args = parser.parse_args()

    report = build_report(horizon_days=args.days, history_hours=args.hours)

    # Console output
    print(report)

    # File output
    out_path = args.out or os.path.join(
        _DIR, f"EOD-report-{datetime.now().strftime('%Y-%m-%d')}.md"
    )
    with open(out_path, "w") as f:
        f.write(report)
    print(f"\n{'─'*60}")
    print(f"Report saved → {out_path}")


if __name__ == "__main__":
    main()
