# Reformulate Injury domain model

**Ticket:** [Reformulate Injury domain model](https://linear.app/jesus-guti-workspace/issue/JES-30/reformulate-injury-domain-model)  
**Accepted:** `JES-30: ok` (2026-08-03)  
**Planning map:** worktree `jes-30` → `.scratch/jes-30-injury-domain/map.md`

## Answer

### Canonical entity

**Injury** is the staff-authored official injury period (episode) for a **Player**. It replaces **InjuryReport** as the name and lifecycle of that concept. Player intake (if retained) is not an official Injury — see JES-33.

### Lifecycle

- Required `startDate`; optional `endDate` (`null` = open).
- Drop `REPORTED` / `UNDER_REVIEW` / `RESOLVED` on the official Injury.
- **`endDate` is inclusive** — last injured calendar day. Active on day D iff `startDate ≤ D` and (`endDate` is null or `D ≤ endDate`).

### Regions and fields

- One Injury ↔ ≥1 **BodyRegion** (unordered unique set); optional `regionDetail`.
- No free-string `bodyPart` as primary; no separate `InjurySide`.
- Required: Player, ≥1 BodyRegion, startDate, cause (free text).
- Optional: severity (`UNKNOWN|MINOR|MODERATE|MAJOR`), endDate on close, staff notes, optional `expectedReturnDate` (hint only, ≠ endDate).

### Status derivation

- Concurrent open Injuries allowed.
- While ≥1 active ⇒ `Player.status = INJURED` (**authoritative**; staff cannot override to another status while open).
- On close of last active Injury: if status is `INJURED` → `AVAILABLE`; never auto-set ILL / UNAVAILABLE / MODIFIED_TRAINING; no prior-status stack.
- Staff may **reopen** and **edit** dates/regions/cause/severity/notes; history follows corrections.

### Scope notes

- Injury is **not** Season-scoped (Player + Team via player).
- Not EMR: no OSICS/ICD, imaging, RTP milestone engines in this domain slice.
- Schema/migration shape deferred to synthesis / implementation backlog.

### Glossary

**Injury** and **BodyRegion** in root `CONTEXT.md`; relationships Player–Injury–BodyRegion.
