---
Status: ready-for-agent
Labels: ready-for-agent
---

# Decouple shared design system from auth provider

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Move session/auth provider wiring out of the shared design system package so UI primitives do not force a dependency on the auth package. Each app composes auth + design providers at the app shell. Verify both staff and player apps still authenticate, render, and hydrate as before (no missing session in staff flows; player stays lean).

## Acceptance criteria

- [ ] Shared design system package no longer declares a hard dependency on the auth package for basic usage (or documents an optional integration path only where needed).
- [ ] Staff app root layout (or equivalent) composes auth + design providers explicitly; behavior unchanged for logged-in staff.
- [ ] Player app remains free of unnecessary auth/design coupling; smoke the player check-in shell.
- [ ] `pnpm` install / typecheck for affected packages succeeds with the new graph.

## Blocked by

None — can start immediately.

## User stories covered

13, 14, 15
