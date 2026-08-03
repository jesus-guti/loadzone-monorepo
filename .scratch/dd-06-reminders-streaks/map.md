# DD-06 — Define reminders, streaks, and health escalation

Planning map for wayfinder grilling ticket
`.scratch/design-direction-wayfinder/issues/06-define-reminders-streaks-and-health-escalation.md`.
Parent effort: [LoadZone Design Direction](../design-direction-wayfinder/MAP.md).
Locked parent: [Player age bands and parental supervision](../design-direction-wayfinder/resolutions/player-age-bands-and-parental-supervision.md).

## Destination

Product rules for adherence and safety in `apps/player`: reminder channels and anti-nag, consent per Age Band, recoverable streaks, health escalation visibility, in-scope motivation vs deferred, and explicit safety rails — English rules safe to feed the adherence section of DD-08 — without implementing push, streak engines, or notification infrastructure.

## Notes

- **Domain:** root `CONTEXT.md` (**DailyEntry**, **Season**, **Player**, **PushSubscription**). Current reality (read-only skim): Web Push to Player via `@repo/push-notifications`; staff “re-notify pending” action; calendar consecutive-day `currentStreak` / `longestStreak` on Player; injury reports; staff AI anomaly heuristics (RPE/recovery/sleep/ACWR) — **not** a product escalation contract yet. No Guardian contacts or Age Band in schema today.
- **Locked from DD-02:** Age Bands Assisted / Guided / Independent; Player primary operator; Guardian **see + receive**, **approve nothing** on routine DailyEntry; Guardian **care slice** (completed, escalated flags, injury) — no load ratios, staff notes, peer comparison; reminder consent / channels / anti-nag / streak recovery / escalation thresholds **owned here**.
- **Standing preferences (effort-locked):** adherence features in scope for the map destination; no geo attendance by default; no punishment UX; no FUT attributes as health/performance scores; no childish competitive leaderboards / badge spam; ambient audio deferred; destination is **spec + backlog**.
- **Skills:** `/grilling`, `/domain-modeling`; design rules in `.cursor/rules/loadzone-design-system.mdc` (`apps/player` calm surfaces).
- **Autonomy:** classify per `orchestrator/autonomy-matrix.md`. Max 3 `hitl`. Do not live-grill; do not close the wayfinder ticket from this planning wave.
- **Downstream:** hard-blocks DD-08 adherence section; soft influence on DD-07 if adherence/motivation UX patterns need governance notes (player-local vs shared). Parallel with DD-05 (prototype may illustrate calm streak / supervision surfaces using these rules once locked).

## Decisions so far

### Auto

1. **[auto] Spec rules only — no implementation** — This ticket decides product rules for the design-direction adherence section. No push scheduler, streak engine, Guardian contact model, or escalation pipeline code in this effort (later backlog after DD-08).
2. **[auto] Inherit DD-02 care / supervision boundaries** — Staff = full DailyEntry + load + injury for ops. Guardian = care slice only. Miss and escalation **notifications** are allowed; routine soft-approval remains rejected. Exact care-slice field allow-list graduates from HITL B below.
3. **[auto] Safety rails (explicit rejects)** — No coercion or guilt/punishment copy for missed check-ins; no public shaming or peer leaderboards for adherence; no geolocation-based attendance as default; no FUT / attribute boosts as medical or on-pitch health scores; no competitive boards. Aligns with parent MAP **Out of scope**.
4. **[auto] Motivation scope split (MAP Notes + Out of scope)** — **In-scope for upcoming spec:** calm recoverable streaks; optional football-identity teaser / player-card progression that does **not** claim real scoring. **Deferred beyond this map:** ambient audio; FUT attribute boosts as health scores; high-res card export before habit is validated; childish competitive boards / badge spam.
5. **[auto] Miss reminders ≠ health escalations** — Adherence nudges (session / pending DailyEntry) are a separate product path from care escalation (injury / red-flag wellness). Mixing them would create punishment-by-health UX and violate safety rails.
6. **[auto] Player push precedent stays the player channel substrate** — Design-direction rules may assume **PushSubscription**-backed Web Push to the Player device plus in-app surfacing when the token link is open. Staff-initiated “re-notify pending” remains a staff ops control (already in `apps/app`), bounded by anti-nag assume below — not a Guardian approval gate.
7. **[auto] Glossary candidates (English, for CONTEXT.md on resolution)** — Propose: **Reminder Consent**, **Anti-nag Policy**, **Recoverable Streak**, **Excused Absence**, **Health Escalation**, **Care Alert** (Guardian-facing escalation signal within the care slice). Keep **Parental Supervision Layer**, **Age Band**, **Guardian** as locked in DD-02. Avoid “streak punishment,” “attendance GPS,” “FUT health score,” “parent portal.”

### Assume

8. **[assume] Logical reminder channels** — **Player:** (1) Web Push when subscribed, (2) calm in-app reminder state when the player surface is open (banner / empty-day prompt — not modal spam). **Guardian:** receive-only miss and Care Alert notifications via the Parental Supervision Layer (delivery mechanism — email / SMS / push / magic link — stays fog with Guardian auth). **Staff:** in-app wellness ops surfaces + optional staff-triggered player re-nudge (existing pattern); staff are not “reminded” as Guardians. No SMS-to-Player as a default in this design-direction pass.  
   **Revert:** add SMS-to-Player or drop in-app channel if DD-05 / later ops research shows one channel is enough or legally required.
9. **[assume] Anti-nag Policy (defaults)** — Per expected check-in window (pre- and/or post-session as configured on Team/Session): at most **one** automated Player reminder + at most **one** staff re-nudge; quiet hours respected (no overnight pushes); copy stays invitational Spanish (“cuando puedas”), never escalating severity or streak-threat language; Guardian miss notifies at most **one** per missed expected window (not a drip). Escalation Care Alerts are rate-limited separately (HITL B) and never reused as adherence spam.  
   **Revert:** tighten to automated-only (no staff re-nudge) or loosen to two automated beats if clubs report under/over-notify in a later effort.
10. **[assume] Season boundary for streaks** — `currentStreak` is **Season-scoped** (resets when the active Season changes). `longestStreak` may remain a career pride number on the Player record but is never used in shame copy or public boards.  
    **Revert:** make both counters Season-scoped only, or keep currentStreak calendar-global across seasons if product later wants multi-season habit continuity.

### Hitl (pending human)

11. **[hitl] Reminder Consent × Age Band** — Who opts in (or is opted in) for Player reminders and for Guardian miss / Care Alert receives. Recommendation below (A).
12. **[hitl] Health Escalation triggers + visibility** — What fires staff and/or Guardian Care Alerts; what the child sees vs adults. Recommendation below (B).
13. **[hitl] Recoverable Streak model** — What increments, what breaks, recovery without guilt, how Excused Absence and Season interact. Recommendation below (C).

## Decision ledger (classification)

| # | Decision | Level | Rationale |
|---|---|---|---|
| 1 | Spec-only / no push–streak code | `auto` | Effort Notes; destination is spec + backlog |
| 2 | Inherit DD-02 care + no routine approve | `auto` | Precedent locked resolution |
| 3 | Safety rails rejects | `auto` | Parent MAP Out of scope |
| 4 | Motivation in-scope vs deferred | `auto` | Parent MAP Notes + Out of scope |
| 5 | Miss path ≠ escalation path | `auto` | Safety + vocabulary hygiene |
| 6 | Player push + staff re-nudge as substrates | `auto` | Code precedent (`PushSubscription`, pending reminder) |
| 7 | Glossary candidates | `auto` | Vocabulary hygiene |
| 8 | Logical channels (player / guardian / staff) | `assume` | Contained product defaults; delivery mech fog; reversible |
| 9 | Anti-nag limits + quiet hours + copy tone | `assume` | Contained; mirrors existing staff dialog guidance; reversible |
| 10 | Season-scoped currentStreak | `assume` | Contained; reversible |
| 11 | Consent per Age Band | `hitl` | Product + minors / privacy / externo |
| 12 | Escalation triggers + child vs adult visibility | `hitl` | Product + privacy / care / minors |
| 13 | Streak increment / break / recovery / excused | `hitl` | Product — changes what end users experience |

## HITL recommendations (for orchestrator → human)

### A. Reminder Consent × Age Band

**Recommend:** consent follows supervision autonomy, not a separate family-app model.

| Age Band | Player reminders (push / in-app) | Guardian miss + Care Alert receives |
|---|---|---|
| **Assisted** | **Guardian consents** (adult present; Player does not independently opt in) | **On** — Guardian consents at roster / supervision setup |
| **Guided** | **Player may opt in**; Guardian can revoke Player push as supervision control | **On** — Guardian consents; default on when Parental Supervision Layer is active |
| **Independent (16–17)** | **Player consents** | **Only if** club policy enables Parental Supervision Layer (DD-02); then Guardian consents to receives |
| **Independent (18+)** | **Player consents** | **Off by default** (layer off) |

Staff never “consents for” the Player’s body data; staff only configure team reminder timing and may fire the bounded re-nudge.

### B. Health Escalation triggers + visibility

**Recommend:** two Care Alert classes; load anomalies stay staff-only.

| Trigger | Staff (`apps/app`) | Guardian (care slice) | Child (`apps/player`) |
|---|---|---|---|
| **Injury report / explicit injury or pain flag** on check-in | Always — full context | Care Alert: injury-relevant signal + that check-in completed / flagged (no load ratios, no staff notes) when Parental Supervision Layer is on | Calm confirm only (“Tu equipo ya lo tiene”) — **no** severity labels, **no** “avisamos a tus padres” shame framing, **no** peer comparison |
| **Immediate red-flag wellness** on a single DailyEntry (product thresholds to be named in spec; e.g. floor values on recovery / soreness if form exposes them — **not** ACWR) | Always | Care Alert only for flags marked **care-relevant** (same layer-on rule as injury); never raw load metrics | Same calm confirm if a care flag fired; otherwise no special escalation chrome |
| **Sustained load / ACWR / anomaly patterns** (today’s AI heuristics) | Staff ops / risk surfaces only | **Never** (violates care-slice rule) | **Never** |
| **Missed check-in** | Pending list / staff re-nudge | Miss notify per Consent A + Anti-nag — **not** a Care Alert | Calm in-app pending state only — no guilt |

Rate-limit: at most one Care Alert per trigger class per calendar day per Player unless staff manually escalates further in a later ops product.

### C. Recoverable Streak model

**Recommend:** habit support, not attendance enforcement.

- **Increments:** completing the **expected** DailyEntry obligations for that calendar day within the active **Season** (if the day expects pre and post, both required; if rest / no session and product marks day as non-expected, no increment pressure). Aligns with wellness completion, not geo presence.
- **Breaks:** missing an **expected** day without Excused Absence → `currentStreak` resets on next successful expected day (start at 1), matching today’s consecutive-entry spirit without inventing GPS.
- **Recovery without guilt:** UI never scolds (“rompiste tu racha”); after a break show a calm restart moment; keep `longestStreak` as quiet personal pride if shown at all; never public.
- **Excused Absence:** staff (or Assisted Guardian helper flow later — fog) can mark a day **excused** → streak **freezes** (neither increments nor breaks). Use for illness, travel, club cancellation — not as a punishment escape that Guardians must beg for daily.
- **Season:** `currentStreak` resets at Season boundary (assume #10). Excused and expected-day calendars are Season-scoped.

## Not yet specified

- Guardian auth / contact delivery (email vs SMS vs push) and whether notification-only contacts need login (parent-map fog; DD-02).
- Exact numeric thresholds for “immediate red-flag wellness” form fields (graduates into implementation backlog / form config after HITL B locks the classes).
- Whether Excused Absence is staff-only vs Guardian-request workflow (Assisted band) — fog until Guardian surface exists.
- Push permission UX copy and browser-permission recovery (implementation).
- How DD-05 prototype visualizes calm streak restart vs Care Alert confirm (prototype ticket; consumes this resolution).
- Legal/jurisdictional consent copy for minors’ wellness + marketing-style pushes (policy).

## Out of scope

- Implementing schedulers, PushSubscription UX, streak persistence changes, or escalation engines during this wayfinder map.
- Geolocation attendance; punishment / public shaming UX; FUT-as-health-scores; ambient audio; competitive adherence boards (parent MAP).
- Full parent-portal product; routine DailyEntry soft-approval (DD-02 reject).
- Replacing staff AI anomaly tools with a medical device claim or diagnostic system.
- Soft-blocking DD-07 unless adherence patterns later need an explicit governance note — not a hard `Blocked by` edge.

## Human review (2026-08-03)

- **Orchestrator:** `ok a todo` — accept all auto/assume decisions and all HITL recommendations for this ticket.
- **Product override (global):** Age Band cutoffs and Guardian / Parental Supervision Layer settings MUST remain **staff-configurable at all times** (club/team policy). Indicative ages and Guardian defaults in resolutions are **defaults**, not hard-coded product constants. Spec language must say clubs can always retune bands and guardian receive/escalation options without a code change to product doctrine.
- **HITL A/B/C locked** as recommended. Consent×band, escalation visibility, and streak model as in planner report. Guardian consent/receive and Age Band thresholds remain always configurable (see global override).
