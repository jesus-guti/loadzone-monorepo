# Prototype the admin data surface

Status: closed
Labels: wayfinder:prototype
Type: prototype
Parent: ../MAP.md
Assignee: implementer (dd-04)
Blocked by:
- ./01-define-admin-experience-principles.md

## Question

Does the approved admin experience feel right when applied to a concrete, throwaway prototype of the canonical staff data surface?

Build a low-fidelity prototype (via `/prototype`) that shows:

1. Persistent navigation consistent with the principles from [Define admin experience principles](./01-define-admin-experience-principles.md).
2. An invisible-surface table or row list (exercise-library / players style): horizontal rules, no enclosing box, uppercase column labels, toolbar with underline language.
3. At least one contrast case: a summary panel or risk state where a card **is** appropriate, so the boundary is visible.
4. Dense controls, restrained color for status only.

Link the prototype as an asset from this ticket. Resolve when the human accepts, rejects, or amends the principles based on reacting to the artifact — not when production code is shipped.

## Resolution

**layout rejected; amend = larger sidebar icons only (2026-08-03)**

Human viewed the throwaway and rejected it as a layout winner. **Keep production `apps/app` as it is now.** The only liked change from the prototype: **larger sidebar icons**. DD-01 principles remain doctrine (not reopened); do **not** clone the DD-04 HTML Wellness chrome. Full write-up: [resolutions/admin-data-surface-prototype.md](../resolutions/admin-data-surface-prototype.md).

## Asset

- Prototype: [`.scratch/dd-04-admin-prototype/prototype/`](../../dd-04-admin-prototype/prototype/) (historical evidence only)
- Reaction: [resolutions/admin-data-surface-prototype.md](../resolutions/admin-data-surface-prototype.md)

## Comments

- **2026-08-03 — Implementer:** Built single faithful composition… (see prior comment).
- **2026-08-03 — Human:** “DD-04 uy mal; solo me gustan los iconos más grandes del sidebar; el resto dejarlo como está ahora.” Recorded as reject + icon-size amend.
