# Design-system governance and migration

Status: accepted  
Source ticket: [Define design-system governance and migration boundary](../issues/07-define-design-system-governance-and-migration-boundary.md)  
Locked decisions: [DD-07 planning map](../../dd-07-ds-governance/map.md) (human `ok 7` — all auto/assume + HITL A/B/C as recommended, 2026-08-03)  
Parents: [Admin experience principles](admin-experience-principles.md), [Shared visual language and app divergence](shared-visual-language-and-app-divergence.md), [Reminders, streaks, and health escalation](reminders-streaks-and-health-escalation.md), [Player age bands and parental supervision](../resolutions/player-age-bands-and-parental-supervision.md)

These rules are **rule-ready** for Wave 0 rewrites of `.cursor/rules/loadzone-design-system.mdc` (plus admin-shell / player-pwa deltas) after DD-08 assembles the synthesized spec. They are **not** production CSS edits, DS primitive refactors, Figma kits, or dual-kit bureaucracy.

Hard-to-reverse package boundary + promotion gates are also recorded in [ADR 0001](../../../docs/adr/0001-design-system-package-boundary.md).

---

## Critical configurability note

**Age Band cutoffs** and **Guardian / Parental Supervision** settings remain **always staff-configurable**. Shared primitives must not bake fixed band skins, guardian UIs, or Age Band branches. One player component tree adapts **copy**, not chrome (DD-02 / DD-03 §8).

---

## 1. Package boundary — `@repo/design-system`

### In the shared package

- Interaction atoms / regenerable primitives (Button, Input, Table, Dialog, Sheet, Item, …)
- `lib/utils` (`cn`), fonts, theme provider
- Shared hooks that are **not** product-domain (no DailyEntry, Age Band, check-in, Spanish product copy)

Appearance is injected by each app’s `globals.css` semantic tokens. Keep package name `@repo/design-system`. Orthogonal to `.scratch/shadcn-migration/` (Base UI / base-nova) — do not invent a second kit taxonomy or `@workspace/ui`.

### Outside the shared package (app-local)

| Home | Owns |
|---|---|
| `apps/app` | Shell, feature compositions, exercise-library list pattern, wellness ops surfaces, admin-only CSS utilities |
| `apps/player` | Check-in flow, `QuestionCard` / future PlayerCard / streak chrome, Age Band–adaptive Spanish copy, parental see-only affordances |
| `apps/web` | Marketing / public surfaces (when they consume primitives, same promotion gates apply) |

**HITL B locked:** strict flat shared primitives — **no** `components/admin/*` or `components/player/*` kits inside `@repo/design-system`. No split packages (`@repo/ui-admin`, `@repo/ui-player`).

---

## 2. Promotion gates (intentional — not use-count)

A component or utility may enter `@repo/design-system` only when **all** gates pass (**HITL A**):

1. **App-agnostic contract** — no admin density assumptions, no player check-in / DailyEntry domain, no Spanish product copy, no Age Band branches inside the primitive.
2. **Same interaction need across product boundaries** — at least two of `{apps/app, apps/player, apps/web}` (or a shared non-UI package consuming the primitive) need the **same behavior/API**, not merely similar visuals.
3. **Token-driven appearance** — all divergence via semantic tokens / app `globals.css`; no `if (app === 'player')` class forks inside the shared file.
4. **Intentional PR** — the move PR states why app-local failed, names the second consumer, and links this governance; silent “drive-by promote” is rejected.
5. **Primitives from registry** — shadcn / Base UI regenerable atoms are preferred over one-off shared composites; product composites stay app-local by default.

Grep hit counts (“used twice / thrice”) **never** suffice — even when gate 2 looks met without gates 1, 3, and 4.

---

## 3. App-local patterns (document in rules; do not promote by default)

### Admin-only CSS utilities (`apps/app/app/globals.css`)

Named utilities today: `bevel-card`, `bevel-card-brand`, `border-gradient-subtle`, `glass-surface`.

Constraints:

- `glass-surface`: floating / signature moments only (pills, alert dots, rare overlay chrome) — **never** list/table frames.
- `bevel-card*`: only on **exception** cards/panels allowed by DD-01 — never invisible list frames or toolbars.
- Do **not** add equivalent utilities to player `globals.css`.
- Wave 1 does **not** mass-delete call sites; retire or replace **on touch** when a screen is restyled.

Canonical admin data-surface reference: exercise library + (post-pilot) Wellness list.

### Player-only patterns (`apps/player`)

`QuestionCard`, progressive check-in layouts, calm streak chip, parental see-only notes, future PlayerCard / football-identity teaser — all app-local feature components. They may compose shared atoms (`Button`, `cn`) but must not move into DS until promotion gates pass with a second real product boundary.

DD-06 calm adherence / Care Alert **product** rules stay doctrine; their UI chrome stays player- or admin-local until gates pass.

### How to document (Wave 0)

Add a short **“App-local patterns”** section to `loadzone-design-system.mdc` covering the above. No Storybook / Figma mirror required.

---

## 4. Prototype → rule graduation

| Source | Becomes binding rule text | Stays experiment / backlog |
|---|---|---|
| DD-01 / DD-03 / DD-06 locked doctrine confirmed by prototypes | Yes — port into `.cursor/rules` after DD-08 | — |
| DD-04 invisible list + one risk callout (principles held) | Structural rules already locked; prototype is evidence | Exact mock copy, optional mobile sketch |
| DD-05 variants A/B/C | Age-adaptive copy strategy, calm streak (no guilt), parental see-only, Assisted OQAT, non-scoring teaser — once human picks/amends | Winning layout tree, pixel type scale, football teaser extent, Flame vs quiet chip chrome |
| Throwaway code paths (`prototype-dd-05`, scratch HTML) | **Never** promoted as DS components | Delete or leave gated until replaced by product work |

Human visual accept of DD-04 / DD-05 still gates **layout winners** in the implementation backlog; it does **not** reopen locked principles unless the human amends them.

---

## 5. Migration waves (after DD-08)

| Wave | What moves | Deferred / not in wave |
|---|---|---|
| **0 — Rules** | Rewrite `loadzone-design-system.mdc` (+ admin-shell / player-pwa deltas) from locked artifacts + this governance; ADR for package boundary + promotion gates (shipped with this ticket) | Production screens |
| **1 — Pilots** | Admin: Wellness **data surface** toward invisible list + one risk callout (DD-04 evidence; exercise library remains pattern reference). Player: check-in path toward calm streak + band-adaptive copy + OQAT for Assisted (DD-05 / DD-02 / DD-06), after variant choice | Full dashboard KPI walls; sessions calendar chrome; marketing |
| **2 — On-touch hygiene** | As screens are touched: strip legacy shadcn authoring classes; audit `bevel-card` / card wrappers against DD-01 exception list; prefer semantic tokens | Big-bang restyle of all sessions cards |
| **3 — Package hygiene** | Evaluate decorative shared components (`noise-background`, `moving-border`, `hover-border-gradient`, etc.) for quarantine / no-new-usage; align with shadcn-migration regeneration | Forced deletion of every decorative export in one PR |

`--surface-*` stays **internal** (DD-03). Feature authors keep `bg-bg-*` / documented semantics. Retirement or rename is later hygiene, not Wave 1.

Explicitly deferred beyond this map’s backlog intent: dark OKLCH ladder polish, Guardian auth UI, parent-portal skin, promoting `QuestionCard` / PlayerCard, Figma.

**Wave 0 rule-file diffs wait for DD-08** unless the human explicitly pulls rules forward. This ticket ships the governance artifact + ADR only.

---

## 6. ADR policy

Write an ADR when changing:

- (a) public package export / folder boundary
- (b) public semantic token vocabulary for feature authors
- (c) base component library (Radix → Base UI is owned by shadcn-migration)

Ordinary principle updates land only in `.cursor/rules` + wayfinder artifacts. No docs site, no Storybook inventory mandate.

---

## 7. Documentation homes (lightweight)

| Concern | Home |
|---|---|
| Transversal visual + governance | `.cursor/rules/loadzone-design-system.mdc` (rewrite after DD-08) |
| Admin shell / IA | `.cursor/rules/loadzone-admin-shell.mdc` from DD-01 |
| Player touch / PWA | `.cursor/rules/loadzone-player-pwa.mdc` |
| Hard-to-reverse package boundary | [ADR 0001](../../../docs/adr/0001-design-system-package-boundary.md) |

---

## 8. Explicit rejects

- **Figma board ceremony** / mandatory Figma library / dual design-tool kit sync.
- **Use-count auto-promote** (grep “used N times”).
- **App kits inside `@repo/design-system`** (`components/admin`, `components/player`) or split admin/player packages.
- Promoting throwaway prototype trees into DS.
- Structural shadows on ordinary cards/list frames; legacy shadcn as product authoring vocabulary (DD-03).
- Per-Age-Band visual kits / chrome forks.
- Multi-kit bureaucracy competing with shadcn-migration.

---

## Out of scope for this artifact

- Implementing rule rewrites, screen pilots, or DS code moves (post–DD-08 backlog).
- Executing the shadcn Base UI migration (separate map).
- Changing Age Band / Guardian configurability.
- Final synthesized specification (DD-08).
- Guardian auth UI / parent portal product skin.
