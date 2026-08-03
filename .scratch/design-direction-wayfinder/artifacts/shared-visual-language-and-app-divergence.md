# Shared visual language and app divergence

Status: accepted  
Source ticket: [Decide shared visual language and app divergence](../issues/03-decide-shared-visual-language-and-app-divergence.md)  
Locked decisions: [DD-03 planning map](../../dd-03-visual-language/map.md) (human `ok a todo`, HITL A, 2026-08-03)  
Parents: [Admin experience principles](admin-experience-principles.md), [Player age bands and parental supervision](../resolutions/player-age-bands-and-parental-supervision.md)

These rules are **rule-ready** for a later rewrite of `.cursor/rules/loadzone-design-system.mdc` and both apps’ token guidance (DD-07). They are **not** production CSS edits, pixel type-scale tables, or dark OKLCH ladders.

## 1. Brand hue — shared sage family

Both `apps/app` and `apps/player` share one **sage** brand hue family at roughly **OKLCH hue 160–162**.

- Keep `brand`, `ring`, chart accents, and related semantic hues in that family.
- Diverge apps via **density, radius, border presence, motion, and type scale/weight only** — not a second brand hue.
- Exact dark-mode OKLCH ladders stay in the sage family; tune values later, not hue policy.

Locked HITL: map recommendation A (human `ok a todo`).

## 2. Radius, density, border, and elevation (per app)

Keep the current `globals.css` split as the product rule.

### `apps/app` (dense productivity)

- Small radius: `--radius: 0.25rem`.
- Visible `border-*` scale on controls and chrome that need structure.
- Invisible horizontal list/table frames (DD-01): no four-sided enclosing box; row separation is primarily horizontal.
- Tight control rhythm for operational scanning.

### `apps/player` (airier mobile)

- Larger radius: `--radius: 1rem` (soft rounded controls).
- Minimal / transparent borders in check-in flow chrome.
- Thumb-friendly spacing; calmer surfaces for outdoor/field readability.

### Elevation (both apps)

- Elevation **only** on floating surfaces: dialogs, popovers, menus, tooltips, sheets.
- **No** structural `shadow-*` on ordinary cards, list frames, or toolbars.
- Soft / elevated tokens may exist for floating or rare signature moments only.

## 3. Typography — Geist everywhere

- Both apps use **Geist Sans** and **Geist Mono** via `@repo/design-system/lib/fonts`.
- One product type family; diverge with size, weight, tracking, and density — **not** a second typeface.
- Age-adaptive friendliness is owned by DD-02 Spanish copy register, not a friendlier font stack.

## 4. Icons and touch targets

- **Phosphor only.** In Next.js App Router Server Components, import from `@phosphor-icons/react/ssr`.
- Admin / dense chrome default weight: **`fill`**.
- Player / airier surfaces: **`regular` or `bold`** (not fill-by-default).
- Player touch minima: **44×44** required, **48×48** preferred.
- Admin: dense desktop controls may be smaller; mobile shell / bottom-nav primary targets still meet **44×44**.

## 5. Motion

- Preferred animated properties: **`transform` and `opacity`** (plus color/opacity for state feedback).
- Avoid animating layout geometry (`width` / `height` / `top` / `left`) on critical check-in or admin data paths.
- Duration caps:
  - Micro ≤ **200ms**
  - Intentional UI transition ≤ **300ms**
  - Rare progress / celebration ≤ **500ms**
- Prefer shared constants over ad-hoc millisecond values.
- `prefers-reduced-motion`: disable non-essential motion; keep opacity fades at most when needed for comprehension.

## 6. Light / dark defaults

- **Admin:** product default **light**; dark remains an available preference (existing shell / `ModeToggle`).
- **Player:** product default **light-first** (calm check-in; Assisted adults; outdoor readability). Keep `.dark` token sets for optional preference / system follow.
- Mandatory dark-first / `#080A0A` industrial base remains **rejected**.
- Player check-in chrome does **not** require an admin-style `ModeToggle` in v1 (ThemeProvider may remain for class strategy / optional system follow; wiring is implementation backlog).

## 7. Semantic tokens — keep vs retire

### Keep (product authoring vocabulary)

- `bg-bg-*`, `text-text-*`, `border-border-*`
- `brand` (+ foreground)
- `premium` (+ foreground)
- `danger` (+ foreground)
- `success` (+ foreground) where a positive status state is needed

### Retire from product UI authoring

Do **not** introduce or re-promote legacy shadcn functional tokens as the primary vocabulary:

- `bg-card`, `bg-muted`, `text-muted-foreground`
- `bg-background` / `text-foreground` as primary authoring
- Hardcoded utility colors such as `bg-green-500`

Shared primitives may still bridge internally; **new feature code** authors LoadZone semantic tokens.

### `--surface-*` (internal)

`--surface-*` CSS variables remain **internal aliases** mapping to `bg-*` / popover surfaces. They are **not** a second public Tailwind vocabulary for feature authors. Feature code prefers `bg-bg-*` / documented semantic surfaces. Promotion or retirement of aliases is DD-07 migration work.

## 8. Age Band / Guardian — no visual chrome forks

- One player component tree across Age Bands; adapt **copy/register**, not per-band radius, hue, or type chrome (DD-02).
- Age Band cutoffs and Guardian / Parental Supervision settings remain **staff-configurable** club/team policy defaults — visual language does not fork skins per band or guardian mode.

## 9. Explicit rejects

- Mandatory `#080A0A` / dark-first industrial theme.
- Contradictory spacing scale claiming 4px multiples while listing 5 / 11 / 13 / 19 — spacing stays **4px multiples** only.
- Structural shadows on ordinary cards and containers.
- Legacy shadcn color tokens as product authoring vocabulary.
- Per-Age-Band visual chrome forks (radius / hue / type).
- Split brand hues between admin and player (HITL A locked shared sage).

## 10. Deferred (not this ticket)

- Exact dark OKLCH ladders (tune within sage family).
- Whether player `ThemeProvider` ships as `light` vs `system` at implementation time (product rule is light-first).
- Pixel type-scale tables (may graduate from DD-04 / DD-05 into DD-07).
- Chart accent discipline beyond existing `--chart-*` in sage / premium family.
- Admin-only utilities (`bevel-card`, `glass-surface`) promotion vs app-local — DD-07.
- Migration sequencing of screens and rule text — DD-07.
- Design-system governance / promotion criteria — DD-07.
- Final synthesized design-direction specification — DD-08.

## Out of scope for this artifact

- Implementing or restyling production CSS.
- Changing `@repo/design-system` primitives.
- Editing `.cursor/rules` (DD-07 migrates rules from this language).
- Guardian-facing visual system as a second app skin.
