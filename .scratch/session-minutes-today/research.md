# How LoadZone stores and uses session minutes today

Question: Where do session / attendance / day-duration numbers live, what does a match attendance row store, and does Carga multiply mean RPE by a day duration?

Scope: primary code in this repo only. No product code changes in this note.

---

## Summary of facts

| Concern | Where it lives today | Used for load? |
| --- | --- | --- |
| Match `minutesPlayed` / `startedMinute` | `SessionAttendance` | No — write/read for match attendance UI only |
| Team session wall-clock | `TeamSession.startsAt` / `endsAt` | No load math; schedule, reminders, display |
| Exercise block minutes | `Exercise.durationMinutes`, optional `SessionExercise.durationMinutesOverride` | Catalog / session builder display only |
| Per-player check-in duration | `DailyEntry.duration` (nullable `Int`) | Yes for **player** sRPE / acute / chronic in stats cron and player detail charts — when both `rpe` and `duration` are present |
| Team day duration / Team daily load | No schema field; no production computation | Carga prototype uses hardcoded `teamLoad` numbers |

There is **no** production path that multiplies team mean RPE by a civil-day duration. Carga’s only UI is a throwaway prototype with placeholder day loads.

---

## 1. Match attendance minutes (`SessionAttendance`)

### Schema

`packages/database/prisma/schema.prisma` — model `SessionAttendance`:

- `teamSessionId`, `playerId` (unique pair)
- `status` (`AttendanceStatus`: `PENDING` | `PRESENT` | `ABSENT` | `LATE` | `EXCUSED`)
- `notes` (`String?`)
- `minutesPlayed` (`Int?`)
- `startedMinute` (`Int?`)
- `markedAt` (`DateTime?`)
- timestamps

Baseline migration creates the same columns: `packages/database/prisma/migrations/20260418120000_baseline/migration.sql`.

### Write path

`apps/app/features/sessions/actions/session-actions.ts` — `setAttendance`:

- Zod: `minutesPlayed` / `startedMinute` optional nullable ints, range `0…240`
- Upserts `sessionAttendance` with `status`, `minutesPlayed`, `startedMinute`, `notes`, `markedAt`

### UI contract (match-only)

`apps/app/features/sessions/components/attendance-form.tsx`:

- Props include `isMatch`
- On save, non-match sessions force `minutesPlayed: null` and `startedMinute: null`
- Match UI exposes “Min. jugados” and “Min. entrada”

`apps/app/app/(authenticated)/sessions/[sessionId]/page.tsx`:

- Loads attendance `minutesPlayed` / `startedMinute`
- Sets `isMatch = session.type === "MATCH"`
- Passes rows into `AttendanceForm`

### Consumers

Repo-wide search for `minutesPlayed` / `startedMinute` hits only schema, attendance form, `setAttendance`, and the session detail page. **No** stats cron, wellness summary, player charts, AI tools, or Carga code reads these fields.

---

## 2. Team-session duration (wall clock, not a shared-minutes field)

### Schema

`packages/database/prisma/schema.prisma` — model `TeamSession`:

- Has `startsAt` and `endsAt` (`DateTime`)
- Has **no** `durationMinutes` (or similar) column for “shared session minutes”

### Defaults / editing

- New session UI default end = start + 90 minutes: `apps/app/app/(authenticated)/sessions/new/page.tsx` (`end.setMinutes(end.getMinutes() + 90)`)
- Staff edit via `startsAt` / `endsAt` form fields: `session-form.tsx`, `edit-session-form.tsx`, edit page

### Uses of `startsAt` / `endsAt` (not load)

Examples:

- Calendar / display: sessions list and detail pages
- Reminder scheduling from start/end ± reminder minutes: `apps/api/app/cron/reminders/route.ts`
- Streak / wellness “session day” civil-date filtering elsewhere (session clock → team timezone)

Nothing in the load/stats paths derives minutes from `endsAt - startsAt`.

---

## 3. Exercise / session-exercise minutes (catalog, not attendance)

- `Exercise.durationMinutes` — required int on the exercise catalog (`schema.prisma`)
- `SessionExercise.durationMinutesOverride` — optional per-session override

Used when attaching exercises (`attachExercises` in `session-actions.ts`) and when displaying session exercise lists / last-session cards (`sessions/[sessionId]/page.tsx`, `sessions/page.tsx`). Not wired into `DailyEntry`, `PlayerDailyStats`, or attendance.

`SessionExercise` also declares `loadFormulaType` / `loadFormulaConfig` in the schema; there are **no** TypeScript call sites for those field names in the apps/packages searched.

---

## 4. Player check-in duration (`DailyEntry.duration`) and player load

### Schema

`DailyEntry` (`schema.prisma`):

- `rpe` (`Int?`)
- `duration` (`Int?`)
- optional `teamSessionId`
- unique `(playerId, date)`

`PlayerDailyStats` stores derived `srpe`, `acuteLoad`, `chronicLoad`, `acwr`, `rpeAvg7d`, etc. — per player per day, not team microcycle columns.

### Collection status

Player post-session UI **does not collect duration**:

- `apps/player/app/[token]/components/post-session-form.tsx` filters out questions with `mappingKey === "duration"`; steps are RPE-only
- `apps/player/app/[token]/actions/save-entry.ts` skips duration questions during parse (“Duration is no longer collected from the player…”)
- Migration `packages/database/prisma/migrations/20260724100000_remove_post_session_duration_question/migration.sql` deletes duration questions from `system-rpe-post`

`savePostSession` still writes `duration: metrics.duration` on upsert. Because duration is skipped in parse, that value is typically `undefined` → Prisma leaves/nulls accordingly; legacy rows may still hold numbers from older forms or seeds.

### Where duration × RPE is computed (player only)

1. **Stats cron** — `apps/api/app/cron/stats/route.ts`:
   - `srpe = rpe * duration` when both non-null on today’s `DailyEntry`
   - Acute = sum of `rpe * duration` over last 7 days (entries with both set)
   - Chronic = same sum over 28 days `/ 4`
   - `acwr = acute / chronic` when chronic &gt; 0
   - `rpeAvg7d` averages **RPE only** (no duration)
   - Upserts `PlayerDailyStats`

2. **Player detail charts** — `apps/app/app/(authenticated)/players/[id]/page.tsx`:
   - Chart `srpe: entry.rpe && entry.duration ? entry.rpe * entry.duration : null`
   - Also loads stored `PlayerDailyStats` for ACWR / acute / chronic

3. **Wellness** — `apps/app/lib/team-wellness.ts` passes through `entry.duration` on each player entry; team **summary** averages recovery / energy / soreness only — **not** RPE, duration, or sRPE. CSV export includes duration as a column (`load-team-wellness-csv-rows.ts`, `team-wellness-csv.ts`).

No code identifier or computation for “Team daily load”, “team day minutes”, “shared session minutes”, or mean-RPE × day-duration exists under those names in `*.ts` / `*.tsx`.

---

## 5. Carga today

### Production surface

- Only route: `apps/app/app/(authenticated)/carga/prototype/page.tsx` → `CargaPrototypeScreen`
- Feature tree: `apps/app/features/carga/prototype/*`
- Staff operational nav (`apps/app/lib/admin-navigation.ts`) has **no** `/carga` item

### Numbers

`apps/app/features/carga/prototype/data.ts` file header:

> `PROTOTYPE — placeholder numbers for the Carga microcycles screen. Not production data.`

- `teamLoad` values are hardcoded arrays (e.g. `[280, 310, 0, …]`)
- Day acute/chronic/AC derived from those placeholders
- Player row “loads” = `round(day.teamLoad * factor * 0.15)` — still from placeholders
- **No** reads of `DailyEntry`, `SessionAttendance`, `TeamSession`, or mean RPE
- **No** multiplication of mean RPE by any day duration

UI labels “Carga del día” render `day.teamLoad` from that prototype data (`screen.tsx`).

---

## 6. Direct answers

**Where do the numbers live?**

- Match minutes: `SessionAttendance.minutesPlayed` (+ `startedMinute`), staff-entered for `MATCH` only
- Session length on the calendar: `TeamSession.startsAt` / `endsAt` (default 90 minutes apart on create)
- Drill block length: exercise catalog / override minutes
- Optional per-player duration for load: `DailyEntry.duration` (column remains; player no longer fills it)

**What does a match attendance row store?**

`status`, optional `notes`, optional `minutesPlayed`, optional `startedMinute`, `markedAt`, plus session/player ids — not RPE, not sRPE, not team day minutes.

**Does Carga already multiply mean RPE by a day duration?**

No. Carga is a prototype with hardcoded `teamLoad`. Player sRPE uses `DailyEntry.rpe * DailyEntry.duration` in the stats cron and player charts; that is per-player, not team-day Carga math, and duration is no longer collected on the post-session form.
