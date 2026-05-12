---
Status: done
Labels: ready-for-agent
---

# Split database package: thin client vs bootstrap/seed side effects

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Separate "import Prisma client and types for normal app code" from "run product bootstrap such as ensuring base form templates," so consumers that only need persistence do not pull seed-like side effects. Update imports across the monorepo as needed so behavior is unchanged; add a short maintainer note on when to use which entry.

## Acceptance criteria

- [x] There is a clear thin entry for database access used by routine app and test code.
- [x] Bootstrap/ensure helpers live behind an explicit entry or module name that callers opt into.
- [x] No unintended double-initialization or circular import regressions in staff and player apps.
- [x] Automated or scripted smoke: an import path that previously dragged bootstrap is verified not to run it at module load unless intended.

## Blocked by

None — can start immediately.

## User stories covered

16, 30

## Comments

**Implementación:** `@repo/database` (root export / `./client`) solo expone `database`, tipos Prisma y `risk`; JSDoc en `index.ts` indica cuándo usar bootstrap. `ensureBaseFormTemplates` y `ensureBaseFormTemplatesWithDb` viven en `@repo/database/bootstrap` (`bootstrap.ts` + `bootstrap/base-form-templates.ts`). Consumidores que llamaban `ensureBaseFormTemplates` desde `@repo/database` pasan a importar desde `@repo/database/bootstrap`. El script CLI `scripts/bootstrap.ts` reutiliza `ensureBaseFormTemplatesWithDb` con su propio `PrismaClient`. Tests en `packages/database/__tests__/database-package-entries.test.ts` (Vitest + shim `server-only` para Node) comprueban que la entrada por defecto no exporte helpers de bootstrap.
