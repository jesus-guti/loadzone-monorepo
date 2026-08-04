# JES-44 audit report

**Date:** 2026-08-04  
**Branch:** `jgutierrez/jes-44-audit-surfaces`  
**Base pilots:** JES-39 (`d8219e5`) ∪ JES-42 (`3cc0468`) ∪ JES-43 (`27ec438`)  
**Verdict:** zero banlist findings — no product class edits required.

## Touched-file set (product UI)

| Pilot | Paths |
|---|---|
| JES-39 | `apps/app/components/layouts/sidebar.tsx` |
| JES-42 | `apps/player/app/[token]/components/{chip-input,focus-progress,post-session-form,pre-session-form,question-card,scale-input,session-page,slider-input}.tsx`, `apps/player/app/[token]/lib/{age-band,focus-copy,focus-step}.ts` |
| JES-43 | `apps/app/app/(authenticated)/settings/page.tsx`, `apps/app/app/(authenticated)/players/[id]/edit/page.tsx`, `apps/app/features/players/components/{create,edit}-player-form.tsx`, `apps/app/features/settings/components/age-band-policy-fields.tsx`, `apps/player/app/[token]/{page,components/session-page}.tsx` (+ non-UI policy/actions/tests/schema out of visual audit) |

## Greps (limited to set above)

- Legacy shadcn authoring (`bg-card`, `bg-muted`, `text-muted-foreground`, `bg-background` / `text-foreground` stand-ins, popover equivalents): **none**
- Raw Tailwind palette colors (`bg-green-500`, …): **none**
- Structural `shadow-*` on ordinary containers: **none**
- `bevel-card` / `glass-surface`: **none**

## Retained frames (DD-01 exceptions — no removal)

1. **Player `QuestionCard` / Focus-frame step chrome** (`rounded-3xl bg-bg-secondary`, …) — DD-01 **(b)** single interactive question widget + player Focus-frame pattern (map decision 5). Not an admin invisible-list target.
2. **Settings `Card` “Crear equipo”** — DD-01 **(b)** compact create-team decision widget. Pre-existing on the JES-43-touched settings leaf; left as-is (no big-bang restyle).
3. **Settings `Card` “Superficie secundaria”** — pre-existing secondary-nav panel on the same touched leaf; retained without expanding into a settings restyle. Not introduced by Age Band policy UI (policy blocks use frameless `border-t` sections).
4. **Settings team form** (`border border-border-secondary p-6`) — pre-existing bordered settings panel; JES-43 only semanticized the border token. Age Band fields inside stay section dividers, not nested cards.

`ClubBrandingCard` is consumed on settings but its component file was **not** in the pilot diffs — left alone (map assume 11).

## Explicit non-goals respected

No Wellness/`bevel-card` walls, no `apps/web`, no DS quarantine (JES-40), no Focus-frame behavior changes, no Age Band policy behavior changes beyond the merge wiring already required to land pilots.
