---
Status: done
Labels: ready-for-agent
---

# Single source of truth for Exercise enums (server + staff UI)

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

One shared vocabulary for Exercise attribute enums (values, Zod or equivalent validation, and staff-facing labels) consumed by server actions and by staff UI filters/forms, so validation and UI cannot drift. End-to-end: staff can still create/edit/filter exercises using those attributes; errors remain clear if invalid payloads are sent.

## Acceptance criteria

- [x] Server validation and staff UI option lists read from the same module (no parallel `as const` lists for the same field).
- [x] Adding or renaming an allowed value requires updating that module and is reflected in both layers.
- [x] Automated test(s) cover at least one enum round-trip (valid payload accepted; invalid rejected with stable error shape).
- [ ] Manual smoke: exercise library filters and a create/edit flow still work for at least one attribute family touched by the change.

## Blocked by

None — can start immediately.

## User stories covered

6, 7, 8, 27

## Comments

**Implementación:** Vocabulario canónico en `apps/app/features/exercises/exercise-attribute-vocabulary.ts` (opciones `value` + etiquetas staff). Validación Zod en `exercise-form-schema.ts` con `enumValuesFromOptions` para que coincida con las mismas listas. `components/exercise-enums.ts` solo reexporta. Panel de sesiones usa `staffLabelForExerciseComplexity` en lugar de un `Record` duplicado. Tests: `__tests__/exercise-form-schema-contract.test.ts`.

**Smoke manual pendiente para humanos:** filtros de biblioteca + crear/editar ejercicio comprobando atributos (p. ej. complejidad).
