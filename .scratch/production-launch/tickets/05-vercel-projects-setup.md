---
title: "Set up Vercel projects and environment variables"
status: open
labels: wayfinder:task
blocked-by: ["01-cleanup-dead-packages", "02-audit-env-vars"]
---

## Question

Create Vercel projects for `app` and `player`, configure all environment variables, and prepare for deployment.

Tasks:
1. Go to [vercel.com](https://vercel.com) → Import `loadzone-monorepo`
2. Create **two** Vercel projects:
   - `loadzone-app` → root directory: `apps/app`, framework: Next.js
   - `loadzone-player` → root directory: `apps/player`, framework: Next.js
3. Configure env vars per app (exact list depends on ticket 02 resolution)
4. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_PLAYER_URL` to placeholder domains for now (update after domains are configured)
5. Connect Git repository → Vercel auto-deploys on push

Note: In a Turborepo + Vercel setup, each project needs `rootDirectory` set to the app's path in the monorepo.
