---
Status: ready-for-agent
Labels: ready-for-agent
---

# Phase 1: testable core for staff workspace / session resolution

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Extract one or more **pure, narrow** modules from the current staff context resolution flow (active club, membership, team/season selection rules) behind a thin orchestrator, so domain rules can be unit-tested without mocking the entire Next.js cookie surface. Staff UX for login, team switching, and errors should remain equivalent unless a bug is explicitly fixed; document any intentional behavior change.

## Acceptance criteria

- [ ] At least one non-trivial rule module has unit tests covering success and representative failure cases.
- [ ] The public entry used by layouts/actions remains a single obvious function or small facade (call sites do not multiply).
- [ ] Staff smoke: login, pick workspace, load a page that depended on context before.
- [ ] No regression in error messaging for missing club or invalid session beyond intentional tightening.

## Blocked by

None — can start immediately.

## User stories covered

19, 20, 21, 36
