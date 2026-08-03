# Reminders, streaks, and health escalation

Status: accepted  
Source ticket: [Define reminders, streaks, and health escalation](../issues/06-define-reminders-streaks-and-health-escalation.md)  
Locked decisions: [DD-06 planning map](../../dd-06-reminders-streaks/map.md) (orchestrator `ok a todo` + HITL A/B/C as recommended, 2026-08-03)  
Depends on: [Player age bands and parental supervision](../resolutions/player-age-bands-and-parental-supervision.md)

These rules are **safe to feed the adherence section of DD-08**. They are product doctrine for design direction — **not** push schedulers, streak engines, Guardian contact models, or escalation pipeline code (later backlog).

---

## Critical configurability override

**Age Band cutoffs** and **Guardian / Parental Supervision Layer** settings (consent who opts in, miss/Care Alert receives, Independent 16–17 supervision opts, escalation receive toggles, and related club policy) are **always staff-configurable**.

Indicative ages in DD-02 and the consent×band defaults in this artifact are **defaults only**, never fixed-only product constants. Clubs may retune bands and guardian receive/escalation options without a code change to product doctrine. Spec and backlog language must preserve that staff can always retune.

Cross-link (DD-02): indicative ages (~under 10 / ~10–15 / 16+) and Independent 16–17 supervision defaults in the age-bands resolution are likewise **configurable defaults**, not hard-coded cutoffs.

---

## 1. Reminder channels (logical)

| Audience | Channels |
|---|---|
| **Player** | (1) Web Push when subscribed (`PushSubscription` substrate). (2) Calm in-app reminder state when the player surface is open (banner / empty-day prompt — not modal spam). |
| **Guardian** | Receive-only miss and Care Alert notifications via the Parental Supervision Layer. Delivery mechanism (email / SMS / push / magic link) remains fog with Guardian auth. |
| **Staff** | In-app wellness ops surfaces + optional staff-triggered player re-nudge (existing `apps/app` pattern). Staff are not “reminded” as Guardians. |

- No SMS-to-Player as a default in this design-direction pass.
- Staff-initiated “re-notify pending” is a staff ops control, bounded by Anti-nag Policy — not a Guardian approval gate.

---

## 2. Anti-nag Policy

Per expected check-in window (pre- and/or post-session as configured on Team/Session):

- At most **one** automated Player reminder + at most **one** staff re-nudge.
- Quiet hours respected (no overnight pushes).
- Copy stays invitational Spanish (“cuando puedas”) — never escalating severity or streak-threat language.
- Guardian miss notifies at most **one** per missed expected window (not a drip).
- Escalation Care Alerts are rate-limited separately (§5) and never reused as adherence spam.

**Miss reminders ≠ health escalations.** Adherence nudges (session / pending DailyEntry) are a separate product path from care escalation (injury / red-flag wellness). Mixing them would create punishment-by-health UX and violate safety rails.

---

## 3. Reminder Consent × Age Band (defaults — always configurable)

Consent follows supervision autonomy (DD-02), not a separate family-app model. The table below is the **default** mapping; staff may retune per club/team policy under the configurability override.

| Age Band (default) | Player reminders (push / in-app) | Guardian miss + Care Alert receives |
|---|---|---|
| **Assisted** | **Guardian consents** (adult present; Player does not independently opt in) | **On** — Guardian consents at roster / supervision setup |
| **Guided** | **Player may opt in**; Guardian can revoke Player push as supervision control | **On** — Guardian consents; default on when Parental Supervision Layer is active |
| **Independent (16–17)** | **Player consents** | **Only if** club policy enables Parental Supervision Layer (DD-02); then Guardian consents to receives |
| **Independent (18+)** | **Player consents** | **Off by default** (layer off) |

Staff never “consent for” the Player’s body data; staff only configure team reminder timing and may fire the bounded re-nudge.

---

## 4. Recoverable Streak model

Habit support, not attendance enforcement.

| Rule | Behavior |
|---|---|
| **Increments** | Completing the **expected** DailyEntry obligations for that calendar day within the active **Season**. If the day expects pre and post, both required. If rest / no session and the product marks the day as non-expected, no increment pressure. Aligns with wellness completion, not geo presence. |
| **Breaks** | Missing an **expected** day without Excused Absence → `currentStreak` resets on next successful expected day (start at 1). |
| **Recovery without guilt** | UI never scolds (“rompiste tu racha”); after a break show a calm restart moment; `longestStreak` is quiet personal pride if shown at all — never public. |
| **Excused Absence** | Staff (or Assisted Guardian helper flow later — fog) can mark a day **excused** → streak **freezes** (neither increments nor breaks). For illness, travel, club cancellation — not a daily beg-for-excuse loop. |
| **Season** | `currentStreak` is **Season-scoped** (resets when the active Season changes). `longestStreak` may remain a career pride number on the Player record but is never used in shame copy or public boards. Excused and expected-day calendars are Season-scoped. |

---

## 5. Health Escalation triggers + visibility

Two Care Alert classes; load anomalies stay staff-only. Missed check-in is **not** a Care Alert.

| Trigger | Staff (`apps/app`) | Guardian (care slice) | Child (`apps/player`) |
|---|---|---|---|
| **Injury report / explicit injury or pain flag** on check-in | Always — full context | Care Alert: injury-relevant signal + that check-in completed / flagged (no load ratios, no staff notes) when Parental Supervision Layer is on | Calm confirm only (“Tu equipo ya lo tiene”) — **no** severity labels, **no** “avisamos a tus padres” shame framing, **no** peer comparison |
| **Immediate red-flag wellness** on a single DailyEntry (product thresholds named in implementation backlog / form config — e.g. floor values on recovery / soreness if the form exposes them — **not** ACWR) | Always | Care Alert only for flags marked **care-relevant** (same layer-on rule as injury); never raw load metrics | Same calm confirm if a care flag fired; otherwise no special escalation chrome |
| **Sustained load / ACWR / anomaly patterns** (today’s AI heuristics) | Staff ops / risk surfaces only | **Never** (violates care-slice rule) | **Never** |
| **Missed check-in** | Pending list / staff re-nudge | Miss notify per Consent §3 + Anti-nag — **not** a Care Alert | Calm in-app pending state only — no guilt |

**Rate-limit:** at most one Care Alert per trigger class per calendar day per Player unless staff manually escalates further in a later ops product.

Guardian receive of Care Alerts remains subject to Parental Supervision Layer being on and staff-configurable receive opts (override above).

---

## 6. Motivation — in scope vs deferred

| In scope (this design-direction map) | Deferred beyond this map |
|---|---|
| Calm recoverable streaks | Ambient audio |
| Optional football-identity teaser / player-card progression that does **not** claim real scoring | FUT attribute boosts as health / performance scores |
| | High-res card export before habit is validated |
| | Childish competitive boards / badge spam |

---

## 7. Safety rails (explicit rejects)

- No coercion or guilt/punishment copy for missed check-ins.
- No public shaming or peer leaderboards for adherence.
- No geolocation-based attendance as default.
- No FUT / attribute boosts as medical or on-pitch health scores.
- No competitive adherence boards.
- No mixing miss-reminder severity with health-escalation framing.
- No using Care Alerts as adherence spam.

Aligns with parent MAP **Out of scope**.

---

## 8. Glossary

Safe to promote into root `CONTEXT.md` when domain docs are updated. Keep **Age Band**, **Guardian**, **Assisted Check-in**, **Parental Supervision Layer** as locked in DD-02.

| Term | Meaning |
|---|---|
| **Reminder Consent** | Who opts in (or is opted in) for Player reminders and for Guardian miss / Care Alert receives; defaults follow Age Band autonomy and are always staff-configurable. |
| **Anti-nag Policy** | Caps on automated and staff re-nudges per expected window, quiet hours, invitational copy tone, and separation from Care Alerts. |
| **Recoverable Streak** | Season-scoped consecutive expected-day completion habit; breaks without guilt UI; may freeze under Excused Absence. |
| **Excused Absence** | Staff-marked (or later Assisted helper) day that freezes the streak — neither increments nor breaks. |
| **Health Escalation** | Care path for injury / care-relevant red-flag wellness — distinct from miss reminders. |
| **Care Alert** | Guardian-facing escalation signal within the care slice (injury / care-relevant flags), never load ratios or staff notes. |

**Avoid:** “streak punishment,” “attendance GPS,” “FUT health score,” “parent portal.”

---

## Downstream use

| Consumer | Use of this doc |
|---|---|
| DD-05 player prototype | Calm streak restart, miss pending state, Care Alert confirm — illustrate rules, do not invent new doctrine |
| DD-07 (soft) | Only if adherence/motivation UX patterns need a governance note (player-local vs shared) |
| DD-08 synthesis | Source for the adherence / reminders / escalation section of the final design-direction spec |
| Implementation backlog | Push UX, numeric red-flag thresholds, Excused Absence workflow, Guardian delivery mech |

## Still fog / deferred

- Guardian auth / contact delivery (email vs SMS vs push) and whether notification-only contacts need login.
- Exact numeric thresholds for “immediate red-flag wellness” form fields.
- Whether Excused Absence is staff-only vs Guardian-request workflow (Assisted band).
- Push permission UX copy and browser-permission recovery.
- Legal/jurisdictional consent copy for minors’ wellness + marketing-style pushes (policy).
- Exact care-slice field allow-list beyond injury / care-relevant flags (boundary locked; fields graduate in backlog).

## Out of scope here

- Implementing schedulers, PushSubscription UX, streak persistence changes, or escalation engines.
- Geolocation attendance; punishment / public shaming UX; FUT-as-health-scores; ambient audio; competitive adherence boards.
- Full parent-portal product; routine DailyEntry soft-approval (DD-02 reject).
- Replacing staff AI anomaly tools with a medical device claim or diagnostic system.
