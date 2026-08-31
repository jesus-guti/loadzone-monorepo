# 01 — Show Season switcher on staff mobile header

**Status:** ready-for-agent
**Labels:** Bug · plan:direct · risk:low
**Blocked by:** None — can start immediately

`plan:direct` · `risk:low` · area: apps/app/seasons

## What Jesús asked

> ademas resolver crear temporada en vesion mobil, ya que como se esconde el select ya no se puede crear desde ninguna parte.

## What I understand

Staff cannot create or switch **Season** from the staff shell on mobile because `ActiveSeasonSwitcher` (the in-header path that opens `CreateSeasonDialog`) is `hidden` below `md`. Grill confirmed: show the **same** season selector (including «Crear temporada») in the mobile header — not a separate + button and not seasons-page-only.

**Assumptions taken**
- `/seasons` «Nueva temporada» and `/seasons/new` stay as secondary paths — this ticket restores shell access.
- Compact header keeps the Team switcher; Season sits beside it without replacing Team.

## Reproduction

1. Open `apps/app` below the `md` breakpoint.
2. Look at the sticky header: Team switcher is visible; Season switcher is not.
3. Try to create a Season from the shell (no Select item «Crear temporada»).

**Expected:** On mobile, staff can open the Season select, switch Season, and choose «Crear temporada».
**Actual:** Desktop header row is `hidden md:flex` with the switcher; the mobile row wraps `ActiveSeasonSwitcher` in `hidden … md:block`, so the control never appears under `md` (`apps/app/components/layouts/header.tsx`).
**Scope:** Staff shell `Header`; authenticated routes that use it.

## No-goals

- Do not redesign the create **Season** dialog (sibling `02`).
- Do not change Season persistence, cookies, or `setActiveSeason`.
- Do not add a FAB or extra sidebar create entry unless the header select cannot fit.

## Acceptance criteria

- [ ] Below `md`, the header shows the same Season switcher as desktop (active Season label, list, «Crear temporada»).
- [ ] Choosing «Crear temporada» opens `CreateSeasonDialog` on mobile.
- [ ] Switching Season still persists via `setActiveSeason` and refreshes.
- [ ] Team switcher remains usable; header does not overflow unusably at ~375px width.
- [ ] Regression coverage fails if the mobile header omits the Season switcher again.

## Blocked by

- None — can start immediately
