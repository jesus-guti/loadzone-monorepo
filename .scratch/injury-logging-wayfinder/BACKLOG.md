# LoadZone Injury Logging — Implementation backlog

Status: ready for `/to-issues`  
Date: 2026-08-04  
Parent: [MAP.md](MAP.md) · Spec: [SPEC.md](SPEC.md)  
Accepted: `JES-36: ok`

Independently grabbable **tracer-bullet** slices. Prefer one vertical slice per future Linear issue with `plan:` / `risk:` headers for `/orchestrator`.

Suggested labels: Feature · ready-for-agent (when fully specified).

## Linear issues (published 2026-08-04)

| Slice | Linear |
|---|---|
| Schema Injury + BodyRegion + Pain Alert (+ migrate, catalog, status, FormFillMoment) | [JES-50](https://linear.app/jesus-guti-workspace/issue/JES-50) |
| Staff profile: log + close/edit/reopen | [JES-51](https://linear.app/jesus-guti-workspace/issue/JES-51) |
| Team `/injuries` list | [JES-52](https://linear.app/jesus-guti-workspace/issue/JES-52) |
| Wellness exemption (EXEMPTED + reminders + streak) | [JES-53](https://linear.app/jesus-guti-workspace/issue/JES-53) |
| Pain Alert Sheet + promote | [JES-54](https://linear.app/jesus-guti-workspace/issue/JES-54) |
| Profile injury history map | [JES-55](https://linear.app/jesus-guti-workspace/issue/JES-55) |

Orchestrator order: **JES-50** first → then **JES-51 / JES-52 / JES-53 / JES-54** in parallel → **JES-55** after JES-51.

---

## Wave 0 — Schema & domain wiring

- **IL-0a — Prisma: Injury + BodyRegion join + Pain Alert**  
  Introduce Injury (dates, cause, severity optional, staff author, region set); Pain Alert entity or reshaped player-report table; migrate from `InjuryReport`. Acceptance: CONTEXT terms match schema; no player path creates official Injury; active predicate queryable by Team.timezone civil day.

- **IL-0b — Derive Player.status from active Injuries**  
  On create/close/edit: enforce INJURED while ≥1 active; last close → AVAILABLE if was INJURED; block manual status override while open. Acceptance: status never diverges from open injuries; reopen/edit recalculates.

- **IL-0c — Seed / ship BodyRegion catalog**  
  Catalog constants (+ hotspot JSON) shared for apps/app; Spanish labels. Acceptance: matches `artifacts/body-region-catalog.json` ids; assets front/back available to admin UI.

---

## Wave 1 — Staff log + list

- **IL-1a — Staff: Registrar lesión on player profile**  
  Production UI from JES-34: Frente/Espalda multi-select, start, cause, optional detalle, save. Acceptance: creates Injury; status → Lesionado; Spanish copy; no in-memory debug panel.

- **IL-1b — Staff: Dar de alta / edit / reopen**  
  Close with inclusive endDate; edit regions/dates/cause; reopen clears end. Acceptance: inclusive day rules; history follows corrections.

- **IL-1c — Team `/injuries` list**  
  Active + history for team; link to profile; triage Pain Alerts separately or with type badge. Acceptance: staff SoT Injuries distinct from Pain Alerts; promote action stub or full in IL-2b.

---

## Wave 2 — Wellness exemption + reminders

- **IL-2a — EXEMPTED wellness day state**  
  Staff wellness: active Injury ⇒ EXEMPTED (not Pendiente); pendingCount / re-nudge exclude exempt; voluntary COMPLETED + Lesionado; ALERT wins. Acceptance: never “Pendiente” for exempt-only miss.

- **IL-2b — Suppress reminders on exempt days**  
  Cron PRE/POST + staff re-nudge skip players exempt on Team.timezone day D. Acceptance: both paths filtered; Pain Alert alone does not exempt.

- **IL-2c — Excused Absence streak freeze for injury days**  
  Align with design-direction recoverable streak: injury-exempt day freezes; voluntary complete increments. Acceptance: matches SPEC §3 streaks; no guilt UX.

---

## Wave 3 — History + pain alert polish

- **IL-3a — Player profile injury history map**  
  Production UI from JES-35: Total/year, counts, Histórico, region filter; no state dump. Acceptance: matches accepted prototype behavior with real Injuries.

- **IL-3b — Pain Alert player Sheet + staff promote**  
  Keep aviso Sheet; staff promote → Injury (prefill regions/cause if available). Acceptance: alert never sets INJURED alone; Care Alert hook documented if supervision on.

- **IL-3c — Hygiene: FormFillMoment.INJURY_REPORT**  
  Remove or leave unused with comment; no product surface. Acceptance: no half-dead form-engine path.

---

## Out of backlog (explicit)

- OSICS/ICD, imaging, sanctions, parent injury portal, physio-only roles, severity-driven exemption.

## Suggested orchestrator order

`IL-0a → IL-0b → IL-0c` then parallel `IL-1*` · `IL-2*` can start after 0a/0b · `IL-3a` after 1a · `IL-3b` after 0a.
