# Migrate existing DailyEntries to Version 1 (long Preset)

Labels: `wayfinder:grilling`  
Status: open  
Blocked by: [Persist DailyEntry against a Questionnaire Version](04-persist-dailyentry-against-version.md)

## Question

What is the one-shot migration plan (not the executed script) that lands every existing **DailyEntry** on Version 1 of that Team’s **Check-in Questionnaire**, where Version 1 equals today’s full opinionated field set (the long Preset)?

One real Club is in production (friend). Prefer a clean schema after migration over dual-write. Describe backfill, default live Version, empty Teams, and what happens to `formSubmissionId` rows if any exist. Do not run the migration in this ticket.
