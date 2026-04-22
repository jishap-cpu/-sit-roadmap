/**
 * SIT ROADMAP — loads Program Milestones from Google Sheets.
 *
 * ── OPTION A: Google Sign-In / OAuth2 (recommended — sheet stays private) ──
 *   1. oauthClientId → already filled from your project credentials
 *   2. Sheet must be shared with your team's Google accounts (not public)
 *   3. Users click "Sign in with Google" on the page — one-time per session
 *   SETUP: In Google Cloud Console → APIs & Services → Credentials → your OAuth2 client
 *          → Add "https://jishap-cpu.github.io" under Authorized JavaScript origins
 *
 * ── OPTION B: Google Sheets API key (sheet must be public) ──
 *   1. sheetsApiKey  → get from console.cloud.google.com → Credentials → API key
 *   2. Sheet must be shared: "Anyone with the link → Viewer"
 *
 * ── OPTION C: CSV export (no API key, sheet must be public) ──
 *   Set csvExportUrl below, OR leave spreadsheetId + sheetGid (auto-builds URL)
 */
(function () {
  window.SIT_ROADMAP_CONFIG = {
    // ── OPTION A: OAuth2 Sign-In (recommended — keeps sheet private) ──────────
    /** OAuth2 client ID from Google Cloud Console → Credentials */
    oauthClientId: "209434048344-rf3sepodgeg02bqapt1586gl620utqfi.apps.googleusercontent.com",

    // ── OPTION B: Sheets API key (public sheet only) ──────────────────────────
    /** Paste your Google Sheets API key here if not using OAuth2 */
    sheetsApiKey: "",

    /** Your spreadsheet ID — already filled from your sheet URL */
    spreadsheetId: "1UyHzvdtqED7Rz0fDtsvms0V7e_9kcnaDbYKaSaEO5IM",

    /** The tab's GID — already filled from your sheet URL */
    sheetGid: "539542201",

    // ── OPTION C: CSV export (fallback — public sheet only) ───────────────────
    /** Full CSV export URL — leave empty to auto-build from spreadsheetId + sheetGid */
    csvExportUrl: "",

    /** "Open spreadsheet" link shown in the page header */
    openSheetUrl: "https://docs.google.com/spreadsheets/d/1UyHzvdtqED7Rz0fDtsvms0V7e_9kcnaDbYKaSaEO5IM/edit?gid=539542201"
  };

  var qp = new URLSearchParams(window.location.search || "");
  var qCsv = qp.get("csv");
  if (qCsv) {
    try {
      window.SIT_ROADMAP_CONFIG.csvExportUrl = decodeURIComponent(qCsv);
    } catch (e) {}
  }

  var TODAY = new Date();
  TODAY.setHours(12, 0, 0, 0);

  var ROADMAP_L1 = [];
  var ROADMAP_L2 = [];

  var FALLBACK_L1 = [
    { date: "2026-04-22", label: "PMB/Scaling / Diversity Test Plan Strategy", ws: "InCar Testing", st: "progress" },
    { date: "2026-04-24", label: "Product Feature Completion", ws: "Product", st: "progress" },
    { date: "2026-04-24", label: "R18.0.0 VIP", ws: "Sys Int", st: "progress" },
    { date: "2026-04-26", label: "L2PP Sweeping CA", ws: "InCar Testing", st: "progress" },
    { date: "2026-04-27", label: "PMB/Scaling / Diversity Test Execution Plan", ws: "InCar Testing", st: "progress" },
    { date: "2026-04-29", label: "Complete Fleet Transition to R18.0.0 VIP", ws: "Car Prioritization/Diversity", st: "blocked" },
    { date: "2026-05-04", label: "USA Scaling (Tier1/Tier2) Testing Completion", ws: "Car Prioritization/Diversity", st: "blocked" },
    { date: "2026-05-05", label: "R18.1.0 VIP", ws: "Sys Int", st: "notstarted" },
    { date: "2026-05-22", label: "R18 x.x.x VIP", ws: "Sys Int", st: "notstarted" },
    { date: "2026-05-22", label: "R18 PMB Branch Off & Process", ws: "PMB", st: "blocked" },
    { date: "2026-05-25", label: "Integration Complete", ws: "Program", st: "blocked" },
    { date: "2026-06-07", label: "L2PP Sweeping TX", ws: "InCar Testing", st: "progress" },
    { date: "2026-06-08", label: "SW Pre-Freeze", ws: "Program", st: "blocked" },
    { date: "2026-06-12", label: "LKG Pre RC VIP", ws: "Sys Int", st: "notstarted" },
    { date: "2026-06-19", label: "Zero Rel Blockers", ws: "Sys Int", st: "notstarted" },
    { date: "2026-06-19", label: "SW Freeze / Harlock", ws: "Program", st: "blocked" },
    { date: "2026-06-24", label: "SW Freeze Mgmt Review", ws: "Program", st: "blocked" },
    { date: "2026-07-12", label: "L2PP Sweeping NJ", ws: "InCar Testing", st: "notstarted" },
    { date: "2026-07-12", label: "Sweeping – VnV Testing Completion", ws: "InCar Testing", st: "progress" },
    { date: "2026-07-20", label: "RPD", ws: "Program", st: "blocked" }
  ];

  var FALLBACK_L2 = [
    { date: "", label: "Highway AMO SILC Feature in PMB", ws: "Product", st: "complete" },
    { date: "2026-04-27", label: "Highway AMO SILC PMB Test Plan Complete", ws: "InCar Testing", st: "progress" },
    { date: "", label: "Highway AMO SILC DAG /Config Updates", ws: "Product", st: "progress" },
    { date: "2026-04-24", label: "Highway AMO SILC Digital Replay Testing Enablement", ws: "PMB", st: "notstarted" },
    { date: "", label: "HFE Feature in PMB", ws: "Product", st: "progress" },
    { date: "2026-04-27", label: "HFE Test Plan Complete", ws: "InCar Testing", st: "progress" },
    { date: "", label: "HFE DAG/Config Updates", ws: "Product", st: "progress" },
    { date: "2026-04-24", label: "HFE Digital Replay Testing Enablement", ws: "PMB", st: "progress" },
    { date: "2026-04-27", label: "DCAS Feature in PMB", ws: "Product", st: "blocked" },
    { date: "2026-04-27", label: "DCAS PMB Test Plan Complete", ws: "InCar Testing", st: "progress" },
    { date: "", label: "DCAS DAG /Config Updates", ws: "Product", st: "progress" },
    { date: "", label: "APA P2P On Street Feature in PMB", ws: "Product", st: "progress" },
    { date: "", label: "APA P2P On Street Test Plan Complete", ws: "InCar Testing", st: "progress" },
    { date: "", label: "APA P2P On Street Digital Replay Testing Enablement", ws: "PMB", st: "progress" },
    { date: "", label: "Active Safety Feature in PMB", ws: "Product", st: "progress" },
    { date: "", label: "Active SafetyTest Plan Complete", ws: "InCar Testing", st: "progress" },
    { date: "", label: "ATCA Feature in PMB", ws: "Product", st: "unspecified" },
    { date: "", label: "ATCA Test Plan Complete", ws: "InCar Testing", st: "unspecified" },
    { date: "2026-05-15", label: "Branch Activation", ws: "PMB", st: "blocked" },
    { date: "2026-05-15", label: "Config List", ws: "PMB", st: "blocked" },
    { date: "2026-05-17", label: "Promotions Setup", ws: "PMB", st: "blocked" },
    { date: "2026-05-18", label: "MTTF Setup", ws: "PMB", st: "blocked" },
    { date: "2026-05-18", label: "DIFORV Setup", ws: "PMB", st: "blocked" },
    { date: "2026-05-19", label: "CCB Setup", ws: "PMB", st: "blocked" },
    { date: "2026-05-15", label: "AVBT Checklist", ws: "PMB", st: "blocked" },
    { date: "2026-05-20", label: "Maintainer Support", ws: "PMB", st: "blocked" },
    { date: "2026-05-20", label: "QC Support", ws: "PMB", st: "blocked" },
    { date: "2026-05-20", label: "Automatic PMB Setup", ws: "PMB", st: "blocked" },
    { date: "2026-05-20", label: "Alfred Setup", ws: "PMB", st: "blocked" },
    { date: "2026-05-20", label: "GVS Compute Allocation", ws: "PMB", st: "blocked" },
    { date: "2026-05-20", label: "Main Freeze", ws: "PMB", st: "blocked" },
    { date: "2026-05-22", label: "Branch Fast Forward", ws: "PMB", st: "blocked" },
    { date: "2026-05-23", label: "Daily Build Starts", ws: "PMB", st: "blocked" }
  ];

  function setBanner(message, isError) {
    var el = document.getElementById("data-source-banner");
    if (!el) return;
    el.textContent = message;
    el.className = "data-banner" + (isError ? " is-error" : "");
    el.hidden = !message;
  }

  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = "";
    var i = 0;
    var inQuotes = false;
    while (i < text.length) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        if (c === '"') {
          inQuotes = false;
          i++;
          continue;
        }
        field += c;
        i++;
      } else {
        if (c === '"') {
          inQuotes = true;
          i++;
          continue;
        }
        if (c === ",") {
          row.push(field);
          field = "";
          i++;
          continue;
        }
        if (c === "\r") {
          i++;
          continue;
        }
        if (c === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
          i++;
          continue;
        }
        field += c;
        i++;
      }
    }
    row.push(field);
    if (row.some(function (cell) {
      return String(cell).trim() !== "";
    })) {
      rows.push(row);
    }
    return rows;
  }

  function normHeader(h) {
    return String(h || "")
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase();
  }

  function findColIndex(headers, candidates) {
    for (var c = 0; c < candidates.length; c++) {
      var want = candidates[c].toLowerCase();
      for (var i = 0; i < headers.length; i++) {
        if (normHeader(headers[i]) === want) return i;
      }
    }
    for (var c2 = 0; c2 < candidates.length; c2++) {
      var w = candidates[c2].toLowerCase();
      for (var j = 0; j < headers.length; j++) {
        if (normHeader(headers[j]).indexOf(w) !== -1) return j;
      }
    }
    return -1;
  }

  function excelSerialToISO(n) {
    var serial = Math.floor(Number(n));
    if (!isFinite(serial)) return "";
    var base = new Date(1899, 11, 30);
    base.setDate(base.getDate() + serial);
    return base.toISOString().slice(0, 10);
  }

  function parseEtc(raw) {
    if (raw == null) return "";
    var s = String(raw).trim();
    if (!s) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    var slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      var mm = slash[1].padStart(2, "0");
      var dd = slash[2].padStart(2, "0");
      return slash[3] + "-" + mm + "-" + dd;
    }
    if (/^\d+(\.\d+)?$/.test(s)) {
      return excelSerialToISO(s);
    }
    var d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return "";
  }

  function normalizeStatusKey(statusRaw) {
    var s = String(statusRaw || "").trim().toLowerCase();
    if (!s) return "unspecified";
    if (s.indexOf("complete") !== -1 && s.indexOf("in progress") === -1) return "complete";
    if (s.indexOf("block") !== -1) return "blocked";
    if (s.indexOf("not start") !== -1 || s === "not started") return "notstarted";
    if (s.indexOf("progress") !== -1) return "progress";
    return "unspecified";
  }

  function statusDisplay(st) {
    if (st === "complete") return "Complete";
    if (st === "blocked") return "Blocked";
    if (st === "notstarted") return "Not Started";
    if (st === "progress") return "In Progress";
    return "—";
  }

  function rowModelFromSheet(cells, col) {
    var milestone = String(cells[col.milestone] || "").trim();
    if (!milestone) return null;
    var level = String(cells[col.level] || "").trim().toUpperCase();
    var ws = String(cells[col.ws] || "").trim() || "—";
    var pic = String(cells[col.pic] || "").trim() || "—";
    var statusRaw = cells[col.status] != null ? cells[col.status] : "";
    var etcISO = col.etc >= 0 ? parseEtc(cells[col.etc]) : "";
    var dep = col.dependency >= 0 ? String(cells[col.dependency] || "").trim() : "";
    var st = normalizeStatusKey(statusRaw);
    return {
      date: etcISO,
      label: milestone,
      ws: ws,
      pic: pic,
      st: st,
      statusText: String(statusRaw || "").trim(),
      dependency: dep
    };
  }

  function parseProgramMilestonesRows(rows) {
    if (!rows.length) return { l1: [], l2: [] };
    var headers = rows[0];
    var col = {
      milestone: findColIndex(headers, ["Milestones", "milestone", "name"]),
      level: findColIndex(headers, ["Level", "level"]),
      ws: findColIndex(headers, ["Workstream", "workstream", "stream"]),
      pic: findColIndex(headers, ["PIC", "pic", "owner"]),
      status: findColIndex(headers, ["Status", "status"]),
      etc: findColIndex(headers, ["ETC", "etc", "target"]),
      dependency: findColIndex(headers, ["Dependency", "dependency", "dependencies", "depends on", "depends_on", "Depends On", "blocking", "blocker"])
    };
    if (col.milestone < 0) col.milestone = 0;
    if (col.level < 0) col.level = 1;
    if (col.ws < 0) col.ws = 2;
    if (col.pic < 0) col.pic = 3;
    if (col.status < 0) col.status = 4;
    if (col.etc < 0) col.etc = 6;
    // dependency column is optional — stays -1 if not found

    var l1 = [];
    var l2 = [];
    for (var r = 1; r < rows.length; r++) {
      var cells = rows[r];
      if (!cells || !cells.length) continue;
      var m = rowModelFromSheet(cells, col);
      if (!m) continue;
      var lv = String(cells[col.level] || "").trim().toUpperCase();
      if (lv === "L1") l1.push(m);
      else if (lv === "L2") l2.push(m);
    }
    return { l1: l1, l2: l2 };
  }

  function parseProgramMilestonesCSV(text) {
    return parseProgramMilestonesRows(parseCSV(text));
  }

  function buildCsvUrl() {
    var cfg = window.SIT_ROADMAP_CONFIG || {};
    if (cfg.csvExportUrl && String(cfg.csvExportUrl).trim()) {
      return String(cfg.csvExportUrl).trim();
    }
    var id = (cfg.spreadsheetId || "").trim();
    if (!id) return "";
    var gid = (cfg.sheetGid != null && cfg.sheetGid !== "") ? String(cfg.sheetGid) : "0";
    return "https://docs.google.com/spreadsheets/d/" + id + "/export?format=csv&gid=" + encodeURIComponent(gid);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusClass(st) {
    if (st === "blocked") return "blocked";
    if (st === "notstarted") return "notstarted";
    if (st === "complete") return "complete";
    if (st === "unspecified") return "unspecified";
    return "progress";
  }

  function fillMilestoneTable(tbodyId, list) {
    var tb = document.getElementById(tbodyId);
    if (!tb) return;

    var sorted = list.slice().sort(function (a, b) {
      var ad = a.date ? new Date(a.date).getTime() : 9e15;
      var bd = b.date ? new Date(b.date).getTime() : 9e15;
      if (ad !== bd) return ad - bd;
      return a.label.localeCompare(b.label);
    });
    var html = sorted.map(function (m) {
      var etc = m.date || "—";
      var st = m.st;
      var disp = statusDisplay(st);
      var span =
        st === "unspecified"
          ? '<span class="status unspecified">—</span>'
          : '<span class="status ' + statusClass(st) + '">' + escapeHtml(disp) + "</span>";
      var dep = (m.dependency || "").trim();
      var depCell = dep
        ? '<td class="dep-cell"><span class="dep-tag">' + escapeHtml(dep) + "</span></td>"
        : '<td class="dep-cell" style="color:var(--muted,#8b95a8);font-size:0.82rem">—</td>';

      // ETA delta badge (etcDelta is integer days set by fetch-roadmap-data.py)
      var deltaBadge = "";
      if (m.etcDelta != null && m.etcDelta !== 0) {
        var d = m.etcDelta;
        var slipped = d > 0;
        var abs = Math.abs(d);
        var label = slipped ? ("+" + abs + "d") : ("-" + abs + "d");
        var title = slipped
          ? ("Slipped " + abs + " day" + (abs === 1 ? "" : "s") + " since last update")
          : ("Improved " + abs + " day" + (abs === 1 ? "" : "s") + " since last update");
        deltaBadge = ' <span class="eta-delta ' + (slipped ? "eta-slipped" : "eta-improved") +
          '" title="' + title + '">' + label + "</span>";
      }

      return (
        '<tr data-ws="' + escapeHtml(m.ws || "") + '" data-label="' + escapeHtml(m.label) + '"><td>' +
        escapeHtml(etc) + deltaBadge +
        "</td><td>" +
        escapeHtml(m.label) +
        '</td><td><span class="ws-tag">' +
        escapeHtml(m.ws) +
        "</span></td><td>" +
        escapeHtml(m.pic) +
        "</td><td>" +
        span +
        "</td>" +
        depCell +
        "</tr>"
      );
    });
    tb.innerHTML = html.join("");
  }

  function dateRangeFor(items, padDays) {
    padDays = padDays || 4;
    var times = [];
    items.forEach(function (m) {
      if (m.date && /^\d{4}-\d{2}-\d{2}$/.test(m.date)) {
        times.push(new Date(m.date + "T12:00:00").getTime());
      }
    });
    if (!times.length) {
      return {
        start: new Date(2026, 3, 15),
        end: new Date(2026, 6, 28)
      };
    }
    var mn = Math.min.apply(null, times);
    var mx = Math.max.apply(null, times);
    var start = new Date(mn);
    start.setDate(start.getDate() - padDays);
    var end = new Date(mx);
    end.setDate(end.getDate() + padDays);
    return { start: start, end: end };
  }

  function monthBandLabels(start, end) {
    var labels = [];
    var d = new Date(start.getFullYear(), start.getMonth(), 1);
    var endM = new Date(end.getFullYear(), end.getMonth(), 1);
    var guard = 0;
    while (d <= endM && guard++ < 14) {
      labels.push(
        d.toLocaleString("en-US", { month: "short", year: "numeric" })
      );
      d.setMonth(d.getMonth() + 1);
    }
    if (labels.length < 2) {
      labels = ["Apr 2026", "May 2026", "Jun 2026", "Jul 2026"];
    }
    return labels;
  }

  function makePctBetween(rangeStart, rangeEnd) {
    return function (d) {
      var t = d.getTime();
      var a = rangeStart.getTime();
      var b = rangeEnd.getTime();
      if (t <= a) return 0;
      if (t >= b) return 100;
      return ((t - a) / (b - a)) * 100;
    };
  }

  function markerClass(st) {
    if (st === "blocked") return "blocked";
    if (st === "notstarted") return "notstarted";
    if (st === "complete") return "complete";
    if (st === "unspecified") return "unspecified";
    return "progress";
  }

  function renderGanttChart(rootId, items, options) {
    var months = options.months;
    var rangeStart = options.rangeStart;
    var rangeEnd = options.rangeEnd;
    var today = options.today || TODAY;
    var pctBetween = makePctBetween(rangeStart, rangeEnd);

    var root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = "";

    var sorted = items
      .filter(function (m) {
        return m.date && /^\d{4}-\d{2}-\d{2}$/.test(m.date);
      })
      .slice()
      .sort(function (x, y) {
        return new Date(x.date) - new Date(y.date) || x.label.localeCompare(y.label);
      });

    var axis = document.createElement("div");
    axis.className = "gantt-axis";
    var bg = document.createElement("div");
    bg.className = "gantt-axis-bg";
    months.forEach(function (m) {
      var el = document.createElement("div");
      el.className = "gantt-month";
      el.textContent = m;
      bg.appendChild(el);
    });
    axis.appendChild(bg);

    var todayPct = pctBetween(today);
    if (todayPct >= 0 && todayPct <= 100) {
      var line = document.createElement("div");
      line.className = "gantt-today-line is-axis";
      line.style.left = todayPct + "%";
      axis.appendChild(line);
    }

    root.appendChild(axis);

    sorted.forEach(function (m) {
      var row = document.createElement("div");
      row.className = "gantt-row";

      var lab = document.createElement("div");
      lab.className = "gantt-label";
      lab.textContent = m.label;
      row.appendChild(lab);

      var track = document.createElement("div");
      track.className = "gantt-track";

      var grid = document.createElement("div");
      grid.className = "gantt-track-grid";
      for (var i = 0; i < months.length; i++) {
        grid.appendChild(document.createElement("span"));
      }
      track.appendChild(grid);

      if (todayPct >= 0 && todayPct <= 100) {
        var lineClone = document.createElement("div");
        lineClone.className = "gantt-today-line is-row";
        lineClone.style.left = todayPct + "%";
        track.appendChild(lineClone);
      }

      var dot = document.createElement("div");
      dot.className = "gantt-marker " + markerClass(m.st);
      dot.style.left = pctBetween(new Date(m.date + "T12:00:00")) + "%";
      dot.setAttribute("data-tip", m.date + " · " + m.ws);
      dot.setAttribute("role", "img");
      dot.setAttribute("aria-label", m.label + ", ETC " + m.date + ", " + m.ws);
      track.appendChild(dot);

      row.appendChild(track);
      root.appendChild(row);
    });
  }

  function destroyChart(canvasId) {
    var el = document.getElementById(canvasId);
    if (!el || typeof Chart === "undefined" || !Chart.getChart) return;
    var ch = Chart.getChart(el);
    if (ch) ch.destroy();
  }

  function countBy(arr, keyFn) {
    var map = {};
    arr.forEach(function (x) {
      var k = keyFn(x);
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }

  function mondayOfWeek(d) {
    var x = new Date(d.getTime());
    var day = x.getDay();
    var diff = (day + 6) % 7;
    x.setDate(x.getDate() - diff);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function weekKey(d) {
    return mondayOfWeek(d).toISOString().slice(0, 10);
  }

  function formatWeekLabel(isoMonday) {
    var d = new Date(isoMonday + "T12:00:00");
    return "Week of " + (d.getMonth() + 1) + "/" + d.getDate();
  }

  function renderChartsL1(data) {
    if (typeof Chart === "undefined") return;
    Chart.defaults.color = "#8b95a8";
    Chart.defaults.borderColor = "rgba(255,255,255,0.08)";
    Chart.defaults.font.family = "'Source Sans 3', system-ui, sans-serif";

    ["chart-status", "chart-workstream", "chart-weekly"].forEach(destroyChart);

    var st = countBy(data, function (m) {
      return m.st;
    });
    var l1Labels = ["Complete", "In progress", "Blocked", "Not started", "Unspecified"];
    var l1Keys = ["complete", "progress", "blocked", "notstarted", "unspecified"];
    var l1Colors = ["#22c55e", "#3b82f6", "#f87171", "#64748b", "#475569"];
    var d1 = [];
    var lab1 = [];
    var col1 = [];
    l1Keys.forEach(function (key, i) {
      var v = st[key] || 0;
      if (v > 0) {
        d1.push(v);
        lab1.push(l1Labels[i]);
        col1.push(l1Colors[i]);
      }
    });
    var ctxS = document.getElementById("chart-status");
    if (ctxS && d1.length) {
      new Chart(ctxS, {
        type: "doughnut",
        data: {
          labels: lab1,
          datasets: [{
            data: d1,
            backgroundColor: col1,
            borderWidth: 2,
            borderColor: "#151b24",
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { padding: 14, usePointStyle: true } } },
          cutout: "58%"
        }
      });
    }

    var wsMap = countBy(data, function (m) {
      return m.ws;
    });
    var wsLabels = Object.keys(wsMap).sort(function (a, b) {
      return wsMap[b] - wsMap[a];
    });
    var wsColors = ["#5eead4", "#7c9cff", "#c4b5fd", "#fbbf24", "#fb7185", "#34d399", "#94a3b8"];
    var ctxW = document.getElementById("chart-workstream");
    if (ctxW) {
      new Chart(ctxW, {
        type: "bar",
        data: {
          labels: wsLabels,
          datasets: [{
            label: "Milestones",
            data: wsLabels.map(function (k) {
              return wsMap[k];
            }),
            backgroundColor: wsLabels.map(function (_, i) {
              return wsColors[i % wsColors.length];
            }),
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1 } },
            y: { ticks: { font: { size: 11 } } }
          }
        }
      });
    }

    var weekMap = {};
    data.forEach(function (m) {
      if (!m.date || !/^\d{4}-\d{2}-\d{2}$/.test(m.date)) return;
      var k = weekKey(new Date(m.date + "T12:00:00"));
      weekMap[k] = (weekMap[k] || 0) + 1;
    });
    var weekKeys = Object.keys(weekMap).sort();
    var ctxZ = document.getElementById("chart-weekly");
    if (ctxZ && weekKeys.length) {
      new Chart(ctxZ, {
        type: "bar",
        data: {
          labels: weekKeys.map(formatWeekLabel),
          datasets: [{
            label: "L1 ETC this week",
            data: weekKeys.map(function (k) {
              return weekMap[k];
            }),
            backgroundColor: "rgba(94, 234, 212, 0.45)",
            borderColor: "#5eead4",
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
            x: { ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } } }
          }
        }
      });
    }
  }

  function renderChartsL2(data) {
    if (typeof Chart === "undefined") return;
    Chart.defaults.color = "#8b95a8";
    Chart.defaults.borderColor = "rgba(255,255,255,0.08)";
    Chart.defaults.font.family = "'Source Sans 3', system-ui, sans-serif";

    ["chart-l2-status", "chart-l2-workstream", "chart-l2-weekly"].forEach(destroyChart);

    var st = countBy(data, function (m) {
      return m.st;
    });
    var l2Labels = ["Complete", "In progress", "Blocked", "Not started", "Unspecified"];
    var l2Keys = ["complete", "progress", "blocked", "notstarted", "unspecified"];
    var l2Colors = ["#22c55e", "#3b82f6", "#f87171", "#64748b", "#475569"];
    var l2Data = [];
    var l2Lab = [];
    var l2Col = [];
    l2Keys.forEach(function (key, i) {
      var v = st[key] || 0;
      if (v > 0) {
        l2Data.push(v);
        l2Lab.push(l2Labels[i]);
        l2Col.push(l2Colors[i]);
      }
    });

    var ctxS = document.getElementById("chart-l2-status");
    if (ctxS && l2Data.length) {
      new Chart(ctxS, {
        type: "doughnut",
        data: {
          labels: l2Lab,
          datasets: [{
            data: l2Data,
            backgroundColor: l2Col,
            borderWidth: 2,
            borderColor: "#151b24",
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } },
          cutout: "55%"
        }
      });
    }

    var wsMap = countBy(data, function (m) {
      return m.ws;
    });
    var wsLabels = Object.keys(wsMap).sort(function (a, b) {
      return wsMap[b] - wsMap[a];
    });
    var wsColors = ["#c4b5fd", "#5eead4", "#7c9cff", "#fbbf24", "#fb7185"];
    var ctxW = document.getElementById("chart-l2-workstream");
    if (ctxW) {
      new Chart(ctxW, {
        type: "bar",
        data: {
          labels: wsLabels,
          datasets: [{
            label: "L2 milestones",
            data: wsLabels.map(function (k) {
              return wsMap[k];
            }),
            backgroundColor: wsLabels.map(function (_, i) {
              return wsColors[i % wsColors.length];
            }),
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1 } },
            y: { ticks: { font: { size: 11 } } }
          }
        }
      });
    }

    var weekMap = {};
    data.forEach(function (m) {
      if (!m.date || !/^\d{4}-\d{2}-\d{2}$/.test(m.date)) return;
      var k = weekKey(new Date(m.date + "T12:00:00"));
      weekMap[k] = (weekMap[k] || 0) + 1;
    });
    var weekKeys = Object.keys(weekMap).sort();
    var ctxZ = document.getElementById("chart-l2-weekly");
    if (ctxZ && weekKeys.length) {
      new Chart(ctxZ, {
        type: "bar",
        data: {
          labels: weekKeys.map(formatWeekLabel),
          datasets: [{
            label: "L2 ETC this week",
            data: weekKeys.map(function (k) {
              return weekMap[k];
            }),
            backgroundColor: "rgba(124, 156, 255, 0.42)",
            borderColor: "#7c9cff",
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
            x: { ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } } }
          }
        }
      });
    }
  }

  function fireDataReady() {
    window.ROADMAP_DATA = { l1: ROADMAP_L1, l2: ROADMAP_L2 };
    try {
      document.dispatchEvent(new CustomEvent("roadmapDataReady", {
        detail: { l1: ROADMAP_L1, l2: ROADMAP_L2 },
        bubbles: false
      }));
    } catch (e) {}
  }

  window.SIT_REFRESH = function () { refreshAll(); fireDataReady(); };

  function refreshAll() {
    var r1 = dateRangeFor(ROADMAP_L1, 5);
    var months1 = monthBandLabels(r1.start, r1.end);
    renderGanttChart("gantt-root", ROADMAP_L1, {
      rangeStart: r1.start,
      rangeEnd: r1.end,
      months: months1,
      today: TODAY
    });

    var r2 = dateRangeFor(ROADMAP_L2, 5);
    var months2 = monthBandLabels(r2.start, r2.end);
    if (months2.length > 6) months2 = months2.slice(0, 6);
    renderGanttChart("gantt-l2-root", ROADMAP_L2, {
      rangeStart: r2.start,
      rangeEnd: r2.end,
      months: months2,
      today: TODAY
    });

    fillMilestoneTable("tbody-l1", ROADMAP_L1);
    fillMilestoneTable("tbody-l2", ROADMAP_L2);

    var datedL2 = ROADMAP_L2.filter(function (m) {
      return m.date && /^\d{4}-\d{2}-\d{2}$/.test(m.date);
    }).length;
    var hint = document.getElementById("l2-gantt-hint");
    if (hint) {
      hint.innerHTML =
        "<strong>" +
        datedL2 +
        "</strong> of <strong>" +
        ROADMAP_L2.length +
        "</strong> L2 milestones have an ETC on the Gantt above.";
    }

    renderChartsL1(ROADMAP_L1);
    renderChartsL2(ROADMAP_L2);
  }

  function applyOpenSheetLink() {
    var cfg = window.SIT_ROADMAP_CONFIG || {};
    var a = document.getElementById("open-sheet-link");
    if (!a) return;
    var url = (cfg.openSheetUrl || "").trim();
    if (!url && cfg.spreadsheetId) {
      url = "https://docs.google.com/spreadsheets/d/" + cfg.spreadsheetId + "/edit";
    }
    if (url) {
      a.href = url;
      a.hidden = false;
    } else {
      a.hidden = true;
    }
  }

  function applyParsed(parsed, source) {
    ROADMAP_L1 = parsed.l1.length ? parsed.l1 : FALLBACK_L1.slice();
    ROADMAP_L2 = parsed.l2.length ? parsed.l2 : FALLBACK_L2.slice();
    setBanner("Live data from " + source + " (refreshes on page reload).", false);
    refreshAll();
    fireDataReady();
  }

  function useFallback(reason) {
    ROADMAP_L1 = FALLBACK_L1.slice();
    ROADMAP_L2 = FALLBACK_L2.slice();
    setBanner(reason, true);
    refreshAll();
    fireDataReady();
  }

  /**
   * OPTION A — OAuth2 token-based Sheets API access.
   * Uses Google Identity Services token model. Sheet stays private.
   * Requires oauthClientId and https://jishap-cpu.github.io added as
   * an Authorized JavaScript Origin in Google Cloud Console.
   */
  var _oauthToken = null;

  function loadFromOAuth(spreadsheetId, sheetGid, clientId) {
    return new Promise(function (resolve) {
      // If already have a token, use it directly
      if (_oauthToken) {
        resolve(fetchSheetsWithToken(_oauthToken, spreadsheetId, sheetGid));
        return;
      }

      // Show sign-in UI and request a token
      showSignInButton(clientId, spreadsheetId, sheetGid, resolve);
    });
  }

  function showSignInButton(clientId, spreadsheetId, sheetGid, resolve) {
    var banner = document.getElementById("roadmap-banner");

    // Create sign-in overlay if not already there
    var existing = document.getElementById("gsi-signin-bar");
    if (existing) existing.remove();

    var bar = document.createElement("div");
    bar.id = "gsi-signin-bar";
    bar.style.cssText = [
      "position:fixed", "top:0", "left:0", "right:0", "z-index:9999",
      "background:#1a73e8", "color:#fff", "padding:12px 20px",
      "display:flex", "align-items:center", "gap:14px",
      "font-family:sans-serif", "font-size:14px", "box-shadow:0 2px 8px rgba(0,0,0,.3)"
    ].join(";");
    bar.innerHTML =
      '<span style="flex:1">Sign in with your Google account to load live roadmap data from the sheet.</span>' +
      '<button id="gsi-signin-btn" style="background:#fff;color:#1a73e8;border:none;' +
      'border-radius:4px;padding:8px 18px;font-weight:600;cursor:pointer;font-size:14px">' +
      'Sign in with Google</button>' +
      '<button id="gsi-skip-btn" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);' +
      'border-radius:4px;padding:8px 14px;cursor:pointer;font-size:13px">Use snapshot</button>';

    document.body.insertBefore(bar, document.body.firstChild);
    document.body.style.paddingTop = "54px";

    document.getElementById("gsi-signin-btn").addEventListener("click", function () {
      setBanner("Connecting to Google…", false);
      var client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
        callback: function (resp) {
          if (resp.error) {
            useFallback("Google sign-in cancelled or failed. Showing embedded snapshot.");
            bar.remove();
            document.body.style.paddingTop = "";
            resolve();
            return;
          }
          _oauthToken = resp.access_token;
          bar.remove();
          document.body.style.paddingTop = "";
          resolve(fetchSheetsWithToken(_oauthToken, spreadsheetId, sheetGid));
        }
      });
      client.requestAccessToken({ prompt: "select_account" });
    });

    document.getElementById("gsi-skip-btn").addEventListener("click", function () {
      bar.remove();
      document.body.style.paddingTop = "";
      useFallback("Using embedded snapshot — click 'Sign in with Google' to load live data.");
      resolve();
    });

    setBanner("Sign in with Google (blue bar above) to load live sheet data, or use snapshot.", false);
  }

  function fetchSheetsWithToken(token, spreadsheetId, sheetGid) {
    var BASE = "https://sheets.googleapis.com/v4/spreadsheets/";
    setBanner("Loading roadmap from Google Sheet…", false);

    return fetch(
      BASE + spreadsheetId + "?fields=sheets.properties",
      { headers: { "Authorization": "Bearer " + token } }
    )
      .then(function (res) {
        if (!res.ok) throw new Error("Sheets API HTTP " + res.status);
        return res.json();
      })
      .then(function (meta) {
        var sheets = meta.sheets || [];
        var sheetName = null;
        var gidNum = String(sheetGid);
        for (var i = 0; i < sheets.length; i++) {
          var p = sheets[i].properties || {};
          if (String(p.sheetId) === gidNum) { sheetName = p.title; break; }
        }
        if (!sheetName) sheetName = sheets.length ? (sheets[0].properties || {}).title : "Sheet1";
        return fetch(
          BASE + spreadsheetId + "/values/" + encodeURIComponent(sheetName) +
          "?valueRenderOption=FORMATTED_VALUE",
          { headers: { "Authorization": "Bearer " + token } }
        );
      })
      .then(function (res) {
        if (!res.ok) throw new Error("Sheets values HTTP " + res.status);
        return res.json();
      })
      .then(function (body) {
        var rows = body.values || [];
        if (!rows.length) throw new Error("Sheet returned empty data.");
        var parsed = parseProgramMilestonesRows(rows);
        if (!parsed.l1.length && !parsed.l2.length)
          throw new Error("No L1/L2 rows found — verify Level, Milestones, Workstream, Status, ETC columns exist.");
        applyParsed(parsed, "Google Sheet (live)");
      })
      .catch(function (err) {
        useFallback("Sheet error: " + (err && err.message ? err.message : "unknown") +
          ". Showing embedded snapshot.");
      });
  }

  /**
   * OPTION B — Google Sheets API v4 (JSON) with API key.
   * Requires a free API key and the sheet shared as "Anyone with link → Viewer".
   */
  function loadFromSheetsAPI(spreadsheetId, sheetGid, apiKey) {
    var BASE = "https://sheets.googleapis.com/v4/spreadsheets/";
    setBanner("Loading roadmap from Google Sheets API…", false);

    // Step 1 — get sheet name from GID
    return fetch(
      BASE + spreadsheetId + "?key=" + encodeURIComponent(apiKey) + "&fields=sheets.properties",
      { mode: "cors" }
    )
      .then(function (res) {
        if (!res.ok) throw new Error("Sheets API metadata HTTP " + res.status + " — check your API key and sheet sharing.");
        return res.json();
      })
      .then(function (meta) {
        var sheets = (meta.sheets || []);
        var sheetName = null;
        var gidNum = String(sheetGid);
        for (var i = 0; i < sheets.length; i++) {
          var p = sheets[i].properties || {};
          if (String(p.sheetId) === gidNum) {
            sheetName = p.title;
            break;
          }
        }
        if (!sheetName) {
          // Fall back to first sheet
          sheetName = sheets.length > 0 ? (sheets[0].properties || {}).title : "Sheet1";
        }
        // Step 2 — fetch values
        return fetch(
          BASE + spreadsheetId + "/values/" + encodeURIComponent(sheetName) +
          "?key=" + encodeURIComponent(apiKey) + "&valueRenderOption=FORMATTED_VALUE",
          { mode: "cors" }
        );
      })
      .then(function (res) {
        if (!res.ok) throw new Error("Sheets API values HTTP " + res.status);
        return res.json();
      })
      .then(function (body) {
        var rows = body.values || [];
        if (!rows.length) throw new Error("Sheets API returned empty data.");
        var parsed = parseProgramMilestonesRows(rows);
        if (!parsed.l1.length && !parsed.l2.length) {
          throw new Error("No L1/L2 rows found — verify the tab has Level, Milestones, Workstream, Status, ETC columns.");
        }
        applyParsed(parsed, "Google Sheets API");
      })
      .catch(function (err) {
        useFallback(
          "Sheets API error: " + (err && err.message ? err.message : "unknown") +
          ". Falling back to embedded snapshot — check API key, sheet sharing, and that the Sheets API is enabled."
        );
      });
  }

  /**
   * OPTION B — CSV export (no API key needed, sheet must be public).
   */
  function loadFromCsv(url) {
    setBanner("Loading roadmap from Google Sheet CSV…", false);
    return fetch(url, { mode: "cors" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        var parsed = parseProgramMilestonesCSV(text);
        if (!parsed.l1.length && !parsed.l2.length) {
          throw new Error("No L1/L2 rows found — check the tab has Level, Milestones, Workstream, Status, ETC columns.");
        }
        applyParsed(parsed, "Google Sheet CSV");
      })
      .catch(function (err) {
        useFallback(
          "Could not load sheet (" + (err && err.message ? err.message : "error") +
          "). Showing embedded snapshot. Serve over http(s) and verify sheet sharing."
        );
      });
  }

  /**
   * OPTION A (recommended) — Load pre-fetched roadmap-data.json.
   * Generated by fetch-roadmap-data.py (uses same gspread/token.pickle pattern as GDrive.py).
   * Run the Python script locally whenever the sheet changes, then push to GitHub.
   */
  function loadFromJsonFile() {
    setBanner("Loading roadmap data…", false);
    return fetch("roadmap-data.json?_=" + Date.now(), { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("roadmap-data.json not found (HTTP " + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        var l1 = data.l1 || [];
        var l2 = data.l2 || [];
        if (!l1.length && !l2.length) throw new Error("roadmap-data.json has no milestones");
        var ts = data.generated ? " (generated " + data.generated.replace("T", " ").replace("Z", " UTC") + ")" : "";
        applyParsed({ l1: l1, l2: l2 }, "Google Sheet via Python script" + ts);
      });
  }

  function loadFromGoogleSheet() {
    var cfg = window.SIT_ROADMAP_CONFIG || {};
    applyOpenSheetLink();

    var clientId = (cfg.oauthClientId || "").trim();
    var apiKey = (cfg.sheetsApiKey || "").trim();
    var spreadsheetId = (cfg.spreadsheetId || "").trim();
    var sheetGid = String(cfg.sheetGid != null ? cfg.sheetGid : "0").trim();

    // OPTION A — roadmap-data.json (from fetch-roadmap-data.py)
    // Try this first. Falls through to OAuth2 / API key / CSV if not present.
    return loadFromJsonFile().catch(function () {
      // OPTION B — OAuth2 Sign-In (sheet stays private)
      if (clientId && spreadsheetId) {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          return loadFromOAuth(spreadsheetId, sheetGid, clientId);
        }
        var waited = 0;
        return new Promise(function (resolve) {
          var poll = setInterval(function () {
            waited += 200;
            if (window.google && window.google.accounts && window.google.accounts.oauth2) {
              clearInterval(poll);
              resolve(loadFromOAuth(spreadsheetId, sheetGid, clientId));
            } else if (waited >= 5000) {
              clearInterval(poll);
              resolve(
                apiKey && spreadsheetId ? loadFromSheetsAPI(spreadsheetId, sheetGid, apiKey) :
                buildCsvUrl() ? loadFromCsv(buildCsvUrl()) :
                useFallback("Could not load data. Showing embedded snapshot.")
              );
            }
          }, 200);
        });
      }

      // OPTION C — Sheets API key (public sheet)
      if (apiKey && spreadsheetId) {
        return loadFromSheetsAPI(spreadsheetId, sheetGid, apiKey);
      }

      // OPTION D — CSV export (public sheet)
      var csvUrl = buildCsvUrl();
      if (csvUrl) return loadFromCsv(csvUrl);

      useFallback("No data source configured — run fetch-roadmap-data.py to generate roadmap-data.json.");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadFromGoogleSheet();
  });
})();
