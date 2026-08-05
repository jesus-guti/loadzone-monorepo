# JES-71 — Synthesize the Form System SPEC

**Ticket:** [Synthesize the Form System SPEC](https://linear.app/jesus-guti-workspace/issue/JES-71/synthesize-the-form-system-spec)  
**Parent:** [JES-63](https://linear.app/jesus-guti-workspace/issue/JES-63/form-system-rhf-design-system-controls)  
**Mode:** AFK full pipeline — SPEC auto-accepted as destination artifact  
**Branch:** `jgutierrez/jes-71-form-system-spec`  
**Worktree:** `/Users/jesus-guti/Code/personal/worktrees/rely/jes-71`

## Question

What is the Form System SPEC that clears the way to `/to-issues`?

## Decisions

| # | Level | Decision |
|---|---|---|
| 1 | auto | Single English SPEC at `.scratch/form-system-wayfinder/SPEC.md` distilling JES-64–70 + JES-58; law sections, not inventory restatements |
| 2 | auto | MAP.md indexes tickets/resolutions; destination = SPEC accepted (not migration) |
| 3 | auto | Incorporate JES-70 clarifications: Select empty sentinel, FormControl on leaf, typed `mapFormActionResultToRhf`, preferred RHF import path from DS form module |
| 4 | auto | Fog stays fog: lint/CI, migration wave order, player-local adapters; no dedicated Form ADR (JES-66) |
| 5 | assume | BACKLOG.md clusters are **suggestions** for `/to-issues`, not binding wave law — revert by editing BACKLOG only |
| 6 | auto | SPEC-focused commit; prototype may remain via stacked ancestry (do not delete throwaway) |
| 7 | hitl→accepted | AFK: accept SPEC as map exit without human wait |

## Deliverables

- [SPEC.md](../form-system-wayfinder/SPEC.md)
- [MAP.md](../form-system-wayfinder/MAP.md)
- [BACKLOG.md](../form-system-wayfinder/BACKLOG.md)

## Non-goals

- Product form migration
- Deleting `/prototype/form-system`
- Opening new doctrine beyond locked resolutions
