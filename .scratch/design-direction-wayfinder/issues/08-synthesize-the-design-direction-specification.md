# Synthesize the design direction specification

Status: closed
Labels: wayfinder:task
Type: task
Parent: ../MAP.md
Assignee: orchestrator
Blocked by:
- ./01-define-admin-experience-principles.md
- ./02-define-player-age-bands-and-parental-supervision.md
- ./03-decide-shared-visual-language-and-app-divergence.md
- ./04-prototype-the-admin-data-surface.md
- ./05-prototype-the-player-check-in-and-reward-loop.md
- ./06-define-reminders-streaks-and-health-escalation.md
- ./07-define-design-system-governance-and-migration-boundary.md

## Question

With all prior decisions closed, assemble the implementation-ready specification and backlog that fulfill this map’s destination.

Deliverables (create as repo docs under this effort, linked from the resolution comment):

1. A single English specification covering admin principles, player age-adaptive experience, visual divergence, adherence rules, and governance/migration.
2. A backlog of independently grabbable implementation issues (tracer-bullet slices) ready for a later `/to-issues` or manual handoff — **do not** start implementing them here.
3. Proposed updates to `CONTEXT.md` glossary terms (if any) listed explicitly for a follow-up domain write.
4. Clear restatement of what remains deferred after this map closes.

This ticket is the map’s exit ramp: closing it (and updating **Decisions so far**) should leave no open decision tickets and allow `MAP.md` to close.

## Comments

### 2026-08-03 — Resolution (implementer)

Closed from locked planning map `.scratch/dd-08-synthesize/map.md` (human `DD-08: ok` — all auto/assume).

**Specification:** [SPEC.md](../SPEC.md)

**Implementation backlog:** [BACKLOG.md](../BACKLOG.md)

**Deliverables:**

1. SPEC synthesizes DD-01…07 (admin, age bands/Guardian configurable, sage + divergence, adherence, governance/ADR 0001, prototype soft accepts) with explicit rejects + deferred list + glossary proposals.
2. BACKLOG tracer waves 0–3 + adherence slices A1–A6 — Markdown only, no Linear create.
3. Glossary proposals live in SPEC §10 (W0d promotes to `CONTEXT.md` later — not edited here).
4. Deferred restated in SPEC §9; MAP fog cleared to deferred pointer.

Map exit complete — parent [MAP.md](../MAP.md) Status closed.
