# Define design-system governance and migration boundary

Status: open
Labels: wayfinder:grilling
Type: grilling
Parent: ../MAP.md
Assignee:
Blocked by:
- ./03-decide-shared-visual-language-and-app-divergence.md
- ./04-prototype-the-admin-data-surface.md
- ./05-prototype-the-player-check-in-and-reward-loop.md

## Question

How do we govern components and migrate from today’s rules without inventing a heavy multi-kit bureaucracy?

Decide at least:

1. What stays in `@repo/design-system` (atoms/primitives) vs what must remain app-local until a second real consumer appears.
2. Promotion criteria that are **not** “used more than twice automatically.”
3. How admin-only utilities (`bevel-card`, `glass-surface`, etc.) and player-only patterns (`QuestionCard`, future PlayerCard) are documented and constrained.
4. Migration order: which rules files and screens move first after the spec lands; what is explicitly deferred.
5. How prototype learnings from [Prototype the admin data surface](./04-prototype-the-admin-data-surface.md) and [Prototype the player check-in and reward loop](./05-prototype-the-player-check-in-and-reward-loop.md) become rule text vs one-off experiments.

Reject inventing Figma board ceremony unless the human insists; prefer lightweight repo rules and ADRs only when hard to reverse.

## Comments
