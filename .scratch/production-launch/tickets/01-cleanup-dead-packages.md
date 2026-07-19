---
title: "Cleanup dead template packages"
status: open
labels: wayfinder:task
blocked-by: []
---

## Question

Remove the 6 unused template packages (`analytics`, `cms`, `email`, `notifications`, `rate-limit`, `security`) from the monorepo — they only contain empty directories and stale `node_modules/`.

Tasks:
1. Delete each package directory under `packages/`
2. Verify no workspace references exist to them in any `package.json`
3. Run `pnpm install` to clean up lockfile
4. Confirm `pnpm build` still works

These are AFK — I can drive this one alone.
