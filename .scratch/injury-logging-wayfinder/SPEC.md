# LoadZone Injury Logging — Specification

Status: accepted (`JES-36: ok` 2026-08-04)  
Date: 2026-08-04  
Parent map: [Injury logging wayfinder](https://linear.app/jesus-guti-workspace/issue/JES-28) · [MAP.md](MAP.md)  
Backlog: [BACKLOG.md](BACKLOG.md)

This spec is **implementation-ready doctrine** for reforming staff injury logging, wellness exemption, pain alerts, and history UX. It does **not** ship product code by itself — promote slices via `/to-issues` then `/orchestrator`.

---

## 1. Goals

1. Staff can **register and close** official **Injuries** with a multi-region body map (front/back photo assets), start/end dates, and cause.
2. While an Injury is active, the player is **not** treated as missing DailyEntry (no Pendiente / no reminders); voluntary check-in remains allowed.
3. `Player.status` **INJURED** is **derived** from ≥1 active Injury.
4. Player **Pain Alert** stays as intake signal only — never the official period.
5. Player profile shows **injury history** (counts on body map + Histórico list).

## 2. Non-goals

- Medical coding (OSICS/ICD), imaging, formal discharge / EMR RTP engines.
- Sanctions / cards.
- Player self-report as official Injury.
- Parent/guardian injury portal (Care Alerts may consume Pain Alert flags per design-direction).
- Shipping throwaway prototype HTML into production as-is (rebuild with design-system).

## 3. Domain (glossary)

Canonical terms live in root `CONTEXT.md`:

| Term | Summary |
|---|---|
| **Injury** | Staff-authored official period; start + optional inclusive end; ≥1 BodyRegion |
| **BodyRegion** | Fixed catalog id (anatomical L/R in id); optional free-text detail |
| **Pain Alert** | Player aviso; not Injury; staff may promote |

### Injury rules (JES-30)

- Required: Player, ≥1 BodyRegion, `startDate`, cause (free text).
- Optional: severity `UNKNOWN|MINOR|MODERATE|MAJOR`, `endDate`, staff notes, `expectedReturnDate` (hint ≠ end).
- Open when `endDate` is null; active on civil day D iff `startDate ≤ D ≤ endDate` (or end null).
- Concurrent opens allowed; while ≥1 active ⇒ status `INJURED` (no manual override while open).
- Last close: if `INJURED` → `AVAILABLE`; never auto ILL/UNAVAILABLE/MODIFIED_TRAINING.
- Staff may reopen/edit; history follows corrections.
- Not Season-scoped.

### Body map (JES-31)

- Assets: `front.png` / `back.png` (catalog + hotspots % `cx`/`cy`/`r`).
- Machine list: [artifacts/body-region-catalog.json](artifacts/body-region-catalog.json).
- Optional **Detalle de zona**; no `OTHER` region in v1.

### Pain Alert (JES-33)

- Keep player footer Sheet + aviso copy in v1.
- Does not set INJURED / exemption.
- Staff triage + explicit promote → Injury.
- Care Alerts (DD-06) may still fire when Parental Supervision is on.

### Wellness exemption (JES-32)

- Clock: **Team.timezone** (default Europe/Madrid).
- No obligation + suppress cron PRE/POST and staff re-nudge on exempt D.
- Staff day state **`EXEMPTED`** (Exento) — never Pendiente for exempt-only miss.
- Voluntary complete → prefer COMPLETED + Lesionado; ALERT wins if signals.
- Streak: exempt day = **Excused Absence** freeze; voluntary complete **increments**.

## 4. UX (accepted prototypes)

### Log + close (JES-34 accepted)

Evidence: worktree `jes-34` `.scratch/jes-34-staff-prototype/prototype/`

- Entry: player profile → **Registrar lesión**.
- Frente/Espalda multi-select; start + cause; optional detalle; save → Lesionado.
- **Dar de alta** with inclusive end → Disponible when last closed.
- Team list `/injuries` remains list/history surface (create primary = profile).

### History (JES-35 accepted)

Evidence: worktree `jes-35` `.scratch/jes-35-history-prototype/prototype/`

- Total + year filters; count badges; Histórico list; badge click filters by region.
- **No** “Estado en memoria” for staff; throwaway may use `?dev=1` only.

## 5. Migration notes (for implementers)

- Today’s `InjuryReport` + statuses REPORTED/UNDER_REVIEW/RESOLVED + free `bodyPart` + `InjurySide` + `reportedByPlayer` must be replaced/split into **Injury** vs **Pain Alert**.
- Prefer explicit migration plan in schema slice (W0): map staff rows → Injury; `reportedByPlayer: true` → Pain Alert; drop unused `FormFillMoment.INJURY_REPORT` or leave unused until forms pass.
- Do not leave a half-dead dual path where player reports create official periods.

## 6. Deferred / fog (ok to leave for later issues)

- Exact Spanish microcopy Exento vs Lesionado.
- Whether severity / expectedReturnDate appear in v1 UI chrome.
- Physio vs coach role split (same STAFF for now).
- Hotspot pixel nudge beyond seed JSON.
- Pain Alert storage reshape details beyond “not Injury”.

## 7. Resolution index

| Ticket | Artifact |
|---|---|
| JES-29 Research | [research/sports-injury-logging-patterns.md](research/sports-injury-logging-patterns.md) |
| JES-31 Catalog | [resolutions/body-region-catalog-and-hotspots.md](resolutions/body-region-catalog-and-hotspots.md) |
| JES-30 Domain | [resolutions/injury-domain-model.md](resolutions/injury-domain-model.md) |
| JES-32 Exemption | [resolutions/wellness-exemption-rules.md](resolutions/wellness-exemption-rules.md) |
| JES-33 Pain alert | [resolutions/player-injury-self-report-fate.md](resolutions/player-injury-self-report-fate.md) |
| JES-34 Log proto | [resolutions/staff-injury-log-prototype.md](resolutions/staff-injury-log-prototype.md) |
| JES-35 History proto | [resolutions/injury-history-prototype.md](resolutions/injury-history-prototype.md) |
