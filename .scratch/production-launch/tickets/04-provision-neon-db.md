---
title: "Provision Neon production database"
status: open
labels: wayfinder:task
blocked-by: []
---

## Question

Set up the production Postgres database on Neon.

Tasks:
1. Go to [neon.tech](https://neon.tech) → create a new project for production (separate from any dev/staging project)
2. Choose the region closest to your users (e.g., Europe if your clubs are in Spain)
3. Get the `DATABASE_URL` connection string (use the pooled connection string with `-pooler` if using Prisma)
4. Run Prisma migrations against it:
   ```sh
   cd packages/database
   DATABASE_URL=<production-url> pnpm exec prisma migrate deploy
   ```
5. Save the connection string — it goes into Vercel env vars (ticket 07)

Note: The repo uses `@neondatabase/serverless` + `@prisma/adapter-neon`, so the standard Postgres connection string from Neon works directly.
