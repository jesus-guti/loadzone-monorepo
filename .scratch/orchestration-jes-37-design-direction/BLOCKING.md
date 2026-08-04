# Lote JES-37 design-direction implement — grafo de bloqueos

**Base**: `dev` · **Fecha**: 2026-08-04 · **Linear**: activo  
**Parent**: [JES-37](https://linear.app/jesus-guti-workspace/issue/JES-37/implement-loadzone-design-direction)  
**Spec**: `.scratch/design-direction-wayfinder/SPEC.md` · Backlog: `BACKLOG.md`

## Grafo

```
Wave 0 / fundacionales (sin bloqueo Linear)
  JES-38 doctrine ──────────────────────► JES-43 Age Band / Guardian settings
  JES-39 sidebar icons ─┐
  JES-40 quarantine DS  │ (independiente)
  JES-41 red-flag thresholds ──────────┐
  JES-42 Focus-frame check-in ─┬───────┼──► JES-44 audit pilots
                               │       │
                               ├──► JES-46 Season Recoverable Streak
                               │
                               JES-43 ─┬──► JES-45 Reminder Consent
                                       │         │
                                       │         ├──► JES-48 Anti-nag
                                       │         │
                                       └──┬──────┴──► JES-47 Care Alerts ──► JES-49 allow-list
                                          └── (+ JES-41)
```

## Issues

| Issue | Rama / worktree | Bloqueada por | plan | risk | Estado |
|---|---|---|---|---|---|
| JES-38 Doctrine rules + CONTEXT | `jgutierrez/jes-38-align-doctrine` · `../worktrees/rely/jes-38` | — | auto | bajo | esperando revisión |
| JES-39 Sidebar icons | `jgutierrez/jes-39-sidebar-icons` · `../worktrees/rely/jes-39` | — | direct | bajo | lista (sin planificador) |
| JES-40 Quarantine decorative DS | `jgutierrez/jes-40-quarantine-ds` · `../worktrees/rely/jes-40` | — | auto | bajo | planificando |
| JES-41 Red-flag thresholds | `jgutierrez/jes-41-red-flag-thresholds` · `../worktrees/rely/jes-41` | — | hitl | medio | planificando |
| JES-42 Focus-frame check-in | `jgutierrez/jes-42-focus-frame` · `../worktrees/rely/jes-42` | — | hitl | medio | planificando |
| JES-43 Age Band + Guardian policy | `jgutierrez/jes-43-age-band-policy` · `../worktrees/rely/jes-43` | JES-38 | hitl | alto | planificando |
| JES-44 Audit pilot surfaces | `jgutierrez/jes-44-audit-surfaces` · `../worktrees/rely/jes-44` | JES-39, JES-42, JES-43 | auto | bajo | planificando |
| JES-45 Reminder Consent × band | `jgutierrez/jes-45-reminder-consent` · `../worktrees/rely/jes-45` | JES-43 | hitl | alto | planificando |
| JES-46 Season Recoverable Streak | `jgutierrez/jes-46-recoverable-streak` · `../worktrees/rely/jes-46` | JES-42 | hitl | medio | planificando |
| JES-47 Care Alerts | `jgutierrez/jes-47-care-alerts` · `../worktrees/rely/jes-47` | JES-43, JES-45, JES-41 | hitl | alto | planificando |
| JES-48 Anti-nag bounds | `jgutierrez/jes-48-anti-nag` · `../worktrees/rely/jes-48` | JES-45 | auto | medio | planificando |
| JES-49 Care-slice allow-list | `jgutierrez/jes-49-care-allow-list` · `../worktrees/rely/jes-49` | JES-47 | hitl | alto | planificando |

## Rutas (sin cabecera `plan:`/`risk:` en Linear — clasificado por autonomy-matrix)

- **direct**: JES-39 (cambio único ya aceptado en DD-04).
- **auto**: JES-38, JES-40, JES-44, JES-48 (aplicar doctrina/SPEC ya cerrada; higiene acotada).
- **hitl**: JES-41–43, JES-45–47, JES-49 (producto, política, consentimiento, o contrato de visibilidad).

## Notas

- Soft-merge: tips de padres (38→43, 42→46, …) se pueden fusionar en worktrees hijos antes del merge a `dev`.
- JES-37 es el epic padre; no se implementa como issue única.
- No reabrir locks del wayfinder (DD-04 layout rechazado; Focus A; Age Band configurable; no Guardian portal).
