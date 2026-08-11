# Lote admin-ui-polish — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-11 · **Linear**: activo

## Grafo

```
JES-87 (avatars) ──soft──► JES-88 (cromos)
JES-89 (sidebar) ──independent──► (wave 1 parallel OK; implement one-by-one after plans)
```

Soft: JES-88 benefits from merging JES-87 tip before cromo layout so people avatars on cards inherit circular clip.

## Issues

| Issue | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|
| JES-87 | jesusgutierrezsiliceo/jes-87-… → `../worktrees/loadzone/jes-87` | — | PR abierta (#81) · review OK (0/0) |
| JES-88 | jesusgutierrezsiliceo/jes-88-… → `../worktrees/loadzone/jes-88` | soft: JES-87 | PR abierta (#82, stack 87) · review OK (0 high) |
| JES-89 | jesusgutierrezsiliceo/jes-89-… → `../worktrees/loadzone/jes-89` | — | PR abierta (#83) · review OK (0 high) |

## Notas

- Implement order requested: one by one → 87 → 88 (merge 87 tip) → 89.
- PRD: `.scratch/admin-ui-polish-2026-08-11/PRD.md`
