# Recoverable Streak grace and lifesaver week

Domain: `CONTEXT.md` (**Recoverable Streak**, **Session**, **DailyEntry**, **Excused Absence**, **Streak Cromo**).

Linear issue: not created. Linear MCP authentication was skipped.

## Problem Statement

Players lose their **Recoverable Streak** in one step when a session day is not fully checked in. One hole, or a pre-session fill without the post-session fill, sets the streak back to zero. A decent **Streak Cromo** (Platino at 14, Esmeralda at 30, Diamante at 60) is then out of reach for the rest of the **Season**, which runs through 26 June 2027. The number on screen can also stay stale until the next day they finish both forms, so the drop feels sudden.

They still need a streak that can fail to rise and that can fall. It is not a counter that only goes up.

## Solution

From Monday 28 September 2026, in the **Team** timezone, a missed session day no longer zeroes the streak. The player has the next civil day to finish that day’s pre and post. If they do, the day counts and the streak does not fall. If they do not, the streak drops by 2, and it never goes below 0.

The week of 28 September through 4 October 2026 is a lifesaver week: a miss in that week does not drop the streak, even if the extra day to fill it falls on 5 October. A completed session day in that week still adds 1.

Every non-cancelled **Session** day counts. There is no weekly cap.

The streak already stored on each **Player** stays the starting number. Past days are not replayed.

The first time a player opens check-in after this ships, they see one apology that explains the rule. It does not show again.

## User Stories

1. As a player, I want a finished session day (pre and post) to add 1 to my streak, so that showing up still builds the cromo.
2. As a player, I want every non-cancelled session day to be able to add 1, so that a week with seven sessions can add seven.
3. As a player, I want a day with no session to leave my streak unchanged, so that rest days are not a trap.
4. As a player, I want a cancelled session to leave my streak unchanged, so that a called-off day is not a miss.
5. As a player, I want an incomplete session day to stay open through the next civil day, so that I can still fill it.
6. As a player, I want filling that missed day during the extra day to add 1 and not subtract, so that catching up keeps the streak.
7. As a player, I want the extra day to mean that specific session date, so that filling a different day does not erase the hole.
8. As a player, I want both pre and post on that date, so that a morning-only fill is not a finished day.
9. As a player, I want a miss whose extra day has ended to subtract 2, so that skipping has a cost.
10. As a player, I want that drop to stop at 0, so that the streak cannot go negative.
11. As a player, I want two expired misses to subtract 2 each, so that a longer gap costs more than one hole.
12. As a player, I do not want one miss to set me back to zero, so that a cromo I already reached is not wiped out.
13. As a player, I want my streak updated when I open check-in, so that I see the drop without having to finish some later day first.
14. As a player, I want my streak updated when I save pre or post, so that a partial fill and a finished fill both refresh the number.
15. As a player, I want the week of 28 September–4 October 2026 to add 1 for each session day I finish, so that a good week still counts.
16. As a player, I want a miss in that week to subtract nothing, so that the lifesaver week cannot cost me streak.
17. As a player, I want a miss on 4 October to subtract nothing even if I still have not filled it on 5 October, so that the lifesaver covers the hole, not only the calendar day I notice it.
18. As a player, I want misses from 5 October onward to use the −2 rule again, so that the lifesaver is one week.
19. As a player, I want the number I have today to be the base, so that old holes are not recalculated under the new rule.
20. As a player who only filled pre on many days, I want those past days left alone, so that shipping this does not rewrite my season.
21. As a player, I want an excused absence to keep freezing the streak, so that a staff excuse still neither adds nor subtracts.
22. As a player with an active injury on a session day, I want that day to keep freezing the streak when I do not check in, so that injury exemption stays as it is.
23. As a player, I want a voluntary complete check-in on an injury day to still add 1, so that showing up while exempt still counts.
24. As a player, I want the cromo tiers unchanged (3, 7, 14, 30, 60), so that the card still means the same thresholds.
25. As a player, I want “Empezamos de nuevo.” only when my streak is 0, so that a drop from 27 to 25 is not announced as a restart.
26. As a player, I want my longest streak to stay at least as high as before, so that a drop does not erase the season record.
27. As a player, I want one apology the first time I open check-in, so that I understand why the streak behaved badly and what the rule is now.
28. As a player, I want that apology in Spanish, so that it matches the rest of the player app.
29. As a player, I want a single acknowledgement control on that apology, so that I can dismiss it in one tap.
30. As a player, I want the apology to stay dismissed on later visits and other devices, so that it really appears once.
31. As a player with an open extra day, I want a short note that names that session date and says I can still fill it, so that I know the hole is not final yet.
32. As a player in the lifesaver week, I want that note to say this miss will not cost streak, so that the week matches the apology.
33. As a player after the lifesaver week, I want that note to say the streak drops by 2 if I do not fill the day, so that the cost is visible before it happens.
34. As a player, I want the note to take me to that session date, so that I do not have to hunt for it in the date control.
35. As a player, I want “today” and the extra day decided in the team timezone, so that a check-in just after midnight in Madrid is the right civil day.
36. As staff, I want no new setting for this, so that the rule is the product default for the rest of this season.
37. As staff, I want excusing a day to keep working as it does now, so that this change does not add an excuse workflow.
38. As a player on a team in another timezone, I want the lifesaver dates read in that team’s timezone, so that the week is the local Monday–Sunday.

## Implementation Decisions

- One pure streak step owns the arithmetic. Callers hand it a baseline and the expected days on or after the rules date. They do not hand it the season history from before that date.
- The rules date is Monday 28 September 2026, as a civil date in the **Team** timezone.
- The first time a player’s streak is computed after this ships, the baseline is snapshotted from the streak they already have. Later computes reuse that snapshot plus days on or after the rules date. They do not read the live streak as the baseline, or the same days would be applied twice.
- Days before the rules date are not classified and not walked. There is no migration that rewrites streaks from **DailyEntry** history, and no cap of three session days per week.
- A session day still requires the pre and post obligations that already define a complete **DailyEntry**. Pre alone is incomplete.
- Outcomes the step understands: completed (+1), excused or injury-exempt and incomplete (freeze), grace-open (freeze; the extra civil day has not ended), missed (−2, floored at 0), lifesaver-miss (freeze).
- A missed session day whose civil date is inside 28 September–4 October 2026 is a lifesaver-miss once its extra day has ended. It is not a −2. Completing it during the extra day is a normal +1.
- The extra day is the next civil day after the session day, in the team timezone. The hole closes when that civil day has ended.
- Each missed session day has its own extra day. Two closed holes are −4, not a single −2 for the gap.
- Filling some other date does not convert a hole into a completed day.
- Excused absence and injury exemption stay on the existing freeze path. They are not lifesaver-misses and they are not −2.
- `restarted` is true only when the result is 0 after a closed miss or lifesaver processing that could have dropped it, and the player-facing restart line renders only when the visible streak is 0. A drop that stays above 0 does not show “Empezamos de nuevo.”
- Longest streak is still the max of the stored longest and the new current value. A drop does not reduce it.
- The check-in page load and both pre and post saves recompute and persist. An incomplete save must not skip the recompute. That is what lets an expired extra day subtract before the next finished day.
- Civil “today” for the default check-in date, the extra day, and the lifesaver bounds uses the team timezone. The server-local midnight converted through UTC is not the source of that date.
- The date control already allows a past day up to today. The grace note selects the missed session date; it does not add a new calendar.
- The apology is one block of Spanish copy, acknowledged once. Persistence is on the **Player**, not only in the browser. Suggested copy:

  «Perdona: la racha se cortaba mal y ya está corregida. Solo cuentan los días con sesión. Si te saltas uno, tienes el día siguiente para rellenarlo y la racha sigue. Si no, bajas 2. No vuelves a cero. Del 28 de septiembre al 4 de octubre, si fallas, no pierdes racha.»

- The grace note is separate and can show again. Outside the lifesaver week it says the streak drops by 2 if that date is not filled today. Inside it, including a 4 October hole viewed on 5 October, it says filling is still possible and the miss will not cost streak.
- Cromo tier thresholds stay 0, 3, 7, 14, 30, 60.
- The glossary sentence for **Recoverable Streak** changes with the behavior: an unexcused miss no longer breaks to zero; after the extra civil day it subtracts 2 down to a floor of 0, except misses whose session day falls in the lifesaver week, which do not subtract. Increment stays “completed session-day obligations only”.
- No staff screen, season flag, or per-team configuration. The lifesaver week is this dated rule.

## Testing Decisions

The seam is the pure streak step in the recoverable-streak module, the same place as the existing streak tests. Callers are not the test surface. A good test feeds a baseline and a short list of expected days and asserts the resulting streak, the floor, the longest value, and whether the result counts as a restart. It does not assert private counters.

Cover at least: +1 per completed day including seven in one week; freeze on excused; grace-open leaves the baseline unchanged; one closed miss subtracts 2; two closed misses subtract 4; floor 0; a complete on the missed date is +1 with no subtract; a lifesaver-miss subtracts 0; a lifesaver complete is +1; a miss dated 4 October still subtracts 0 when it is closed; a miss dated 5 October subtracts 2; a drop from 10 to 8 is not a restart; a drop to 0 is; longest does not shrink.

Prior art is the existing recoverable-streak unit tests (increment, zero-on-miss, excuse freeze). The zero-on-miss case is replaced by the −2 case. Tests that still expect a reset to zero are updated, not left as the rule.

The apology is not a second rules engine. A small test can assert it is shown when the player has not acknowledged it and hidden when they have. The grace-note copy is asserted the same way: lifesaver versus −2.

## Out of Scope

- Replaying the season and rewriting stored streaks.
- Capping credit at three session days per week, including as a one-time recount.
- Changing cromo tier thresholds or foil.
- A staff control to declare future lifesaver weeks.
- Treating pre-only as a finished day.
- Public streak boards, shame copy, or a push that exists only to announce a miss.
- Backfilling holes older than the open extra day.

## Further Notes

Production context that motivated the rule, not a data repair: the live team has a daily session series, so one empty day zeroes a long run; 11 September and 22 September 2026 have no check-ins from the squad; many “fills” are pre without post. Those facts stay in the past. The stored streak is the baseline on purpose.

The lifesaver week is the Monday–Sunday after Friday 25 September 2026. If this ships after 4 October 2026, the week is already over and only the −2 rule remains; do not move the dates.
