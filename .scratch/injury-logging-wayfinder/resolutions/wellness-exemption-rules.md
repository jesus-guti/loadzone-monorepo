# Wellness exemption rules for active injuries

**Ticket:** [JES-32](https://linear.app/jesus-guti-workspace/issue/JES-32/define-wellness-exemption-rules-for-active-injuries)  
**Accepted:** `JES-32: ok` (2026-08-04)

## Answer

### Active day

Uses JES-30 inclusive interval: Injury active on civil day **D** iff `startDate ≤ D` and (`endDate` is null or `D ≤ endDate`). Any concurrent open Injury ⇒ exempt that day.

### Clock

**Team.timezone** defines D (default `Europe/Madrid`). Injury dates, DailyEntry dates, and wellness `evaluatedDate` share that civil calendar.

### Obligation and reminders

- No DailyEntry **obligation** on exempt D; **voluntary** DailyEntry still allowed.
- Suppress **both** reminder paths on exempt D: session PRE/POST cron and staff re-nudge for that player/day.
- Only official active **Injury** exempts — not ILL alone, not player pain alert.

### Staff wellness labeling

Add day-level state **`EXEMPTED`** (UI e.g. **Exento**):

| Situation | Staff state | Pendiente / pendingCount / re-nudge |
|---|---|---|
| Active Injury, no entry | `EXEMPTED` | No |
| Active Injury + voluntary complete | Prefer `COMPLETED` + Lesionado badge | No |
| Active Injury + partial voluntary | Show data + Lesionado; not pending | No |
| ALERT signals on voluntary entry | ALERT wins | No obligation nag |

Never show exempt-only missing check-in as **Pendiente**.

### Streaks

Exempt day = **Excused Absence** (freeze recoverable streak). Voluntary complete on that day **does increment** the streak.

### Assumes retained

Date edits are authoritative (retroactive by D; already-sent pushes not retracted). Same-day create/close stays inclusive. Severity / expectedReturnDate do not affect exemption.
