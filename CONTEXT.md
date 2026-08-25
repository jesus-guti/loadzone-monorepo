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

**Playing Position**:
Optional coarse line on a **Player**: POR, DEF, MED, or DEL. Identity on the **Streak Cromo** only — not a rating, attribute, or selection rule.
_Avoid_: Fine pitch slots (LD, MCD, …) as required roster data; FUT-style attributes; treating missing position as an error.

**Session**:
A scheduled **Team** event (training, match, recovery, or other) on a civil calendar day in the team’s timezone. May apply to the whole Team or a subset of **Players**.
_Avoid_: Auth/login “session”; using Session as a synonym for **DailyEntry**; treating a cancelled Session as an expected streak day.

**DailyEntry**:
One wellness record for a **Player** on a given calendar day within a **Season** (sleep, fatigue, RPE, etc.); the model allows at most one row per player and date. The same record may be filled **PRE-session**, **POST-session**, or both (distinct fill moments, not two DailyEntries). Staff **Team** history (reports, CSV export) still includes past **DailyEntry** rows after the **Player** is archived — archive stops live workspace and reminders, not club history.
_Avoid_: “Diary” if it suggests a generic journal outside this domain; treating archive as deletion of past check-ins; modelling PRE and POST as separate DailyEntries.

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
Season-scoped expected-day habit. An expected day is a civil day with a non-cancelled **Session** the **Player** is on and PRE/POST **DailyEntry** obligations. Increments on completing those fills; breaks on an unexcused miss; days with no such Session neither increment nor break. Never public shame boards. Attendance GPS is not the signal.
_Avoid_: “Streak punishment,” competitive adherence boards, calendar-consecutive days, or geo-based attendance as the streak signal.

**Streak Cromo**:
Player-facing identity card in `apps/player` that visually evolves with the **Recoverable Streak**. Shows staff-uploaded **Player** photo (calm silhouette when missing) and **Club** crest from `Club.logoUrl` only (omit when null; never **Team** logo). Optional **Playing Position** line when set. Portrait overprint shows the optional shirt (**dorsal**) as a hollow numeral (rank-stamp lab variant C treatment) when `Player.shirtNumber` is set. Footer ink seal (lab variant A) shows **Team streak rank** (`#1` = longest Recoverable Streak among non-archived teammates; omit when this Player’s streak is 0). Footer bottom-left shows **Team** name in cromo serif. Recoverable Streak count stays in the header racha pill and LOADZONE pill — not duplicated as a fire disc on the card. Material tier names (Bronce, Oro, Esmeralda, …) are not printed on the card; vivid per-tier chrome is player-local CSS — not a second staff / design-system brand hue. Shine is a 3px foil rim on every tier: **Bronce** / **Plata** use a metallic plate bevel; **Oro** and above add holographic drift on the shell and the rim (ambient CSS only — no pointer tracking). Football-identity teaser only — never claims real performance / health scoring. Distinct from staff Wellness Tarjetas / admin cromos. Empty **Playing Position** omits the line (no «Sin posición» placeholder).
_Avoid_: FUT-style attribute numbers; high-res export/share as the first habit surface; conflating with admin Team Wellness player cards; using Team logo as the crest source; putting the dorsal in the ink seal.

**Playing Position**:
Optional coarse football line on a **Player**: **POR**, **DEF**, **MED**, or **DEL**. Staff set or clear it on create/edit; **Streak Cromo** shows that Spanish abbreviation only when set. Not fine pitch slots (LB, CM, ST, …).
_Avoid_: Treating empty as a displayed «Sin posición» on the cromo; inventing per-slot pitch coordinates.

**Shirt number**:
Optional integer dorsal on a **Player** (`shirtNumber`, 1–99). Staff set or clear it on create/edit; **Streak Cromo** shows the portrait overprint with that number only when set. Not unique per Team in v1 (amateur squads may reuse numbers).
_Avoid_: Using the dorsal as the ink-seal numeral; treating empty as a «Sin dorsal» placeholder on the card.

**Session** (Team Session):
A scheduled team block (`TeamSession`: training / match / recovery / other) on a **Team**, with an absolute `startsAt` interpreted on civil days in the **Team** timezone. Racha sheet week chrome marks every non-cancelled Team Session that Monday–Sunday week (one mark per civil day; CANCELLED omitted). **Recoverable Streak** expected days stay player-applicable Sessions only — week marks are not DailyEntry done/miss.
_Avoid_: Painting check-in complete/miss on weekday letters; using CANCELLED Sessions as week marks; treating week chrome as the streak habit engine.

**Excused Absence**:
A day that freezes the **Recoverable Streak** (neither increments nor breaks). Exact staff vs Assisted Guardian-request workflow is deferred.

**Health Escalation**:
Care path for injury / care-relevant wellness signals, distinct from miss reminders and adherence nagging.

**Care Alert**:
Guardian-facing care-slice signal (injury / care-relevant). Never includes load ratios or ACWR-style staff metrics.
_Avoid_: Using Care Alerts as adherence spam; “FUT health score” or attendance GPS as care framing.

**BodyRegion**:
A named anatomical zone from LoadZone’s fixed injury catalog (with anatomical left/right in the id where needed), used to locate injuries on the staff body map. Optional free-text detail may refine a region; it does not create a new catalog entry.
_Avoid_: Freehand body-part strings as the primary location; medical coding systems (OSICS/ICD) as the catalog.

**Injury**:
A staff-authored official injury period for a **Player**, located on one or more **BodyRegion**s, with a required start date and optional inclusive end date. While active it drives `Player.status` `INJURED` and wellness check-in obligation exemption (voluntary **DailyEntry** still allowed).
_Avoid_: **InjuryReport** as the name of the official period; EMR “case”; treating player self-report as the official period.

**Pain Alert**:
A player-submitted intake signal (aviso) that something hurts — not an official **Injury**. Does not by itself set `INJURED` or exempt wellness; staff may promote it to an **Injury**.
_Avoid_: Calling a Pain Alert an injury period or “lesión oficial”.

**Operational Baseline**:
The minimum state for a **Team** to use day-to-day wellness meaningfully: an active **Season** plus at least one **Player**. Creating **Club** and the first **Team** happens in hard onboarding before the staff shell. Without this baseline, Wellness is empty of usable day-to-day signal — not “broken,” but not yet a working workspace.
_Avoid_: Treating club logo, exercises, or sessions as blockers before Wellness can open; conflating hard onboarding (Club + Team) with post-shell setup.

**Recommended Setup**:
The unified first-run path staff should complete after hard onboarding — not a second hard gate. Product UI label: **Primeros pasos** (not English “Getting started” in the staff app). Five steps and completion predicates:

- **Club** logo — `Club` has branding logo set
- **Season** — any **Season** exists on any **Team** in the Club
- **Player** — any **Player** exists on any **Team** in the Club
- **Exercise** — staff has *used* library content: any membership favorite on an **Exercise**, **or** any **Exercise** placed on a Session in the Club (system or club-owned). Creating a club-owned **Exercise** is not required
- **Session** — any Session exists on any **Team** in the Club

Hard onboarding (Club + first **Team**) is outside this count. Completion is derived from those **Club facts** (and the exercise-use signal), not from whether the current User personally created the rows. Invited staff joining a Club that already satisfies Recommended Setup should not get a false empty-club tour.

Separately, any User may **minimize** or **dismiss** the guidance panel for that Club — minimize collapses it to a compact progress affordance (e.g. `Primeros pasos n/5` with brand emphasis); dismiss/hide-until-reopen is also allowed when they already know the product. The expanded panel lives in the staff **sidebar footer** (above the notifications / user block). Reopen after full completion (or after dismiss) lives under **Settings → Club**. When all Club-fact steps are complete, the expanded panel auto-hides. Dismissing or minimizing does **not** suppress contextual empty states on surfaces like Wellness while **Operational Baseline** facts are still missing.
_Avoid_: Calling Recommended Setup “onboarding” if that means the hard Club+Team gate; English “Getting started” as staff-facing copy; treating “system catalog is visible” alone as the Exercise step; blocking Wellness until every Recommended Setup step is done; refusing a minimize / reopen path; treating panel dismiss as “staff needs no empty-state guidance.”; counting Club+Team creation inside the five Primeros pasos steps.


## Relationships

- A **Club** has many **Teams** (and club-scoped exercises and other shared entities).
- A **Team** belongs to a **Club** and has many **Seasons**, many **Players**, and many **Sessions**.
- A **Season** belongs to a **Team**; it groups that season’s **DailyEntry** and **PlayerDailyStats**.
- A **Player** belongs to a **Team**; has an optional **Playing Position** and optional shirt number; has zero or more **PushSubscription** rows and many **DailyEntry** and **PlayerDailyStats** rows (per season); has many **Injuries**.
- A **DailyEntry** belongs to a **Player** and a **Season**; at most one record per (player, date).
- **PlayerDailyStats** belongs to a **Player** and a **Season**; summarises metrics per (player, date) within that season.
- A **Player** is assigned an **Age Band** (Assisted / Guided / Independent) from optional `dateOfBirth` and/or `ageBandOverride`, resolved against Club defaults with Team override (see `@repo/database/age-band-policy`); indicative ages and consent defaults are staff-configurable policy, not fixed-only constants.
- **Reminder Consent** defaults live in `Team.reminderConsentPolicy` JSON (null → SPEC §5 package defaults); per-**Player** `reminderConsentState` gates push subscribe (see `@repo/database/reminder-consent`).
- A **Guardian** participates via the **Parental Supervision Layer** (care slice: see / receive / escalate) — not as co-operator of routine **DailyEntry** on `apps/player`.
- A **Recoverable Streak** and **Excused Absence** are scoped to expected check-ins within a **Season** for a **Player**; expected days come from **Sessions** that player is on, not from every **Session** on the Team.
- A **Streak Cromo** reflects that **Player**’s **Recoverable Streak** on the player check-in surface (photo, **Club** crest, optional **Playing Position**, optional shirt-number overprint, Team streak-rank seal, **Team** name); it is not a staff Wellness Tarjeta. The DD-05 lab (`prototype-dd-05`, variant C) reuses the same app-local component. Optional **Playing Position** (`Player.playingPosition`) feeds the cromo identity line only when set (see `@repo/database/playing-position`). Optional `Player.shirtNumber` feeds the portrait overprint only when set (see `@repo/database/shirt-number`). Team rank on the ink seal uses Recoverable Streak among non-archived teammates (`#1` = longest).
- A **Session** (Team Session) belongs to a **Team**; Racha week chrome uses all non-cancelled Sessions that civil week, while Recoverable Streak expected days use player-applicable Sessions only.
- An **Injury** belongs to a **Player** and associates to one or more **BodyRegion**s; a **Team** lists Injuries via its Players (Injury is not Season-scoped).
- A **Pain Alert** belongs to a **Player** and is triage input for staff; it is not an **Injury** until staff promotes it.
- A **Team** reaches **Operational Baseline** when it has an active **Season** and at least one **Player**; Club + Team creation precedes that via hard onboarding.
- **Recommended Setup** completion comes from **Club facts** (plus an exercise-*use* signal); User×Club stores expanded / minimized / dismissed panel chrome; panel chrome lives in the sidebar footer; reopen from **Settings → Club**.


## Example dialogue

> **Dev:** “If we archive the **Player**, do we still show their **DailyEntry** rows from the past **Season** on **Team** reports?”
> **Domain:** “Yes—a closed season is team history; I don’t want them to keep getting pushes—that’s **PushSubscription** and reminders, not deleting the club’s past.”

## Flagged ambiguities

- **User** vs **Player**: a **User** is a login identity (staff or optional player linkage); **Player** is the roster entity. A player row may exist without a linked **User**.
- **Guardian** auth/linkage and **Excused Absence** request workflow remain deferred product decisions — do not invent them here. Care-slice field allow-list: graduated in JES-49 (`GuardianCareSlice` in `@repo/database/care-alerts`; resolution under `.scratch/jes-49-care-allow-list/`).
- **Age Band** persistence: optional `Player.dateOfBirth` + `ageBandOverride`; effective cutoffs live in `Club.ageBandPolicy` / `Team.ageBandPolicy` JSON (null → documented package defaults).
- **Session** subset vs whole-Team: a Session may list a subset of Players; Recoverable Streak uses only Sessions that Player is on. Player week chrome may still show all Team Sessions that week.
- **Preseason**: not a domain entity. Staff scope history with **Season** and calendar dates. Persistence may store an optional `preSeasonEnd` on **Season**; that is not product language and is not a filter object.
