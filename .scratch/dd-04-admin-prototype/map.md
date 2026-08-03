# DD-04 — Prototype the admin data surface

Status: prototype delivered (pending human visual accept of principles)  
Parent: `.scratch/design-direction-wayfinder/MAP.md`  
Ticket: `.scratch/design-direction-wayfinder/issues/04-prototype-the-admin-data-surface.md`  
Locked parent: `.scratch/design-direction-wayfinder/artifacts/admin-experience-principles.md`  
Artifact: `.scratch/dd-04-admin-prototype/prototype/`  
Planning route: `plan:auto` (human reaction to the built artifact formally accepts/rejects/amends principles)

## Destination

A **throwaway UI prototype** that answers: *Does the accepted admin experience feel right when applied to a concrete staff data surface?*

The artifact must demonstrate, in one composition:

1. Persistent navigation consistent with locked IA (primary + secondary).
2. An **invisible** table/row list (exercise-library pattern).
3. **One** allowed contrast: compact risk/status callout (card OK) that does **not** wrap the list.
4. Dense controls; color only for status/risk.

Resolve when a human **accepts, rejects, or amends** the principles after reacting to the prototype — not when production code ships.

## Question branch

**UI prototype** (`/prototype` → UI.md), but **single faithful composition** — not three radically different variants.

Reason: the design question is principle-validation (“does the locked doctrine feel right?”), not open exploration (“which of three layouts?”). Radical variants that contradict §3–§4 would confuse the reaction. Deviation from UI.md’s default N=3 is intentional and recorded.

## Notes

- Parent MAP destination remains **spec + backlog**; production restyles of `apps/app` are out of scope for this effort.
- Pattern reference (read-only): `ExerciseLibraryList` / `ExerciseLibraryListToolbar` / `ExerciseLibraryGroup` — `ItemGroup` without enclosing box; rows `border-t`; group titles `text-xs uppercase tracking-wide text-text-secondary`; toolbar underline / `shadow-none`.
- Nav reference: `apps/app/lib/admin-navigation.ts` — primary Inicio / Wellness / Sesiones / Configuración; secondary Jugadores / Ejercicios / Lesiones / Temporadas / Análisis IA.
- Product UI copy in the prototype: **Spanish**. This map: **English**.
- Do **not** change `@repo/design-system` primitives or production routes in this ticket.

## Prototype scope (what to build in the implement wave)

### Shell

- Mock desktop sidebar with **primary** destinations; **Wellness** active.
- Secondary destinations available as a compact “Más” / overflow list (not promoted into primary chrome).
- Team-centric chrome: one fake `activeTeam` label (e.g. “Juvenil A”) — no multi-team mashup.
- Light default; no dark-first industrial theme; no ModeToggle required in the throwaway (optional stub OK).

### Main surface — invisible list

- Domain fit for job #1: **roster wellness rows** (mock players + check-in / risk status), not the exercise library itself.
- Exercise library remains the **visual pattern** source; wellness content makes the risk callout meaningful.
- Toolbar: search + filter + sort, underline language (`border-b`), no card chrome, no structural shadow.
- Column / group labels: small, uppercase, wide tracking, secondary tone.
- Rows: horizontal rules only; no four-sided frame around the list/table; no vertical list-frame borders.
- Dense row controls (status badge / text link); Phosphor-like icons at dense `fill` weight where used.
- Status color via semantic roles only (`danger` / muted secondary) — no decorative multi-accent chrome.
- ~8–12 mock rows in memory; client-side filter/sort is enough to feel the toolbar (no persistence).

### Contrast case — one callout

- Above (or beside, on wide screens) the list: **one** compact risk/status callout framed as a card/panel, e.g. “3 jugadores sin check-in hoy” with a single affordance (“Ver pendientes”).
- Must **not** wrap the list or table.
- Purpose: make the §4 exception boundary visible next to the frameless list.

### Explicitly out of prototype scope

- Real auth, real data, Server Actions, mutations.
- Command palette, global multi-select, bulk row selection.
- Pixel-perfect token parity with `globals.css` (approximate semantic tokens OK).
- Mobile bottom-nav fidelity (optional sketch; desktop shell is enough for reaction).
- Player app / age bands / reminders (DD-02 / DD-05 / DD-06).
- Shared visual language hue/type/motion decisions (DD-03).

## Location and tech

| Choice | Decision |
|---|---|
| Path | `.scratch/dd-04-admin-prototype/prototype/` |
| Entry | `index.html` (self-contained) |
| Styling | Tailwind CDN + a small set of CSS variables mirroring semantic roles (`bg-*`, `text-*`, `border-*`, `danger`) |
| Run | One command from repo/worktree: `pnpm dlx serve .scratch/dd-04-admin-prototype/prototype` (or open the file); document the URL in the ticket when built |
| Link | After build, link the folder / serve URL from `issues/04-prototype-the-admin-data-surface.md` |

**Why not `apps/app` throwaway route:** parent MAP forbids shipping design implementation in app code during this map; scratch keeps the effort boundary clean and matches the ticket’s “throwaway / asset” framing.

**Why not Vite/React + design-system imports:** unnecessary for a low-fidelity reaction surface; HTML avoids wiring the monorepo app, auth, and DS package into a throwaway. Pattern fidelity comes from matching the exercise-library structural rules, not from importing production components.

## Decisions so far

### Implement (2026-08-03)

12. **[implement] Prototype delivered** at [`.scratch/dd-04-admin-prototype/prototype/`](prototype/) (`index.html` + README). Single faithful Wellness roster composition: locked primary nav + Más secondary, invisible list, one risk callout. Principles held as locked — no contradiction found. Ticket closed with resolution *prototype delivered for reaction; principles held as locked*; human visual accept still pending.

### Auto

1. **[auto] UI branch, single faithful composition.** Validate locked principles; skip multi-variant switcher. Reason: ticket question is reaction-to-doctrine, not layout bake-off.

2. **[auto] Content domain = Wellness roster list** (mock DailyEntry-ish status rows). Reason: primary staff job #1; enables a meaningful risk callout. Exercise library stays the pattern reference only.

3. **[auto] Shell mirrors locked IA.** Primary four destinations; Wellness active; secondary not in primary chrome; single fake team. Reason: `admin-experience-principles.md` §2 + `admin-navigation.ts`.

4. **[auto] Invisible list rules copy design-system / exercise-library pattern.** No enclosing box; horizontal row rules; uppercase labels; toolbar underline; no elevation on list frame. Reason: principles §3 + adjacent code.

5. **[auto] Exactly one card/callout contrast** — compact risk/status, does not wrap the list. Reason: principles §4 + ticket requirement 3.

6. **[auto] Dense controls; Spanish copy; color for status only; light default.** Reason: principles §5 / §8.

7. **[auto] No persistence; mock data in the HTML/JS.** Reason: prototype skill default.

8. **[auto] No production `apps/app` or `@repo/design-system` changes in this ticket.** Reason: MAP out of scope + principles § Out of scope.

9. **[auto] Zero planning HITL.** All product doctrine already locked in DD-01 artifact; remaining choices are implementation shape for a throwaway. Human reaction after the build is the ticket close, not a planning gate.

### Assume

10. **[assume] Prototype lives under `.scratch/dd-04-admin-prototype/prototype/` as static HTML + Tailwind CDN.** Reason: MAP forbids app implementation during the map; user/planner hint allows scratch HTML; one-command serve. **Revert:** mount a throwaway Next route under `apps/app` (e.g. `/prototype/admin-data-surface`) with `?variant=` if in-shell fidelity is required for reaction.

11. **[assume] Approximate semantic tokens via local CSS variables** rather than importing `apps/app/globals.css`. Reason: keep throwaway decoupled; fidelity is structural. **Revert:** copy token snippets from `globals.css` into the prototype stylesheet, or switch to an in-app route that inherits real tokens.

## Not yet specified (implement wave / reaction)

- Exact mock copy and which risk numbers feel alarming vs calm (tweak during build; not doctrine).
- Whether a thin mobile bottom-nav sketch is worth five minutes (optional; not blocking).
- Human accept / reject / amend of principles after seeing the artifact (closes DD-04).

## Out of scope

- Building the prototype in this planning wave.
- Production restyles, DS primitive changes, rule file rewrites (DD-07).
- Final design-direction synthesis (DD-08).
- Shared visual language bake-off (DD-03).
- Player check-in prototype (DD-05).

## Decision index (classification)

| # | Decision | Level | Notes |
|---|---|---|---|
| 1 | Single faithful UI composition (no N=3 variants) | auto | Principle validation |
| 2 | Wellness roster as content domain | auto | Job #1 + contrast |
| 3 | Nav / team shell from locked IA | auto | DD-01 artifact |
| 4 | Invisible list pattern | auto | DS + exercise library |
| 5 | One risk callout card | auto | Principles §4 |
| 6 | Density / Spanish / status color / light | auto | Principles |
| 7 | In-memory mock data | auto | Prototype skill |
| 8 | No apps/app or DS production edits | auto | MAP |
| 9 | Zero planning HITL | auto | Doctrine locked |
| 10 | Scratch HTML + Tailwind CDN location/tech | assume | Reversible |
| 11 | Approximate tokens locally | assume | Reversible |
| 12 | Prototype delivered; principles held pending human reaction | implement | Asset linked |

**HITL count: 0** (under cap of 3). Prototype ready for human visual accept.

## Implement wave checklist (for the next agent)

1. ~~Create `.scratch/dd-04-admin-prototype/prototype/index.html` (+ tiny CSS/JS if split).~~
2. ~~Build shell + invisible wellness list + one risk callout per this map.~~
3. ~~Document one-command run in a one-line `README.md` beside the prototype.~~
4. ~~Link the asset from `issues/04-prototype-the-admin-data-surface.md`.~~
5. Stop — do not promote into `apps/app`; wait for human reaction to formally accept/reject/amend principles.

## Human review (2026-08-03)

- **Orchestrator:** `ok a todo` — accept all auto/assume decisions and all HITL recommendations for this ticket.
- **Product override (global):** Age Band cutoffs and Guardian / Parental Supervision Layer settings MUST remain **staff-configurable at all times** (club/team policy). Indicative ages and Guardian defaults in resolutions are **defaults**, not hard-coded product constants. Spec language must say clubs can always retune bands and guardian receive/escalation options without a code change to product doctrine.

