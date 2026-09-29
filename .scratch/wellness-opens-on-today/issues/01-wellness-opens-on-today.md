# 01 — Wellness opens on today each civil day

**Status:** ready-for-agent
**Labels:** Improvement · plan:direct · risk:low
**Blocked by:** None — can start immediately

`plan:direct` · `risk:low` · area: apps/app/wellness

## What Jesús asked

> Actualice bien el hoy en el wellness: es decir, cada dia por defecto siempre que se haga un f5 o te conectes por primera vez en el dia el wellness debe estar puesto en el dia de hoy no el ultimo que miraste.

## What I understand

Staff Wellness remembers the last civil day the preparador looked at (`setActiveWellnessDate` in `apps/app/actions/active-wellness-date.ts`, consumed by `WellnessDateFilter`). A refresh or a return the next morning still shows that day, so "Hoy" is wrong until they tap "Ir a hoy".

The short grill was cancelled. This ticket takes the recommended reading: a new civil day resets the viewed day to today; a refresh later the same day keeps the day they picked.

**Assumptions taken**
- "Today" is the civil day in the browser's local calendar, same as `WellnessDateFilter` already labels "Hoy".
- Choosing another day still sticks for the rest of that civil day (the date control stays useful). A full reload the next civil day lands on today.
- Scope is the staff Team Wellness date (`apps/app`), not player check-in.

## What to build

When the preparador opens Team Wellness, or reloads it, the evaluated day is today if the stored day is from an earlier civil day. If they pick another day and reload before the next civil day, that day stays selected. The control still shows "Hoy" when the evaluated day is today, and "Ir a hoy" still jumps back.

## No-goals

- Do not change which DailyEntry rows exist or how wellness scores are computed.
- Do not reset the day on every refresh inside the same civil day.
- Do not change the player app check-in date.
- Do not remove the ability to browse past days.

## Acceptance criteria

- [ ] With the stored wellness date set to yesterday, opening Wellness or reloading it shows today and the button label "Hoy".
- [ ] After picking an earlier day, a reload on that same civil day still shows the picked day.
- [ ] After that pick, the next civil day's first load shows today.
- [ ] "Ir a hoy" still selects today when a past day is showing.
- [ ] A regression test covers the civil-day reset (stored date older than today → today; stored date is today → unchanged).

## Blocked by

None — can start immediately.
