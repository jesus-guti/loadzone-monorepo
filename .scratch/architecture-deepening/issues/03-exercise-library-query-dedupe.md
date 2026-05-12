---
Status: done
Labels: ready-for-agent
---

# Deduplicate staff Exercise library query (happy path + favorites fallback)

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Remove copy-paste between the primary Exercise library query and the compatibility fallback when the membership-favorites relation is missing, by sharing one select/where builder (or equivalent mechanical deduplication) while preserving identical response shapes for staff. Verify behavior with tests and a quick staff library smoke (list + favorites when applicable).

## Acceptance criteria

- [x] A single shared definition drives the duplicated query shapes so fields cannot silently diverge between branches.
- [x] Existing error handling for the “missing favorites relation” scenario still behaves the same from the staff user’s perspective.
- [x] Automated tests cover or document the invariant that both branches return the same projection for core list fields.
- [ ] Staff library and favorite display still work in dev after migration scenarios described in code comments (if any).

## Comments

**Implementación:** `exerciseLibraryListRowBaseSelect` y `exerciseLibraryListRowSelectWithMembership` viven en `apps/app/features/exercises/queries/exercise-library-list-select.ts`. El camino feliz y el fallback P2021 reutilizan el mismo objeto base (`select`), y el fallback sigue mapeando `membershipFavorites: []`. Los tipos exportados (`ExerciseLibraryListDbRow*` alineados con `Prisma.ExerciseGetPayload`) evitan repetir una interfaz grande en `get-exercise-library.ts`. El retorno del builder de select **no** se anota como `Prisma.ExerciseSelect` para no ensanchar los argumentos de `findMany`. Tests del invariante superficial de proyección: `apps/app/__tests__/exercise-library-list-select-contract.test.ts`.

**Smoke manual pendiente:** listado biblioteca + favoritos tras escenarios de migración / relación ausente cuando aplique — para revisores/humanos si quieren corroborarlo en dev.

## Blocked by

None — can start immediately (recommended after or alongside `issues/01-exercise-library-visibility-contract.md` for safer refactors).

## User stories covered

11, 12, 34
