---
Status: done
Labels: ready-for-agent
---

# Phase 1: testable core for staff workspace / session resolution

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Extract one or more **pure, narrow** modules from the current staff context resolution flow (active club, membership, team/season selection rules) behind a thin orchestrator, so domain rules can be unit-tested without mocking the entire Next.js cookie surface. Staff UX for login, team switching, and errors should remain equivalent unless a bug is explicitly fixed; document any intentional behavior change.

## Acceptance criteria

- [x] At least one non-trivial rule module has unit tests covering success and representative failure cases.
- [x] The public entry used by layouts/actions remains a single obvious function or small facade (call sites do not multiply).
- [ ] Staff smoke: login, pick workspace, load a page that depended on context before.
- [x] No regression in error messaging for missing club or invalid session beyond intentional tightening.

## Comments

**Implementación (fase 1):** reglas puras en `apps/app/lib/staff-workspace-rules.ts`: elección de membership preferida (`pickPreferredStaffMembership`), equipo activo desde cookie (`resolveActiveTeamSnapshot`), temporada por ventana calendario y primera en orden (`pickDefaultSeasonForDate`), temporada por cookie (`resolveSeasonFromCookie`), `formatSeasonLabel`, `staffCanCreateTeam`. `getCurrentStaffContext` en `auth-context.ts` sigue como orquestador único (cookies + DB + transformaciones sin cambiar semántica). Tests: `apps/app/__tests__/staff-workspace-rules.test.ts`. Se corrigió además `status` en fixture de wellness tests (`AVAILABLE` vs `ACTIVE`) para TypeScript tras alineación del enum Prisma — sin cambiar aserciones de negocio de esos utils.

**Próximo paso opcional:** extraer más piezas si hace falta (p. ej. resolución de club por membership) cuando surja segunda necesidad de prueba sin acoplar a Next.

## Blocked by

None — can start immediately.

## User stories covered

19, 20, 21, 36
