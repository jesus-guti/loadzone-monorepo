# DD-03 — Decide shared visual language and app divergence

Status: planning  
Parent: `.scratch/design-direction-wayfinder/MAP.md`  
Ticket: `.scratch/design-direction-wayfinder/issues/03-decide-shared-visual-language-and-app-divergence.md`  
Locked parents: [admin-experience-principles](../design-direction-wayfinder/artifacts/admin-experience-principles.md), [player-age-bands-and-parental-supervision](../design-direction-wayfinder/resolutions/player-age-bands-and-parental-supervision.md)

## Destination

Rule-ready **shared visual language + per-app divergence** for LoadZone — hue family policy, radius/density/elevation, type, icons/touch, motion, light/dark defaults, and semantic-token keep/retire — enough to rewrite `.cursor/rules/loadzone-design-system.mdc` and both apps’ token guidance later, and to unblock [Define design-system governance and migration boundary](../design-direction-wayfinder/issues/07-define-design-system-governance-and-migration-boundary.md) and [Synthesize the design direction specification](../design-direction-wayfinder/issues/08-synthesize-the-design-direction-specification.md). **Not** implementing CSS or shipping restyles.

## Notes

- Effort destination remains **spec + backlog** (parent MAP).
- Honor DD-01: light default for admin; color for state/risk; invisible data surfaces; elevation only on floating surfaces; Phosphor `fill` for dense admin; cards as exceptions.
- Honor DD-02: one player component tree across Age Bands; adapt copy/register, not a per-band visual chrome fork; Player-first; no childish badge spam.
- Precedent in code (read-only): both apps already share sage-ish OKLCH hue ~160–162; admin `--radius: 0.25rem` + visible borders; player `--radius: 1rem` + transparent borders; Geist via `@repo/design-system/lib/fonts`; player ThemeProvider `defaultTheme="system"`.
- Parent MAP fog still lists sage-vs-split as open — that is the primary HITL for this ticket.
- Explicit MAP rejects remain binding: no mandatory `#080A0A` / dark-first industrial; no contradictory spacing list (5/11/13/19); no structural shadows on ordinary cards; no legacy shadcn color tokens in product UI.
- Product UI copy Spanish; this planning artifact English.
- Autonomy: `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not live-grill; do not close the wayfinder ticket from this planning wave.

## Decisions so far

### Auto

1. **[auto] Radius, density, border, and elevation diverge per app; keep current `globals.css` split as the rule.**  
   - `apps/app`: dense productivity — small radius (`--radius: 0.25rem`), visible `border-*` scale, invisible horizontal list/table frames (DD-01), tight control rhythm.  
   - `apps/player`: airier mobile — larger radius (`--radius: 1rem` / soft rounded controls), minimal/transparent borders in flow chrome, thumb-friendly spacing.  
   - **Elevation:** only floating surfaces (dialogs, popovers, menus, tooltips, sheets). No structural `shadow-*` on ordinary cards, list frames, or toolbars. Soft/elevated tokens may exist for floating/signature moments only.  
   Reason: `loadzone-design-system.mdc` + current token files + DD-01 elevation/card principles.

2. **[auto] Typography: keep Geist (Sans + Mono) everywhere.**  
   Both apps already load `@repo/design-system/lib/fonts` (Geist). One product family; diverge via size, weight, tracking, and density — not a second typeface. Age-adaptive friendliness is owned by DD-02 Spanish copy register, not a friendlier font stack.  
   Reason: adjacent shared package + MAP “one product family” via app `globals.css` divergence.

3. **[auto] Icons and touch targets.**  
   - Phosphor only; RSC import from `@phosphor-icons/react/ssr`.  
   - Admin / dense chrome default weight: **`fill`**.  
   - Player / airier surfaces: **`regular` or `bold`** (not fill-by-default).  
   - Player touch minima: **44×44** required, **48×48** preferred (`loadzone-player-pwa.mdc`).  
   - Admin: dense controls may be smaller on desktop; mobile shell / bottom-nav primary targets still meet **44×44**.  
   Reason: design-system icon rules + player PWA rule + DD-01 icon lock.

4. **[auto] Light/dark defaults — admin light locked; player light-first family.**  
   - Admin default **light**; dark remains an available preference (`ModeToggle` / existing shell) — DD-01 locked.  
   - Player product default is **light-first** (calm check-in; Assisted adults present; outdoor/field readability). Keep `.dark` token sets for optional preference / system follow. Mandatory dark-first / `#080A0A` base remains out of scope (parent MAP). Exact dark OKLCH values stay in the sage family once hue HITL lands.  
   Reason: DD-01 + MAP Out of scope + Age Band calm UX.

5. **[auto] Semantic token vocabulary — keep; legacy shadcn — retire from product UI.**  
   Keep as the product class vocabulary: `bg-bg-*`, `text-text-*`, `border-border-*`, `brand` (+ foreground), `premium` (+ foreground), `danger` (+ foreground), and existing `success` (+ foreground) where status needs a positive state.  
   Do **not** introduce or re-promote legacy shadcn functional tokens in product UI (`bg-card`, `bg-muted`, `text-muted-foreground`, `bg-background`/`text-foreground` as primary authoring, hardcoded `bg-green-500`, etc.). Shared primitives may still bridge internally; new feature code authors semantic LoadZone tokens.  
   Reason: `loadzone-design-system.mdc` + parent MAP rejects.

6. **[auto] Explicit rejects (rule-ready).**  
   - Mandatory `#080A0A` / dark-first industrial theme.  
   - Contradictory spacing scale claiming 4px multiples while listing 5 / 11 / 13 / 19 — spacing stays **4px multiples** only.  
   - Structural shadows on ordinary cards and containers.  
   - Legacy shadcn color tokens as product authoring vocabulary.  
   - Per-Age-Band visual chrome forks (radius/hue/type) — same player tree; copy adapts (DD-02).  
   Reason: parent MAP Out of scope + DD-01/DD-02.

### Assume

7. **[assume] Motion: duration caps, allowed properties, reduced-motion.**  
   - Allowed primary animated properties: **`transform` and `opacity`** (plus color/opacity for state feedback). Avoid animating layout geometry (`width`/`height`/`top`/`left`) on critical check-in or admin data paths.  
   - Caps: micro ≤ **200ms**; intentional UI transition ≤ **300ms**; rare progress/celebration ≤ **500ms**. Prefer shared constants over ad-hoc ms (design-system standing preference).  
   - `prefers-reduced-motion`: disable non-essential motion (`motion-reduce:transition-none` / equivalent); keep opacity fades at most if needed for comprehension.  
   Reason: player already uses ~0.2s transform/opacity; admin already uses `motion-reduce`; rule text reversible before CSS ships.  
   **Revert:** raise caps, allow layout animation on named surfaces, or require a motion-token package before prototypes.

8. **[assume] Player theme control: no ModeToggle required in v1 player chrome.**  
   Light-first default as product rule; ThemeProvider may remain for class strategy / optional system follow. Do not add an admin-style theme toggle to the check-in path (friction vs 1–3 minute habit).  
   Reason: player-first speed (DD-05 path); Assisted simplicity.  
   **Revert:** add ModeToggle or force `defaultTheme="system"` as a documented product requirement.

9. **[assume] `surface-*` CSS variables stay as internal aliases** mapping to `bg-*` / popover surfaces — not a second public Tailwind vocabulary for feature authors. Feature code continues to prefer `bg-bg-*` / semantic surfaces already in rules.  
   Reason: both `globals.css` files already define `--surface-*`; renaming now is churn without product gain.  
   **Revert:** promote `surface-*` into documented product tokens, or retire aliases in a later migration ticket (DD-07).

### Hitl (pending human)

10. **[hitl] Brand hue: shared sage family vs split hues between admin and player.**  
    Parent MAP **Not yet specified** still lists this as fog. Current code already shares ~160–162 OKLCH sage across both apps with different lightness/chroma/radius.  
    **Recommendation A — keep a shared sage hue family** (both apps ~160–162), diverge via density, radius, border presence, motion, and type scale/weight only. Preserves one product family, matches shipped tokens, and avoids dual-brand maintenance for charts/`brand`/`ring`.  
    Alternatives: (B) split hues (e.g. admin cooler/neutral, player warmer green) — stronger app personality, weaker family signal, more token/chart drift risk.

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Shared sage vs split brand hues | `hitl` | Design-system transversal + brand identity; MAP fog |
| 2 | Radius / density / border / elevation per app | `auto` | Documented rules + current `globals.css` |
| 3 | Typography Geist everywhere vs friendlier player stack | `auto` | Precedent: shared Geist fonts package; DD-02 owns friendliness via copy |
| 4 | Icon weight + touch minima per app | `auto` | Design-system + player PWA rules |
| 5 | Motion caps / properties / reduced-motion | `assume` | Reversible rule; adjacent patterns exist |
| 6 | Light/dark defaults per app | `auto` | Admin locked DD-01; MAP rejects dark-first; player light-first |
| 7 | Token keep / retire (semantic vs legacy shadcn) | `auto` | Design-system + MAP rejects |
| 8 | Explicit rejects list | `auto` | Parent MAP Out of scope |
| 9 | Player ModeToggle / theme chrome | `assume` | Contained UX; reversible |
| 10 | `surface-*` alias policy | `assume` | Internal CSS; reversible via DD-07 |

**HITL count: 1** (under cap of 3). Ticket is well-formed.

## Not yet specified

- Exact dark OKLCH ladders once hue HITL locks (tune values, not policy).
- Whether player `ThemeProvider` stays on `system` in code vs `light` at implementation time (product rule is light-first; wiring is backlog).
- Pixel type scale tables (admin 12/14/16 vs player display sizes) — may graduate from DD-04 / DD-05 prototypes into DD-07 rule text.
- Chart accent discipline beyond existing `--chart-*` in sage/premium family.
- Admin-only utilities (`bevel-card`, `glass-surface`) promotion vs app-local — owned by DD-07.
- Migration sequencing of screens/rules — DD-07.

## Out of scope

- Implementing or restyling production CSS in this ticket.
- Changing `@repo/design-system` primitives during this planning wave.
- Per-Age-Band visual themes or Guardian-facing visual system (DD-02 supervision layer is not a second app skin).
- Full design-system governance / promotion criteria (DD-07).
- Final synthesized design-direction specification (DD-08).
- Mandatory dark-first industrial theme; `#080A0A` base palette; contradictory spacing list; structural card shadows; legacy shadcn product tokens (rejected, not deferred).

## Human review (2026-08-03)

- **Orchestrator:** `ok a todo` — accept all auto/assume decisions and all HITL recommendations for this ticket.
- **Product override (global):** Age Band cutoffs and Guardian / Parental Supervision Layer settings MUST remain **staff-configurable at all times** (club/team policy). Indicative ages and Guardian defaults in resolutions are **defaults**, not hard-coded product constants. Spec language must say clubs can always retune bands and guardian receive/escalation options without a code change to product doctrine.
- **HITL A locked:** shared sage hue family (~160–162 OKLCH); diverge density/radius/motion only.
