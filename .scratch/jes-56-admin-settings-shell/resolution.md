# JES-56 — Admin settings shell map (resolution index)

Issue: [Admin settings shell — centered config + settings sidebar](https://linear.app/jesus-guti-workspace/issue/JES-56/admin-settings-shell-centered-config-settings-sidebar)  
Approved: orchestrator `JES-56: ok` (2026-08-05)  
Full effort map: [`map.md`](./map.md)

**No production UI in this ticket.** This file indexes child resolutions and the follow-on implement issue. Production `/settings/*` ships only on the follow-on.

## Standing law (consume from map)

- Desktop: settings sidebar replaces ops sidebar; **Volver** → last operational route (fallback Inicio).
- Mobile: sheet-sidebar = settings nav + Volver.
- Routes: `/settings` → Equipo; Wellness, Políticas, Club, Cuenta.
- Sections + rows (no cards); autosave absolute; app-local chrome; Spanish UI copy.
- Layout law + Volver `sessionStorage` contract — see map Standing preferences.

## Child resolutions (PRs)

| Child | Role | PR | Artifact |
|---|---|---|---|
| [JES-57](https://linear.app/jesus-guti-workspace/issue/JES-57/prototype-settings-shell-equipo-sections) | Throwaway prototype (chrome reference) | [#52](https://github.com/jesus-guti/loadzone-monorepo/pull/52) · tip `c402dec` | `.scratch/jes-57-settings-prototype/map.md` · `/prototype/settings` |
| [JES-58](https://linear.app/jesus-guti-workspace/issue/JES-58/define-settings-autosave-contract) | Autosave contract | [#53](https://github.com/jesus-guti/loadzone-monorepo/pull/53) | `.scratch/jes-58-autosave-contract/resolution.md` |
| [JES-59](https://linear.app/jesus-guti-workspace/issue/JES-59/decide-per-route-settings-section-grouping) | Per-route section → rows | [#56](https://github.com/jesus-guti/loadzone-monorepo/pull/56) · `Jes-59:ok` | `.scratch/jes-59-section-grouping/resolution.md` |
| [JES-60](https://linear.app/jesus-guti-workspace/issue/JES-60/inventory-settings-deep-links-and-create-team-entry-points) | Deep-link + create-team inventory | [#54](https://github.com/jesus-guti/loadzone-monorepo/pull/54) | `.scratch/jes-60-settings-deep-links/resolution.md` |
| [JES-61](https://linear.app/jesus-guti-workspace/issue/JES-61/decide-last-operational-route-memory-for-volver) | Volver memory contract | [#55](https://github.com/jesus-guti/loadzone-monorepo/pull/55) | `.scratch/jes-61-volver-memory/resolution.md` |

## Follow-on implement

Production work is **not** JES-56. Tracked as:

- [JES-62 — Implement admin settings shell (centered config + settings sidebar)](https://linear.app/jesus-guti-workspace/issue/JES-62/implement-admin-settings-shell-centered-config-settings-sidebar) — child of JES-56; consumes standing prefs + JES-58/59/60/61 contracts; JES-57 prototype as chrome reference only.
- Soft-blocked on merge of child PRs #52–#56 into `dev` (orchestration), not a product re-open.

## No-goals (unchanged)

- Implementing production settings chrome under JES-56.
- Tip-merging the prototype into this map-hygiene PR.
- Player settings, DS promotion, season switcher in settings, recreating Superficie secundaria.
