# Define design-system governance and migration boundary

Status: closed
Labels: wayfinder:grilling
Type: grilling
Parent: ../MAP.md
Assignee: orchestrator
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

### 2026-08-03 — Resolution (implementer)

Closed from locked planning map `.scratch/dd-07-ds-governance/map.md` (human `ok 7` — all auto/assume + HITL A/B/C as recommended).

**Artifact:** [artifacts/design-system-governance-and-migration.md](../artifacts/design-system-governance-and-migration.md)

**ADR (Wave 0):** [docs/adr/0001-design-system-package-boundary.md](../../../docs/adr/0001-design-system-package-boundary.md)

**Answers to Question bullets:**

1. **Package boundary:** `@repo/design-system` = app-agnostic primitives + infra only. Product composition, admin CSS utilities, and player check-in patterns stay app-local. No `components/admin` / `components/player` kits in DS.
2. **Promotion:** five intentional gates (app-agnostic; ≥2 real consumers with same API; token-driven; intentional PR; prefer registry primitives). Never use-count auto-promote.
3. **App-local docs:** constrain `bevel-card` / `glass-surface` (never on invisible list frames); player compositions under `apps/player`; document in `loadzone-design-system.mdc` App-local section at Wave 0 (after DD-08).
4. **Migration waves:** 0 rules (+ ADR shipped here) → 1 Wellness + check-in pilots → 2 on-touch hygiene → 3 decorative package quarantine. Rule-file diffs wait for DD-08.
5. **Prototype→rule:** locked doctrine → rules after DD-08; DD-04/05 layout winners stay backlog until human accept; throwaway prototype trees never enter DS.

**Rejects:** Figma ceremony, use-count auto-promote, admin/player kits in DS.
