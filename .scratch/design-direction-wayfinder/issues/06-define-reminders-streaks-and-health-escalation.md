# Define reminders, streaks, and health escalation

Status: closed
Labels: wayfinder:grilling
Type: grilling
Parent: ../MAP.md
Assignee: orchestrator
Blocked by:
- ./02-define-player-age-bands-and-parental-supervision.md

## Question

What are the product rules for adherence and safety in the player experience: reminders, recoverable streaks, and health escalation?

Decide at least:

1. Reminder channels (push, in-app, parent notification) and anti-nag limits.
2. Who consents to reminders for each age band.
3. Streak model: what increments, what breaks, how recovery works without guilt, and how seasons/excused absences interact.
4. When a check-in answer escalates to staff and/or parent; what the child sees vs what adults see.
5. Which motivation mechanics are in-scope for the upcoming spec (calm streaks, optional player-card progression) vs deferred (audio, FUT attribute boosts as health scores, competitive boards).
6. Explicit safety rails: no coercion, no public shaming, no geolocation attendance by default.

This feeds the adherence section of the final specification; it does not implement push or streak code.

## Comments

### 2026-08-03 — Resolution (implementer)

Closed from locked planning map `.scratch/dd-06-reminders-streaks/map.md` (orchestrator `ok a todo` + HITL A/B/C as recommended). Full artifact:

→ [artifacts/reminders-streaks-and-health-escalation.md](../artifacts/reminders-streaks-and-health-escalation.md)

**Answers to Question bullets:**

1. **Channels + anti-nag:** Player = Web Push + calm in-app; Guardian = receive-only miss/Care Alert (delivery mech fog); Staff = ops surfaces + bounded re-nudge. Anti-nag: ≤1 automated + ≤1 staff re-nudge per expected window; quiet hours; invitational Spanish; Guardian miss ≤1/window; Care Alerts rate-limited separately. Miss path ≠ escalation path.
2. **Consent × band (defaults, always staff-configurable):** Assisted — Guardian consents Player reminders, Guardian receives on; Guided — Player may opt in (Guardian can revoke), Guardian receives on; Independent 16–17 — Player consents, Guardian receives only if layer enabled by club policy; 18+ — Player consents, receives off by default.
3. **Streak:** Increment on expected DailyEntry completion (Season-scoped `currentStreak`); break on unexcused miss → restart at 1 next success; no guilt copy; Excused Absence freezes streak; `longestStreak` quiet personal pride only.
4. **Escalation:** Injury / care-relevant red-flag → staff always + Guardian Care Alert when layer on; child calm confirm only. ACWR/anomaly patterns staff-only. Miss = miss notify, not Care Alert. ≤1 Care Alert per class per day per Player.
5. **Motivation:** In — calm recoverable streaks + optional non-scoring player-card teaser. Deferred — ambient audio, FUT-as-health, high-res export early, competitive boards/badge spam.
6. **Safety rails:** No coercion/guilt, no public shaming/adherence boards, no geo attendance default, no FUT health scores, no Care Alerts as adherence spam.

**Glossary proposed:** Reminder Consent, Anti-nag Policy, Recoverable Streak, Excused Absence, Health Escalation, Care Alert.

**Configurability (product override):** Age Band cutoffs and Guardian/Parental Supervision settings (consent, receive, escalation opts including 16–17) are always staff-configurable; indicative ages and table defaults are defaults only. Same note applies to DD-02 indicative ages — do not treat them as hard-coded constants.

**Still fog:** Guardian delivery mech/auth; numeric red-flag thresholds; Excused Absence request workflow; push permission UX; legal consent copy.
