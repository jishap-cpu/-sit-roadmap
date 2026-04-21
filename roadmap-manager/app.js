/**
 * Roadmap Manager — data model + computed fields + Notion-style UI
 */
(function () {
  "use strict";

  var STORAGE_KEY = "roadmap-manager-v2";

  function uid() {
    return "id_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function defaultState() {
    var wsProg = uid();
    var wsInt = uid();
    var wsTest = uid();
    var wsFleet = uid();
    var fCore = uid();
    var fUsa = uid();
    var fVnv = uid();
    var pfc = uid();
    var pmb = uid();
    var intc = uid();
    var swpre = uid();
    var swf = uid();
    var swmgmt = uid();
    var rpd = uid();
    var r18vip = uid();
    var fleet = uid();
    var l2pp = uid();
    var sweepvnv = uid();
    var usa = uid();
    var lkg = uid();
    var zero = uid();

    return {
      workstreams: [
        { id: wsProg, name: "Program", owner: "Moore", type: "milestone-driven" },
        { id: wsInt, name: "Integration", owner: "Moore", type: "milestone-driven" },
        { id: wsTest, name: "Testing", owner: "Bruce", type: "milestone-driven" },
        { id: wsFleet, name: "Car & Fleet", owner: "Toan", type: "service" }
      ],
      features: [
        { id: fCore, name: "Core program product scope", owner: "Kyle", status: "In Progress", plannedDate: "2026-04-20" },
        { id: fUsa, name: "USA scaling / diversity test readiness", owner: "Ninad", status: "Not Started", plannedDate: "2026-05-12" },
        { id: fVnv, name: "VnV exit criteria package", owner: "Bruce", status: "Done", plannedDate: "2026-04-01" }
      ],
      milestones: [
        { id: pfc, name: "Product Feature Completion", workstreamId: wsProg, milestoneType: "Program", status: "Not Started", targetDate: "2026-04-24", startDate: "2026-03-01", dependsOnMilestoneIds: [], dependsOnFeatureIds: [fCore], externalDependency: "", criticalPath: true },
        { id: pmb, name: "R18 PMB Branch Off", workstreamId: wsInt, milestoneType: "Integration", status: "Not Started", targetDate: "2026-05-22", startDate: "2026-04-15", dependsOnMilestoneIds: [pfc], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: intc, name: "Integration Complete", workstreamId: wsInt, milestoneType: "Integration", status: "Not Started", targetDate: "2026-05-25", startDate: "2026-05-20", dependsOnMilestoneIds: [pmb], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: swpre, name: "SW Pre-Freeze", workstreamId: wsProg, milestoneType: "Program", status: "Not Started", targetDate: "2026-06-08", startDate: "2026-05-28", dependsOnMilestoneIds: [intc], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: swf, name: "SW Freeze / Harlock", workstreamId: wsProg, milestoneType: "Program", status: "Not Started", targetDate: "2026-06-19", startDate: "2026-06-09", dependsOnMilestoneIds: [swpre], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: swmgmt, name: "SW Freeze Mgmt Review", workstreamId: wsProg, milestoneType: "Program", status: "Not Started", targetDate: "2026-06-24", startDate: "2026-06-20", dependsOnMilestoneIds: [swf], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: rpd, name: "RPD", workstreamId: wsProg, milestoneType: "Program", status: "Not Started", targetDate: "2026-07-20", startDate: "2026-06-25", dependsOnMilestoneIds: [swmgmt], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: r18vip, name: "R18.0.0 VIP", workstreamId: wsFleet, milestoneType: "Service Readiness", status: "Done", targetDate: "2026-04-24", startDate: "2026-04-10", dependsOnMilestoneIds: [], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: fleet, name: "Complete Fleet Transition to R18.0.0", workstreamId: wsFleet, milestoneType: "Service Readiness", status: "In Progress", targetDate: "2026-04-29", startDate: "2026-04-18", dependsOnMilestoneIds: [r18vip], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: l2pp, name: "L2PP Sweeping (all regions)", workstreamId: wsTest, milestoneType: "Testing", status: "Not Started", targetDate: "2026-06-07", startDate: "2026-05-01", dependsOnMilestoneIds: [fleet], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: sweepvnv, name: "Sweeping – VnV Testing Completion", workstreamId: wsTest, milestoneType: "Testing", status: "Not Started", targetDate: "2026-07-12", startDate: "2026-06-01", dependsOnMilestoneIds: [l2pp, intc], dependsOnFeatureIds: [fVnv], externalDependency: "", criticalPath: true },
        { id: usa, name: "USA Scaling Testing Completion", workstreamId: wsTest, milestoneType: "Testing", status: "Not Started", targetDate: "2026-05-04", startDate: "2026-04-22", dependsOnMilestoneIds: [l2pp], dependsOnFeatureIds: [fUsa], externalDependency: "", criticalPath: true },
        { id: lkg, name: "LKG Pre RC VIP", workstreamId: wsInt, milestoneType: "Integration", status: "Not Started", targetDate: "2026-06-12", startDate: "2026-05-20", dependsOnMilestoneIds: [pmb], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true },
        { id: zero, name: "Zero Release Blockers", workstreamId: wsProg, milestoneType: "Program", status: "Not Started", targetDate: "2026-06-19", startDate: "2026-06-14", dependsOnMilestoneIds: [lkg, sweepvnv, usa], dependsOnFeatureIds: [], externalDependency: "", criticalPath: true }
      ],
      intakeIssues: [
        { id: uid(), name: "Unplanned scaling scope question", type: "Change", impact: "Medium", linkedMilestoneId: usa, status: "Open" }
      ]
    };
  }

  var state = loadState() || defaultState();

  function getWorkstream(id) {
    return state.workstreams.find(function (w) {
      return w.id === id;
    });
  }

  function getFeature(id) {
    return state.features.find(function (f) {
      return f.id === id;
    });
  }

  function getMilestone(id) {
    return state.milestones.find(function (m) {
      return m.id === id;
    });
  }

  function isDoneMilestone(m) {
    return m && m.status === "Done";
  }

  function isDoneFeature(f) {
    return f && f.status === "Done";
  }

  function computeBlocked(m) {
    var reasons = [];
    (m.dependsOnMilestoneIds || []).forEach(function (mid) {
      var dep = getMilestone(mid);
      if (!dep || !isDoneMilestone(dep)) {
        reasons.push({ kind: "milestone", id: mid, label: dep ? dep.name : "(removed)" });
      }
    });
    (m.dependsOnFeatureIds || []).forEach(function (fid) {
      var fe = getFeature(fid);
      if (!fe || !isDoneFeature(fe)) {
        reasons.push({ kind: "feature", id: fid, label: fe ? fe.name : "(removed)" });
      }
    });
    return { blocked: reasons.length > 0, reasons: reasons };
  }

  function computeBlockerReason(m) {
    var r = computeBlocked(m);
    if (!r.blocked) return "";
    return r.reasons
      .map(function (x) {
        return x.kind === "milestone" ? "Milestone: " + x.label : "Feature: " + x.label;
      })
      .join(" · ");
  }

  function computeRiskScore(m) {
    var b = computeBlocked(m);
    var overdue =
      m.targetDate &&
      m.status !== "Done" &&
      new Date(m.targetDate + "T23:59:59") < new Date(new Date().setHours(0, 0, 0, 0));
    if (b.blocked && m.criticalPath) return 3;
    if (overdue) return 3;
    if (b.blocked) return 2;
    return 1;
  }

  function enrichMilestone(m) {
    var b = computeBlocked(m);
    return Object.assign({}, m, {
      blocked: b.blocked,
      blockerReason: computeBlockerReason(m),
      riskScore: computeRiskScore(m)
    });
  }

  function allMilestonesEnriched() {
    return state.milestones.map(enrichMilestone);
  }

  function e2eReadinessPercent() {
    var crit = state.milestones.filter(function (m) {
      return m.criticalPath;
    });
    if (!crit.length) return 0;
    var done = crit.filter(function (m) {
      return m.status === "Done";
    }).length;
    return Math.round((100 * done) / crit.length);
  }

  /** Incomplete features with count of non-Done milestones that depend on them (dependency impact). */
  function upstreamImpactsByFeature() {
    var enriched = allMilestonesEnriched();
    return state.features
      .filter(function (f) {
        return !isDoneFeature(f);
      })
      .map(function (f) {
        var count = enriched.filter(function (m) {
          if (m.status === "Done") return false;
          return (m.dependsOnFeatureIds || []).indexOf(f.id) >= 0;
        }).length;
        return { feature: f, impactedCount: count };
      })
      .filter(function (x) {
        return x.impactedCount > 0;
      })
      .sort(function (a, b) {
        return b.impactedCount - a.impactedCount;
      });
  }

  /** Non-Done milestones that others depend on, with count of direct downstream milestones. */
  function upstreamImpactsByMilestone() {
    return state.milestones
      .filter(function (b) {
        return !isDoneMilestone(b);
      })
      .map(function (b) {
        var impactedCount = state.milestones.filter(function (m) {
          return (m.dependsOnMilestoneIds || []).indexOf(b.id) >= 0;
        }).length;
        return { milestone: b, impactedCount: impactedCount };
      })
      .filter(function (x) {
        return x.impactedCount > 0;
      })
      .sort(function (a, b) {
        return b.impactedCount - a.impactedCount;
      });
  }

  function parseDay(iso) {
    if (!iso) return NaN;
    return new Date(iso + "T12:00:00").getTime();
  }

  /** { startMs, endMs, isDot } — target-only uses same day for start/end. */
  function milestoneWindowMs(m) {
    var t = parseDay(m.targetDate);
    var s = parseDay(m.startDate);
    if (!m.targetDate && !m.startDate) return null;
    if (m.targetDate && !m.startDate) {
      return { startMs: t, endMs: t, isDot: true };
    }
    if (!m.targetDate && m.startDate) {
      return { startMs: s, endMs: s, isDot: true };
    }
    var startMs = s;
    var endMs = t;
    if (endMs < startMs) {
      var swap = startMs;
      startMs = endMs;
      endMs = swap;
    }
    return { startMs: startMs, endMs: endMs, isDot: false };
  }

  function globalTimelineRange() {
    var wins = state.milestones.map(milestoneWindowMs).filter(Boolean);
    if (!wins.length) return null;
    var minT = Math.min.apply(
      null,
      wins.map(function (w) {
        return w.startMs;
      })
    );
    var maxT = Math.max.apply(
      null,
      wins.map(function (w) {
        return w.endMs;
      })
    );
    if (minT === maxT) maxT = minT + 86400000 * 14;
    var pad = 86400000 * 2;
    return { minT: minT - pad, maxT: maxT + pad };
  }

  function ganttBarClass(m, colorMode) {
    if (colorMode === "blocked") {
      return m.blocked && m.status !== "Done" ? "gantt-bar-blocked" : "gantt-bar-clear";
    }
    if (m.status === "Done") return "gantt-bar-done";
    if (m.status === "In Progress") return "gantt-bar-progress";
    return "gantt-bar-todo";
  }

  var activeView = "dashboard";
  var modal = null;
  var milestoneFilterCritical = false;
  var timelineColorMode = "status";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setView(v) {
    activeView = v;
    document.querySelectorAll(".nav-item").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.view === v);
    });
    render();
  }

  function openModal(title, bodyHtml, onSave, onCancel) {
    modal = { title: title, bodyHtml: bodyHtml, onSave: onSave, onCancel: onCancel };
    renderModal();
  }

  function closeModal() {
    modal = null;
    var el = document.getElementById("modal-root");
    if (el) el.innerHTML = "";
  }

  function renderModal() {
    var root = document.getElementById("modal-root");
    if (!modal) {
      root.innerHTML = "";
      return;
    }
    root.innerHTML =
      '<div class="modal-backdrop" id="modal-backdrop">' +
      '<div class="modal" role="dialog">' +
      '<div class="modal-header">' +
      esc(modal.title) +
      "</div>" +
      '<div class="modal-body">' +
      modal.bodyHtml +
      "</div>" +
      '<div class="modal-footer">' +
      '<button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>' +
      '<button type="button" class="btn btn-primary" id="modal-save">Save</button>' +
      "</div></div></div>";
    document.getElementById("modal-backdrop").addEventListener("click", function (e) {
      if (e.target.id === "modal-backdrop") closeModal();
    });
    document.getElementById("modal-cancel").addEventListener("click", closeModal);
    document.getElementById("modal-save").addEventListener("click", function () {
      if (modal.onSave) modal.onSave();
    });
  }

  function workstreamOptions(selectedId) {
    return state.workstreams
      .map(function (w) {
        return (
          '<option value="' +
          esc(w.id) +
          '"' +
          (w.id === selectedId ? " selected" : "") +
          ">" +
          esc(w.name) +
          "</option>"
        );
      })
      .join("");
  }

  function milestoneMultiOptions(selectedIds, excludeId) {
    selectedIds = selectedIds || [];
    return state.milestones
      .filter(function (m) {
        return m.id !== excludeId;
      })
      .map(function (m) {
        return (
          '<label class="checkbox-row"><input type="checkbox" name="depM" value="' +
          esc(m.id) +
          '"' +
          (selectedIds.indexOf(m.id) >= 0 ? " checked" : "") +
          " /> " +
          esc(m.name) +
          "</label>"
        );
      })
      .join("");
  }

  function featureMultiOptions(selectedIds) {
    selectedIds = selectedIds || [];
    return state.features
      .map(function (f) {
        return (
          '<label class="checkbox-row"><input type="checkbox" name="depF" value="' +
          esc(f.id) +
          '"' +
          (selectedIds.indexOf(f.id) >= 0 ? " checked" : "") +
          " /> " +
          esc(f.name) +
          "</label>"
        );
      })
      .join("");
  }

  function readChecked(root, name) {
    var out = [];
    root.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (cb) {
      out.push(cb.value);
    });
    return out;
  }

  function renderDashboard() {
    var enriched = allMilestonesEnriched();
    var pct = e2eReadinessPercent();
    var critTotal = state.milestones.filter(function (m) {
      return m.criticalPath;
    }).length;
    var critDone = state.milestones.filter(function (m) {
      return m.criticalPath && m.status === "Done";
    }).length;

    var blockingE2E = enriched.filter(function (m) {
      return m.blocked && m.criticalPath && m.status !== "Done";
    });
    var topRisks = enriched
      .filter(function (m) {
        return m.status !== "Done";
      })
      .sort(function (a, b) {
        if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
        return (a.targetDate || "").localeCompare(b.targetDate || "");
      })
      .slice(0, 5);

    var blockRows =
      blockingE2E.length === 0
        ? '<tr><td colspan="5" class="empty-state">No critical-path milestones are currently blocked.</td></tr>'
        : blockingE2E
            .map(function (m) {
              var ws = getWorkstream(m.workstreamId);
              return (
                "<tr><td>" +
                esc(m.name) +
                "</td><td>" +
                esc(ws ? ws.name : "—") +
                '</td><td><span class="badge badge-type">' +
                esc(m.milestoneType) +
                "</span></td><td>" +
                esc(m.blockerReason) +
                '</td><td><span class="badge badge-risk-' +
                m.riskScore +
                '">Risk ' +
                m.riskScore +
                "</span></td></tr>"
              );
            })
            .join("");

    var riskRows = topRisks
      .map(function (m) {
        var ws = getWorkstream(m.workstreamId);
        return (
          "<tr><td>" +
          esc(m.name) +
          "</td><td>" +
          esc(ws ? ws.name : "—") +
          '</td><td><span class="badge badge-risk-' +
          m.riskScore +
          '">' +
          m.riskScore +
          "</span></td><td>" +
          (m.blocked ? '<span class="badge badge-blocked">Blocked</span>' : "—") +
          "</td><td>" +
          esc(m.targetDate || "—") +
          "</td></tr>"
        );
      })
      .join("");

    var byFeat = upstreamImpactsByFeature();
    var featRows =
      byFeat.length === 0
        ? '<tr><td colspan="2" class="empty-state">No open feature dependencies affecting milestones.</td></tr>'
        : byFeat
            .map(function (x) {
              return (
                "<tr><td>" +
                esc(x.feature.name) +
                '</td><td style="font-variant-numeric:tabular-nums;font-weight:600">' +
                x.impactedCount +
                "</td></tr>"
              );
            })
            .join("");

    var byMs = upstreamImpactsByMilestone();
    var msRows =
      byMs.length === 0
        ? '<tr><td colspan="2" class="empty-state">No incomplete milestone dependencies with downstream work.</td></tr>'
        : byMs
            .map(function (x) {
              return (
                "<tr><td>" +
                esc(x.milestone.name) +
                '</td><td style="font-variant-numeric:tabular-nums;font-weight:600">' +
                x.impactedCount +
                "</td></tr>"
              );
            })
            .join("");

    return (
      '<h1 class="view-title">Dashboard</h1>' +
      '<p class="view-desc">Executive view: E2E readiness on the critical path, dependency-driven delay signals, and portfolio charts. Open <strong>Timeline</strong> for a Gantt grouped by workstream.</p>' +
      '<div class="dashboard-hero">' +
      '<div class="readiness-card">' +
      '<div class="readiness-pct">' +
      pct +
      "%</div>" +
      '<div class="readiness-meta"><strong>E2E readiness</strong><span class="cell-muted">Critical-path milestones completed · ' +
      critDone +
      " / " +
      critTotal +
      "</span></div></div>" +
      '<p class="readiness-foot cell-muted">Use <em>Intake / Issues</em> for unplanned work; dependencies and dates drive blocked state.</p>' +
      "</div>" +
      '<div class="dashboard-grid">' +
      '<div class="panel"><div class="panel-header">What is blocking E2E right now</div><div class="panel-body">' +
      '<table class="mini-table"><thead><tr><th>Milestone</th><th>Workstream</th><th>Type</th><th>Blocker</th><th>Risk</th></tr></thead><tbody>' +
      blockRows +
      "</tbody></table></div></div>" +
      '<div class="panel"><div class="panel-header">Top 5 risks</div><div class="panel-body">' +
      '<table class="mini-table"><thead><tr><th>Milestone</th><th>Workstream</th><th>Risk</th><th>Blocked</th><th>Target</th></tr></thead><tbody>' +
      riskRows +
      "</tbody></table></div></div>" +
      "</div>" +
      '<div class="dashboard-grid">' +
      '<div class="panel"><div class="panel-header">Upstream causes — depends on feature</div><div class="panel-body">' +
      '<table class="mini-table"><thead><tr><th>Feature (incomplete)</th><th>Impacted milestones</th></tr></thead><tbody>' +
      featRows +
      "</tbody></table></div></div>" +
      '<div class="panel"><div class="panel-header">Upstream causes — depends on milestone</div><div class="panel-body">' +
      '<table class="mini-table"><thead><tr><th>Milestone (not Done)</th><th>Downstream count</th></tr></thead><tbody>' +
      msRows +
      "</tbody></table></div></div>" +
      "</div>" +
      '<div class="chart-grid">' +
      '<div class="chart-card"><div class="chart-card-title">Status distribution</div><canvas id="chart-pie-status" height="200"></canvas></div>' +
      '<div class="chart-card"><div class="chart-card-title">Blocked vs not blocked</div><canvas id="chart-pie-blocked" height="200"></canvas></div>' +
      '<div class="chart-card"><div class="chart-card-title">Workstream load (milestones)</div><canvas id="chart-bar-ws" height="220"></canvas></div>' +
      '<div class="chart-card"><div class="chart-card-title">Dependency impact (by feature)</div><canvas id="chart-bar-deps" height="220"></canvas></div>' +
      "</div>" +
      '<div class="flow-diagram">' +
      "<strong>Model:</strong> Incomplete <em>features</em> and <em>milestones</em> in <em>Depends on</em> fields propagate <strong>Blocked</strong>. " +
      "Service workstreams publish <strong>Service Readiness</strong> milestones that gate testing and integration. Critical path marks milestones whose slip directly affects E2E exit." +
      "</div>"
    );
  }

  function renderTimelineView() {
    var range = globalTimelineRange();
    var legendStatus =
      '<span class="gantt-legend-swatch gantt-bar-done"></span> Done ' +
      '<span class="gantt-legend-swatch gantt-bar-progress"></span> In progress ' +
      '<span class="gantt-legend-swatch gantt-bar-todo"></span> Not started';
    var legendBlocked =
      '<span class="gantt-legend-swatch gantt-bar-blocked"></span> Blocked ' +
      '<span class="gantt-legend-swatch gantt-bar-clear"></span> Not blocked';

    if (!range) {
      return (
        '<div class="timeline-view-wide">' +
        '<h1 class="view-title">Timeline</h1>' +
        '<p class="view-desc">Gantt-style view grouped by workstream. Add target dates to milestones to see the schedule.</p>' +
        '<p class="cell-muted">No schedule data.</p></div>'
      );
    }

    var minT = range.minT;
    var maxT = range.maxT;
    var span = maxT - minT || 1;

    var wsSections = state.workstreams
      .map(function (ws) {
        var msList = allMilestonesEnriched()
          .filter(function (m) {
            return m.workstreamId === ws.id;
          })
          .sort(function (a, b) {
            var wa = milestoneWindowMs(a);
            var wb = milestoneWindowMs(b);
            var ta = wa ? wa.startMs : 0;
            var tb = wb ? wb.startMs : 0;
            return ta - tb;
          });

        var rows = msList
          .map(function (m) {
            var win = milestoneWindowMs(m);
            if (!win) {
              return (
                '<div class="gantt-row">' +
                '<div class="gantt-label"><span class="gantt-name">' +
                esc(m.name) +
                '</span><span class="cell-muted">No dates</span></div><div class="gantt-track"></div></div>'
              );
            }
            var left = ((win.startMs - minT) / span) * 100;
            var width = ((win.endMs - win.startMs) / span) * 100;
            if (win.isDot) width = Math.max(width, 0.35);
            else width = Math.max(width, 0.8);
            left = Math.max(0, Math.min(100 - width, left));
            var cp = m.criticalPath ? '<span class="gantt-cp" title="Critical path">CP</span>' : "";
            var barCls = ganttBarClass(m, timelineColorMode);
            var tip =
              esc(m.name) +
              " · " +
              (m.startDate || "—") +
              " → " +
              (m.targetDate || "—") +
              (m.blocked ? " · Blocked" : "");
            var inner =
              '<div class="gantt-bar ' +
              barCls +
              (win.isDot ? " is-dot" : "") +
              '" style="left:' +
              left.toFixed(2) +
              "%;width:" +
              width.toFixed(2) +
              '%" title="' +
              tip +
              '"></div>';
            return (
              '<div class="gantt-row">' +
              '<div class="gantt-label"><span class="gantt-name">' +
              esc(m.name) +
              "</span> " +
              cp +
              '<span class="gantt-dates cell-muted">' +
              esc((m.startDate || m.targetDate || "—") + " → " + (m.targetDate || m.startDate || "—")) +
              "</span></div>" +
              '<div class="gantt-track">' +
              inner +
              "</div></div>"
            );
          })
          .join("");

        return (
          '<section class="gantt-ws"><h2 class="gantt-ws-title">' +
          esc(ws.name) +
          '<span class="badge badge-type">' +
          esc(ws.type === "service" ? "Service" : "Milestone-driven") +
          "</span></h2>" +
          rows +
          "</section>"
        );
      })
      .join("");

    var axisStart = new Date(minT).toLocaleDateString();
    var axisEnd = new Date(maxT).toLocaleDateString();

    return (
      '<div class="timeline-view-wide">' +
      '<h1 class="view-title">Timeline</h1>' +
      '<p class="view-desc">Bars use start and target dates; target-only milestones render as dots. Grouped by workstream. Toggle coloring below.</p>' +
      '<div class="toolbar gantt-toolbar">' +
      '<label class="gantt-toggle-label">Color by' +
      '<select id="timeline-color-mode" class="gantt-select">' +
      '<option value="status"' +
      (timelineColorMode === "status" ? " selected" : "") +
      ">Status</option>" +
      '<option value="blocked"' +
      (timelineColorMode === "blocked" ? " selected" : "") +
      ">Blocked</option>" +
      "</select></label>" +
      '<span class="gantt-inline-legend">' +
      (timelineColorMode === "status" ? legendStatus : legendBlocked) +
      "</span></div>" +
      '<div class="gantt-shell panel">' +
      '<div class="gantt-axis-top"><span>' +
      esc(axisStart) +
      "</span><span>" +
      esc(axisEnd) +
      "</span></div>" +
      wsSections +
      '<div class="gantt-axis-bottom"><span>' +
      esc(axisStart) +
      "</span><span>" +
      esc(axisEnd) +
      "</span></div></div></div>"
    );
  }

  function renderMilestones() {
    var list = allMilestonesEnriched();
    if (milestoneFilterCritical) {
      list = list.filter(function (m) {
        return m.criticalPath;
      });
    }
    list.sort(function (a, b) {
      return (a.targetDate || "9999").localeCompare(b.targetDate || "9999");
    });

    var rows = list
      .map(function (m) {
        var ws = getWorkstream(m.workstreamId);
        return (
          "<tr data-id=\"" +
          esc(m.id) +
          "\"><td>" +
          esc(m.name) +
          "</td><td>" +
          esc(ws ? ws.name : "—") +
          '</td><td><span class="badge badge-type">' +
          esc(m.milestoneType) +
          "</span></td><td>" +
          esc(m.status) +
          "</td><td>" +
          esc(m.startDate || "—") +
          "</td><td>" +
          esc(m.targetDate || "—") +
          "</td><td>" +
          (m.criticalPath ? "Yes" : "—") +
          "</td><td>" +
          (m.blocked ? '<span class="badge badge-blocked">Yes</span>' : "—") +
          '</td><td class="cell-muted">' +
          esc(m.blockerReason || "—") +
          '</td><td><span class="badge badge-risk-' +
          m.riskScore +
          '">' +
          m.riskScore +
          "</td>" +
          '<td class="cell-actions"><button type="button" class="link-btn edit-milestone" data-id="' +
          esc(m.id) +
          '">Edit</button> ' +
          '<button type="button" class="link-btn del-milestone" data-id="' +
          esc(m.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");

    return (
      '<h1 class="view-title">Milestones</h1>' +
      '<p class="view-desc">Core delivery objects. Service workstreams appear as <strong>Service Readiness</strong> milestones. Dependencies drive <em>Blocked</em> and <em>Risk</em>.</p>' +
      '<div class="toolbar">' +
      '<button type="button" class="btn btn-primary" id="add-milestone">+ Add milestone</button>' +
      '<button type="button" class="filter-pill' +
      (milestoneFilterCritical ? " is-on" : "") +
      '" id="toggle-cp-filter">Critical path only</button>' +
      "</div>" +
      '<div class="data-table-wrap"><table class="data-table"><thead><tr>' +
      "<th>Name</th><th>Workstream</th><th>Type</th><th>Status</th><th>Start</th><th>Target</th><th>CP</th><th>Blocked</th><th>Blocker</th><th>Risk</th><th></th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div>"
    );
  }

  function renderFeatures() {
    var rows = state.features
      .map(function (f) {
        return (
          "<tr data-id=\"" +
          esc(f.id) +
          "\"><td>" +
          esc(f.name) +
          "</td><td>" +
          esc(f.owner) +
          "</td><td>" +
          esc(f.status) +
          "</td><td>" +
          esc(f.plannedDate || "—") +
          '</td><td class="cell-actions"><button type="button" class="link-btn edit-feature" data-id="' +
          esc(f.id) +
          '">Edit</button> ' +
          '<button type="button" class="link-btn del-feature" data-id="' +
          esc(f.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
    return (
      '<h1 class="view-title">Features</h1>' +
      '<p class="view-desc">Upstream scope items; incomplete features can block milestones.</p>' +
      '<div class="toolbar"><button type="button" class="btn btn-primary" id="add-feature">+ Add feature</button></div>' +
      '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Owner</th><th>Status</th><th>Planned date</th><th></th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="5" class="empty-state">No features</td></tr>') +
      "</tbody></table></div>"
    );
  }

  function renderWorkstreams() {
    var rows = state.workstreams
      .map(function (w) {
        return (
          "<tr><td>" +
          esc(w.name) +
          "</td><td>" +
          esc(w.owner) +
          "</td><td>" +
          esc(w.type === "service" ? "Service" : "Milestone-driven") +
          '</td><td class="cell-actions"><button type="button" class="link-btn edit-ws" data-id="' +
          esc(w.id) +
          '">Edit</button> ' +
          '<button type="button" class="link-btn del-ws" data-id="' +
          esc(w.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
    return (
      '<h1 class="view-title">Workstreams</h1>' +
      '<p class="view-desc"><strong>Milestone-driven</strong> (Integration, Testing) vs <strong>Service</strong> (Car Allocation, Infra). Services surface as readiness milestones.</p>' +
      '<div class="toolbar"><button type="button" class="btn btn-primary" id="add-ws">+ Add workstream</button></div>' +
      '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Owner</th><th>Type</th><th></th></tr></thead><tbody>' +
      rows +
      "</tbody></table></div>"
    );
  }

  function renderIntake() {
    var rows = state.intakeIssues
      .map(function (i) {
        var m = i.linkedMilestoneId ? getMilestone(i.linkedMilestoneId) : null;
        return (
          "<tr><td>" +
          esc(i.name) +
          "</td><td>" +
          esc(i.type) +
          "</td><td>" +
          esc(i.impact) +
          "</td><td>" +
          esc(m ? m.name : "—") +
          "</td><td>" +
          esc(i.status) +
          '</td><td class="cell-actions"><button type="button" class="link-btn edit-intake" data-id="' +
          esc(i.id) +
          '">Edit</button> ' +
          '<button type="button" class="link-btn del-intake" data-id="' +
          esc(i.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
    var mopts =
      '<option value="">—</option>' +
      state.milestones
        .map(function (m) {
          return '<option value="' + esc(m.id) + '">' + esc(m.name) + "</option>";
        })
        .join("");
    return (
      '<h1 class="view-title">Intake / Issues</h1>' +
      '<p class="view-desc">Bugs, gaps, and changes linked to milestones for traceability.</p>' +
      '<div class="toolbar"><button type="button" class="btn btn-primary" id="add-intake">+ Add item</button></div>' +
      '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Item</th><th>Type</th><th>Impact</th><th>Linked milestone</th><th>Status</th><th></th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="6" class="empty-state">No intake items</td></tr>') +
      "</tbody></table></div>"
    );
  }

  function destroyAllCharts() {
    if (typeof Chart === "undefined" || !Chart.getChart) return;
    ["chart-pie-status", "chart-pie-blocked", "chart-bar-ws", "chart-bar-deps"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var ch = Chart.getChart(el);
      if (ch) ch.destroy();
    });
  }

  function initDashboardCharts() {
    if (typeof Chart === "undefined") return;
    var enriched = allMilestonesEnriched();
    var font = { family: "Inter, ui-sans-serif, system-ui, sans-serif", size: 11 };

    var stLabels = ["Not Started", "In Progress", "Done"];
    var stData = stLabels.map(function (lab) {
      return enriched.filter(function (m) {
        return m.status === lab;
      }).length;
    });
    var elPie = document.getElementById("chart-pie-status");
    if (elPie) {
      new Chart(elPie, {
        type: "pie",
        data: {
          labels: stLabels,
          datasets: [
            {
              data: stData,
              backgroundColor: ["#d1d5db", "#3b82f6", "#10b981"],
              borderWidth: 1,
              borderColor: "#fff"
            }
          ]
        },
        options: {
          plugins: { legend: { position: "bottom", labels: { font: font } } },
          maintainAspectRatio: false
        }
      });
    }

    var blocked = enriched.filter(function (m) {
      return m.blocked && m.status !== "Done";
    }).length;
    var notBlocked = Math.max(0, enriched.length - blocked);
    var elBlk = document.getElementById("chart-pie-blocked");
    if (elBlk) {
      new Chart(elBlk, {
        type: "pie",
        data: {
          labels: ["Blocked (open work)", "Not blocked"],
          datasets: [
            {
              data: [blocked, notBlocked],
              backgroundColor: ["#fca5a5", "#bbf7d0"],
              borderWidth: 1,
              borderColor: "#fff"
            }
          ]
        },
        options: {
          plugins: { legend: { position: "bottom", labels: { font: font } } },
          maintainAspectRatio: false
        }
      });
    }

    var wsLabels = state.workstreams.map(function (w) {
      return w.name;
    });
    var wsCounts = state.workstreams.map(function (w) {
      return state.milestones.filter(function (m) {
        return m.workstreamId === w.id;
      }).length;
    });
    var elWs = document.getElementById("chart-bar-ws");
    if (elWs) {
      new Chart(elWs, {
        type: "bar",
        data: {
          labels: wsLabels,
          datasets: [
            {
              label: "Milestones",
              data: wsCounts,
              backgroundColor: "#60a5fa",
              borderRadius: 4
            }
          ]
        },
        options: {
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1, font: font } },
            y: { ticks: { font: font } }
          },
          maintainAspectRatio: false
        }
      });
    }

    var depRows = upstreamImpactsByFeature();
    var elDep = document.getElementById("chart-bar-deps");
    if (elDep) {
      var depLabels =
        depRows.length > 0
          ? depRows.map(function (r) {
              return r.feature.name;
            })
          : ["(none)"];
      var depData =
        depRows.length > 0
          ? depRows.map(function (r) {
              return r.impactedCount;
            })
          : [0];
      new Chart(elDep, {
        type: "bar",
        data: {
          labels: depLabels,
          datasets: [
            {
              label: "Impacted milestones",
              data: depData,
              backgroundColor: "#f97316",
              borderRadius: 4
            }
          ]
        },
        options: {
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { font: font } },
            y: { ticks: { font: font } }
          },
          maintainAspectRatio: false
        }
      });
    }
  }

  function renderMain() {
    var main = document.getElementById("main-content");
    var shell = document.querySelector(".main");
    if (shell) shell.classList.toggle("main--wide", activeView === "timeline");
    if (activeView === "dashboard") main.innerHTML = renderDashboard();
    else if (activeView === "milestones") main.innerHTML = renderMilestones();
    else if (activeView === "features") main.innerHTML = renderFeatures();
    else if (activeView === "workstreams") main.innerHTML = renderWorkstreams();
    else if (activeView === "intake") main.innerHTML = renderIntake();
    else if (activeView === "timeline") main.innerHTML = renderTimelineView();
    bindMainHandlers();
  }

  function bindMainHandlers() {
    document.querySelectorAll(".nav-item").forEach(function (b) {
      b.onclick = function () {
        setView(b.dataset.view);
      };
    });

    var addM = document.getElementById("add-milestone");
    if (addM) addM.onclick = function () { editMilestone(null); };

    var tf = document.getElementById("toggle-cp-filter");
    if (tf) {
      tf.onclick = function () {
        milestoneFilterCritical = !milestoneFilterCritical;
        render();
      };
    }

    document.querySelectorAll(".edit-milestone").forEach(function (b) {
      b.onclick = function () {
        editMilestone(b.dataset.id);
      };
    });
    document.querySelectorAll(".del-milestone").forEach(function (b) {
      b.onclick = function () {
        if (!confirm("Delete milestone?")) return;
        state.milestones = state.milestones.filter(function (m) {
          return m.id !== b.dataset.id;
        });
        saveState(state);
        render();
      };
    });

    var addF = document.getElementById("add-feature");
    if (addF) addF.onclick = function () { editFeature(null); };
    document.querySelectorAll(".edit-feature").forEach(function (b) {
      b.onclick = function () {
        editFeature(b.dataset.id);
      };
    });
    document.querySelectorAll(".del-feature").forEach(function (b) {
      b.onclick = function () {
        if (!confirm("Delete feature?")) return;
        state.features = state.features.filter(function (f) {
          return f.id !== b.dataset.id;
        });
        state.milestones.forEach(function (m) {
          m.dependsOnFeatureIds = (m.dependsOnFeatureIds || []).filter(function (id) {
            return id !== b.dataset.id;
          });
        });
        saveState(state);
        render();
      };
    });

    var addW = document.getElementById("add-ws");
    if (addW) addW.onclick = function () { editWorkstream(null); };
    document.querySelectorAll(".edit-ws").forEach(function (b) {
      b.onclick = function () {
        editWorkstream(b.dataset.id);
      };
    });
    document.querySelectorAll(".del-ws").forEach(function (b) {
      b.onclick = function () {
        if (!confirm("Delete workstream? Milestones using it will break.")) return;
        state.workstreams = state.workstreams.filter(function (w) {
          return w.id !== b.dataset.id;
        });
        saveState(state);
        render();
      };
    });

    var addI = document.getElementById("add-intake");
    if (addI) addI.onclick = function () { editIntake(null); };
    document.querySelectorAll(".edit-intake").forEach(function (b) {
      b.onclick = function () {
        editIntake(b.dataset.id);
      };
    });
    document.querySelectorAll(".del-intake").forEach(function (b) {
      b.onclick = function () {
        if (!confirm("Delete?")) return;
        state.intakeIssues = state.intakeIssues.filter(function (x) {
          return x.id !== b.dataset.id;
        });
        saveState(state);
        render();
      };
    });

    var tcm = document.getElementById("timeline-color-mode");
    if (tcm) {
      tcm.onchange = function () {
        timelineColorMode = tcm.value;
        render();
      };
    }
  }

  function editMilestone(id) {
    var m = id ? getMilestone(id) : null;
    var body =
      '<div class="form-row"><label>Milestone name</label><input type="text" id="f-name" value="' +
      esc(m ? m.name : "") +
      '" /></div>' +
      '<div class="form-row"><label>Workstream</label><select id="f-ws">' +
      workstreamOptions(m ? m.workstreamId : state.workstreams[0] && state.workstreams[0].id) +
      "</select></div>" +
      '<div class="form-row"><label>Milestone type</label><select id="f-type">' +
      ["Program", "Integration", "Testing", "Service Readiness", "External"]
        .map(function (t) {
          return (
            "<option" +
            (m && m.milestoneType === t ? " selected" : "") +
            ">" +
            t +
            "</option>"
          );
        })
        .join("") +
      "</select></div>" +
      '<div class="form-row"><label>Status</label><select id="f-status">' +
      ["Not Started", "In Progress", "Done"]
        .map(function (t) {
          return (
            "<option" +
            (m && m.status === t ? " selected" : !m && t === "Not Started" ? " selected" : "") +
            ">" +
            t +
            "</option>"
          );
        })
        .join("") +
      "</select></div>" +
      '<div class="form-row"><label>Target date</label><input type="date" id="f-target" value="' +
      esc(m ? m.targetDate || "" : "") +
      '" /></div>' +
      '<div class="form-row"><label>Start date (optional)</label><input type="date" id="f-start" value="' +
      esc(m ? m.startDate || "" : "") +
      '" /></div>' +
      '<div class="form-row"><label>Depends on milestones</label><div id="depM-wrap">' +
      milestoneMultiOptions(m ? m.dependsOnMilestoneIds : [], m && m.id) +
      "</div></div>" +
      '<div class="form-row"><label>Depends on features</label><div id="depF-wrap">' +
      featureMultiOptions(m ? m.dependsOnFeatureIds : []) +
      "</div></div>" +
      '<div class="form-row"><label>External dependency (text)</label><textarea id="f-ext">' +
      esc(m ? m.externalDependency || "" : "") +
      "</textarea></div>" +
      '<div class="form-row checkbox-row"><input type="checkbox" id="f-cp" ' +
      (m && m.criticalPath ? "checked" : "") +
      ' /><label for="f-cp" style="margin:0;text-transform:none;font-weight:600">Critical path (delay impacts E2E)</label></div>';

    openModal(m ? "Edit milestone" : "New milestone", body, function () {
      var root = document.getElementById("modal-root");
      var box = root.querySelector(".modal-body");
      var rec = {
        id: m ? m.id : uid(),
        name: document.getElementById("f-name").value.trim(),
        workstreamId: document.getElementById("f-ws").value,
        milestoneType: document.getElementById("f-type").value,
        status: document.getElementById("f-status").value,
        targetDate: document.getElementById("f-target").value,
        startDate: document.getElementById("f-start").value,
        dependsOnMilestoneIds: readChecked(box, "depM"),
        dependsOnFeatureIds: readChecked(box, "depF"),
        externalDependency: document.getElementById("f-ext").value.trim(),
        criticalPath: document.getElementById("f-cp").checked
      };
      if (!rec.name) {
        alert("Name required");
        return;
      }
      if (m) {
        var ix = state.milestones.findIndex(function (x) {
          return x.id === m.id;
        });
        state.milestones[ix] = rec;
      } else state.milestones.push(rec);
      saveState(state);
      closeModal();
      render();
    });
  }

  function editFeature(id) {
    var f = id ? getFeature(id) : null;
    var body =
      '<div class="form-row"><label>Feature name</label><input type="text" id="ff-name" value="' +
      esc(f ? f.name : "") +
      '" /></div>' +
      '<div class="form-row"><label>Owner</label><input type="text" id="ff-owner" value="' +
      esc(f ? f.owner : "") +
      '" /></div>' +
      '<div class="form-row"><label>Status</label><select id="ff-status">' +
      ["Not Started", "In Progress", "Done"]
        .map(function (t) {
          return "<option" + (f && f.status === t ? " selected" : "") + ">" + t + "</option>";
        })
        .join("") +
      "</select></div>" +
      '<div class="form-row"><label>Planned date</label><input type="date" id="ff-date" value="' +
      esc(f ? f.plannedDate || "" : "") +
      '" /></div>';

    openModal(f ? "Edit feature" : "New feature", body, function () {
      var rec = {
        id: f ? f.id : uid(),
        name: document.getElementById("ff-name").value.trim(),
        owner: document.getElementById("ff-owner").value.trim(),
        status: document.getElementById("ff-status").value,
        plannedDate: document.getElementById("ff-date").value
      };
      if (!rec.name) {
        alert("Name required");
        return;
      }
      if (f) {
        var ix = state.features.findIndex(function (x) {
          return x.id === f.id;
        });
        state.features[ix] = rec;
      } else state.features.push(rec);
      saveState(state);
      closeModal();
      render();
    });
  }

  function editWorkstream(id) {
    var w = id ? state.workstreams.find(function (x) { return x.id === id; }) : null;
    var body =
      '<div class="form-row"><label>Workstream name</label><input type="text" id="fw-name" value="' +
      esc(w ? w.name : "") +
      '" /></div>' +
      '<div class="form-row"><label>Owner</label><input type="text" id="fw-owner" value="' +
      esc(w ? w.owner : "") +
      '" /></div>' +
      '<div class="form-row"><label>Type</label><select id="fw-type">' +
      '<option value="milestone-driven"' +
      (!w || w.type === "milestone-driven" ? " selected" : "") +
      ">Milestone-driven</option>" +
      '<option value="service"' +
      (w && w.type === "service" ? " selected" : "") +
      ">Service</option></select></div>";

    openModal(w ? "Edit workstream" : "New workstream", body, function () {
      var rec = {
        id: w ? w.id : uid(),
        name: document.getElementById("fw-name").value.trim(),
        owner: document.getElementById("fw-owner").value.trim(),
        type: document.getElementById("fw-type").value
      };
      if (!rec.name) {
        alert("Name required");
        return;
      }
      if (w) {
        var ix = state.workstreams.findIndex(function (x) {
          return x.id === w.id;
        });
        state.workstreams[ix] = rec;
      } else state.workstreams.push(rec);
      saveState(state);
      closeModal();
      render();
    });
  }

  function editIntake(id) {
    var it = id ? state.intakeIssues.find(function (x) { return x.id === id; }) : null;
    var mopts =
      '<option value="">—</option>' +
      state.milestones
        .map(function (m) {
          return (
            '<option value="' +
            esc(m.id) +
            '"' +
            (it && it.linkedMilestoneId === m.id ? " selected" : "") +
            ">" +
            esc(m.name) +
            "</option>"
          );
        })
        .join("");
    var body =
      '<div class="form-row"><label>Item name</label><input type="text" id="fi-name" value="' +
      esc(it ? it.name : "") +
      '" /></div>' +
      '<div class="form-row"><label>Type</label><select id="fi-type">' +
      ["Bug", "Gap", "Change"]
        .map(function (t) {
          return "<option" + (it && it.type === t ? " selected" : "") + ">" + t + "</option>";
        })
        .join("") +
      "</select></div>" +
      '<div class="form-row"><label>Impact</label><select id="fi-impact">' +
      ["High", "Medium", "Low"]
        .map(function (t) {
          return "<option" + (it && it.impact === t ? " selected" : "") + ">" + t + "</option>";
        })
        .join("") +
      "</select></div>" +
      '<div class="form-row"><label>Linked milestone</label><select id="fi-ms">' +
      mopts +
      "</select></div>" +
      '<div class="form-row"><label>Status</label><input type="text" id="fi-st" value="' +
      esc(it ? it.status : "Open") +
      '" placeholder="Open / In progress / Closed" /></div>';

    openModal(it ? "Edit intake item" : "New intake item", body, function () {
      var rec = {
        id: it ? it.id : uid(),
        name: document.getElementById("fi-name").value.trim(),
        type: document.getElementById("fi-type").value,
        impact: document.getElementById("fi-impact").value,
        linkedMilestoneId: (function () {
          var v = document.getElementById("fi-ms").value;
          return v ? v : null;
        })(),
        status: document.getElementById("fi-st").value.trim() || "Open"
      };
      if (!rec.name) {
        alert("Name required");
        return;
      }
      if (it) {
        var ix = state.intakeIssues.findIndex(function (x) {
          return x.id === it.id;
        });
        state.intakeIssues[ix] = rec;
      } else state.intakeIssues.push(rec);
      saveState(state);
      closeModal();
      render();
    });
  }

  function render() {
    destroyAllCharts();
    renderMain();
    if (activeView === "dashboard") {
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(function () {
          initDashboardCharts();
        });
      } else initDashboardCharts();
    }
    renderModal();
  }

  window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".nav-item").forEach(function (b) {
      b.onclick = function () {
        setView(b.dataset.view);
      };
    });
    var reset = document.getElementById("reset-demo");
    if (reset) {
      reset.onclick = function () {
        if (!confirm("Reset all data to demo seed?")) return;
        state = defaultState();
        saveState(state);
        milestoneFilterCritical = false;
        timelineColorMode = "status";
        render();
      };
    }
    render();
  });
})();
