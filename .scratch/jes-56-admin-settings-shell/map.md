# JES-56 — Admin settings shell — centered config + settings sidebar

Effort map (`wayfinder:map`) for [Admin settings shell — centered config + settings sidebar](https://linear.app/jesus-guti-workspace/issue/JES-56/admin-settings-shell-centered-config-settings-sidebar).  
Route: `plan:auto` · Risk: `med` · Labels: `wayfinder:map`, `Feature`.  
Orchestration lote: `.scratch/orchestration-jes-settings/BLOCKING.md` (Wave 3).

**This ticket does not implement production settings chrome.** It is the effort index: standing preferences + child resolutions. Production work ships in a **follow-on implement issue** forged after this map is closed.

## Destination

The **way to production settings is clear**: every product and UX decision needed to build the admin settings shell is locked (standing preferences + closed children JES-57…JES-61), indexed here with links to detail. Reaching the destination means a later implement ticket can run without new grilling — **not** that `/settings/*` production code lands under JES-56.

## Notes

- **Domain:** `apps/app` admin settings only. Spanish product UI copy. App-local chrome until ADR 0001 promotion gates.
- **Skills / rules:** `orchestrator/autonomy-matrix.md`, `wayfinder`, `.cursor/rules/loadzone-design-system.mdc`, `.cursor/rules/loadzone-admin-shell.mdc` (settings section/row exception), `.cursor/rules/loadzone-content-design.mdc`, ADR 0001.
- **Prototype-first:** Wave 1 [Prototype settings shell + Equipo sections](https://linear.app/jesus-guti-workspace/issue/JES-57/prototype-settings-shell-equipo-sections) grounded Wave 2; Wave 3 (this map) absorbs resolutions.
- **Language:** this map English; UI copy Spanish.
- **Autonomy:** max 3 `hitl` for map hygiene. Prefer 0 — children already closed hard product calls.
- **Gate:** ask `JES-56: ok` before map-hygiene implement (commit this map + Linear Decisions-so-far update). No product code in that wave either.

## Standing preferences (product law)

Charted locks — remain law unless a child recorded an explicit override (none revoked):

| Lock | Detail |
|---|---|
| Desktop chrome | Settings sidebar fully replaces ops sidebar; **Volver** → last operational route (fallback Inicio) |
| Mobile | Keep sheet-sidebar; sheet = settings nav + Volver |
| Routes | `/settings` → redirect Equipo; also Wellness, Políticas, Club, Cuenta |
| Content partition | Equipo = category + timezone; Wellness = forms + alert thresholds + reminder minutes; Políticas = team age bands + reminder consent; Club = branding + club age policy; Cuenta = existing staff profile + theme/mode |
| Visual grouping | Linear-style **sections** (small title + optional description) + **rows** (label left / control right); **no cards** as grouping containers (product override 2026-08-05) |
| Persist | Autosave each change (contract: JES-58) |
| Permissions | Club nav visible to all; mutations stay `canEdit` / `canCreateTeam` gated |
| Header in settings | Team switcher only (no season); create-team stays in switcher; drop `/settings?createTeam=1` as home |
| Delete | Superficie secundaria — do not recreate |
| Package | Settings layout app-local; no `@repo/design-system` promotion |

### Layout law (content column — from JES-57 / user 2026-08-05)

- **Single column**, stack downward.
- **All breakpoints:** `max-w-[640px] mx-10 mb-16` (user revoke 2026-08-05 — keep max-w on desktop too; supersedes prior tablet+ no max-w).
- Page-column geometry — not section grouping (JES-59).

### Volver law (from standing + JES-57 + JES-61)

- Memory + destination label (e.g. “Volver a Wellness”) — **not** no-memory / always Inicio.
- Production contract: `sessionStorage` key `loadzone_settings_volver`, `{ href, label }`; write on every operational nav; fallback Inicio.

## Decisions so far

Index only — detail lives on the child ticket / resolution artifact.

- **Gate:** `JES-56: ok` (2026-08-05) — map hygiene approved; production implement deferred to [JES-62](https://linear.app/jesus-guti-workspace/issue/JES-62/implement-admin-settings-shell-centered-config-settings-sidebar).

- [Prototype settings shell + Equipo sections](https://linear.app/jesus-guti-workspace/issue/JES-57/prototype-settings-shell-equipo-sections) — Throwaway `/prototype/settings` chrome (settings sidebar, labeled Volver with memory stub, team pills, mobile sheet, Equipo sections/rows, no Save, layout law). PR [#52](https://github.com/jesus-guti/loadzone-monorepo/pull/52), tip `c402dec`. Map: worktree `jes-57` `.scratch/jes-57-settings-prototype/map.md`.

- [Define settings autosave contract](https://linear.app/jesus-guti-workspace/issue/JES-58/define-settings-autosave-contract) — Autosave absolute on all five routes; discrete = immediate; text/number = debounce ~300ms + blur; silent success / Spanish error toast; ignore stale mid-team/route; no Guardar. PR [#53](https://github.com/jesus-guti/loadzone-monorepo/pull/53). Resolution: worktree `jes-58` `.scratch/jes-58-autosave-contract/resolution.md`.

- [Decide per-route settings section grouping](https://linear.app/jesus-guti-workspace/issue/JES-59/decide-per-route-settings-section-grouping) — Per-route section → rows table; Equipo Identidad / Zona; shared spacing `pt-8` / `border-t`; `#formularios` for Wellness forms. Approved `Jes-59:ok`. PR [#56](https://github.com/jesus-guti/loadzone-monorepo/pull/56) (base `dev`, `cd9e32c`). Resolution: worktree `jes-59` `.scratch/jes-59-section-grouping/resolution.md`.

- [Inventory settings deep links and create-team entry points](https://linear.app/jesus-guti-workspace/issue/JES-60/inventory-settings-deep-links-and-create-team-entry-points) — Path → retarget/delete table (nav, `#wellness-forms` → `/settings/wellness#formularios`, delete `createTeam=1` + Superficie + create-team card, route-specific redirects/`revalidatePath`). PR [#54](https://github.com/jesus-guti/loadzone-monorepo/pull/54). Resolution: worktree `jes-60` `.scratch/jes-60-settings-deep-links/resolution.md`.

- [Decide last-operational-route memory for Volver](https://linear.app/jesus-guti-workspace/issue/JES-61/decide-last-operational-route-memory-for-volver) — `sessionStorage` + labeled Volver; operational = authenticated non-settings/non-prototype; write every ops nav; no cross-tab sync. PR [#55](https://github.com/jesus-guti/loadzone-monorepo/pull/55). Resolution: worktree `jes-61` `.scratch/jes-61-volver-memory/resolution.md`.

## What this map effort still owns (vs deferred)

| Still on JES-56 (map hygiene) | Deferred to follow-on **implement** ticket |
|---|---|
| Keep Decisions so far / standing prefs accurate | Production `/settings` layout + five routes |
| Close map when children are done (Linear Done + gist) | Wire JES-58 autosave to real server actions |
| Recommend / link the implement issue (do not sneak UI here) | Apply JES-59 composition on real fields |
| Optional: sync Linear description after `JES-56: ok` | Retarget/delete per JES-60 inventory |
| | Wire Volver per JES-61 |
| | Create-team affordance inside team switcher (delete settings entry) |
| | Delete Superficie secundaria from production |
| | Tests for redirects / revalidate / age-band actions |
| | Spanish microcopy polish beyond section titles in JES-59 |
| | Whether / when to remove `/prototype/settings` after ship |

## Not yet specified

Fog toward destination that is **not** ticket-sharp on this map (graduates only if destination redrawn or implement surfaces new fog):

- ~~Exact forge title / AC checklist wording for the production implement issue~~ → forged as [JES-62](https://linear.app/jesus-guti-workspace/issue/JES-62/implement-admin-settings-shell-centered-config-settings-sidebar).
- Merge order of open child PRs (#52–#56) into `dev` before JES-62 starts — orchestration concern, not a product lock.
- Linear children may still show **In Progress** until their resolution PRs merge; closing them to Done is tracker hygiene, not a new product call.

Nothing left that blocks **clarity of the way**. Remaining work is **execution** on JES-62, which is out of this map’s destination.

## Out of scope

- **Implementing the production admin settings shell in JES-56** (explicit no-goal; forge a follow-on).
- Changing DD-01 primary/secondary operational destinations.
- Player-app settings.
- New profile/account product features beyond rehosting existing profile + mode toggle.
- Promoting settings composites into `@repo/design-system`.
- Season switcher inside settings chrome.
- Recreating Superficie secundaria elsewhere.
- Cross-device / server-side Volver memory.
- Redesigning create-team UX beyond “lives in team switcher” (JES-60 inventory only).

## Follow-on implement (forged)

**Do not** expand JES-56 into a build ticket. Production work:

> [**JES-62 — Implement admin settings shell (centered config + settings sidebar)**](https://linear.app/jesus-guti-workspace/issue/JES-62/implement-admin-settings-shell-centered-config-settings-sidebar)  
> Parent: JES-56 · `blockedBy` JES-57…JES-61 · `plan:auto` · `risk:med` · labels: `wayfinder:task`, `Feature`, `ready-for-agent`, `agent-forged`

Must consume: standing prefs + layout law + JES-58/59/60/61 contracts; ship under `(authenticated)` with settings chrome replacing ops sidebar; apply deep-link retargets; keep security gates. JES-57 is chrome reference only.

## Decision ledger (this Wave 3 planning session)

| # | Decision | Level | Notes |
|---|---|---|---|
| 1 | JES-56 remains effort index only — no production UI | `auto` | Issue body + BLOCKING.md |
| 2 | Absorb all standing prefs + child gists into Decisions so far | `auto` | Wayfinder map index |
| 3 | Layout law + Volver memory+label are closed product law | `auto` | User / JES-57 / JES-61 |
| 4 | Recommend separate implement issue; do not sneak build into map | `auto` | Destination + no-goals |
| 5 | Zero HITL for map planning — children closed product calls | `auto` | Cap unused |
| 6 | Map hygiene after `JES-56: ok` = commit this file + Linear update; still no product code | `assume` | Revert: leave map uncommitted / Linear body unchanged until human prefers another hygiene shape |

**HITL count: 0** (under cap of 3). Map ready for hygiene after `JES-56: ok`.

## Child artifact pointer table

| Child | PR | Artifact (sibling worktree unless merged) |
|---|---|---|
| JES-57 | [#52](https://github.com/jesus-guti/loadzone-monorepo/pull/52) · tip `c402dec` | `…/jes-57/.scratch/jes-57-settings-prototype/map.md` · route `/prototype/settings` |
| JES-58 | [#53](https://github.com/jesus-guti/loadzone-monorepo/pull/53) | `…/jes-58/.scratch/jes-58-autosave-contract/resolution.md` |
| JES-59 | [#56](https://github.com/jesus-guti/loadzone-monorepo/pull/56) · `cd9e32c` · `Jes-59:ok` | `…/jes-59/.scratch/jes-59-section-grouping/resolution.md` |
| JES-60 | [#54](https://github.com/jesus-guti/loadzone-monorepo/pull/54) | `…/jes-60/.scratch/jes-60-settings-deep-links/resolution.md` |
| JES-61 | [#55](https://github.com/jesus-guti/loadzone-monorepo/pull/55) | `…/jes-61/.scratch/jes-61-volver-memory/resolution.md` |

## Orchestrator checklist (map hygiene — after ok)

1. ~~Commit `.scratch/jes-56-admin-settings-shell/map.md` (+ `resolution.md`) on the JES-56 branch (docs only).~~ Done after `JES-56: ok`.
2. ~~Update Linear JES-56: comment absorbed children + defer implement to JES-62; keep map open until hygiene PR / children merge.~~
3. ~~Forge follow-on implement [JES-62](https://linear.app/jesus-guti-workspace/issue/JES-62/implement-admin-settings-shell-centered-config-settings-sidebar).~~
4. Do **not** edit `apps/app` production settings routes under JES-56.
5. ~~Ask user confirmation: **`JES-56: ok`** before that hygiene commit / Linear sync.~~ Received 2026-08-05.
