---
Status: ready-for-agent
Labels: ready-for-agent
---

# Contract tests for high-risk Exercise server actions

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Add integration-style tests for a small set of highest-risk staff server actions that mutate Exercises or favorites (public return shapes, authorization/scoping failures, and key persistence side effects), using the repo’s existing test stack patterns—not re-testing pure sort helpers. Scope stays limited to a handful of actions agreed during implementation to keep the slice reviewable.

## Acceptance criteria

- [ ] Each targeted action has tests for at least: happy path, unauthorized/out-of-scope id, and one validation failure where applicable.
- [ ] Tests exercise the action’s **public contract** (inputs/outputs), not private helpers.
- [ ] CI runs these tests with the same command family as other staff tests.
- [ ] Brief list in PR description of which actions are covered and which remain for follow-up.

## Blocked by

None — can start immediately (pairs well with `issues/01-exercise-library-visibility-contract.md` for scope rules).

## User stories covered

22, 23, 35, 38
