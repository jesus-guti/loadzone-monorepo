# Staff session minutes banner

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Owner instructed inline execution (no questions).

**Goal:** Staff in `apps/app` get an end-of-day banner to log one shared training duration or a match lineup, and Carga uses the resulting Team day minutes.

**Architecture:** Pure functions for Minutes played, Full match length, Team day minutes, banner visibility, and player load minutes. Prisma stores shared minutes and the lineup. A staff page edits them. The authenticated shell shows the banner.

**Tech Stack:** TypeScript, Prisma, Next.js server actions, Vitest.

## Global Constraints

- Spanish product UI. English plan and comments for maintainers.
- Staff app only for the banner. Schema lives in `@repo/database`.
- Default shared minutes when the field is opened: 80. Unset stays null until staff save (banner treats null as not logged).
- Spacing 4px multiples. Semantic tokens. Phosphor icons from `@phosphor-icons/react/ssr` in server components.

## Rulings

- Ruling: JES-130 — hand-typed `SessionAttendance.minutesPlayed` stays until a lineup is saved for that match. Saving a lineup overwrites minutes for players on that lineup. Players not on the lineup keep the hand-typed value.
- Ruling: JES-132 — a penalty shoot-out adds no minutes. Full match length stops at the end of the halves, including extra-time halves.
- Ruling: JES-133 — player sRPE minutes are Minutes played on a match when set, otherwise Shared session minutes when set, otherwise check-in `DailyEntry.duration`.
- Ruling: two matches on one civil day — Team day minutes is the sum of both Full match lengths. A training session on that day does not add minutes.
- Ruling: a match with no lineup yet still contributes the previous Carga fallback of 95 minutes so existing sheets do not drop to zero. A training day with no saved shared minutes still uses 80. Several trainings on a day with no match sum (each unset session counts as 80).
- Ruling: the banner shows when the team-local hour is greater than or equal to `Team.minutesPromptHour` (default 20) and at least one non-cancelled session that civil day is missing minutes (training: `sharedMinutes` null; match: no lineup).
- Ruling: JES-129 — the surface is `/sessions/[sessionId]/minutos`, opened from the banner or the session page. No separate match-day screen.
- Ruling: stoppage of a half counts only when the player is still on after that half’s open-play end (exit minute greater than 45, 90, 105, or 120, or no exit). A substitution at that exact minute does not receive that half’s stoppage.

## File map

- `packages/database/session-minutes.ts` — player load minutes helper.
- `packages/database/prisma/schema.prisma` — shared minutes, prompt hour, lineup.
- `apps/app/features/minutes/derive.ts` — lineup math and banner predicate.
- `apps/app/features/minutes/actions.ts` — save duration, lineup, prompt hour.
- `apps/app/features/minutes/minutes-editor.tsx` — staff form.
- `apps/app/features/minutes/minutes-banner.tsx` — shell banner.
- `apps/app/features/carga/microcycles.ts` — optional `minutesByDate`.
- `apps/app/features/carga/load-microcycle-sheet.ts` — compute day minutes from sessions.
- `apps/api/app/cron/stats/route.ts` — sRPE uses the helper.
