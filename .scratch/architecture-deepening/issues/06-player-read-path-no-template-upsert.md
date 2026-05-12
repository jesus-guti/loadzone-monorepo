---
Status: ready-for-agent
Labels: ready-for-agent
---

# Remove runtime base-form template ensure from Player token read path

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Relocate ensuring base form templates to a migration, deploy hook, or documented one-off job so the Player token check-in page does not perform global writes during read. Player flow remains correct: forms still resolve templates that exist in the environment. Coordinate with the database package split so callers use the right entry for bootstrap vs read-only use.

## Acceptance criteria

- [ ] Player token route no longer triggers template upsert on ordinary page load.
- [ ] Documented procedure (migration, script, or deploy step) ensures templates exist in fresh environments.
- [ ] Smoke: new environment following docs yields working player check-in without the old runtime ensure.
- [ ] No new logging or exposure of player tokens; compliance with existing sensitive-flow rules.

## Blocked by

- `issues/05-database-client-vs-bootstrap-split.md` (bootstrap must be addressable without pulling it into every consumer).

## User stories covered

17, 18, 29, 31
