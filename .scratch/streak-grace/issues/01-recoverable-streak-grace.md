# 01 — Recoverable Streak grace day and lifesaver week

**What to build:** From Monday 28 September 2026, in the Team timezone, a missed session day no longer zeroes the Recoverable Streak. The player has the next civil day to finish that day's pre and post. If they do, the day counts and the streak does not fall. If they do not, the streak drops by 2 and never goes below 0. The week of 28 September through 4 October 2026 is a lifesaver week: a miss in that week does not drop the streak, even if the extra day falls on 5 October. A completed session day in that week still adds 1. If this ships after 4 October 2026, the week is already over and only the −2 rule remains; do not move the dates. Every non-cancelled Session day counts. There is no weekly cap. The streak already stored on the Player is snapshotted once as the baseline the first time it is computed after this ships. Later computes reuse that snapshot plus days on or after the rules date. Past days are not replayed. Opening check-in, and saving pre or post even when the day is still incomplete, recomputes and shows the number. The first time a player opens check-in they see one Spanish apology they can dismiss in one tap; it stays dismissed on later visits and other devices. While a session day is still inside its extra civil day, a short note names that date, says whether the miss will cost streak, and selects that date in the existing date control. Spec: `.scratch/streak-grace/spec.md`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A finished session day (pre and post) adds 1, including seven sessions in one week. A day with no session, a cancelled session, an excused absence, or an injury-exempt incomplete day leaves the streak unchanged. A voluntary complete check-in on an injury day still adds 1.
- [ ] An incomplete session day stays open through the next civil day in the Team timezone. Filling that session date during the extra day adds 1 and does not subtract. Filling a different date does not close the hole. Pre alone is not a finished day.
- [ ] When the extra day has ended, that miss subtracts 2, floored at 0. Two closed misses subtract 2 each. A miss whose session day is 28 September–4 October 2026 subtracts nothing, including a 4 October hole still unfilled on 5 October. A miss dated 5 October subtracts 2. Lifesaver bounds are civil dates in the Team timezone.
- [ ] The stored streak is the baseline, snapshotted once. Later computes do not re-read the live streak as the baseline and do not walk days before 28 September 2026. Longest streak does not shrink. Cromo tiers stay 0, 3, 7, 14, 30, 60. "Empezamos de nuevo." shows only when the visible streak is 0.
- [ ] Opening check-in, and saving pre or post while the day is still incomplete, recomputes and persists the streak, so an expired extra day subtracts before the next finished day.
- [ ] The first check-in open shows one Spanish apology with a single acknowledgement. It does not show again on later visits or other devices. Copy: «Perdona: la racha se cortaba mal y ya está corregida. Solo cuentan los días con sesión. Si te saltas uno, tienes el día siguiente para rellenarlo y la racha sigue. Si no, bajas 2. No vuelves a cero. Del 28 de septiembre al 4 de octubre, si fallas, no pierdes racha.»
- [ ] While a session day is inside its extra civil day, check-in shows a short note that names that date and selects it in the existing date control. Outside the lifesaver week it says the streak drops by 2 if that date is not filled today. Inside the lifesaver week, including a 4 October hole viewed on 5 October, it says the miss will not cost streak. The note can show again.
- [ ] There is no new staff setting, season flag, or per-team configuration. Excusing a day keeps working as it does now.
- [ ] The glossary sentence for Recoverable Streak matches the new rule: an unexcused miss no longer breaks to zero; after the extra civil day it subtracts 2 down to a floor of 0, except misses whose session day falls in the lifesaver week, which do not subtract. Increment stays completed session-day obligations only.
- [ ] The pure streak step is tested with a baseline and a short list of expected days: +1 per completed day including seven in one week; freeze on excused; grace-open leaves the baseline unchanged; one closed miss subtracts 2; two closed misses subtract 4; floor 0; a complete on the missed date is +1 with no subtract; a lifesaver-miss subtracts 0; a lifesaver complete is +1; a miss dated 4 October still subtracts 0 when closed; a miss dated 5 October subtracts 2; a drop from 10 to 8 is not a restart; a drop to 0 is; longest does not shrink. Tests that still expect a reset to zero are updated. The apology is shown when not acknowledged and hidden when it is. Grace-note copy is asserted for lifesaver versus −2.

## Out of scope

- Replaying the season or rewriting stored streaks from DailyEntry history.
- Capping credit at three session days per week.
- Changing cromo tier thresholds or foil.
- A staff control for future lifesaver weeks.
- Treating pre-only as a finished day.
- Public streak boards, shame copy, or a push that exists only to announce a miss.
- Backfilling holes older than the open extra day.
