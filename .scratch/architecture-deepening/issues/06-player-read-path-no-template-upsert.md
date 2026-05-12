---
Status: done
Labels: ready-for-agent
---

# Remove runtime base-form template ensure from Player token read path

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Relocate ensuring base form templates to a migration, deploy hook, or documented one-off job so the Player token check-in page does not perform global writes during read. Player flow remains correct: forms still resolve templates that exist in the environment. Coordinate with the database package split so callers use the right entry for bootstrap vs read-only use.

## Acceptance criteria

- [x] Player token route no longer triggers template upsert on ordinary page load.
- [x] Documented procedure (migration, script, or deploy step) ensures templates exist in fresh environments.
- [ ] Smoke: new environment following docs yields working player check-in without the old runtime ensure.
- [x] No new logging or exposure of player tokens; compliance with existing sensitive-flow rules.

## Blocked by

- `issues/05-database-client-vs-bootstrap-split.md` (bootstrap must be addressable without pulling it into every consumer).

## User stories covered

17, 18, 29, 31

## Comments

**Implementación:** La página del jugador `apps/player/app/[token]/page.tsx` ya no llama `ensureBaseFormTemplates`. Las plantillas de sistema se insertan de forma idempotente con la migración `packages/database/prisma/migrations/20260512183000_seed_base_form_templates/migration.sql` (`ON CONFLICT` por `FormTemplate.code` y por `(templateId, key)` en preguntas). Definiciones alineadas con `bootstrap/base-form-templates.ts`; JSDoc en `bootstrap.ts` indica ejecutar migraciones (`prisma migrate deploy` sobre `packages/database/prisma/schema.prisma`) en entornos nuevos y que `ensureBaseFormTemplates*` sigue disponible para staff/bootstrap/reparaciones sin escribir en la ruta de lectura del token.

**Smoke manual pendiente revisores:** `migrate deploy` en DB limpia + flujo player check-in sin llamada runtime al ensure.

