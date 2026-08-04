# JES-51 — Staff profile: log Injury + close/edit/reopen

Status: implemented  
Ticket: [Staff profile: log Injury + close/edit/reopen](https://linear.app/jesus-guti-workspace/issue/JES-51/staff-profile-log-injury-closeeditreopen)  
Parent: [JES-28 Injury logging wayfinder](https://linear.app/jesus-guti-workspace/issue/JES-28) · [SPEC.md](../injury-logging-wayfinder/SPEC.md)  
Blocks: [JES-55](https://linear.app/jesus-guti-workspace/issue/JES-55) (profile history map)  
Blocked by: [JES-50](https://linear.app/jesus-guti-workspace/issue/JES-50) (schema Injury / BodyRegion / Pain Alert + catalog + status helpers)

**Route:** `plan: auto` · **Risk:** medio · **HITL count:** 0

## Destination

On staff player profile (`apps/app` `/players/[id]`): production **Registrar lesión** flow rebuilt from the accepted JES-34 prototype — Frente/Espalda multi-select body map, Fecha de inicio, Causa, optional Detalle de zona — creating a staff **Injury** and deriving **Lesionado**. **Dar de alta** sets inclusive `endDate`; **Editar** and **Reabrir** (clear end) recalculate status. Spanish UI; no in-memory / debug dump for staff. Does **not** ship the JES-35 history map (counts / year filters / Histórico) — that is JES-55. Does **not** own team `/injuries` list (JES-52) or wellness EXEMPTED (JES-53).

## Notes

- **Doctrine:** SPEC §3–4 · [staff-injury-log-prototype.md](../injury-logging-wayfinder/resolutions/staff-injury-log-prototype.md) (accepted) · [injury-domain-model.md](../injury-logging-wayfinder/resolutions/injury-domain-model.md) · [body-region-catalog-and-hotspots.md](../injury-logging-wayfinder/resolutions/body-region-catalog-and-hotspots.md) · BACKLOG IL-1a / IL-1b.
- **Prototype evidence:** worktree `jes-34` → `.scratch/jes-34-staff-prototype/prototype/` (also mirrored under `jes-35`). Faithful composition: profile CTA → map multi-select → save → open list → Dar de alta dialog. Prototype has **no** edit/reopen chrome; production extends with the same form + list actions. JES-35 amend: never ship “Estado en memoria” for staff.
- **Code reality (this worktree):** Profile (`players/[id]/page.tsx`) shows status Badge + excused absence; **no** injury log UI. `features/injuries` only has legacy `updateInjury` against `InjuryReport` statuses. Team `/injuries` is old triage — leave for JES-52. Body map assets not in tree yet (JES-50 ships catalog + front/back).
- **Sibling boundaries:** JES-50 owns schema, migration, catalog export, `INJURED` derive helpers, no-override-while-open. JES-52 owns team list. JES-55 owns history map + filters. Soft-merge / wait for JES-50 tip before implementing.
- **Autonomy:** `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Planning only — no product code, no commit.

## Decisions so far

### Auto

1. **[auto] Production UI from JES-34, not HTML paste** — Rebuild with `@repo/design-system` primitives + app semantic tokens (admin density). Throwaway CSS/HTML is reference only. Reason: SPEC non-goal; design-system rules.

2. **[auto] Entry on player profile** — Primary create CTA **Registrar lesión** on `/players/[id]` (header/actions near status). Team `/injuries` is not the create primary (SPEC §4; JES-52 list). Reason: accepted prototype + SPEC.

3. **[auto] In-page log panel (profile swap)** — Show/hide a log panel on the profile page (Frente/Espalda map + form), matching prototype navigation — not a new primary nav item and not a cramped Sheet-only map. Cancel returns to profile chrome. Reason: accepted prototype composition; body map needs width.

4. **[auto] Body-map interaction contract** — Frente/Espalda toggle; multi-select hotspots (`cx`/`cy`/`r` %); selection chips persist across views; ≥1 region required; Spanish `labelEs` from catalog. Reason: JES-31 + JES-34.

5. **[auto] Create fields = prototype set** — Required: regions, `startDate`, `cause`. Optional: **Detalle de zona** (`regionDetail`, one string per Injury). Omit severity / `expectedReturnDate` / staff notes from v1 chrome (SPEC §6 fog; not in accepted prototype). Reason: fog + prototype fidelity.

6. **[auto] Open list + Dar de alta** — Profile section **Lesiones abiertas**: region labels, start · cause · optional detail; per-row **Dar de alta** opens Dialog with inclusive **Fecha de fin** (default today in Team timezone). Confirm sets `endDate`. Reason: prototype + domain inclusive end.

7. **[auto] Status derivation via JES-50 helpers only** — On create / close / edit / reopen call schema helpers: ≥1 active ⇒ `INJURED`; last close while `INJURED` ⇒ `AVAILABLE`; never auto ILL/UNAVAILABLE/MODIFIED_TRAINING. Do not write status ad hoc in the UI layer. Reason: JES-30; JES-50 AC; blocked-by.

8. **[auto] Concurrent opens allowed** — **Registrar lesión** stays available while already Lesionado. Reason: domain concurrent opens.

9. **[auto] Spanish copy; no debug panel** — Labels/actions as prototype (Registrar lesión, Guardar lesión, Dar de alta, Frente/Espalda, Detalle de zona, Lesionado/Disponible). Never render “Estado en memoria” / JSON dump / `?dev=1` state panel for staff. Reason: AC + JES-35 amend.

10. **[auto] Feature locus `apps/app/features/injuries`** — Expand beyond legacy `InjuryReport` action: body-map components, open/closed lists, Dialog, server actions. App-local (not `@repo/design-system`); body map is injury/admin domain. Share map primitives with JES-55 later via same feature folder. Reason: ADR 0001 promote gates; repo feature layout.

11. **[auto] Consume JES-50 catalog + assets** — Region ids/hotspots/assets from JES-50 ship path (matching `artifacts/body-region-catalog.json`). Do not fork catalog JSON in this issue. Reason: blocked-by JES-50 IL-0c.

12. **[auto] Validation** — ≥1 BodyRegion; non-empty cause; `endDate` required on close; `endDate ≥ startDate`; team-scoped auth like other player mutations; revalidate `/players/[id]` (and `/injuries` if still linked). Reason: domain + existing action patterns.

13. **[auto] Active predicate / “today”** — Civil day uses **Team.timezone** (default Europe/Madrid) for default date inputs and active checks — same clock as JES-32. Reason: SPEC §3 wellness clock; consistency.

14. **[auto] Closed list without history map** — Profile shows a simple **Cerradas** (or equivalent) list for reopen/edit access: rows + **Reabrir** / **Editar** only — **no** Total/year filters, count badges, or Histórico map (JES-55). Reason: AC requires reopen; BACKLOG splits IL-1b vs IL-3a.

15. **[auto] Edit = same map form prefilled** — **Editar** opens the log panel with existing regions/dates/cause/detail; save updates Injury; history follows corrections (no separate audit UI). Reason: domain edit; natural extension of prototype form.

16. **[auto] Reabrir = clear `endDate`** — Explicit **Reabrir** (or clear end in edit) sets `endDate` null; recalculates status. Does not delete the episode. Reason: domain reopen.

17. **[auto] Leave team `/injuries` + Pain Alert promote alone** — Do not rewrite list triage or promote flows here (JES-52 / JES-54). Soft-stack: after JES-50 migration the old page may be broken until JES-52 — out of scope. Reason: backlog boundaries.

18. **[auto] Soft-stack JES-50 before implement** — Implementation waits for (or soft-merges tip of) JES-50. Reason: Linear blocked-by.

19. **[auto] Tests required** — Create multi-region → INJURED; Dar de alta inclusive last close → AVAILABLE; edit regions/dates recalculates; reopen clears end → INJURED; validation (≥1 region, end ≥ start); no player-path create. Reason: AC + business rules.

20. **[auto] Invisible-list styling for injury rows** — Open/closed rows follow admin shell list language (section label uppercase tracking; row rules; no card-wrapped whole list). Dialog only for Dar de alta (floating). Reason: `loadzone-admin-shell.mdc`.

### Assume

21. **[assume] Server actions surface** — Feature actions: `createInjury`, `closeInjury` (set inclusive end), `updateInjury` (fields/regions; replaces legacy InjuryReport status updater when JES-50 lands), `reopenInjury` (clear end). Prefer structured results + toast like excused-absence over throw-only FormData voids where practical.  
    **Revert:** collapse to fewer actions or FormData-only if sibling patterns prefer one `mutateInjury`.

22. **[assume] Edit-player status UX when opens exist** — On `/players/[id]/edit`, disable or lock status Select while ≥1 open Injury and show Spanish hint that status is derived from lesiones abiertas (server already rejects override per JES-50).  
    **Revert:** leave Select enabled and rely on server error toast only.

23. **[assume] Future `startDate` allowed** — Staff may backdate or set a future start; active/`INJURED` follows civil-day predicate (future open does not force Lesionado until start day).  
    **Revert:** clamp `startDate ≤ today (Team.tz)` in validation if clubs abuse future dating.

24. **[assume] Closed edit does not auto-reopen** — Editing cause/regions/start/detail on a closed Injury keeps `endDate` unless staff uses **Reabrir** or explicitly clears end in the edit form.  
    **Revert:** any save on closed clears end (always reopen on edit) if that proves simpler.

### HITL

None — create/close/edit/reopen chrome, field set, and profile vs history split are locked by accepted prototype + domain + BACKLOG IL-1 vs IL-3a.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Rebuild with DS, not HTML paste | `auto` | SPEC + DS rules |
| 2 | Profile CTA primary create | `auto` | Prototype + SPEC |
| 3 | In-page log panel | `auto` | Prototype composition |
| 4 | Frente/Espalda multi-select contract | `auto` | JES-31/34 |
| 5 | Field set = prototype; omit severity chrome | `auto` | Fog + prototype |
| 6 | Open list + Dar de alta Dialog | `auto` | Prototype + inclusive end |
| 7 | Status only via JES-50 helpers | `auto` | Domain + blocker |
| 8 | Concurrent opens OK | `auto` | Domain |
| 9 | ES copy; no debug dump | `auto` | AC |
| 10 | `features/injuries` app-local | `auto` | ADR 0001 |
| 11 | Catalog/assets from JES-50 | `auto` | Blocked-by |
| 12 | Validation rules | `auto` | Domain |
| 13 | Team.timezone civil day | `auto` | JES-32 / SPEC |
| 14 | Simple closed list; no history map | `auto` | AC + IL-3a split |
| 15 | Edit = prefilled log form | `auto` | Domain edit |
| 16 | Reabrir clears end | `auto` | Domain |
| 17 | Skip team list / promote | `auto` | Sibling issues |
| 18 | Soft-stack JES-50 | `auto` | Linear |
| 19 | Tests for AC paths | `auto` | AC |
| 20 | Invisible-list row chrome | `auto` | Admin shell |
| 21 | Action names / toast results | `assume` | Contained; reversible |
| 22 | Lock edit-player status Select | `assume` | UX polish; reversible |
| 23 | Allow future startDate | `assume` | Contained; reversible |
| 24 | Closed edit keeps end unless Reabrir | `assume` | Contained; reversible |

## Implementation sketch (for implementer; not executed)

1. Soft-merge JES-50 tip; confirm Injury API, catalog import, assets URL, derive helpers.
2. Add body-map client component (catalog-driven hotspots + chips + Frente/Espalda).
3. Wire profile: CTA, log panel, open/closed lists, Dar de alta Dialog.
4. Server actions create/close/update/reopen + revalidate; Spanish toasts/errors.
5. Optional: gate edit-player status Select when open injuries exist.
6. Tests covering AC paths.
7. Do **not** implement JES-55 history map or JES-52 team list rewrite.

## Open questions

None pending human. Ready to implement after JES-50.

### User acceptance

**User:** `JES-51: ok` (2026-08-04) — all auto/assume accepted; implement after soft-merge blocker tip.
