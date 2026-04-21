# Roadmap Manager — data schema and dashboard configuration

This document describes the in-browser model (`localStorage` key `roadmap-manager-v2`), computed fields, seed example, and how dashboard / timeline / charts map to that data.

## Entities

### Workstream

| Field   | Type    | Notes |
|--------|---------|--------|
| `id`   | string  | Stable id |
| `name` | string  | Display name |
| `owner`| string  | RACI-style owner label |
| `type` | string  | `milestone-driven` or `service` (service workstreams own readiness-style milestones) |

### Feature

| Field         | Type   | Notes |
|--------------|--------|--------|
| `id`         | string | |
| `name`       | string | |
| `owner`      | string | |
| `status`     | string | `Not Started`, `In Progress`, or `Done` |
| `plannedDate`| string | ISO date `YYYY-MM-DD` (informational) |

### Milestone

| Field                    | Type     | Notes |
|-------------------------|----------|--------|
| `id`                    | string   | |
| `name`                  | string   | |
| `workstreamId`          | string   | FK → workstream |
| `milestoneType`         | string   | `Program`, `Integration`, `Testing`, `Service Readiness`, `External` |
| `status`                | string   | `Not Started`, `In Progress`, `Done` |
| `targetDate`            | string   | ISO date; primary schedule anchor |
| `startDate`             | string   | Optional; timeline bar start |
| `dependsOnMilestoneIds` | string[] | Incomplete deps → **Blocked** |
| `dependsOnFeatureIds`   | string[] | Features not `Done` → **Blocked** |
| `externalDependency`    | string   | Free text (not auto-evaluated for block) |
| `criticalPath`          | boolean  | Marks E2E-critical milestones |

### Intake issue

| Field               | Type   | Notes |
|--------------------|--------|--------|
| `id`               | string | |
| `name`             | string | |
| `type`             | string | `Bug`, `Gap`, `Change` |
| `impact`           | string | `High`, `Medium`, `Low` |
| `linkedMilestoneId`| string | Optional FK |
| `status`           | string | e.g. `Open` |

## Computed fields (per milestone)

Computed in memory when rendering (not persisted):

- **`blocked`**: true if any `dependsOnMilestoneIds` target is not `Done`, or any `dependsOnFeatureIds` target is not `Done`.
- **`blockerReason`**: Human-readable list of blocking deps.
- **`riskScore`**: `3` if blocked and on critical path or overdue; `2` if blocked; else `1`.

**E2E readiness %** (dashboard): among milestones with `criticalPath === true`, fraction with `status === "Done"`, ×100, rounded.

**Upstream — depends on feature**: For each feature with `status !== "Done"`, count non-`Done` milestones that include that feature id in `dependsOnFeatureIds` (**impacted milestones**).

**Upstream — depends on milestone**: For each milestone with `status !== "Done"`, count milestones that list it in `dependsOnMilestoneIds` (**downstream / impacted count**).

## Example seed (demo reset)

Reset loads a DAG aligned with the program / fleet / SW-freeze narrative:

- **Program chain**: Product Feature Completion → … → RPD (via PMB branch, integration complete, SW pre-freeze, freeze, mgmt review).
- **Fleet**: R18.0.0 VIP → Complete Fleet Transition → L2PP Sweeping.
- **Parallel testing**: L2PP feeds USA Scaling Testing and (with Integration Complete + VnV feature) Sweeping – VnV Testing Completion.
- **Gate**: LKG Pre RC VIP and the three testing/integration legs feed **Zero Release Blockers**.
- **Features**: Core scope (In Progress) blocks Product Feature Completion; USA readiness (Not Started) blocks USA Scaling; VnV package (Done) satisfies VnV dep.

## Dashboard “queries” (filters)

| View / widget | Logic |
|---------------|--------|
| Blocking E2E | `criticalPath && blocked && status !== "Done"` |
| Top 5 risks | `status !== "Done"`, sort by `riskScore` desc, then `targetDate` |
| E2E readiness | critical-path done / critical-path total |
| Upstream by feature | incomplete features → impacted milestone counts (see above) |
| Upstream by milestone | incomplete milestones with dependents → downstream count |
| Status pie | Group all milestones by `status` |
| Blocked pie | Count `blocked && status !== "Done"` vs `total - that` |
| Workstream bar | Count milestones per `workstreamId` |
| Dependency impact bar | Same series as “Upstream by feature” (feature name vs impacted count) |

**Milestones table**: optional filter “Critical path only” (`criticalPath === true`).

## Timeline configuration

- **Range**: min/max over all milestones that have at least one of `startDate` or `targetDate`, padded by two days each side.
- **Row**: one per milestone, **grouped by workstream** (sidebar order).
- **Bar geometry**: If only `targetDate` → **dot** (same start/end). If both dates → bar from `startDate` to `targetDate` (swapped if inverted).
- **Color modes**: `status` → Done / In Progress / Not Started palette; `blocked` → red if blocked and open, else neutral gray.
- **Critical path**: `CP` badge on row when `criticalPath` is true.

## Chart configurations (Chart.js)

| Canvas id | Type | Dataset |
|-----------|------|---------|
| `chart-pie-status` | pie | Counts for Not Started / In Progress / Done |
| `chart-pie-blocked` | pie | Blocked (open) vs not blocked (remainder of portfolio) |
| `chart-bar-ws` | horizontal bar | One bar per workstream: milestone count |
| `chart-bar-deps` | horizontal bar | One bar per incomplete feature with impacted milestone count (or `(none)` if empty) |

Charts are destroyed on each full `render()` to avoid leaking Chart instances when switching views.

## Files

- `index.html` — shell, nav, Chart.js CDN, `app.js`
- `app.js` — state, persistence, views, aggregations, Chart wiring
- `styles.css` — layout, dashboard hero, chart grid, Gantt styles
