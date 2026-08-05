# JES-62 — Implement admin settings shell

Issue: [Implement admin settings shell](https://linear.app/jesus-guti-workspace/issue/JES-62/implement-admin-settings-shell-centered-config-settings-sidebar)  
Route: `plan:auto` · Risk: `med` · Worktree: `../worktrees/rely/jes-62`

## Destination

Production `/settings/*` under `(authenticated)`: settings sidebar replaces ops nav; five hybrid routes with JES-59 sections/rows; JES-58 autosave; JES-61 Volver; JES-60 retargets. Consume standing law — no product re-grill.

## Decisions so far

| # | Decision | Level | Notes |
|---|---|---|---|
| 1 | Consume JES-56 standing prefs + JES-58/59/60/61 resolutions as closed law | `auto` | Issue body + parent map |
| 2 | Pathname-branch `GlobalSidebar`: settings chrome vs ops chrome (no route-group split of auth layout) | `auto` | Same `(authenticated)/layout` |
| 3 | App-local `features/settings` section/row/content + `lib/settings-navigation.ts` + `lib/settings-volver.ts` | `auto` | ADR 0001; port proto structure |
| 4 | Layout: `mx-10 mb-16 max-w-[640px]` at all breakpoints | `auto` | User revoke 2026-08-05 — keep max-w on desktop too (supersedes tablet+ `md:max-w-none`) |
| 5 | Split `updateTeamSettings` into field-level (or per-control) actions for autosave; no page Guardar | `auto` | JES-58 |
| 6 | Create-team: dialog/flow inside `ActiveTeamSwitcher`; delete settings `?createTeam=1` + card | `auto` | JES-60 |
| 7 | Club mutations stay `canCreateTeam`-gated; treat docs `canEdit` as existing club gate | `auto` | Security; explore found no `canEdit` flag |
| 8 | Keep `/prototype/settings` untouched this PR | `assume` | Revert: delete in follow-up if desired |
| 9 | Settings header = route title + `ActiveTeamSwitcher` only (no season); hide ops `MobileBottomNav` on `/settings/*` | `auto` | Standing prefs |
| 10 | Volver write via client effect on every operational pathname | `auto` | JES-61 |

**HITL count: 0** — ready to implement without user gate (standing law + user `go`).

## Out of scope

- Re-grilling children; DS promotion; player settings; season in settings; recreating Superficie; mandatory prototype removal.
