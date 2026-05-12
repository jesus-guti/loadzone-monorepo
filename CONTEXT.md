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
A person on a team roster who submits wellness check-ins. May link to a **User** account or operate via the player’s public access token (do not confuse that token with push subscriptions).
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

## Relationships

- A **Club** has many **Teams** (and club-scoped exercises and other shared entities).
- A **Team** belongs to a **Club** and has many **Seasons** and many **Players**.
- A **Season** belongs to a **Team**; it groups that season’s **DailyEntry** and **PlayerDailyStats**.
- A **Player** belongs to a **Team**; has zero or more **PushSubscription** rows and many **DailyEntry** and **PlayerDailyStats** rows (per season).
- A **DailyEntry** belongs to a **Player** and a **Season**; at most one record per (player, date).
- **PlayerDailyStats** belongs to a **Player** and a **Season**; summarises metrics per (player, date) within that season.

## Example dialogue

> **Dev:** “If we archive the **Player**, do we still show their **DailyEntry** rows from the past **Season** on **Team** reports?”
> **Domain:** “Yes—a closed season is team history; I don’t want them to keep getting pushes—that’s **PushSubscription** and reminders, not deleting the club’s past.”

## Flagged ambiguities

- **User** vs **Player**: a **User** is a login identity (staff or optional player linkage); **Player** is the roster entity. A player row may exist without a linked **User**.
