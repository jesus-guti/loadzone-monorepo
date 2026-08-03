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

**prototype delivered for reaction; principles held as locked**

Throwaway artifact is ready for human visual reaction. No contradiction with [admin-experience-principles.md](../artifacts/admin-experience-principles.md) was found while building. Formal accept / reject / amend of principles remains a **human** step after viewing the prototype (pending human visual accept).

## Asset

- Prototype: [`.scratch/dd-04-admin-prototype/prototype/`](../../dd-04-admin-prototype/prototype/)
- Entry: [`index.html`](../../dd-04-admin-prototype/prototype/index.html)
- Run: see [`README.md`](../../dd-04-admin-prototype/prototype/README.md) — `cd .scratch/dd-04-admin-prototype/prototype && python3 -m http.server 8765`
- Planning map: [`.scratch/dd-04-admin-prototype/map.md`](../../dd-04-admin-prototype/map.md)

## Comments

- **2026-08-03 — Implementer:** Built single faithful composition (Spanish UI): desktop sidebar with locked primary IA (Wellness active) + Más secondary, team chrome `Juvenil A`, invisible Wellness roster list (toolbar underline / horizontal row rules / uppercase labels), exactly one risk callout card (“3 jugadores sin check-in hoy” → Ver pendientes) that does not wrap the list. Principles §2–§5 / §8 held; no doctrine contradiction noted. Human still needs to react to the artifact to formally accept/reject/amend principles — for orchestration this ticket closes with prototype delivered + principles unchanged pending that reaction.
