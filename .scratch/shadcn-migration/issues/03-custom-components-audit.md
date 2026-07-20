# wayfinder:research

**Status: RESOLVED**

## Question

Which of our current custom/non-standard components in `packages/design-system/components/ui/` are now part of the standard shadcn registry (and therefore can be replaced), and which remain custom?

## Findings

Registry checked against `https://ui.shadcn.com/r/styles/base-nova/{name}.json` on 2026-07-20.

| # | File | In Registry? | Registry URL | Recommendation | Notes |
|---|---|---|---|---|---|
| 1 | `button-group.tsx` | ✅ Yes | [`button-group`](https://ui.shadcn.com/docs/components/base/button-group) | **Regenerate** | Registry version uses `@base-ui/react` (`useRender`/`mergeProps`). Local uses `radix-ui` `Slot`. Custom CSS tokens differ. |
| 2 | `empty.tsx` | ✅ Yes | [`empty`](https://ui.shadcn.com/docs/components/base/empty) | **Regenerate** | Almost identical structure. Local uses custom design tokens (`bg-bg-tertiary`, `text-text-primary`); registry uses standard shadcn tokens (`bg-muted`, `text-muted-foreground`). |
| 3 | `field.tsx` | ✅ Yes | [`field`](https://ui.shadcn.com/docs/components/base/field) | **Regenerate** | Same structure. Local uses custom tokens and custom variants. Registry version is the canonical implementation. |
| 4 | `input-group.tsx` | ✅ Yes | [`input-group`](https://ui.shadcn.com/docs/components/base/input-group) | **Regenerate** | Core structure matches. Registry version has more comprehensive disabled/error state handling. Custom tokens everywhere. |
| 5 | `item.tsx` | ✅ Yes | [`item`](https://ui.shadcn.com/docs/components/base/item) | **Regenerate** | Local uses `radix-ui` `Slot`; registry uses `@base-ui/react` `useRender`. Registry adds `xs` size variant. Custom tokens. |
| 6 | `kbd.tsx` | ✅ Yes | [`kbd`](https://ui.shadcn.com/docs/components/base/kbd) | **Regenerate** | Nearly identical. Only custom tokens differ (`bg-bg-tertiary` vs `bg-muted`). Trivial replacement. |
| 7 | `spinner.tsx` | ✅ Yes | [`spinner`](https://ui.shadcn.com/docs/components/base/spinner) | **Regenerate** | Local hardcodes `@phosphor-icons/react`'s `CircleNotchIcon`. Registry uses generic `IconPlaceholder` that adapts to any icon library. |
| 8 | `stateful-button.tsx` | ❌ No | — | **Keep** | Truly custom. Animated loading/success state button using `motion/react`. Not in registry. |
| 9 | `hover-border-gradient.tsx` | ❌ No | — | **Keep** | Truly custom. Animated gradient border on hover using `motion/react`. Not in registry. |
| 10 | `moving-border.tsx` | ❌ No | — | **Keep** | Truly custom. SVG path animated border using `motion/react` `useAnimationFrame`. Not in registry. |
| 11 | `noise-background.tsx` | ❌ No | — | **Keep** | Truly custom. Multi-layer gradient + noise texture background using `motion/react` and external noise asset. Not in registry. |

## Summary

- **7 components** (1–7) are now standard shadcn registry components → **regenerate** from registry
- **4 components** (8–11) remain custom → **keep as-is**

## Key migration notes

### Custom design tokens

The local versions of components 1–7 use custom CSS variables and utility classes (e.g., `bg-bg-tertiary`, `text-text-primary`, `border-border-primary`) instead of the standard shadcn semantic tokens (`bg-muted`, `text-muted-foreground`, `border-border`). When regenerating, these will automatically switch to standard tokens, which is the desired outcome of this migration.

### Radix UI → Base UI

Components 1 (`button-group`) and 5 (`item`) currently use `@radix-ui/react-slot` (`Slot` primitive) for `asChild` polymorphism. The registry versions now use `@base-ui/react`'s `useRender`/`mergeProps` pattern. This is an expected migration path since the shadcn ecosystem is moving from Radix to Base UI.

### Spinner icon

The local `spinner.tsx` tightly couples to `@phosphor-icons/react`. The registry version uses a generic `IconPlaceholder` wrapper that supports multiple icon libraries (Lucide, Tabler, HugeIcons, Phosphor, RemixIcon). This is a cleaner abstraction and means less coupling.
