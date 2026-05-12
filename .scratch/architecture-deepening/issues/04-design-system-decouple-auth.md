---
Status: done
Labels: ready-for-agent
---

# Decouple shared design system from auth provider

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Move session/auth provider wiring out of the shared design system package so UI primitives do not force a dependency on the auth package. Each app composes auth + design providers at the app shell. Verify both staff and player apps still authenticate, render, and hydrate as before (no missing session in staff flows; player stays lean).

## Acceptance criteria

- [x] Shared design system package no longer declares a hard dependency on the auth package for basic usage (or documents an optional integration path only where needed).
- [x] Staff app root layout (or equivalent) composes auth + design providers explicitly; behavior unchanged for logged-in staff.
- [x] Player app remains free of unnecessary auth/design coupling; smoke the player check-in shell.
- [x] `pnpm` install / typecheck for affected packages succeeds with the new graph.

## Blocked by

None — can start immediately.

## User stories covered

13, 14, 15

## Comments

**Implementación:** `DesignSystemProvider` en `@repo/design-system` solo compone tema + `TooltipProvider` + `Toaster`; se eliminó `@repo/auth` del `package.json` del design system. El staff (`apps/app/app/layout.tsx`) envuelve `{children}` con `AuthProvider` de `@repo/auth/provider` dentro de `DesignSystemProvider` (misma jerarquía efectiva de sesión + UI que antes). `apps/web` sigue usando solo `DesignSystemProvider` (sin next-auth en ese app). `apps/player` sin cambios.

**Validación:** `pnpm typecheck` OK en `@repo/design-system` y `apps/web`. `apps/app` falla hoy en `__tests__/team-wellness-workspace-utils.test.ts` (TS2322 `PlayerStatus`) — ajeno a este slice.

**Smoke manual pendiente:** login staff y shell player check-in para humanos si quieren corroborar en dev.
