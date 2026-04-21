# Integration & Testing Team Roadmap

Derived from **Program Milestones** (Level **L1**) in `SIT Release Roadmap.xlsx`. Dates below use the sheet’s **ETC** column (Excel serials interpreted in the workbook’s date system).

---

## 1. How this roadmap is anchored

| Role of this document | Use the Excel **Program Milestones** sheet as the authoritative list for names, PICs, status, and ETC updates. This file translates those L1 gates into an **Integration & Testing** execution view (phases, dependencies, and joint readiness). |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

---

## 2. Program E2E timeline (L1), ordered by ETC

| Target (ETC) | Milestone | Primary workstream (sheet) | PIC | Status (as in sheet) |
| ------------ | --------- | -------------------------- | --- | --------------------- |
| 2026-04-22 | PMB/Scaling / Diversity Test Plan Strategy | InCar Testing | Bruce | In Progress |
| 2026-04-24 | Product Feature Completion | Product | Kyle | In Progress |
| 2026-04-24 | R18.0.0 VIP | Sys Int | Todd | In Progress |
| 2026-04-26 | L2PP Sweeping CA | InCar Testing | Bruce | In Progress |
| 2026-04-27 | PMB/Scaling / Diversity Test Execution Plan | InCar Testing | Bruce | In Progress |
| 2026-04-29 | Complete Fleet Transition to R18.0.0 VIP | Car Prioritization/Diversity | Toan | Blocked (dep.: R18.0.0 VIP Approval) |
| 2026-05-04 | USA Scaling (Diversity Tier1/Tier2) Testing Completion | Car Prioritization/Diversity | Toan | Blocked (dep.: PMB/Scaling / Diversity test plan & execution plan) |
| 2026-05-05 | R18.1.0 VIP | Sys Int | Todd | Not Started |
| 2026-05-22 | R18 x.x.x VIP | Sys Int | Todd | Not Started |
| 2026-05-22 | R18 PMB Branch Off & Process | PMB | Gaurav | Blocked (dep.: Product Feature Completion) |
| 2026-05-25 | Integration Complete | Program | Moore | Blocked (dep.: R18 PMB Branch Off) |
| 2026-06-08 | SW Pre-Freeze | Program | Moore | Blocked (dep.: Integration Complete) |
| 2026-06-12 | LKG Pre RC VIP | Sys Int | Todd | Not Started |
| 2026-06-19 | Zero Rel Blockers | Sys Int | Todd | Not Started |
| 2026-06-19 | SW Freeze / Harlock | Program | Moore | Blocked (dep.: SW Pre-Freeze) |
| 2026-06-24 | SW Freeze Mgmt Review | Program | Moore | Blocked (dep.: SW Freeze / Harlock) |
| 2026-07-12 | L2PP Sweeping NJ | InCar Testing | Bruce | Not Started |
| 2026-07-12 | Sweeping – VnV Testing Completion | InCar Testing | Bruce | In Progress |
| 2026-07-20 | RPD | Program | Moore | Blocked (dep.: SW Freeze Mgmt Review) |

**Note:** L2PP Sweeping TX (ETC **2026-06-07**) sits between May and June program gates; keep it on the Testing track even though it is not repeated in the table above (see Phase B).

---

## 3. Integration & Testing team view by phase

Phases follow the **natural sequence of dependencies** in the sheet (VIP stack → branch/process → integration complete → freeze chain → RPD), with Testing work parallel where dependencies allow.

### Phase A — Readiness for R18.0.0 and test strategy (approx. late Apr 2026)

**Program gates:** R18.0.0 VIP, Product Feature Completion; Testing strategy/execution plan milestones for PMB/Scaling/Diversity.

| Track | Objectives |
| ----- | ---------- |
| **System integration** | Close **R18.0.0 VIP**; unblock **Complete Fleet Transition to R18.0.0 VIP** (dependency: R18.0.0 VIP Approval). |
| **In-vehicle / sweeping** | Advance **L2PP Sweeping CA**; keep **PMB/Scaling / Diversity Test Plan Strategy** and **Test Execution Plan** on track (these gates feed USA scaling diversity work). |
| **Joint** | Align VIP criteria with what Car Prioritization/Diversity needs for fleet transition and scaling sign-off. |

### Phase B — VIP depth, scaling, and sweeping (May–Jun 2026)

**Program gates:** R18.1.0 VIP, R18 x.x.x VIP, **LKG Pre RC VIP**, **Zero Rel Blockers**; Testing: **L2PP Sweeping TX**, continued CA/NJ sweeping path toward **Sweeping – VnV Testing Completion**.

| Track | Objectives |
| ----- | ---------- |
| **System integration** | Land **R18.1.0 VIP** then **R18 x.x.x VIP**; drive **LKG Pre RC VIP** and **Zero Rel Blockers** toward RC readiness. |
| **Testing** | Execute **L2PP Sweeping TX**; unblock **USA Scaling (Tier1/Tier2) Testing Completion** once plan + execution plan dependencies are satisfied; monitor comments (e.g. test requirements / plan review) with named stakeholders on the sheet. |
| **PMB / program** | Unblock **R18 PMB Branch Off & Process** after **Product Feature Completion**; this feeds **Integration Complete**. |

### Phase C — Branch, integration complete, and freeze (late May–late Jun 2026)

**Program gates:** R18 PMB Branch Off & Process → **Integration Complete** → **SW Pre-Freeze** → **SW Freeze / Harlock** → **SW Freeze Mgmt Review**.

| Track | Objectives |
| ----- | ---------- |
| **Integration** | Treat **Integration Complete** as the hard merge of integration evidence with PMB branch/process reality; ensure **SW Pre-Freeze** entry criteria are measurable (defects, CI, promotion paths). |
| **Testing** | Stabilize sweeping/VnV scope so freeze discussions are not undermined by open **Sweeping – VnV Testing Completion** risk; finalize NJ sweeping if still in flight before RPD. |
| **Joint** | Single “freeze readiness” checklist: VIP stack status, zero-rel posture, and test completion deltas vs ETC. |

### Phase D — Release decision (Jul 2026)

**Program gate:** **RPD** (depends on **SW Freeze Mgmt Review**).

| Track | Objectives |
| ----- | ---------- |
| **All** | Close remaining **Sweeping – VnV** and **L2PP Sweeping NJ** items if not already done; package evidence for RPD. |

---

## 4. Critical path (from sheet dependencies)

1. **Product Feature Completion** → **R18 PMB Branch Off & Process** → **Integration Complete** → **SW Pre-Freeze** → **SW Freeze / Harlock** → **SW Freeze Mgmt Review** → **RPD**  
2. **PMB/Scaling / Diversity Test Plan Strategy** + **PMB/Scaling / Diversity Test Execution Plan** → **USA Scaling (Diversity Tier1/Tier2) Testing Completion**  
3. **R18.0.0 VIP Approval** (implicit) → **Complete Fleet Transition to R18.0.0 VIP**

Integration & Testing should **stand up weekly tracking** on these three chains plus the **VIP sequence** (R18.0.0 → R18.1.0 → R18 x.x.x → LKG Pre RC → Zero Rel Blockers).

---

## 5. Risks called out in the source data

- Several **Program** and **PMB** L1 milestones are marked **Blocked** upstream of freeze; Integration & Testing should treat **Product Feature Completion** and **R18 PMB Branch Off** as schedule drivers.  
- **USA Scaling** and **Complete Fleet Transition** are **Blocked** on dependencies explicitly listed on the sheet; escalate at integrated program review, not only within Testing.  
- **Sweeping – VnV Testing Completion** and **L2PP Sweeping NJ** share the same **ETC (2026-07-12)** as each other and sit near **RPD (2026-07-20)** — reserve buffer or scope triage for that week.

---

## 6. Suggested operating rhythm (for I&T leads)

| Cadence | Focus |
| ------- | ----- |
| Weekly | L1 ETC deltas vs actuals; blocked milestones; VIP + PMB branch + sweeping burn-down. |
| Per gate | Pre-readiness checklist: entry criteria, owners (PIC), dependency satisfied / not satisfied. |
| Pre-freeze | Single integration + test sign-off narrative for **SW Pre-Freeze** / **Harlock**. |

---

*When ETC or status changes in `SIT Release Roadmap.xlsx`, update Phase dates and the risk section in this document to match.*
