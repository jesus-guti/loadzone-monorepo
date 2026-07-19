# E2E Tests — Player Check-in Flow

Tests the complete player check-in flow against the deployed apps.

## Prerequisites

- Deployed staff app (default: `https://app.loadzone.app`)
- Deployed player app (default: `https://player.loadzone.app`)
- `DATABASE_URL` pointing to the Neon database (same one the deployed apps use)

## Quick start

```bash
# 1. Set your database URL
export DATABASE_URL="postgresql://user:password@host:5432/loadzone?sslmode=require"

# 2. Seed test data
cd apps/player
pnpm test:e2e:seed

# 3. Run the browser tests
pnpm test:e2e:run

# 4. View report
pnpm test:e2e:report
```

Or do it all in one command:

```bash
cd apps/player && pnpm test:e2e
```

## What gets tested

1. **Staff app reachability** — verifies the sign-in page loads
2. **Player page loads** — each player's token URL renders correctly
3. **Pre-session form** — fills wellness values and submits
4. **Post-session form** — fills RPE/duration and submits
5. **Data integrity** — validates the seed context

## What gets created

Each test run seeds these entities with a unique timestamp:

| Entity | Count | Naming |
|---|---|---|
| Club | 1 | `E2E Test Club <timestamp>` |
| Team | 1 | `E2E Test Team <timestamp>` |
| Season | 1 | Current window (July–June) |
| Staff user | 1 | `e2e-test-<timestamp>@loadzone.app` |
| Players | 3 | `E2E Player 01` – `E2E Player 03` |
| Sessions | ~8 | Past week + upcoming |

## Cleanup

Data is NOT automatically cleaned up after tests (to allow debugging).

To clean up manually:

```bash
pnpm tsx apps/player/e2e/helpers/seed-test-data.ts --cleanup apps/player/e2e/seed-context.json
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `E2E_PLAYER_URL` | `https://player.loadzone.app` | Player app URL |
| `E2E_STAFF_URL` | `https://app.loadzone.app` | Staff app URL |
| `E2E_PLAYER_COUNT` | `3` | Number of test players |

## Project structure

```
apps/player/e2e/
├── playwright.config.ts          # Playwright configuration
├── global-setup.ts               # Pre-test validation
├── helpers/
│   └── seed-test-data.ts         # Standalone DB seeder (run with tsx)
├── tests/
│   └── player-checkin.spec.ts    # E2E test suite
├── package.json                  # ESM config for Playwright
├── .env.example                  # Example env vars
└── README.md                     # This file
```
