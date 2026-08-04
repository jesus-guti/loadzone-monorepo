# QA Age Band — manual run results

Date: 2026-08-04 · Staging Neon · seed `seed-age-band-qa`

| Case | Result | Notes |
|------|--------|--------|
| Seed date titles (local YMD) | PASS | Fixed — [seed fix](7a642fe0-4242-485a-a583-67f45b3686eb) |
| A1–A6 age-band copy/presence | PASS | See prior run |
| B1 Care wellness | PASS | `CARE_RELEVANT_WELLNESS` |
| B2 Injury → INJURY_PAIN | PASS | Allow-list injury location only |
| B3 Rate limit | PASS | 2 injuries → 1 `INJURY_PAIN` / day |
| C consent gates | PASS | OptedIn delivers; Blocked/OptedOut/Assisted denied |
| C cron auth | PASS | 401 / 200; `sent:0` with fake push endpoints |
| C `GUARDIAN_BLOCKED` uiMode | PASS | Fixed — [consent uiMode](431339f0-6cda-4d3f-8e5d-9c04eb1bba68); gate now `uiMode: "blocked"` with stale sub |
| D3 Excused Absence staff surface | PASS | Staff marked `2026-08-02` on Guided; row in DB. Freeze math: 14/14 unit tests |
| E1/E2 settings + player edit | PASS | |

## Fixes this session (uncommitted)

1. `seed-age-band-qa.ts` — `formatLocalYmd` for session titles
2. `reminder-consent.ts` — `OFF` / `GUARDIAN_BLOCKED` always `uiMode: "blocked"`

## Remaining fog

- Real web-push send path
- Care silent note visibility after save (jumps to post)
