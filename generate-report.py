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
    python3 generate-report.py --pdf        # also generate PDF

Output:
    - Printed to console
    - Saved as EOD-report-YYYY-MM-DD.md
    - With --pdf: EOD-report-YYYY-MM-DD.pdf
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


# ── HTML report builder ───────────────────────────────────────────────────────

def build_html(report_md, report_date_str):
    """Convert the structured report data into a styled HTML document."""
    data    = load_json(DATA_PATH)
    history = load_json(HISTORY_PATH)
    now     = datetime.now(timezone.utc)
    today   = now

    all_items  = [(m, "L1") for m in data.get("l1", [])] + [(m, "L2") for m in data.get("l2", [])]
    total      = len(all_items)
    n_complete = sum(1 for m, _ in all_items if m.get("st") == "complete")
    n_blocked  = sum(1 for m, _ in all_items if m.get("st") == "blocked")
    n_progress = sum(1 for m, _ in all_items if m.get("st") == "progress")
    pct        = round(n_complete / total * 100) if total else 0

    def esc(s):
        return str(s).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;")

    def status_badge(st):
        cfg = {
            "blocked":    ("#fca5a5","#7f1d1d","BLOCKED"),
            "progress":   ("#93c5fd","#1e3a5f","In Progress"),
            "notstarted": ("#cbd5e1","#1e293b","Not Started"),
            "complete":   ("#6ee7b7","#064e3b","Complete"),
            "unspecified":("#e2e8f0","#1e293b","Unknown"),
        }
        color, bg, label = cfg.get(st, ("#e2e8f0","#1e293b", st))
        return f'<span style="background:{bg};color:{color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap">{label}</span>'

    # Blocked section rows
    blocked_rows = ""
    for m, lv in all_items:
        if m.get("st") != "blocked": continue
        dep = esc(m.get("dependency","").strip())
        dep_html = f'<br><span style="color:#f87171;font-size:11px">↳ {dep}</span>' if dep else ""
        blocked_rows += f"""
        <tr>
          <td><b>[{lv}]</b> {esc(m['label'])}{dep_html}</td>
          <td>{esc(fmt_date(m.get('date')))}</td>
          <td><span style="color:#94a3b8;font-size:12px">{esc(m.get('ws','—'))}</span></td>
        </tr>"""

    # Upcoming section rows
    upcoming_rows = ""
    upcoming = []
    for m, lv in all_items:
        if m.get("st") == "complete": continue
        d = days_until(m.get("date",""), today)
        if d is not None and 0 <= d <= 14:
            upcoming.append((d, m, lv))
    upcoming.sort(key=lambda x: x[0])

    for days_left, m, lv in upcoming:
        due = "<b>TODAY</b>" if days_left == 0 else (f"in {days_left}d" if days_left > 0 else f"<b style='color:#f87171'>{abs(days_left)}d overdue</b>")
        delta = m.get("etcDelta")
        delta_html = ""
        if delta:
            col = "#fca5a5" if delta > 0 else "#6ee7b7"
            sign = "+" if delta > 0 else ""
            delta_html = f' <span style="color:{col};font-size:11px;font-weight:700">({sign}{delta}d)</span>'
        upcoming_rows += f"""
        <tr>
          <td><b>[{lv}]</b> {esc(m['label'])}</td>
          <td>{esc(fmt_date(m.get('date')))}{delta_html}</td>
          <td>{due}</td>
          <td><span style="color:#94a3b8;font-size:12px">{esc(m.get('ws','—'))}</span></td>
          <td>{status_badge(m.get('st',''))}</td>
        </tr>"""

    # ETA changes rows
    cutoff = now - timedelta(hours=24)
    change_rows = ""
    has_changes = False
    for c in history.get("changes", []):
        try:
            changed_at = datetime.fromisoformat(c.get("changed_at","").replace("Z","+00:00"))
        except Exception:
            continue
        if changed_at < cutoff: continue
        has_changes = True
        ct = c.get("change_type","")
        if ct == "eta_change":
            d = c.get("delta_days")
            col = "#fca5a5" if (d and d > 0) else "#6ee7b7"
            delta_str = f'<span style="color:{col};font-weight:700">{fmt_delta(d)}</span>' if d else "date set"
            change_rows += f"""
            <tr>
              <td><b>[{c.get('level','?')}]</b> {esc(c['label'])}</td>
              <td style="color:#94a3b8">{esc(fmt_date(c.get('old_date')))} → {esc(fmt_date(c.get('new_date')))}</td>
              <td>{delta_str}</td>
              <td style="color:#94a3b8;font-size:12px">{esc(c.get('ws','—'))}</td>
            </tr>"""
        elif ct == "status_change":
            change_rows += f"""
            <tr>
              <td><b>[{c.get('level','?')}]</b> {esc(c['label'])}</td>
              <td style="color:#94a3b8">{esc(c.get('old_status','?'))} → <b>{esc(c.get('new_status','?'))}</b></td>
              <td><span style="color:#94a3b8;font-size:11px">status change</span></td>
              <td style="color:#94a3b8;font-size:12px">{esc(c.get('ws','—'))}</td>
            </tr>"""
        elif ct == "new_milestone":
            change_rows += f"""
            <tr>
              <td><b>[{c.get('level','?')}]</b> {esc(c['label'])}</td>
              <td style="color:#94a3b8">New · ETC {esc(fmt_date(c.get('new_date')))}</td>
              <td><span style="color:#5eead4;font-size:11px;font-weight:700">NEW</span></td>
              <td style="color:#94a3b8;font-size:12px">{esc(c.get('ws','—'))}</td>
            </tr>"""

    if not has_changes:
        change_rows = '<tr><td colspan="4" style="color:#64748b;font-style:italic;padding:12px 8px">No ETA or status changes in the last 24 hours.</td></tr>'
    if not blocked_rows:
        blocked_rows = '<tr><td colspan="3" style="color:#64748b;font-style:italic;padding:12px 8px">No blocked milestones ✅</td></tr>'
    if not upcoming_rows:
        upcoming_rows = '<tr><td colspan="5" style="color:#64748b;font-style:italic;padding:12px 8px">No milestones with an ETC in the next 14 days.</td></tr>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>EOD Roadmap Report — {esc(report_date_str)}</title>
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         background:#f8fafc; color:#1e293b; font-size:13px; line-height:1.5; }}
  .page {{ max-width:900px; margin:0 auto; padding:32px 28px; }}
  .header {{ background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);
             color:#fff; border-radius:12px; padding:28px 32px; margin-bottom:24px; }}
  .header h1 {{ font-size:22px; font-weight:800; margin-bottom:4px; }}
  .header .sub {{ color:#94a3b8; font-size:13px; }}
  .stats-row {{ display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:24px; }}
  .stat-card {{ background:#fff; border:1px solid #e2e8f0; border-radius:10px;
                padding:14px 16px; text-align:center; }}
  .stat-card .num {{ font-size:26px; font-weight:800; line-height:1; }}
  .stat-card .lbl {{ color:#64748b; font-size:11px; margin-top:4px; text-transform:uppercase; letter-spacing:.5px; }}
  .stat-card.blocked .num {{ color:#ef4444; }}
  .stat-card.progress .num {{ color:#3b82f6; }}
  .stat-card.complete .num {{ color:#10b981; }}
  .stat-card.total   .num {{ color:#6366f1; }}
  .stat-card.upcoming .num {{ color:#f59e0b; }}
  .section {{ background:#fff; border:1px solid #e2e8f0; border-radius:10px;
              margin-bottom:20px; overflow:hidden; }}
  .section-header {{ padding:14px 20px; font-weight:700; font-size:14px;
                     border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:8px; }}
  .section-header.red    {{ background:#fef2f2; color:#991b1b; }}
  .section-header.blue   {{ background:#eff6ff; color:#1e40af; }}
  .section-header.yellow {{ background:#fffbeb; color:#92400e; }}
  .section-header.green  {{ background:#f0fdf4; color:#166534; }}
  .section-header.indigo {{ background:#eef2ff; color:#3730a3; }}
  table {{ width:100%; border-collapse:collapse; }}
  th {{ padding:9px 14px; text-align:left; font-size:11px; font-weight:700;
        text-transform:uppercase; letter-spacing:.5px; color:#64748b;
        background:#f8fafc; border-bottom:1px solid #e2e8f0; }}
  td {{ padding:10px 14px; border-bottom:1px solid #f1f5f9; vertical-align:top; }}
  tr:last-child td {{ border-bottom:none; }}
  tr:hover td {{ background:#f8fafc; }}
  .footer {{ text-align:center; color:#94a3b8; font-size:11px; margin-top:24px; padding-top:16px;
             border-top:1px solid #e2e8f0; }}
  @media print {{
    body {{ background:#fff; }}
    .page {{ padding:16px; }}
    .section {{ break-inside:avoid; }}
  }}
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="sub">INTEGRATION &amp; TESTING</div>
    <h1>📋 EOD Roadmap Summary</h1>
    <div class="sub">{esc(report_date_str)} &nbsp;·&nbsp; Source: R18 Program Milestones (Google Sheet)</div>
  </div>

  <div class="stats-row">
    <div class="stat-card total">   <div class="num">{total}</div>      <div class="lbl">Total</div></div>
    <div class="stat-card complete"><div class="num">{n_complete}</div>  <div class="lbl">Complete ({pct}%)</div></div>
    <div class="stat-card progress"><div class="num">{n_progress}</div>  <div class="lbl">In Progress</div></div>
    <div class="stat-card blocked"> <div class="num">{n_blocked}</div>   <div class="lbl">Blocked</div></div>
    <div class="stat-card upcoming"><div class="num">{len(upcoming)}</div><div class="lbl">Due in 14d</div></div>
  </div>

  <div class="section">
    <div class="section-header red">🔴 Blocked Milestones &nbsp;<span style="font-weight:400;font-size:12px">({n_blocked} total — requires attention)</span></div>
    <table>
      <thead><tr><th>Milestone</th><th>ETC</th><th>Workstream</th></tr></thead>
      <tbody>{blocked_rows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header blue">📅 Upcoming — Next 14 Days</div>
    <table>
      <thead><tr><th>Milestone</th><th>ETC</th><th>Due</th><th>Workstream</th><th>Status</th></tr></thead>
      <tbody>{upcoming_rows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header yellow">📊 ETA Changes (last 24h)</div>
    <table>
      <thead><tr><th>Milestone</th><th>Change</th><th>Delta</th><th>Workstream</th></tr></thead>
      <tbody>{change_rows}</tbody>
    </table>
  </div>

  <div class="footer">
    Generated {esc(now.strftime("%Y-%m-%d %H:%M UTC"))} &nbsp;·&nbsp;
    Data: {esc(data.get('generated','unknown'))} &nbsp;·&nbsp;
    <a href="https://jishap-cpu.github.io/-sit-roadmap/integration-testing-roadmap.html"
       style="color:#6366f1">View live roadmap ↗</a>
  </div>

</div>
</body>
</html>"""


def generate_pdf(html_path, pdf_path):
    """Use Chrome headless to print the HTML to PDF."""
    import subprocess
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    cmd = [
        chrome,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-software-rasterizer",
        f"--print-to-pdf={pdf_path}",
        "--print-to-pdf-no-header",
        html_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError(result.stderr or "Chrome PDF generation failed")


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate EOD roadmap summary report")
    parser.add_argument("--days",  type=int,            default=14,    help="Upcoming window in days (default 14)")
    parser.add_argument("--hours", type=int,            default=24,    help="ETA change lookback in hours (default 24)")
    parser.add_argument("--out",   type=str,            default=None,  help="Output markdown file path")
    parser.add_argument("--pdf",   action="store_true",                help="Also generate a PDF")
    args = parser.parse_args()

    report_date_str = datetime.now().strftime("%A, %b %d, %Y")
    stem = f"EOD-report-{datetime.now().strftime('%Y-%m-%d')}"

    report = build_report(horizon_days=args.days, history_hours=args.hours)

    # ── Markdown ──
    print(report)
    md_path = args.out or os.path.join(_DIR, f"{stem}.md")
    with open(md_path, "w") as f:
        f.write(report)
    print(f"\n{'─'*60}")
    print(f"Markdown saved → {md_path}")

    # ── HTML + PDF ──
    html_path = os.path.join(_DIR, f"{stem}.html")
    html = build_html(report, report_date_str)
    with open(html_path, "w") as f:
        f.write(html)
    print(f"HTML saved     → {html_path}")

    if args.pdf:
        pdf_path = os.path.join(_DIR, f"{stem}.pdf")
        print("Generating PDF via Chrome…")
        try:
            generate_pdf(f"file://{html_path}", pdf_path)
            print(f"PDF saved      → {pdf_path}")
            # Open the PDF
            import subprocess
            subprocess.Popen(["open", pdf_path])
            print("PDF opened ✅")
        except Exception as e:
            print(f"PDF failed: {e}")
            print(f"Opening HTML instead → {html_path}")
            import subprocess
            subprocess.Popen(["open", html_path])
    else:
        # Always open the HTML preview
        import subprocess
        subprocess.Popen(["open", html_path])
        print(f"HTML report opened in browser.")


if __name__ == "__main__":
    main()
