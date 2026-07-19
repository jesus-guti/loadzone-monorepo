---
title: "Production Launch: App + Player"
status: open
labels: wayfinder:map
---

## Destination

Production deployment of `app` (staff) and `player` (check-in) Next.js apps on Vercel with Neon Postgres, custom domains, SSL, transactional email, and all env vars configured — after stripping unused template code from the monorepo.

## Notes

- **Domain**: LoadZone football wellness platform (amateur clubs)
- **Stack**: Next.js 16 + Prisma + Neon Postgres + Tailwind 4 + Turbo
- **Hosting**: Vercel (frontends), Neon (Postgres DB)
- **File storage**: Vercel Blob (via `@repo/storage`)
- **Auth**: NextAuth with credentials (email/password)
- **Email**: Resend (transactional)
- **AI**: OpenAI (optional, for player risk analysis)
- **Push notifications**: Web Push (VAPID)
- **Language**: Español (UI) / English (repo docs)
- **Tracker**: Local Markdown under `.scratch/production-launch/`

### Apps included in this launch

| App | Port | Deploy | Description |
|---|---|---|---|
| `apps/app` | 3000 | ✅ Vercel | Staff app (wellness, teams, exercises) |
| `apps/player` | 3003 | ✅ Vercel | Player check-in app |
| `apps/api` | 3002 | ❌ Postponed | Stripe webhooks, push API |
| `apps/web` | 3001 | ❌ Postponed | Marketing / docs site |
| `apps/studio` | 3005 | ❌ Dev only | Prisma Studio |

### Env vars needed for production

**app** (staff):
- `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`
- `OPENAI_API_KEY` (optional)
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PLAYER_URL`
- `RESEND_API_KEY` (via `@repo/email` when configured)

**player**:
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PLAYER_URL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (used directly in push component)
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## Decisions so far

- [Cleanup dead template packages](tickets/01-cleanup-dead-packages.md) — Deleted 6 empty packages (`analytics`, `cms`, `email`, `notifications`, `rate-limit`, `security`). 11 packages remain, all with real code. `pnpm install` passes clean.
- [Audit and consolidate environment variables](tickets/02-audit-env-vars.md) — Made `NEXT_PUBLIC_WEB_URL` optional in next-config; created `apps/player/keys.ts` for VAPID key validation; added `storage()` keys to app env; fixed SEO metadata from template defaults; cleaned up all `.env.example` files.
- [Decide domain strategy](tickets/03-domain-strategy.md) — Root domain `loadzone.app` (Cloudflare). Subdomains: `app.loadzone.app` (staff), `player.loadzone.app` (players). Root redirects to app until landing page is built.
- [Set up Vercel projects](tickets/05-vercel-projects-setup.md) — Created `loadzone-app` and `loadzone-player` projects on Vercel with env vars configured. Fixed broken `ignoreCommand` in vercel.json.

## Not yet specified

- Whether to keep Prisma Studio in the repo or remove it
- Monitoring strategy beyond Sentry (already configured)
- Backup strategy for Neon DB
- Rate limiting for production — no rate-limit package implemented yet (template one was empty)

### Graduated to tickets

- **Cleanup dead packages** → [01-cleanup-dead-packages](tickets/01-cleanup-dead-packages.md)
- **Audit env vars (VAPID key, optional URLs)** → [02-audit-env-vars](tickets/02-audit-env-vars.md)
- **Domain strategy** → [03-domain-strategy](tickets/03-domain-strategy.md)
- **Provision Neon DB** → [04-provision-neon-db](tickets/04-provision-neon-db.md)
- **Vercel projects + env vars** → [05-vercel-projects-setup](tickets/05-vercel-projects-setup.md)
- **Resend email setup** → [06-resend-setup](tickets/06-resend-setup.md)
- **Buy domains + DNS** → [07-buy-domains-and-dns](tickets/07-buy-domains-and-dns.md)
- **Deploy + verify** → [08-deploy-and-verify](tickets/08-deploy-and-verify.md)

## Out of scope

- Deploying `apps/api` (Stripe webhooks, push notifications server) — postponed
- Deploying `apps/web` (marketing/docs) — not yet developed
- CI/CD pipelines (GitHub Actions) — Vercel auto-deploys from Git, no need
- Stripe payment integration — tied to `api` app, postponed
- Migration scripts from any previous database — fresh Neon DB
- Load testing / performance tuning
