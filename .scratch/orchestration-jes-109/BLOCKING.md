# Lote JES-109 — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-19 · **Linear**: activo

## Grafo

```
JES-109 (epic, plan:auto)  — planifica; no PR de código propio
        │
        ├── JES-110 Playing Position          [wave 1]
        ├── JES-111 Racha sheet shell         [wave 1]
        │         ├── JES-112 week row        [wave 2]
        │         └── JES-113 cromo identity  [wave 2]
```

Sin `bundle:` en las hijas. No se agrupan: JES-110 es `risk:low` y el resto `risk:med`; mezclarlas violaría la regla de bundle. JES-109 no se implementa como quinta PR: el trabajo de producto son las hijas.

## Unidades de entrega

| Unidad | Issues | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|---|
| JES-109 | JES-109 | jesusgutierrezsiliceo/jes-109-player-recoverable-streak-sheet-and-streak-cromo-identity · `../worktrees/loadzone/jes-109` | — | decisiones cerradas (sin PR) |
| JES-110 | JES-110 | jesusgutierrezsiliceo/jes-110-playing-position-on-player-and-streak-cromo · `../worktrees/loadzone/jes-110` | — | PR abierta (#88) |
| JES-111 | JES-111 | jesusgutierrezsiliceo/jes-111-player-header-streak-pill-opens-racha-sheet · `../worktrees/loadzone/jes-111` | — | PR abierta (#87) |
| JES-112 | JES-112 | jesusgutierrezsiliceo/jes-112-racha-sheet-week-row-and-team-session-banner · `../worktrees/loadzone/jes-112` | JES-111 (tip mergeado) | PR abierta (#89, base 111) |
| JES-113 | JES-113 | jesusgutierrezsiliceo/jes-113-streak-cromo-photo-club-crest-and-vivid-tiers · `../worktrees/loadzone/jes-113` | JES-111 (tip mergeado) | PR abierta (#90, base 111) |

## Notas

- Bloqueo blando: al aterrizar JES-111, mergear su tip en los worktrees de JES-112 y JES-113.
- JES-113 puede consumir Playing Position de JES-110 si ya está mergeado; no bloquea en 110.
- Stack: PRs de 112/113 con base la rama de 111. Si GitHub borra la rama head al mergear 111, reabrir hijas (git-runbook).
- Grill locked 2026-08-17/18; no reabrir copy/tiers/math de Recoverable Streak.
