---
Status: ready-for-agent
Labels: ready-for-agent
---

# Single source of truth for Exercise enums (server + staff UI)

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

One shared vocabulary for Exercise attribute enums (values, Zod or equivalent validation, and staff-facing labels) consumed by server actions and by staff UI filters/forms, so validation and UI cannot drift. End-to-end: staff can still create/edit/filter exercises using those attributes; errors remain clear if invalid payloads are sent.

## Acceptance criteria

- [ ] Server validation and staff UI option lists read from the same module (no parallel `as const` lists for the same field).
- [ ] Adding or renaming an allowed value requires updating that module and is reflected in both layers.
- [ ] Automated test(s) cover at least one enum round-trip (valid payload accepted; invalid rejected with stable error shape).
- [ ] Manual smoke: exercise library filters and a create/edit flow still work for at least one attribute family touched by the change.

## Blocked by

None — can start immediately.

## User stories covered

6, 7, 8, 27
