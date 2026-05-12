---
Status: done
Labels: ready-for-agent
---

# Contract tests for high-risk Exercise server actions

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Add integration-style tests for a small set of highest-risk staff server actions that mutate Exercises or favorites (public return shapes, authorization/scoping failures, and key persistence side effects), using the repo's existing test stack patterns—not re-testing pure sort helpers. Scope stays limited to a handful of actions agreed during implementation to keep the slice reviewable.

## Acceptance criteria

- [x] Each targeted action has tests for at least: happy path, unauthorized/out-of-scope id, and one validation failure where applicable.
- [x] Tests exercise the action's **public contract** (inputs/outputs), not private helpers.
- [x] CI runs these tests with the same command family as other staff tests (`pnpm --filter app test`).
- [x] Brief list in PR description of which actions are covered and which remain for follow-up.

## Blocked by

None — can start immediately (pairs well with `issues/01-exercise-library-visibility-contract.md` for scope rules).

## User stories covered

22, 23, 35, 38

## Comments

**Implementación:** Vitest en `apps/app/__tests__/exercise-actions-contract.test.ts` con `vi.mock` de `getCurrentStaffContext`, cliente Prisma (`@repo/database`) y `revalidatePath` (mismo patrón que `register-route.test.ts`). Se cubren cuatro acciones públicas:

- `createExercise` — sin club, validación nombre corto, éxito con `clubId`/`createdByMembershipId` y `revalidatePath(/exercises)`.
- `updateExercise` — sin club, ejercicio no encontrado (findFirst vacío), validación sin `id`, éxito con `revalidatePath` en listado y ficha.
- `toggleExerciseFavorite` — sin club, ejercicio no en biblioteca, añadir favorito (`create`), quitar favorito (`delete`).
- `duplicateExercise` — sin club, origen ausente, éxito con nombre `(copia)` y nuevo id.

**Seguimiento (no incluidos en esta tanda):** `archiveExercise` (firma por excepción), `toggleExerciseVisibility` (rama permiso autor vs creador), error P2021 tabla favoritos; añadir cuando haga falta otro incremento sin inflar esta PR.

**Nota tipo PR:** acciones cubiertas arriba; pendientes opcionales listadas en seguimiento.
