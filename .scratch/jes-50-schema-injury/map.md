# JES-50 — Schema: Injury, BodyRegion, Pain Alert + migrate and catalog

Planning map for [Schema: Injury, BodyRegion, Pain Alert + migrate and catalog](https://linear.app/jesus-guti-workspace/issue/JES-50/schema-injury-bodyregion-pain-alert-migrate-and-catalog).  
Parent: [Injury logging wayfinder](https://linear.app/jesus-guti-workspace/issue/JES-28) · Spec: [SPEC.md](../injury-logging-wayfinder/SPEC.md).  
Blocks: JES-51, JES-52, JES-53, JES-54.  
Route: `plan: auto` · Risk: `alto`.

## Destination

Replace `InjuryReport` with CONTEXT terms **Injury** (staff official period), **BodyRegion** associations, and **Pain Alert** (player intake). Migrate existing rows; ship catalog ids + hotspot metadata + front/back assets for `apps/app`; implement derive/`INJURED` helpers on create/close/edit; leave `FormFillMoment.INJURY_REPORT` unused (no product surface). Active Injury predicate queryable for Team.timezone civil day (inclusive `endDate`). Player paths must not create official Injuries.

## Notes

- **Doctrine already locked (not reopenable here):** JES-30 domain, JES-31 catalog, JES-33 Pain Alert fate, SPEC §§3–5 migration notes, root `CONTEXT.md` glossary/relationships.
- **Code reality (this worktree):** `InjuryReport` with `InjuryStatus` REPORTED/UNDER_REVIEW/RESOLVED, free `bodyPart`, `InjurySide`, `reportedByPlayer`; staff `/injuries` + `updateInjury`; player footer Sheet → `saveInjuryReport` → `InjuryReport(reportedByPlayer: true)` + Care Alert; streak recompute maps InjuryReport intervals via `mapInjuryIntervals` / `isInjuryActiveOnDay`; `FormFillMoment.INJURY_REPORT` enum value exists, no form-engine product path; assets live at `.scratch/injury-logging-wayfinder/assets/{front,back}.png` + `artifacts/body-region-catalog.json`.
- **Out of this ticket:** Full staff log/close/reopen UX (JES-51); team list polish + promote UI (JES-52/54); EXEMPTED wellness day state / reminder suppress (JES-53); history map UI (JES-55); Spanish microcopy polish beyond compile-safe labels.
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not implement. Do not commit.

## Proposed schema (implementation target)

### Enums

- Keep `InjurySeverity` (`UNKNOWN|MINOR|MODERATE|MAJOR`).
- Add `BodyRegionId` Prisma enum: exact ids from `artifacts/body-region-catalog.json` (32 regions).
- Keep `InjurySide` **only** for Pain Alert / Care Alert allow-list compatibility (JES-49); Injuries do not use side.
- Drop `InjuryStatus` after data migrate.
- Leave `FormFillMoment.INJURY_REPORT` in the enum (dormant; comment in schema).

### `Injury`

| Field | Type | Notes |
|---|---|---|
| `id` | cuid | |
| `playerId` | FK Player | cascade |
| `teamId` | FK Team | denormalized for team lists (current pattern) |
| `startDate` | `@db.Date` | required civil day |
| `endDate` | `@db.Date`? | null = open; inclusive when set |
| `cause` | String | required free text |
| `severity` | InjurySeverity | default UNKNOWN |
| `regionDetail` | String? | optional “Detalle de zona” |
| `staffNotes` | String? | |
| `expectedReturnDate` | `@db.Date`? | hint ≠ endDate |
| `createdByUserId` | FK User? | staff author |
| `createdAt` / `updatedAt` | DateTime | |

Relations: `regions InjuryBodyRegion[]` (≥1 enforced in app writes; see HITL for migrate orphans).

Indexes: `[playerId, startDate]`, `[teamId, startDate]`, `[playerId, endDate]`.

### `InjuryBodyRegion`

| Field | Type | Notes |
|---|---|---|
| `id` | cuid | |
| `injuryId` | FK Injury | cascade |
| `regionId` | BodyRegionId | |

`@@unique([injuryId, regionId])`.

### `PainAlert`

| Field | Type | Notes |
|---|---|---|
| `id` | cuid | |
| `playerId` | FK Player | cascade |
| `teamId` | FK Team | denormalized |
| `title` | String | player aviso title (current form) |
| `description` | String? | |
| `bodyPart` | String? | free text for Care Alert location (not BodyRegion) |
| `side` | InjurySide? | preserve JES-49 allow-list |
| `injuryType` | String? | preserve if present |
| `severity` | InjurySeverity | default UNKNOWN (staff-only; not on Guardian) |
| `reportedAt` | DateTime | default now |
| `promotedInjuryId` | FK Injury? | nullable; for JES-54 promote link |
| `createdAt` / `updatedAt` | DateTime | |

Never drives `Player.status` or wellness exemption.

## Migration plan (SQL + data)

1. Create enums/tables above.
2. **Staff rows** (`reportedByPlayer = false`) → `Injury`:
   - `cause` ← `title`
   - `staffNotes` ← coalesce/merge `staffNotes` + `description`
   - `severity` ← as-is
   - `startDate` ← civil day of `occurredAt` else `reportedAt` in Team.timezone (fallback Europe/Madrid)
   - `endDate` ← if `status = RESOLVED`: civil day of `resolvedAt` else `reportedAt`; else null
   - `createdByUserId` ← `reportedByUserId`
   - Regions: see HITL A
3. **Player rows** (`reportedByPlayer = true`) → `PainAlert` (field copy; no status/period).
4. Backfill `Player.status`: for each player with ≥1 active Injury on Team “today”, set `INJURED`; if was `INJURED` and zero active, set `AVAILABLE` (do not auto ILL/UNAVAILABLE/MODIFIED_TRAINING).
5. Drop `InjuryReport` + `InjuryStatus`.
6. Rewire callers so the monorepo typechecks (minimal surfaces — not full JES-51/52 UX).

## Status helpers (`@repo/database`)

- `isInjuryActiveOnCivilDay(startDate, endDate, civilYmd)` — inclusive end; pure.
- `playerHasActiveInjury(playerId, civilYmd, timeZone)` — query helper.
- `syncPlayerStatusFromInjuries(playerId, { timeZone, asOf? })` — ≥1 active ⇒ `INJURED`; if last close and status was `INJURED` ⇒ `AVAILABLE`; never auto other statuses.
- Call sync from future create/close/edit paths; also expose for migration backfill.
- Guard `updatePlayer`: while ≥1 active Injury, reject status ≠ `INJURED`.
- Rewire `recompute-player-streak` `mapInjuryIntervals` to read `Injury.startDate`/`endDate` (Pain Alerts ignored).

## Catalog + assets

- Module e.g. `@repo/database/body-region-catalog` (or package export): typed regions + hotspots + Spanish labels sourced from catalog JSON (ids must match artifact).
- Copy `front.png` / `back.png` into `apps/app/public/body-map/` (Next static). Do not ship legacy `player-body-map.png` as product map.
- Keep scratch artifacts as doctrine source; runtime copy is the app/package deliverable.

## Compile-safe consumer rewires (this ticket)

| Surface | Change |
|---|---|
| `apps/player/.../save-injury.ts` | Write `PainAlert` only; never `Injury` |
| `apps/app/.../injuries/*` | Read Injury + PainAlert; drop REPORTED/UNDER_REVIEW/RESOLVED controls (stub triage OK until JES-52) |
| `care-alerts.ts` | Comment/types: Pain Alert entity; keep bodyPart/side signal shape |
| Seeds / e2e helpers | Point at new models |
| Streak recompute | Injury periods only |

## Decisions so far

### Auto

1. **[auto] Apply JES-30 Injury lifecycle in Prisma** — `startDate` required, optional inclusive `endDate`, no InjuryStatus on official Injury; concurrent opens allowed. Doctrine already accepted.
2. **[auto] BodyRegion via join + `BodyRegionId` enum** — Catalog ids from `body-region-catalog.json`; L/R in id; no free-string primary location; no OTHER. JES-31 locked.
3. **[auto] `regionDetail` on Injury (episode-level)** — Optional free text; not a new catalog entry. Catalog `regionDetail` contract.
4. **[auto] Separate `PainAlert` model** — CONTEXT/JES-33: player intake ≠ Injury. New table (not `reportedByPlayer` flag on Injury).
5. **[auto] Keep `InjurySide` for PainAlert only** — Preserves JES-49 Guardian allow-list `injury.side`; Injuries use region ids.
6. **[auto] Drop `InjuryReport` + `InjuryStatus` after migrate** — SPEC migration notes; avoid dual-path SoT.
7. **[auto] Civil `@db.Date` + Team.timezone** — Active predicate and migration dates use team clock (default Europe/Madrid); matches DailyEntry / streak / care-alerts patterns.
8. **[auto] Denormalize `teamId` on Injury and PainAlert** — Adjacent `InjuryReport` pattern for team-scoped queries.
9. **[auto] Include optional `expectedReturnDate`** — Domain field; UI chrome deferred (SPEC fog).
10. **[auto] Status derive helpers in `@repo/database`** — IL-0b acceptance; streak already depends on injury intervals.
11. **[auto] Block manual status override while open** — Domain: INJURED authoritative while ≥1 active; guard `updatePlayer`.
12. **[auto] Leave `FormFillMoment.INJURY_REPORT` unused** — JES-33 dormant hygiene; removing PG enum value is costly; no product surface / no form templates using it.
13. **[auto] Player save path → PainAlert in this ticket** — AC: player must not create official Injuries; no half-dead dual path. Sheet UX polish = JES-54.
14. **[auto] Minimal staff/compile rewires in this ticket** — Typecheck green; full log/list UX = JES-51/52.
15. **[auto] Streak intervals read Injury only** — Pain Alert never exempts (JES-33 / JES-32).
16. **[auto] Field map staff → Injury** — `title`→`cause`; `description` merged into `staffNotes`; severity kept; author ← `reportedByUserId`; dates from occurred/reported/resolved as above.
17. **[auto] Tests** — Active inclusive predicate; sync INJURED / last-close → AVAILABLE; override blocked while open; player create path does not insert Injury; catalog ids match artifact JSON.

### Assume

18. **[assume] Catalog runtime module + assets under `apps/app/public/body-map/`** — Typed export from `@repo/database` (or dedicated export path); PNGs as Next public static files for admin UI.  
    **Revert:** colocate JSON+assets only under `apps/app/features/injuries/` if package export feels premature (single consumer until JES-51/55).
19. **[assume] `PainAlert.promotedInjuryId` nullable FK now** — Avoids a second migration when JES-54 lands promote.  
    **Revert:** drop column in a follow-up migration if promote stores link elsewhere.
20. **[assume] App-level ≥1 BodyRegion on new writes; no DB CHECK** — Allows HITL migration orphan handling; JES-51 create validates set non-empty.  
    **Revert:** add DB check / trigger after orphans cleaned if desired.
21. **[assume] Staff `/injuries` interim: list Injuries + Pain Alerts without old status machine** — Read-only-ish triage until JES-52; drop REPORTED/UNDER_REVIEW/RESOLVED form.  
    **Revert:** temporary compatibility shim only if needed for a demo day (prefer not).

### Hitl (resolved)

22. **[hitl → accepted] Legacy staff `bodyPart`/`side` → BodyRegion mapping fallback** — Best-effort heuristic; on no match, Injury with `regionDetail` = legacy text and **0** regions; log orphans; ≥1 only on new writes (JES-51). No OTHER / no delete / no coerce to PainAlert.  
    **User:** `JES-50: ok` (2026-08-04) — A accepted as recommended.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1–17 | Doctrine / AC / adjacent patterns | `auto` | Precedent in SPEC, resolutions, CONTEXT, code |
| 18–21 | Contained, reversible packaging / interim UX | `assume` | Feature-local; clean revert paths |
| 22 | Unmappable legacy location → region set | `hitl` | Irreversible data migration quality |

## HITL questions (max 3)

### A — Unmappable staff bodyPart/side (recommend)

**Question:** When a staff `InjuryReport` cannot be mapped to ≥1 `BodyRegionId`, what should migration do?

**Recommendation:** Best-effort heuristic map from `bodyPart` + `InjurySide` (and obvious Spanish/English synonyms) → one or more catalog ids; on no match, create the Injury with `regionDetail` = legacy location string (`bodyPart` / side / injuryType) and **zero** `InjuryBodyRegion` rows; log orphan count; enforce ≥1 region only on new staff writes (JES-51). Do not invent OTHER; do not drop the row; do not coerce into Pain Alert (it was staff-authored).

**Alternatives rejected:** (1) invent OTHER region — contradicts JES-31; (2) skip/delete unmappable staff rows — loses official history; (3) force a wrong catalog id (e.g. HEAD) — corrupts map counts.

## Implementation order (for implementer; not decisions)

1. Prisma models + migration SQL (create → copy → backfill status → drop old).
2. Catalog module + copy assets.
3. Status / active-day helpers + streak rewire + tests.
4. Player `save-injury` → PainAlert; care-alerts comment/types.
5. Staff injuries page/actions + seeds/e2e compile fixes.
6. `updatePlayer` override guard.

## Open fog (explicitly deferred)

- Exact Spanish Exento vs Lesionado microcopy (JES-53 / content).
- Hotspot pixel nudge beyond seed JSON.
- Physio vs coach role split.
- Guardian Care Alert payload graduating from bodyPart/side to BodyRegion ids.
