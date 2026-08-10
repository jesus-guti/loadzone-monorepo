# JES-55 — Player profile injury history map with counts

Planning map for [Player profile injury history map with counts](https://linear.app/jesus-guti-workspace/issue/JES-55/player-profile-injury-history-map-with-counts).  
Parent: [Injury logging wayfinder](https://linear.app/jesus-guti-workspace/issue/JES-28) · accepted prototype [JES-35](https://linear.app/jesus-guti-workspace/issue/JES-35).  
Blocked by: [Staff profile: log Injury + close/edit/reopen](https://linear.app/jesus-guti-workspace/issue/JES-51) (JES-51).  
Route: `plan:auto` · Risk: `medium`.  
Worktree: `../worktrees/rely/jes-55` · branch `jgutierrez/jes-55-injury-history-map`.

## Destination

Ship production **Historial de lesiones** on the staff player profile (`apps/app` `/players/[id]`): Total/year filters, Frente/Espalda body map with per-region count badges, Histórico list, click-badge region filter with clear. Counts and list driven by real **Injury** rows from the DB (post JES-50/51). No staff-facing “Estado en memoria”.

## Notes

- **Doctrine:** [SPEC.md](../injury-logging-wayfinder/SPEC.md) §1.5 / §4 History; domain [injury-domain-model.md](../injury-logging-wayfinder/resolutions/injury-domain-model.md); catalog [body-region-catalog-and-hotspots.md](../injury-logging-wayfinder/resolutions/body-region-catalog-and-hotspots.md); accepted prototype [injury-history-prototype.md](../injury-logging-wayfinder/resolutions/injury-history-prototype.md).
- **Prototype evidence (throwaway, do not ship HTML):** worktree `jes-35` → `.scratch/jes-35-history-prototype/prototype/` (`app.js` / `index.html` / assets). Behavior there is the UX SoT.
- **Soft stack:** merge JES-51 tip into this worktree before implement so Injury CRUD + catalog/assets/status derivation exist. Schema land is JES-50 (via JES-51 dependency chain).
- **Out of scope:** Registrar / Dar de alta / edit / reopen (JES-51); team `/injuries` list (JES-52); Pain Alert Sheet/promote (JES-54); wellness EXEMPTED (JES-53); promoting body-map into `@repo/design-system`.
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not implement. Do not commit.
- **Current worktree note:** this branch still has legacy `InjuryReport` — expect Injury + BodyRegion join after merging JES-50/51; do not rebuild history against `InjuryReport`.

## Decisions so far

### Auto

1. **[auto] Production rebuild of accepted JES-35** — Rebuild with design-system / admin density on the player profile; do not import throwaway HTML/CSS/JS. Matches SPEC non-goal and JES-35 amend.
2. **[auto] Data source = official Injury only** — Query staff-authored **Injury** (+ BodyRegion set) for the profile player. Exclude **Pain Alert** / player intake. Matches CONTEXT + SPEC §3.
3. **[auto] Count semantics** — Under the active year filter, each Injury episode increments **each** of its region ids by 1. Multi-region episodes multi-count. Matches AC + prototype `regionCounts()`.
4. **[auto] Year filter = startDate year + Total** — Tabs: **Total** (default) then descending years that appear in the player’s injury `startDate`s. Changing year clears region filter. Counts + Histórico both respect year; region filter does **not** change badge counts. Matches prototype.
5. **[auto] Region badge filter** — Click badge toggles filter on Histórico to episodes containing that region; active badge highlighted; clear chip («Zona: … ×») clears; second click on same badge clears. Matches AC + prototype.
6. **[auto] Frente / Espalda + catalog hotspots** — Same assets/catalog as JES-31 (`front.png` / `back.png` + `body-region-catalog.json` ids/`cx`/`cy`/`r`). Badges only for regions with count > 0 on the current view.
7. **[auto] Histórico list** — Newest-first by `startDate`. Row: cause (title), date range Spanish («Desde … hasta …»), region labels ES. Empty: «Sin lesiones en este periodo».
8. **[auto] Open Injuries included** — `endDate = null` episodes participate in counts and Histórico (official Injury periods). Prototype seeded only closed because throwaway; domain includes open. List copy for open: see assume #12.
9. **[auto] No staff-facing in-memory state dump** — Never show «Estado en memoria» to staff. Omit the panel entirely in product (prototype’s `?dev=1` was throwaway-only). Matches JES-35 amend + AC.
10. **[auto] Spanish product copy** — Title «Historial de lesiones»; filters Total / year; views Frente / Espalda; list «Histórico»; empty as above. English only in maintainer docs.
11. **[auto] Placement** — New section on `/players/[id]` staff profile (same surface as JES-51 Registrar lesión entry). Read-only history; mutations stay JES-51.
12. **[auto] Feature-local UI** — Keep history body-map composition in `apps/app` (injuries feature). Do not promote to `@repo/design-system` (ADR 0001 gates unmet).
13. **[auto] Semantic tokens / admin chrome** — Author with `bg-bg-*`, `text-text-*`, `border-border-*`, `danger` accents for count badges/list markers; dense radius; no quarantined decorative imports; Phosphor via `/ssr` in RSC.
14. **[auto] Tests** — Pure helpers for year bucketing, region counts (multi-region), and list filter (year ∩ region). Skip snapshot-only UI tests.
15. **[auto] Implement after JES-51 tip** — Soft-merge blocker tip so Injury model, catalog shipping, and profile log chrome exist; do not dual-path against `InjuryReport`.

### Assume

16. **[assume] Module home** — Client history map + pure filter helpers under `apps/app/features/injuries/` (e.g. `components/injury-history-map.tsx` + `lib/injury-history-filters.ts`); page wires fetch + section.  
    **Revert:** colocate under `features/players/` if injuries feature stays list-only after JES-51.
17. **[assume] Fetch once, filter client-side** — Server Component loads all Injuries for the player (regions included); client owns Total/year + region UI state (prototype parity). No URL searchParams required for v1.  
    **Revert:** lift year/region into `searchParams` for shareable filtered links.
18. **[assume] Open-episode Histórico copy** — «Desde {date} · Abierta» (no «hasta»). Closed keep «Desde … hasta …».  
    **Revert:** always show «hasta —» / em dash for open if copy review prefers one template.
19. **[assume] Histórico fields = prototype set** — Cause + dates + region labels only. Omit severity, staff notes, expectedReturnDate from the list row.  
    **Revert:** add severity badge if staff triage needs it on this surface.
20. **[assume] Reuse map stage from JES-51 when present** — Prefer shared app-local body-map stage/hotspot renderer with JES-51 log UI; history adds count badges + read-only mode. If JES-51 ships no extractable stage, history-local map is fine.  
    **Revert:** always duplicate a history-only map to avoid coupling.
21. **[assume] Section order on profile** — Place «Historial de lesiones» after profile header / excused-absence block and before wellness charts + daily history table (injury SoT above load charts).  
    **Revert:** move below charts if visual weight fights the existing dashboard.
22. **[assume] Dev debug** — No `?dev=1` state panel in production codepaths.  
    **Revert:** gate a JSON dump behind `NODE_ENV === 'development'` only if implementers need it during QA.

### Hitl

None. `plan:auto` — accepted prototype + SPEC lock behavior; remaining choices are packaging/copy reversibles (`assume`).

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Rebuild JES-35 in product UI | `auto` | Issue AC + SPEC non-goal (no ship HTML) |
| 2 | Injury-only data (not Pain Alert) | `auto` | CONTEXT / SPEC glossary |
| 3 | Multi-region increments each region | `auto` | AC + prototype |
| 4 | Year = startDate; Total; clear region on year change | `auto` | Accepted prototype |
| 5 | Badge toggles Histórico filter + clear | `auto` | AC + prototype |
| 6 | Catalog assets Frente/Espalda | `auto` | JES-31 / SPEC §4 |
| 7 | Histórico row shape + empty copy | `auto` | Prototype Spanish SoT |
| 8 | Include open Injuries | `auto` | Domain: open is still Injury |
| 9 | No staff state dump | `auto` | JES-35 amend + AC |
| 10 | Spanish copy | `auto` | Repo language convention |
| 11 | Profile section read-only | `auto` | Issue scope vs JES-51 |
| 12 | App-local, not design-system | `auto` | ADR 0001 |
| 13 | Semantic tokens / dense admin | `auto` | Design-system rules |
| 14 | Pure filter/count tests | `auto` | Business-rule tests |
| 15 | Soft-merge JES-51 before implement | `auto` | Linear blocked-by |
| 16 | `features/injuries` module home | `assume` | Contained; reversible |
| 17 | Client filter of server fetch | `assume` | Contained; reversible |
| 18 | Open list copy «Abierta» | `assume` | Copy micro-choice |
| 19 | Omit severity/notes in list | `assume` | Prototype parity; reversible |
| 20 | Share map stage with JES-51 if easy | `assume` | Contained coupling choice |
| 21 | Section above wellness charts | `assume` | Layout; reversible |
| 22 | Omit even dev state panel | `assume` | Stronger than `?dev=1`; reversible |

## Spanish copy (locked from prototype)

| Role | Copy |
|---|---|
| Section title | Historial de lesiones |
| Period tabs | Total / `{year}` |
| Views | Frente / Espalda |
| List heading | Histórico |
| Empty | Sin lesiones en este periodo |
| Region chip | Zona: `{labelEs}` + clear |
| Closed meta | Desde {d} hasta {d} |
| Open meta (assume #18) | Desde {d} · Abierta |

## Acceptance mapping

| AC | Plan coverage |
|---|---|
| Counts and list update with Total/year | Decisions 3–4, 7 |
| Multi-region episodes increment each region | Decision 3 |
| Region badge filters Histórico; clear works | Decision 5 |
| No staff-facing in-memory state dump | Decisions 9, 22 |

## Not yet specified (implementer)

- Exact TypeScript export names and file paths within assume #16.
- Whether JES-51 already exports a reusable map stage (diff at soft-merge).
- Pixel nudge of hotspots beyond catalog seed (deferred fog in SPEC §6).

## Out of scope

- Creating / closing / editing / reopening Injuries (JES-51).
- Team injuries index and Pain Alert triage list (JES-52 / JES-54).
- Wellness exemption / streak (JES-53).
- Schema migration from `InjuryReport` (JES-50).
- Medical coding, imaging, RTP engines, Guardian injury portal.

## Implementation sketch (after JES-51 soft-merge · no HITL gate)

1. Soft-merge `jgutierrez/jes-51-*` tip; confirm Injury Prisma model + catalog assets available to `apps/app`.
2. Add pure `injury-history-filters` helpers + unit tests (year tabs, counts, list filter).
3. Server-fetch Injuries for player on `/players/[id]`; pass serializable DTO to client section.
4. Build `InjuryHistoryMap` client UI: year tabs, Frente/Espalda, count badges, region chip, Histórico — semantic tokens, Spanish copy.
5. Wire section into profile page (assume #21 order); ensure Registrar lesión CTA from JES-51 remains sibling, not duplicated.
6. Verify AC manually with multi-region + multi-year fixtures; confirm no state dump in UI.

### User acceptance

**User:** `JES-55: ok` (2026-08-04) — all auto/assume accepted; implement after soft-merge blocker tip.
