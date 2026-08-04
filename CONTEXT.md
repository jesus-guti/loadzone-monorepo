# LoadZone

LoadZone is an amateur football wellness and load monitoring product: staff manage teams and content in the staff app; players submit check-ins from the player app. This file is the **shared domain vocabulary** between product and engineering.

## Language

**Club**:
Sports organisation that groups teams and shared resources (e.g. the club’s exercise library).
_Avoid_: “Tenant” in business-facing prose.

**Team**:
A squad within a club; the unit players belong to and seasons are scoped under.
_Avoid_: “Squad” as the canonical term if the product consistently says **Team**.

**Season**:
A dated work or competition window for one team; frames daily entries and aggregate stats for that period.
_Avoid_: “Campaign” unless product copy standardises it over **Season**.

**Player**:
A person on a team roster who submits wellness check-ins. May link to a **User** account or operate via the player’s public access token (do not confuse that token with push subscriptions). Primary daily operator of `apps/player` across all **Age Bands**.
_Avoid_: “User” when you only mean the roster record—that is **Player**.

**DailyEntry**:
One wellness record for a **Player** on a given calendar day within a **Season** (sleep, fatigue, RPE, etc.); the model allows at most one row per player and date.
_Avoid_: “Diary” if it suggests a generic journal outside this domain.

**PlayerDailyStats**:
Daily aggregated load and risk metrics for a player within a season (e.g. acute/chronic loads, ratios).
_Avoid_: “Stats” without player, day, and season context.

**PushSubscription**:
A browser push subscription tied to a **Player** (session reminders, etc.).
_Avoid_: Treating it as the same thing as the player’s public access token—they are different mechanisms.

**Exercise**:
A training drill definition in the library; may be club-owned or part of the **system catalog** (reusable `isSystem` exercises). **Exercise library** visibility for a club combines non-archived club exercises with system-catalog exercises per the rules encoded in the product code.

**Age Band**:
Capability tier for player autonomy: **Assisted**, **Guided**, or **Independent**. Indicative ages and consent×band defaults are **staff-configurable policy defaults**, never fixed-only product constants.
_Avoid_: Hard-coding cutoffs as immutable product law; “teen app” as a separate product.

**Guardian**:
Adult helper and receive target for the **Parental Supervision Layer**. Helps or supervises — never the default daily operator of `apps/player`.
_Avoid_: “Parent portal,” “family mode,” or modelling Guardian as co-primary user of the player app.

**Assisted Check-in**:
Check-in mode for the **Assisted** **Age Band**: an adult is expected present; the **Player** still operates the flow. Routine **DailyEntry** submit is not gated on Guardian approval.

**Parental Supervision Layer**:
Separate see / receive / escalate capabilities for a **Guardian** — not a joint family co-app, and not soft-approval of routine **DailyEntry**. Guardian visibility is a **care slice** only (completion status, escalated flags, injury-relevant signals); not load ratios, staff notes, or peer comparison.

**Reminder Consent**:
Who opts in for Player reminders and Guardian miss / **Care Alert** receives. Defaults vary by **Age Band** (Assisted / Guided / Independent youth below adult majority / Independent majority) and remain staff-configurable on the **Team**. Per-**Player** compact consent state is the ledger; **PushSubscription** is transport only.
_Avoid_: Treating subscription presence alone as the consent record.

**Anti-nag Policy**:
Caps, quiet hours, and invitational tone for automated reminders (e.g. at most one automated Player reminder and one staff re-nudge per expected check-in window). Miss reminders are not **Care Alerts**.

**Recoverable Streak**:
Season-scoped expected-day habit: increments on completing expected **DailyEntry** obligations; breaks on miss without **Excused Absence** (calm restart, no guilt UI). Never public shame boards.
_Avoid_: “Streak punishment,” competitive adherence boards, or geo-based attendance as the streak signal.

**Excused Absence**:
A day that freezes the **Recoverable Streak** (neither increments nor breaks). Exact staff vs Assisted Guardian-request workflow is deferred.

**Health Escalation**:
Care path for injury / care-relevant wellness signals, distinct from miss reminders and adherence nagging.

**Care Alert**:
Guardian-facing care-slice signal (injury / care-relevant). Never includes load ratios or ACWR-style staff metrics.
_Avoid_: Using Care Alerts as adherence spam; “FUT health score” or attendance GPS as care framing.

## Relationships

- A **Club** has many **Teams** (and club-scoped exercises and other shared entities).
- A **Team** belongs to a **Club** and has many **Seasons** and many **Players**.
- A **Season** belongs to a **Team**; it groups that season’s **DailyEntry** and **PlayerDailyStats**.
- A **Player** belongs to a **Team**; has zero or more **PushSubscription** rows and many **DailyEntry** and **PlayerDailyStats** rows (per season).
- A **DailyEntry** belongs to a **Player** and a **Season**; at most one record per (player, date).
- **PlayerDailyStats** belongs to a **Player** and a **Season**; summarises metrics per (player, date) within that season.
- A **Player** is assigned an **Age Band** (Assisted / Guided / Independent) from optional `dateOfBirth` and/or `ageBandOverride`, resolved against Club defaults with Team override (see `@repo/database/age-band-policy`); indicative ages and consent defaults are staff-configurable policy, not fixed-only constants.
- **Reminder Consent** defaults live in `Team.reminderConsentPolicy` JSON (null → SPEC §5 package defaults); per-**Player** `reminderConsentState` gates push subscribe (see `@repo/database/reminder-consent`).
- A **Guardian** participates via the **Parental Supervision Layer** (care slice: see / receive / escalate) — not as co-operator of routine **DailyEntry** on `apps/player`.
- A **Recoverable Streak** and **Excused Absence** are scoped to expected check-ins within a **Season** for a **Player**.

## Example dialogue

> **Dev:** “If we archive the **Player**, do we still show their **DailyEntry** rows from the past **Season** on **Team** reports?”
> **Domain:** “Yes—a closed season is team history; I don’t want them to keep getting pushes—that’s **PushSubscription** and reminders, not deleting the club’s past.”

## Flagged ambiguities

- **User** vs **Player**: a **User** is a login identity (staff or optional player linkage); **Player** is the roster entity. A player row may exist without a linked **User**.
- **Guardian** auth/linkage and **Excused Absence** request workflow remain deferred product decisions — do not invent them here. Care-slice field allow-list: graduated in JES-49 (`GuardianCareSlice` in `@repo/database/care-alerts`; resolution under `.scratch/jes-49-care-allow-list/`).
- **Age Band** persistence: optional `Player.dateOfBirth` + `ageBandOverride`; effective cutoffs live in `Club.ageBandPolicy` / `Team.ageBandPolicy` JSON (null → documented package defaults).
