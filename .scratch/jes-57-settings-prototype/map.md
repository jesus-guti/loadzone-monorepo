# JES-57 — Prototype settings shell + Equipo sections

Planning map for [Prototype settings shell + Equipo sections](https://linear.app/jesus-guti-workspace/issue/JES-57/prototype-settings-shell-equipo-sections).  
Parent map: [Admin settings shell — centered config + settings sidebar](https://linear.app/jesus-guti-workspace/issue/JES-56/admin-settings-shell-centered-config-settings-sidebar) (JES-56).  
Hard-blocks: [Decide per-route settings section grouping](https://linear.app/jesus-guti-workspace/issue/JES-59/decide-per-route-settings-section-grouping) (JES-59).  
Soft informs: JES-58 (autosave), JES-60 (deep links), JES-61 (Volver memory — **aligned: memory + labeled destination**, not “no memory”).  
Route: `plan:auto` · Risk: `low` · Label: `wayfinder:prototype`.

## Destination

A **throwaway UI prototype** the maintainer can open and click that answers: *Does the locked settings chrome (settings sidebar + labeled Volver with remembered ops route, team pills only, mobile sheet, Equipo sections/rows in a single stacked column) feel right before production work?*

Resolve when the artifact is linked on JES-57 and a human can react — not when production settings ship. Human reaction is the close gate; **not** a planning HITL gate (issue body + JES-56 standing preferences + user overrides below).

## Question branch

**UI prototype** (`/prototype` → UI.md), **single faithful composition** — not three radically different variants.

Reason: chrome and Equipo content partition are locked by JES-56; the question is reaction-to-doctrine, not a layout bake-off. Same deviation from UI.md default N=3 as DD-04. No floating variant switcher.

## Notes

- **Domain / chrome law:** JES-56 standing preferences (settings sidebar replaces ops nav; five hybrid routes; team switcher only; no season; no Superficie secundaria; Spanish copy; sections + rows, **no cards** as grouping containers — product override 2026-08-05).
- **Skills:** `/prototype` (UI.md), `.cursor/rules/loadzone-design-system.mdc`, `.cursor/rules/loadzone-admin-shell.mdc` (density / invisible-list defaults; settings chrome is the documented exception for section/row grouping).
- **Wave 2 learnability:** Prototype choices should make grouping density (JES-59), absence of Save chrome (JES-58), stable stub paths (JES-60), and **labeled Volver with a remembered operational route** (JES-61) *observable* — without fully implementing production persistence for JES-61.
- **Precedents:** DD-04 scratch HTML was later **rejected** as layout winner; DD-05 lived as an in-app throwaway under `apps/player`. Prefer in-app fidelity here so mobile sheet + dense tokens are real.
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not implement in this planning wave. Do not commit.
- **This map:** English. Product UI copy in the prototype: **Spanish**.

## Prototype scope (implement wave)

### Shell (desktop)

- Settings sidebar with five items: **Equipo**, **Wellness**, **Políticas**, **Club**, **Cuenta** (Spanish labels).
- **Volver** affordance above the nav list: labeled with the remembered operational destination (e.g. “Volver a Wellness”), not a generic “Volver a la app” only. Link target = remembered ops route (fallback Inicio `/` if none).
- Operational primary/secondary nav **absent** (no GlobalSidebar ops chrome).
- Header context: **team switcher as Vercel-style pills** only (2–3 mock teams, one active). **No** season switcher. **No** create-team entry required in this throwaway (JES-56 moves create-team into switcher for production; pills can omit “+” if it clutters reaction — optional stub OK).

### Shell (mobile)

- Reuse the existing **sheet-sidebar** pattern (`SidebarProvider` + collapsible Sidebar / mobile opener FAB language from `apps/app` layouts).
- Sheet contents = settings nav + labeled Volver (same five items). No ops bottom-nav requirement beyond whatever the dedicated prototype layout needs to feel openable.

### Content layout law (prototype + note for production)

User override 2026-08-05 — applies to the settings **main content** column:

- **Single column**, stack downward (sections then rows). Mobile-first.
- **Default (mobile):** `max-w-[640px]`, horizontal margin `40px` (`mx-10` on 4px scale), bottom margin `64px` (`mb-16`).
- **Tablet and up:** **full width** of the content pane — **no `max-w`** — but keep the same horizontal (`mx-10`) and bottom (`mb-16`) margins.
- This is **page column geometry**, not Equipo section grouping.

### Equipo page (only filled route)

- Obeys the content layout law above (one stacked column — **not** dual-column).
- **Sections** (small title + optional short description) and **rows** (label left / control right) stacked vertically.
- Provisional content grouping for JES-59 spacing reaction: **two section headers in one column** — e.g. **Identidad** (Categoría row) then **Zona horaria** (timezone row). Clarification: “two sections” = two stacked content groups, **not** two layout columns.
- Fields: **Categoría** + **Zona horaria** only (JES-56 Equipo partition).
- **No card containers** around sections or rows.
- Controls are interactive stubs (client state only). **No** Save / Submit button chrome (autosave-shaped emptiness for JES-58).
- Lean Spanish labels; no design-decision essays on screen (UI.md §2b + content-design).

### Volver memory (prototype stub → informs JES-61)

- Prototype **must demonstrate** labeled Volver + a remembered operational route.
- Persistence may be loose: `sessionStorage`, query param, or in-memory mock set on “enter settings” from a fake ops context — enough to click and see “Volver a Wellness” (or similar) navigate correctly.
- **Final production contract** (JES-61) must reflect **memory + destination label**; this prototype must **not** teach “Volver → `/` without memory”. Soft impact: JES-61 planners/implementers align to memory+label, not the superseded no-memory stub.

### Stub routes

- Wellness, Políticas, Club, Cuenta: empty/placeholder pages (short Spanish empty line + same shell).
- `/prototype/settings` redirects to Equipo.

### Explicitly out of prototype scope

- Production `/settings` routes, real Server Actions, persistence of settings fields, permission gating UI beyond mock.
- Full field inventories for Wellness / Políticas / Club / Cuenta (JES-56 partition stays documentary until later implement).
- Autosave contract details (JES-58), production deep-link inventory (JES-60), **durable** last-route memory storage choice (JES-61 owns the final contract — prototype only demos the UX).
- Promoting composites into `@repo/design-system` (ADR 0001).
- Multi-variant switcher; DD-04-style static HTML scratch.

## Location and tech

| Choice | Decision |
|---|---|
| Host | `apps/app/app/prototype/settings/` (throwaway App Router tree **outside** `(authenticated)` so `GlobalSidebar` does not wrap it) |
| Layout | Dedicated `layout.tsx`: auth gate via `getCurrentStaffContext` → redirect `/sign-in` if missing; mock-friendly settings shell (Sidebar + header pills + mobile sheet + labeled Volver) |
| Components | App-local under `apps/app/app/prototype/settings/_components/` (or sibling `_components`); reuse `@repo/design-system` primitives (`Sidebar`, `Select`, `Button`, etc.) — **no** DS promotion |
| Data | In-memory mock teams + Equipo field state; Volver target stub (session/mock); may read real staff context for display names if handy, but must not mutate team settings |
| Run | Existing app dev server: open `/prototype/settings` (document in a one-line README beside the tree) |
| Link | After build, comment/attachment on JES-57 with path + how to run |

**Why not `.scratch/.../index.html`:** Wave 2 needs real density, sheet behavior, and semantic tokens; DD-04 HTML was rejected as chrome winner.  
**Why not under `(authenticated)/`:** Parent layout always mounts ops `GlobalSidebar`; settings chrome must replace it.  
**Why not edit production `/settings`:** Issue forbids shipping product settings code.

## Decisions so far

### User approval (implement gate)

- **`jes-57:ok`** (2026-08-05) — planning decisions closed; implement wave authorized. Do not reopen HITL.

### User replies (2026-08-05)

- **Volver override:** Want memory of the page they were on; Volver label may include destination (e.g. “Volver a Wellness”). Prototype may stub persistence loosely; **final** contract = memory + labeled Volver. Align Wave-2 JES-61; do **not** leave “no memory” as the taught default.
- **Layout / Equipo clarification:** Prior “two sections” assume was about **content section grouping** (stacked headers), not multi-column layout. Layout law: single column, mobile-first; `max-w-[640px]` + `mx-10` + `mb-16` on mobile; tablet+ full width with same margins (no max-w). Keep two stacked Equipo sections if they still teach JES-59 spacing under that law.

### Auto

1. **[auto] Single faithful UI composition (no N=3 / no switcher).** Locked chrome; reaction-to-doctrine. Precedent: DD-04 map.
2. **[auto] Apply JES-56 standing preferences as law.** Five Spanish nav items; Volver; team context only; no season; no Superficie secundaria; Equipo = category + timezone; sections/rows; no cards; Spanish UI copy.
3. **[auto] Ops primary nav gone inside the prototype.** Dedicated layout; do not mount `GlobalSidebar` ops destinations.
4. **[auto] Stub routes for the four non-Equipo items; Equipo is the only filled page.** Matches AC.
5. **[auto] Stable prototype paths for deep-link observability (JES-60 soft).**  
   - `/prototype/settings` → redirect Equipo  
   - `/prototype/settings/equipo`  
   - `/prototype/settings/wellness`  
   - `/prototype/settings/politicas`  
   - `/prototype/settings/club`  
   - `/prototype/settings/cuenta`
6. **[auto → user override] Labeled Volver with remembered operational route.** Copy like “Volver a Wellness” (destination label). Target = remembered ops path; fallback `/` (Inicio) if none. Prototype stubs memory (sessionStorage / query / in-memory mock). **Final contract direction for JES-61: memory + label — not “no memory”.** Supersedes prior “Volver → `/` without memory”.
7. **[auto] No Save / Submit chrome on Equipo.** Client-only control changes; makes “autosave-shaped” density visible for JES-58 without implementing the contract.
8. **[auto] Dense admin tokens, Phosphor via SSR entry in RSC, light default.** Design-system + admin-shell rules.
9. **[auto] App-local prototype only; zero `@repo/design-system` promotion; do not modify production `/settings`.** ADR 0001 + issue no-goals.
10. **[auto] No persistence for Equipo field values; mock / in-memory state.** Prototype skill default. (Volver memory stub is the exception — see #6 / assume #18.)
11. **[auto] Zero planning HITL.** Product locks + user overrides below are enough; human reaction after the artifact closes the prototype ticket. Cap unused.
12. **[auto] Lean on-screen copy.** Labels/values/verbs only; rationale stays in this map / README.
13. **[auto → user override] Content layout law (single column).** Mobile-first stacked column; mobile `max-w-[640px] mx-10 mb-16`; tablet+ **no max-w**, keep `mx-10 mb-16`. Applies to prototype; note for production settings content. Supersedes prior ~`max-w-2xl` assume (#17 superseded).

### Assume

14. **[assume] Host as Next throwaway under `apps/app/app/prototype/settings/` outside `(authenticated)`.** Reason: real sheet + tokens for Wave 2; avoid ops layout wrap. **Revert:** static HTML under `.scratch/jes-57-settings-prototype/prototype/` (DD-04 style) if in-app auth/layout friction blocks the reaction, or a route-group rename if path convention is disliked.
15. **[assume] Equipo provisional content grouping = two stacked sections (Identidad → Categoría; Zona horaria → timezone row)** in the **same single column**, so JES-59 can react to vertical inter-section spacing. Clarified: **not** dual-column layout. Compatible with layout law #13. **Revert:** one section “Equipo” with both rows if reaction prefers flatter grouping (JES-59 still decides production).
16. **[assume] Header team control is a mock pill row (Vercel-like), not a restyle of production `ActiveTeamSwitcher` Select.** Reason: issue asks for pills; production Select is a different metaphor. **Revert:** reuse/adapt `ActiveTeamSwitcher` visually if pills feel fake next to real branding.
17. **[assume] Auth gate on the prototype layout (signed-in staff only); shell chrome still mock-driven.** Reason: one-command via existing `pnpm --filter app dev` without exposing a public throwaway. **Revert:** fully public mock page gated by `NODE_ENV !== 'production'` only if auth makes demo awkward.
18. **[assume] Volver memory stub via `sessionStorage` (or equivalent session-scoped client stub)** seeded with a mock ops route (e.g. Wellness) when entering the prototype, so the label + navigation are clickable without durable backend. Rows still use `border-t` separators — no Card. **Revert:** query-param-only seed, or hardcode one demo destination if storage is awkward. **Does not** lock JES-61 storage mechanism — only demos UX for that ticket.

### Superseded

- **~~[auto] Volver stub target = `/` (Inicio); no last-route memory.~~** → superseded by decision #6 (user override 2026-08-05).
- **~~[assume] Centered column ~`max-w-2xl`…~~** → superseded by decision #13 (user layout law). Prior wording risked confusion with “two sections” (content grouping ≠ columns).

## Not yet specified (implement / reaction)

- Exact Spanish microcopy for section descriptions and stub empty states (lean; tweak in build).
- Whether create-team “+” appears on the pill strip (optional; not required for chrome reaction).
- Phosphor icon picks per nav item (implementer chooses concrete icons).
- Exact mock seed for “last ops route” label set (Wellness vs Sesiones vs Inicio — any one primary ops destination is enough for the demo).
- Human accept / reject / amend of chrome feel after seeing the artifact (closes JES-57; feeds JES-59 / JES-61).

## Out of scope

- Building the prototype in this planning wave.
- Production settings shell implementation (later ticket consuming JES-56…61).
- Resolving JES-58 / JES-59 / JES-60 / JES-61 in full (prototype only demos observability: paths, autosave-shaped emptiness, section spacing, labeled Volver memory UX).
- Player-app settings; DS package changes; season switcher in settings; recreating Superficie secundaria.

## Decision ledger (classification)

| # | Decision | Level | Notes |
|---|---|---|---|
| 1 | Single faithful composition | `auto` | Doctrine validation |
| 2 | JES-56 locks applied | `auto` | Parent standing preferences |
| 3 | No ops GlobalSidebar | `auto` | Issue AC |
| 4 | Four stub routes | `auto` | Issue AC |
| 5 | Stable `/prototype/settings/*` paths | `auto` | Soft JES-60 |
| 6 | Labeled Volver + remembered route | `auto` | User override; aligns JES-61 |
| 7 | No Save chrome | `auto` | Soft JES-58 |
| 8 | Dense tokens / Phosphor / light | `auto` | Rules |
| 9 | App-local; no prod `/settings` edits | `auto` | ADR 0001 + AC |
| 10 | In-memory Equipo fields | `auto` | Prototype skill |
| 11 | Zero planning HITL | `auto` | Overrides sufficient |
| 12 | Lean copy | `auto` | UI.md + content-design |
| 13 | Single-column layout law (640 / mx-10 / mb-16; tablet+ no max-w) | `auto` | User override |
| 14 | Next host outside `(authenticated)` | `assume` | Reversible |
| 15 | Two **stacked** Equipo sections (not columns) | `assume` | Soft JES-59; clarified |
| 16 | Mock pill team switcher | `assume` | Reversible |
| 17 | Auth-gated prototype layout | `assume` | Reversible |
| 18 | sessionStorage (or equiv.) Volver stub | `assume` | Soft JES-61 UX demo |

**HITL count: 0** (under cap of 3). Issue is well-scoped for implement after `JES-57: ok`.

## Implement wave checklist (for the next agent)

1. Create `apps/app/app/prototype/settings/` tree: `layout.tsx`, Equipo page, four stubs, redirect index.
2. Build settings sidebar + **labeled Volver** (memory stub) + mock team pills + mobile sheet opener using DS Sidebar primitives.
3. Equipo: single-column layout law; two **stacked** sections; Categoría + Zona horaria rows; no cards; no Save; client stubs.
4. One-line README with run URL; link artifact on JES-57.
5. Stop — do not touch production `/settings`; do not treat JES-59 grouping or JES-61 storage as settled beyond the UX demo.

## Orchestrator

- Request user confirmation: **`JES-57: ok`** before implement.
- Soft impact: **JES-61 must not assume “Volver → `/` without memory”** from this prototype; align to memory + destination label (durable mechanism still JES-61’s job).
- After merge/tip: JES-59 can react to Equipo **vertical** section spacing; soft tip-merge into JES-59 worktree per lote BLOCKING.md.
