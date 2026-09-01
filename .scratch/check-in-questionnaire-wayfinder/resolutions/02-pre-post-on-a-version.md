# Resolution: PRE and POST questions on a Questionnaire Version

Ticket: [PRE and POST questions on a Questionnaire Version](../issues/02-pre-post-on-a-version.md)

## Decision

A **Questionnaire Version** is a snapshot of **two** forms, not one list with a moment flag.

- **Pre-session form** and **Post-session form** are the assignable surfaces. Product Presets seed them (today’s PRE wellness metrics vs POST RPE); staff may change anything.
- Questions (not **Exercise** drills) are placed on one form, the other, or both.
- **Custom Question** on both = one identity, two answers that day.
- **WellnessMetric** on both = two stored answers. Load/care use the product-default form’s value if present (recovery, energy, soreness, sleepHours, sleepQuality → pre; rpe, duration → post); otherwise the only placement; the extra copy is CSV-only.
- Empty form ⇒ that fill moment is not an obligation. Live Version must have ≥1 question on at least one form.
- **duration** is an optional NUMBER on the Post-session form (supersedes the research note that it is not a player question).
- Persistence must **replace** `FormTemplate` / `FormQuestion` / `FormAssignment` — do not stretch them. Schema plan lives in [Persist DailyEntry against a Questionnaire Version](../issues/04-persist-dailyentry-against-version.md).

`DailyEntry` remains one row per player and date, with two fill moments.
