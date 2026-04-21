    (function () {
      var TODAY = new Date("2026-04-20T12:00:00");
      var L1_RANGE_START = new Date("2026-04-15T12:00:00");
      var L1_RANGE_END = new Date("2026-07-28T12:00:00");
      var L2_RANGE_START = new Date("2026-04-18T12:00:00");
      var L2_RANGE_END = new Date("2026-05-28T12:00:00");

      var ROADMAP_L1 = [
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

      var ROADMAP_L2 = [
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
        var months = options.months || ["Apr 2026", "May 2026", "Jun 2026", "Jul 2026"];
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

      function renderChartsL1() {
        if (typeof Chart === "undefined") return;

        Chart.defaults.color = "#8b95a8";
        Chart.defaults.borderColor = "rgba(255,255,255,0.08)";
        Chart.defaults.font.family = "'Source Sans 3', system-ui, sans-serif";

        var st = countBy(ROADMAP_L1, function (m) {
          return m.st;
        });
        var ctxS = document.getElementById("chart-status");
        if (ctxS) {
          new Chart(ctxS, {
            type: "doughnut",
            data: {
              labels: ["In progress", "Blocked", "Not started"],
              datasets: [{
                data: [st.progress || 0, st.blocked || 0, st.notstarted || 0],
                backgroundColor: ["#3b82f6", "#f87171", "#64748b"],
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

        var wsMap = countBy(ROADMAP_L1, function (m) {
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
        ROADMAP_L1.forEach(function (m) {
          var k = weekKey(new Date(m.date + "T12:00:00"));
          weekMap[k] = (weekMap[k] || 0) + 1;
        });
        var weekKeys = Object.keys(weekMap).sort();
        var ctxZ = document.getElementById("chart-weekly");
        if (ctxZ) {
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

      function renderChartsL2() {
        if (typeof Chart === "undefined") return;

        Chart.defaults.color = "#8b95a8";
        Chart.defaults.borderColor = "rgba(255,255,255,0.08)";
        Chart.defaults.font.family = "'Source Sans 3', system-ui, sans-serif";

        var st = countBy(ROADMAP_L2, function (m) {
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

        var wsMap = countBy(ROADMAP_L2, function (m) {
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
        ROADMAP_L2.forEach(function (m) {
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

      document.addEventListener("DOMContentLoaded", function () {
        renderGanttChart("gantt-root", ROADMAP_L1, {
          rangeStart: L1_RANGE_START,
          rangeEnd: L1_RANGE_END,
          months: ["Apr 2026", "May 2026", "Jun 2026", "Jul 2026"],
          today: TODAY
        });
        renderGanttChart("gantt-l2-root", ROADMAP_L2, {
          rangeStart: L2_RANGE_START,
          rangeEnd: L2_RANGE_END,
          months: ["Apr 2026", "May 2026"],
          today: TODAY
        });
        renderChartsL1();
        renderChartsL2();
      });
    })();
