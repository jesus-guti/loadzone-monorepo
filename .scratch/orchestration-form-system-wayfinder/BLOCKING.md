# Lote form-system-wayfinder — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-05 · **Linear**: activo  
**Modo**: AFK — `auto`/`assume` + HITL auto-aceptada por recomendación.

## Grafo

```
JES-64 research ──┐
                  ├──► JES-66 grilling ──┐
JES-65 research ──┤                      │
                  ├──► JES-67 grilling ──┤
                  ├──► JES-68 grilling ──┼──► JES-70 prototype ──► JES-71 SPEC
                  └──► JES-69 grilling ──┘
```

Parent map: JES-63 (destination = SPEC accepted).

## Issues

| Issue | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|
| JES-64 Catalog form surfaces | jgutierrez/jes-64-catalog-form-surfaces · ../worktrees/rely/jes-64 | — | PR abierta #59 |
| JES-65 Inventory DS fields | jgutierrez/jes-65-inventory-ds-rhf-gap · ../worktrees/rely/jes-65 | — | PR abierta #60 |
| JES-66 Form primitive home | jgutierrez/jes-66-form-primitive-home · ../worktrees/rely/jes-66 | JES-65 | PR abierta #62 |
| JES-67 Autosave + RHF | jgutierrez/jes-67-autosave-rhf-contract · ../worktrees/rely/jes-67 | JES-64, JES-65 | PR abierta #63 |
| JES-68 Validation ownership | jgutierrez/jes-68-validation-error-mapping · ../worktrees/rely/jes-68 | JES-64, JES-65 | PR abierta #64 |
| JES-69 Control vocabulary | jgutierrez/jes-69-control-vocabulary · ../worktrees/rely/jes-69 | JES-64, JES-65 | PR abierta #61 |
| JES-70 Prototype pilots | jgutierrez/jes-70-rhf-ds-pilots · ../worktrees/rely/jes-70 | JES-66..69 | PR abierta #65 |
| JES-71 Synthesize SPEC | jgutierrez/jes-71-form-system-spec · ../worktrees/rely/jes-71 | JES-66..70 | PR abierta #66 |

## Notas

- Lote AFK completo hasta PRs. Destination: `.scratch/form-system-wayfinder/SPEC.md`.
- Stacked risk: si al mergear una padre GitHub borra la rama head, las hijas pueden cerrarse — remedio en `git-runbook.md`.
- Worktrees montados hasta "Libera worktrees".
- Post-SPEC: `/to-issues` desde BACKLOG (migración no ejecutada en este mapa).
