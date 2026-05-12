---
Status: done
Labels: ready-for-agent
---

# Link architecture deepening doc to PRD and issue index

## Parent

[PRD: LoadZone architecture deepening](../PRD.md)

## What to build

Update the architecture deepening narrative so readers can jump from prose recommendations to this PRD and numbered issues (and optionally note where the Exercise library visibility rule lives conceptually). Pure documentation/traceability slice—no runtime behavior change.

## Acceptance criteria

- [x] Architecture deepening document references the PRD path and the `.scratch/architecture-deepening/issues/` index or list.
- [x] PRD or issue folder has a one-line “how to pick up work” note for agents/humans.
- [x] Optional glossary nudge: if `CONTEXT.md` does not exist, do not create a full file unless this slice explicitly adds one or two load-bearing terms per project convention.

## Comments

**Implementación:** `docs/architecture/deepening-opportunities.md` enlaza al PRD, al `issues/README.md` y señala código + tests de visibilidad de biblioteca; el PRD enlaza la nota de profundización y añade “How to pick up work”; este README incluye la línea en español para retomar trabajo. Ya existe `CONTEXT.md` en la raíz; no se creó glosario nuevo en este slice.

## Blocked by

None — can start immediately.

## User stories covered

24, 25, 26, 32, 33, 39, 40
