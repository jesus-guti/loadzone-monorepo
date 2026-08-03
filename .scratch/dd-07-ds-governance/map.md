# DD-07 — Define design-system governance and migration boundary

Status: locked (human `ok 7`, 2026-08-03)  
Parent: `.scratch/design-direction-wayfinder/MAP.md`  
Ticket: `.scratch/design-direction-wayfinder/issues/07-define-design-system-governance-and-migration-boundary.md`  
Locked parents:
- [admin-experience-principles](../design-direction-wayfinder/artifacts/admin-experience-principles.md)
- [shared-visual-language-and-app-divergence](../design-direction-wayfinder/artifacts/shared-visual-language-and-app-divergence.md)
- [reminders-streaks-and-health-escalation](../design-direction-wayfinder/artifacts/reminders-streaks-and-health-escalation.md)
- [player-age-bands-and-parental-supervision](../design-direction-wayfinder/resolutions/player-age-bands-and-parental-supervision.md)
- Prototypes: [admin data surface](../dd-04-admin-prototype/prototype/), `apps/player/app/[token]/prototype-dd-05/`
- MAP: Age Band / Guardian settings always staff-configurable

Proposed artifact (after HITL lock): `.scratch/design-direction-wayfinder/artifacts/design-system-governance-and-migration.md`

## Destination

Lightweight **design-system governance + migration boundary** for LoadZone: what lives in `@repo/design-system` vs app-local, intentional promotion criteria (not use-count), how admin-only and player-only patterns are documented, post-spec migration order, and how DD-04 / DD-05 prototype learnings become rule text vs experiments — enough for [Synthesize the design direction specification](../design-direction-wayfinder/issues/08-synthesize-the-design-direction-specification.md). **Not** production CSS edits, DS primitive refactors, Figma kits, or dual-kit bureaucracy.

## Notes

- Effort destination remains **spec + backlog** (parent MAP). This ticket produces rule-ready governance language and a migration sequence for the backlog — not shipped restyles.
- Honor DD-01: invisible data surfaces; cards as exceptions; elevation only on floating surfaces; Phosphor `fill` for dense admin.
- Honor DD-02 / MAP: one player tree across Age Bands; copy adapts; Age Band cutoffs and Guardian / Parental Supervision settings remain **staff-configurable** always — visual chrome does not fork per band.
- Honor DD-03: shared sage; diverge via density/radius/border/elevation/motion/type scale; Geist; semantic tokens keep / legacy shadcn retire; `--surface-*` internal aliases.
- Honor DD-06: calm adherence / Care Alert patterns stay product rules; their UI chrome is player- or admin-local until promotion gates pass.
- Parent MAP standing preference: shared primitives app-agnostic; diverge via each app’s `globals.css` and app-local product patterns.
- Parent MAP **Out of scope** (binding reject): automatic promotion solely because a component appears more than twice; Figma board ceremony unless human insists.
- Precedent (read-only): `@repo/design-system` holds shared UI atoms under `packages/design-system/components` (+ fonts, `cn`, theme); admin utilities `bevel-card` / `glass-surface` / `border-gradient-subtle` live only in `apps/app/app/globals.css`; `QuestionCard` lives only under `apps/player/app/[token]/components`.
- Orthogonal effort: `.scratch/shadcn-migration/` (Base UI / base-nova). Governance must **not** invent a second kit taxonomy that fights that map; keep one package name `@repo/design-system`.
- Product UI copy Spanish; this planning artifact English.
- Autonomy: `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not live-grill; do not close the wayfinder ticket from this planning wave.

## Decisions so far

### Auto

1. **[auto] Spec / governance only — no production DS or CSS edits in this map effort.**  
   DD-07 decides package boundary, promotion criteria, documentation homes, migration order, and prototype→rule graduation. Implementation tickets after DD-08 execute rule rewrites and screen pilots.  
   Reason: parent MAP destination = spec + backlog; ticket rejects bureaucracy and shipping restyles during the map.

2. **[auto] Reject Figma ceremony and multi-kit bureaucracy.**  
   No mandatory Figma library, dual “Admin Kit / Player Kit” design-tool sync, or component-count dashboards. Governance lives in **repo rules** (`.cursor/rules`) plus **ADRs only when hard to reverse**.  
   Reason: ticket explicit reject + MAP out of scope.

3. **[auto] `@repo/design-system` stays app-agnostic shared primitives + infrastructure.**  
   In scope for the package: interaction atoms (Button, Input, Table, Dialog, Sheet, Item, …), `lib/utils` (`cn`), fonts, theme provider, shared hooks that are not product domain. Appearance is injected by each app’s `globals.css` semantic tokens.  
   Reason: MAP Notes + `loadzone-design-system.mdc` + DD-03 token split.

4. **[auto] App identity and product composition stay app-local.**  
   - `apps/app`: shell, feature compositions, exercise-library list pattern, wellness ops surfaces, admin-only CSS utilities.  
   - `apps/player`: check-in flow, `QuestionCard` / future PlayerCard / streak chrome, Age Band–adaptive Spanish copy, parental see-only affordances.  
   Reason: MAP standing preference; DD-01 / DD-02 / DD-05 locations in code.

5. **[auto] No automatic promotion by use-count.**  
   Grep hit counts (“used twice / thrice”) never suffice to move code into `@repo/design-system`.  
   Reason: parent MAP Out of scope (binding).

6. **[auto] Age Band / Guardian policy stays staff-configurable — no DS chrome forks.**  
   Cutoffs and Guardian receive/escalation options are club/team settings. Shared primitives must not bake fixed band skins or guardian UIs.  
   Reason: MAP lock + DD-02 / DD-03 §8.

7. **[auto] Documentation homes (lightweight).**  
   - Transversal visual + governance: rewrite `.cursor/rules/loadzone-design-system.mdc` from DD-01 / DD-03 / this ticket’s artifact after DD-08.  
   - Admin shell / IA: `.cursor/rules/loadzone-admin-shell.mdc` from DD-01.  
   - Player touch / PWA: `.cursor/rules/loadzone-player-pwa.mdc` (touch minima already; calm check-in notes as needed).  
   - Hard-to-reverse package boundary: one ADR (see assume / HITL), not a wiki.  
   Reason: artifacts already mark themselves rule-ready for these files; ticket prefers rules over ceremony.

8. **[auto] Orthogonal to shadcn-migration map.**  
   Keep package name `@repo/design-system`; do not invent `@workspace/ui` or app-scoped duplicate registries as governance. Base UI / style regeneration follows the existing shadcn wayfinder, constrained by Phosphor + semantic token policy (DD-03).  
   Reason: adjacent effort HANDOFF; avoid dual bureaucracy.

9. **[auto] Explicit rejects (governance).**  
   - Auto-promote on use-count.  
   - App-flavored folders inside the shared package as a default pattern (pending HITL B).  
   - Promoting throwaway prototype trees (`prototype-dd-05`, scratch HTML) into DS.  
   - Structural shadows on ordinary cards/list frames; legacy shadcn as product authoring vocabulary (DD-03).  
   - Per-Age-Band visual kits.  
   Reason: MAP + locked parents.

### Assume

10. **[assume] Admin-only CSS utilities stay in `apps/app/app/globals.css` — document and constrain; do not promote to `@repo/design-system`.**  
    Named utilities today: `bevel-card`, `bevel-card-brand`, `border-gradient-subtle`, `glass-surface`.  
    **Constraints to write into rules:**  
    - `glass-surface`: floating / signature moments only (pills, alert dots, rare overlay chrome) — never list/table frames.  
    - `bevel-card*`: only on **exception** cards/panels allowed by DD-01 §4 — never invisible list frames or toolbars.  
    - Do not add equivalent utilities to player `globals.css`.  
    Wave-1 migration does **not** mass-delete existing call sites; retire or replace **on touch** when a screen is restyled under the new principles.  
    **Revert:** promote a thin shared `@utility` set into `packages/design-system/styles` if both apps truly need the same material language (unlikely under DD-03 divergence).

11. **[assume] Player-only patterns stay under `apps/player`.**  
    `QuestionCard`, progressive check-in layouts, calm streak chip, parental see-only notes, future PlayerCard / football-identity teaser — all app-local feature components. They may compose shared atoms (`Button`, `cn`) but must not move into DS until promotion gates (HITL A) pass with a second real product boundary.  
    **Revert:** extract a truly agnostic step-card primitive only after a second consumer needs the same interaction contract (not merely similar rounded panels).

12. **[assume] ADR threshold — rare.**  
    Write an ADR when changing: (a) public package export / folder boundary, (b) public semantic token vocabulary for feature authors, or (c) base component library (Radix → Base UI is owned by shadcn-migration). Ordinary principle updates land only in `.cursor/rules` + wayfinder artifacts.  
    **Revert:** skip the governance ADR and keep boundary text only in rules if the human prefers zero ADR surface.

13. **[assume] Prototype → rule graduation protocol.**  
    | Source | Becomes binding rule text | Stays experiment / backlog |
    |---|---|---|
    | DD-01 / DD-03 / DD-06 locked doctrine confirmed by prototypes | Yes — port into `.cursor/rules` after DD-08 | — |
    | DD-04 invisible list + one risk callout (principles held) | Structural rules already locked; prototype is evidence | Exact mock copy, optional mobile sketch |
    | DD-05 variants A/B/C | Age-adaptive copy strategy, calm streak (no guilt), parental see-only, Assisted OQAT, non-scoring teaser — once human picks/amends | Winning layout tree, pixel type scale, football teaser extent, Flame vs quiet chip chrome |
    | Throwaway code paths | Never promoted as DS components | Delete or leave gated until replaced by product work |

    Human visual accept of DD-04 / DD-05 still gates **layout winners** in the implementation backlog; it does **not** reopen locked principles unless the human amends them.  
    **Revert:** treat a specific prototype choice (e.g. variant B timeline) as binding earlier if human explicitly locks it before DD-08.

14. **[assume] Migration order after the design-direction spec lands (DD-08).**  

    | Wave | What moves | Deferred / not in wave |
    |---|---|---|
    | **0 — Rules** | Rewrite `loadzone-design-system.mdc` (+ admin-shell / player-pwa deltas) from locked artifacts + this governance; optional ADR for package boundary | Production screens |
    | **1 — Pilots** | Admin: Wellness **data surface** toward invisible list + one risk callout (DD-04 evidence; exercise library remains pattern reference). Player: check-in path toward calm streak + band-adaptive copy + OQAT for Assisted (DD-05 / DD-02 / DD-06), after variant choice | Full dashboard KPI walls; sessions calendar chrome; marketing |
    | **2 — On-touch hygiene** | As screens are touched: strip legacy shadcn authoring classes; audit `bevel-card` / card wrappers against DD-01 exception list; prefer semantic tokens | Big-bang restyle of all sessions cards |
    | **3 — Package hygiene** | Evaluate decorative shared components (`noise-background`, `moving-border`, `hover-border-gradient`, etc.) for quarantine / no-new-usage; align with shadcn-migration regeneration | Forced deletion of every decorative export in one PR |

    Explicitly deferred beyond this map’s backlog intent: dark OKLCH ladder polish, Guardian auth UI, parent-portal skin, promoting `QuestionCard` / PlayerCard, Figma.  
    **Revert:** swap pilot screens (e.g. start with Sesiones hub instead of Wellness) if ops priority differs; keep Wave 0 (rules) first.

15. **[assume] `--surface-*` stays internal (confirm DD-03 assume for migration).**  
    Feature authors keep `bg-bg-*` / documented semantics. No second public Tailwind vocabulary. Retirement or rename is a later hygiene ticket, not Wave 1.  
    **Revert:** retire aliases in Wave 2 if shadcn-migration CSS work already drops them (see shadcn ticket #02 note).

16. **[assume] How app-only patterns are documented.**  
    Add a short **“App-local patterns”** section to `loadzone-design-system.mdc`:  
    - Admin utilities: name + allowed contexts + “never on invisible list frames”.  
    - Player compositions: live under `apps/player/...`; Age Band adapts copy not chrome; no DS promotion without gates.  
    - Canonical admin data-surface reference remains exercise library + (post-pilot) Wellness list.  
    No Storybook / Figma mirror required.  
    **Revert:** add a one-page `docs/` note if rules feel too dense; still no Figma mandate.

### Hitl (locked — human `ok 7`)

17. **[hitl → locked] Promotion criteria — five intentional gates (recommendation A).**  
    A component may enter `@repo/design-system` only when all pass: (1) app-agnostic contract, (2) same interaction need across ≥2 product boundaries, (3) token-driven appearance, (4) intentional PR naming second consumer, (5) prefer regenerable registry primitives. Reject use-count auto-promote.

18. **[hitl → locked] Shared package shape — Option 1 (recommendation B).**  
    Strict flat shared primitives; **no** `components/admin/*` or `components/player/*` kits inside `@repo/design-system`; no split admin/player packages.

19. **[hitl → locked] Artifact + short Wave-0 ADR (recommendation C Option 1).**  
    Wayfinder artifact `artifacts/design-system-governance-and-migration.md` + ADR `docs/adr/0001-design-system-package-boundary.md`. No Figma; no docs site. Rule-file rewrites still wait for DD-08 unless human pulls them forward.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Spec-only / no production edits this map | `auto` | MAP destination |
| 2 | Reject Figma / multi-kit ceremony | `auto` | Ticket + MAP reject |
| 3 | DS = app-agnostic primitives + infra | `auto` | MAP + design-system rule |
| 4 | Product composition app-local | `auto` | MAP + code precedent |
| 5 | No use-count auto-promotion | `auto` | MAP Out of scope |
| 6 | Staff-configurable bands / guardian; no chrome forks | `auto` | MAP lock + DD-02/03 |
| 7 | Docs live in `.cursor/rules` (+ rare ADR) | `auto` | Ticket preference |
| 8 | Orthogonal to shadcn-migration | `auto` | Adjacent effort |
| 9 | Explicit governance rejects | `auto` | Parents + MAP |
| 10 | Admin utilities stay app-local + constrained | `assume` | Contained; reversible |
| 11 | Player patterns stay app-local | `assume` | Contained; reversible |
| 12 | ADR threshold rare | `assume` | Process; reversible |
| 13 | Prototype → rule graduation | `assume` | Contained protocol; reversible |
| 14 | Migration waves 0→3 | `assume` | Implementation order; reversible |
| 15 | `--surface-*` internal | `assume` | Confirms DD-03; reversible |
| 16 | Document app-local in design-system rule | `assume` | Contained; reversible |
| 17 | Promotion criteria gates (A) | `hitl` → locked | Human `ok 7` |
| 18 | No app kits inside shared package (B) | `hitl` → locked | Human `ok 7` |
| 19 | Artifact + Wave-0 ADR (C) | `hitl` → locked | Human `ok 7` |

**HITL count: 3** — all locked (`ok 7`).

## HITL recommendations (for orchestrator → human)

### A. Promotion criteria

**Recommend:** a component or utility may enter `@repo/design-system` only when **all** gates pass (none is “used N times”):

1. **App-agnostic contract** — no admin density assumptions, no player check-in / DailyEntry domain, no Spanish product copy, no Age Band branches inside the primitive.  
2. **Same interaction need across product boundaries** — at least two of `{apps/app, apps/player, apps/web}` (or a shared non-UI package consuming the primitive) need the **same behavior/API**, not merely similar visuals.  
3. **Token-driven appearance** — all divergence via semantic tokens / app `globals.css`; no `if (app === 'player')` class forks inside the shared file.  
4. **Intentional PR** — the move PR states why app-local failed, names the second consumer, and links this governance; silent “drive-by promote” is rejected.  
5. **Primitives from registry** — shadcn/Base UI regenerable atoms are preferred over one-off shared composites; product composites stay app-local by default.

Reject automatic grep-count promotion even when gate 2 is met without gates 1, 3, and 4.

### B. Shared package shape

**Recommend: Option 1 — strict flat shared primitives; no `components/admin/*` or `components/player/*` kits inside `@repo/design-system`.**

| Option | Meaning |
|---|---|
| **1 (recommend)** | Shared package = agnostic atoms only. Admin/player patterns stay under each app. Document constraints in rules. |
| 2 | Allow namespaced kits inside DS (`components/admin`, `components/player`) as soft boundaries. |
| 3 | Split packages (`@repo/ui-admin`, `@repo/ui-player`) — heavier bureaucracy. |

Option 1 matches MAP Notes, avoids multi-kit ceremony, and keeps shadcn-migration simple. Option 2/3 recreate the bureaucracy this ticket rejects.

### C. Artifact + ADR

**Recommend: Option 1 — write the wayfinder artifact (English, rule-ready) for DD-08 to cite; add one short ADR only for the package boundary + promotion gates once HITL A/B lock. No Figma. No extra docs site.**

| Option | Meaning |
|---|---|
| **1 (recommend)** | Artifact under `artifacts/design-system-governance-and-migration.md` + single ADR when implementing Wave 0. |
| 2 | Rules-only — fold governance into `loadzone-design-system.mdc` at Wave 0; skip ADR. |
| 3 | Heavier — ADR + docs site + Storybook inventory (reject unless human insists). |

Option 1 matches “ADRs only when hard to reverse” (package boundary qualifies) without inventing ceremony.

## Not yet specified

- Exact wording of the Wave 0 rule-file diff (DD-08 / implementation tickets).  
- Which DD-05 variant is the production check-in layout (awaits human reaction).  
- Whether shadcn-migration drops `--surface-*` before or after design-direction Wave 2.  
- Quarantine list details for decorative DS exports (inventory at implementation).  
- Pixel type-scale tables (may graduate from prototypes into backlog, not governance doctrine).

## Out of scope

- Implementing rule rewrites, screen pilots, or DS code moves in this planning wave.  
- Figma libraries, Storybook mandates, dual design-tool kits.  
- Auto-promotion by use-count (rejected, not deferred).  
- Changing Age Band / Guardian configurability.  
- Final synthesized specification (DD-08).  
- Executing the shadcn Base UI migration (separate map).  
- Guardian auth UI / parent portal product skin.

## Handoff for implementer (after human `ok` / HITL answers)

1. Record HITL answers in this map’s **Decisions so far**.  
2. Write `artifacts/design-system-governance-and-migration.md` (status accepted) from resolved decisions.  
3. Append a one-line gist + link on parent `MAP.md` **Decisions so far**; clear governance/migration fog from **Not yet specified**.  
4. Close wayfinder ticket 07 with resolution comment pointing at map + artifact.  
5. Do **not** start Wave 0 rule edits until DD-08 assembles the spec + backlog (unless human explicitly pulls rules forward).

## Human review (2026-08-03)

- **Orchestrator:** `ok 7` — accept all auto/assume decisions and HITL A/B/C recommendations (5 promotion gates; no app kits in DS; wayfinder artifact + short Wave-0 ADR).
