---
Status: done
Labels: ready-for-agent
---

# Contract tests for staff Exercise library visibility

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

A thin vertical slice that locks the **observable contract** of which Exercises count as visible in the staff club library (non-archived club exercises plus non-archived system catalog entries), without duplicating that rule at new call sites. Deliver automated tests that any implementer can run locally and in CI, exercising the same predicate used for library payloads, picker rows, and scoped mutations (e.g. favorites). No product behavior change intended—only confidence and a guardrail for future edits.

## Acceptance criteria

- [x] Automated tests assert the visibility contract (shape or table-driven semantics agreed in review—not brittle Prisma internals).
- [x] Staff exercise library list, picker, and favorite-toggle paths still rely on the single shared predicate (no new divergence).
- [x] CI runs the new tests with the existing staff app test command pattern.
- [x] Brief note for reviewers describing what the contract guarantees (archived vs system vs club scope).

## Comments

**Reviewer note — contrato de visibilidad:** Un ejercicio cuenta como visible en la biblioteca del club staff si **no está archivado** y cumple **(pertenece al club que se está viendo) OR (es entrada del catálogo de sistema)**. Los tests en `apps/app/__tests__/exercise-library-visibility-contract.test.ts` fijan ese contrato vía `matchesStaffExerciseLibraryVisibility`, alineado con `exerciseLibraryWhere` en `exercise-library-where.ts`. Listado + picker (`get-exercise-library`), favoritos (`toggleExerciseFavorite`) y duplicar ejercicio usan `exerciseLibraryWhere`.

## Blocked by

None — can start immediately.

## User stories covered

1, 2, 3, 4, 5, 28, 37, 38
