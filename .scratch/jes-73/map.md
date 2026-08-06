# JES-73 — Standardize staff Tabs styles from Wellness segmented control

**Ticket:** [JES-73](https://linear.app/jesus-guti-workspace/issue/JES-73/standardize-staff-tabs-styles-from-wellness-segmented-control)  
**Branch:** `jesusgutierrezsiliceo/jes-73-standardize-staff-tabs-styles-from-wellness-segmented`  
**Worktree:** `/Users/jesus-guti/Code/personal/worktrees/rely/jes-73`

## Question

How do we unify staff Tabs chrome on the Wellness Tarjetas/Burbujas segmented look without an app-local fork?

## Decisions so far

| # | Level | Decision |
|---|---|---|
| 1 | auto / assume | Delete the Wellness local Tarjetas/Burbujas segmented control; adapt shared `@repo/design-system` Tabs — Jesús 2026-08-06 |
| 2 | auto / assume | Pilots: Wellness view toggle migrated onto Tabs + Exercise library Tabs; inventory other staff Tabs in the PR comment |
| 3 | auto / assume | Reference look = Wellness segmented (bordered track, selected `bg-bg-secondary`, dense admin). Token-driven, app-agnostic primitive |
| 4 | auto / assume | Do not keep an app-local Tabs fork; do not change filter/view behavior; no second brand hue; player may differ via tokens / existing class overrides only |

## Build

- Shared Tabs default track/selected/hover → Wellness segmented look (semantic tokens only)
- Replace Wellness local toggle with shared Tabs
- Exercise library Tabs pick up chrome without local style forks
- Preserve keyboard/a11y
