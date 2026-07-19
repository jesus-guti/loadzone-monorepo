---
title: "Audit and consolidate environment variables"
status: closed
labels: wayfinder:task
blocked-by: []
---

## Question

Review all `keys.ts` files across packages to ensure the env var setup is correct for production deployment.

## Resolution

### Changes made

1. **`packages/next-config/keys.ts`** — Made `NEXT_PUBLIC_WEB_URL` optional (was required, but `web` app isn't deployed). `NEXT_PUBLIC_APP_URL` stays required, others already optional.

2. **`apps/player/keys.ts`** (new) — Created player env schema with `NEXT_PUBLIC_VAPID_PUBLIC_KEY` as optional client var.

3. **`apps/player/env.ts`** — Added `player()` keys to the extends chain.

4. **`apps/player/app/[token]/components/push-prompt.tsx`** — Changed `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` to `env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` (imported from `@/env`).

5. **`apps/app/env.ts`** — Added `storage()` keys to extends (app uses `@repo/storage` for image uploads but it wasn't validated).

6. **`packages/seo/metadata.ts`** — Fixed template defaults: `applicationName` → "LoadZone", `publisher` → "LoadZone", `locale` → "es_ES".

7. **`.env.example` files** — Rewrote for `app`, `player`, `database`, `api`, `web` with only the vars actually needed.

### Definitive env var list per app

**app** (staff):
| Variable | Source | Required |
|---|---|---|
| `DATABASE_URL` | `@repo/database` | ✅ |
| `AUTH_SECRET` | `@repo/auth` | ✅ |
| `AUTH_TRUST_HOST` | `@repo/auth` | ✅ ("true") |
| `OPENAI_API_KEY` | `@repo/ai` | ❌ (optional) |
| `BLOB_READ_WRITE_TOKEN` | `@repo/storage` | ✅ (for image uploads) |
| `NEXT_PUBLIC_APP_URL` | `@repo/next-config` | ✅ |
| `NEXT_PUBLIC_PLAYER_URL` | `@repo/next-config` | ❌ (optional) |
| `NEXT_PUBLIC_WEB_URL` | `@repo/next-config` | ❌ (optional, now) |
| `NEXT_PUBLIC_API_URL` | `@repo/next-config` | ❌ (optional) |
| `NEXT_PUBLIC_DOCS_URL` | `@repo/next-config` | ❌ (optional) |

**player**:
| Variable | Source | Required |
|---|---|---|
| `DATABASE_URL` | `@repo/database` | ✅ |
| `NEXT_PUBLIC_APP_URL` | `@repo/next-config` | ✅ |
| `NEXT_PUBLIC_PLAYER_URL` | `@repo/next-config` | ❌ (optional) |
| `NEXT_PUBLIC_WEB_URL` | `@repo/next-config` | ❌ (optional, now) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `apps/player/keys` | ❌ (optional) |

### Not changed

- **Resend**: Not needed yet — auth uses credentials provider without email verification/password reset. The `@repo/email` package was deleted (was empty template cruft).
- **Web app**: Not deployed, no env vars needed.
- **API app**: Not deployed, its env vars (Stripe, VAPID keys) will be added when deployed later.
