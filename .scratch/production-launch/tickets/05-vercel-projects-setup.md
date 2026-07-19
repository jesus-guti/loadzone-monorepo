---
title: "Set up Vercel projects and environment variables"
status: closed
labels: wayfinder:task
blocked-by: ["01-cleanup-dead-packages", "02-audit-env-vars"]
---

## Question

Create Vercel projects for `app` and `player`, configure all environment variables, and prepare for deployment.

## Resolution

- Created `loadzone-app` project (root: `apps/app`) with env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PLAYER_URL`, `BLOB_READ_WRITE_TOKEN`
- Created `loadzone-player` project (root: `apps/player`) with env vars: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PLAYER_URL`
- Fixed `apps/app/vercel.json` — removed broken `ignoreCommand` that referenced non-existent `scripts/skip-ci.js`
- Both apps deployed successfully
