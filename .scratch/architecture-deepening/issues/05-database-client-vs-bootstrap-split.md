---
Status: ready-for-agent
Labels: ready-for-agent
---

# Split database package: thin client vs bootstrap/seed side effects

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Separate “import Prisma client and types for normal app code” from “run product bootstrap such as ensuring base form templates,” so consumers that only need persistence do not pull seed-like side effects. Update imports across the monorepo as needed so behavior is unchanged; add a short maintainer note on when to use which entry.

## Acceptance criteria

- [ ] There is a clear thin entry for database access used by routine app and test code.
- [ ] Bootstrap/ensure helpers live behind an explicit entry or module name that callers opt into.
- [ ] No unintended double-initialization or circular import regressions in staff and player apps.
- [ ] Automated or scripted smoke: an import path that previously dragged bootstrap is verified not to run it at module load unless intended.

## Blocked by

None — can start immediately.

## User stories covered

16, 30
