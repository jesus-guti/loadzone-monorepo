# Lote injury-logging-wayfinder — grafo de bloqueos

**Base**: `dev` · **Fecha**: 2026-08-04 · **Linear**: activo

## Grafo

```
JES-29 research ✓
JES-31 body catalog ✓
JES-30 domain ✓ ──► JES-32 wellness ✓
         │
         ├──► JES-34 staff log proto ✓ ──► JES-35 history proto (next)
         │
JES-33 pain alert ✓ ──────────────────────► JES-36 synthesize (after 35)
```

## Issues

| Issue | Estado |
|---|---|
| JES-29 Research | done |
| JES-31 Body catalog | done |
| JES-30 Domain | done |
| JES-32 Wellness exemption | done (`JES-32: ok`) |
| JES-33 Self-report → pain alert | done (`JES-33: A → pain alert`) |
| JES-34 Staff log prototype | done (accepted) |
| JES-35 History body map | `jgutierrez/jes-35-injury-history-prototype` · `../worktrees/rely/jes-35` | JES-30 ✓, JES-34 ✓ | done (accepted + ?dev=1) |
| JES-36 Synthesize spec + backlog | `jgutierrez/jes-36-synthesize-injury-spec` · `../worktrees/rely/jes-36` | all ✓ | done (`JES-36: ok`) |

## Handoff

Map **closed**. Next: `/to-issues` on `.scratch/injury-logging-wayfinder/BACKLOG.md` → `/orchestrator`.

