# QA Age Band — agent test harness

Staging Neon branch (via `apps/app/.env.local` → synced to `packages/database`, `apps/player`, `apps/api`).

## Re-seed

```bash
pnpm --filter @repo/database seed-age-band-qa
```

Idempotent: upserts club `qa-age-band-staging`, staff, players, today's sessions.

## Credentials

See `SESSION.md` (staff email/password) and gitignored `context.json` (tokens + case matrix).

## Local servers

- Staff app: `pnpm --filter app dev` → http://localhost:3000
- Player: `pnpm --filter player dev` → http://localhost:3003
- API (cron/push): `pnpm --filter api dev` → typically :3002 if configured

## Agent workflow

1. Confirm `context.json` exists; if missing, re-seed.
2. Start app + player if not already running.
3. Staff: open `/sign-in`, use staff credentials, switch to club **QA Age Band Staging**.
4. Player cases: open URLs from `context.json` → `players[].url`.
5. Care ledger checks: query `CareAlertDispatch` / `PushDispatch` for player ids after B/C cases.

Do **not** point this seed at production `DATABASE_URL`.
