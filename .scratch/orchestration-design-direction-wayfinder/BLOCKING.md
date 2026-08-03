# Lote design-direction-wayfinder — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-03 · **Linear**: local `.scratch` tracker (no SIA)

## Grafo

```
01 admin principles ──────────────┬──► 03 visual language ──┐
                                  │                         │
02 age bands / parents ──┬──► 03 ─┘                         ├──► 07 governance ──► 08 synthesize
                         ├──► 05 player prototype ──────────┤
                         └──► 06 reminders / streaks ───────┘
01 ─────────────────────► 04 admin prototype ───────────────┘
```

## Issues

| Issue | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|
| DD-01 Define admin experience principles | `jgutierrez/dd-01-admin-experience-principles` · `../worktrees/rely/dd-01` | — | done (`e07d0ed`) |
| DD-02 Define player age bands and parental supervision | `jgutierrez/dd-02-player-age-bands` · `../worktrees/rely/dd-02` | — | done (`36cb873`) |
| DD-03 Decide shared visual language and app divergence | `jgutierrez/dd-03-visual-language` · `../worktrees/rely/dd-03` | DD-01, DD-02 | done (`5f17001`) |
| DD-04 Prototype the admin data surface | `jgutierrez/dd-04-admin-data-prototype` · `../worktrees/rely/dd-04` | DD-01 | done (`f2f4c65`) |
| DD-05 Prototype the player check-in and reward loop | `jgutierrez/dd-05-player-checkin-prototype` · `../worktrees/rely/dd-05` | DD-02 | done (`59b55ab`) |
| DD-06 Define reminders, streaks, and health escalation | `jgutierrez/dd-06-reminders-streaks` · `../worktrees/rely/dd-06` | DD-02 | done (`52b2629`) |
| DD-07 Define design-system governance and migration boundary | `jgutierrez/dd-07-ds-governance` · `../worktrees/rely/dd-07` | DD-03, DD-04, DD-05 | done |
| DD-08 Synthesize the design direction specification | `jgutierrez/dd-08-synthesize-spec` · `../worktrees/rely/dd-08` | DD-01…DD-07 | done (SPEC + BACKLOG; MAP closed) |

## Rutas de planificación

| Issue | Tipo | plan | risk | Notas |
|---|---|---|---|---|
| DD-01 | grilling | hitl | medio | cerrado |
| DD-02 | grilling | hitl | alto | cerrado |
| DD-03 | grilling | hitl | medio | Design system transversal |
| DD-04 | prototype | auto | bajo | Plan de prototipo; reacción humana al cerrar |
| DD-05 | prototype | auto | medio | Depende de bandas de edad |
| DD-06 | grilling | hitl | alto | Adherencia + escalado de salud |
| DD-07 | grilling | hitl | medio | Gobernanza DS / migración |
| DD-08 | task | auto | bajo | Síntesis tras cerrar el resto |

## Notas

- Destino del mapa: **spec + backlog**, no código de producto.
- Frontera wave 2: **DD-03, DD-04, DD-05, DD-06**.
- Soft-merge: tips de DD-01/DD-02 fusionados en worktrees hijos; MAP canónico unificado en main `.scratch`.
- Sin IDs Linear; ids locales `DD-NN`.
