# Lote JES-72–77 — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-06 · **Linear**: activo

## Grafo

```
JES-72 (direct) ──────────────────────────── independent
JES-77 (direct) ──────────────────────────── independent (shell/sidebar)
JES-75 (auto)   ──────────────────────────── independent (shell loading)
JES-73 (auto)   ──soft──► JES-74 (auto)     Tabs chrome before Wellness summary
JES-76 (auto)   ──related JES-74──────────── parallel OK (cards/table vs summary)
```

## Issues

| Issue | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|
| JES-72 | jesusgutierrezsiliceo/jes-72-… · ../worktrees/rely/jes-72 | — | PR #69 · review OK |
| JES-73 | jesusgutierrezsiliceo/jes-73-… · ../worktrees/rely/jes-73 | — | PR #68 · review OK (0 hard Standards) |
| JES-74 | jesusgutierrezsiliceo/jes-74-… · ../worktrees/rely/jes-74 | JES-73 (stack en PR) | PR #70 · review OK |
| JES-75 | jesusgutierrezsiliceo/jes-75-… · ../worktrees/rely/jes-75 | JES-77 tip absorbido | PR #71 · hard fixed + 77 merged |
| JES-76 | jesusgutierrezsiliceo/jes-76-… · ../worktrees/rely/jes-76 | soft overlap JES-74 | PR #72 · review OK |
| JES-77 | jesusgutierrezsiliceo/jes-77-… · ../worktrees/rely/jes-77 | — | PR #67 · review OK (0 high) |

## Notas

- Usuario: asumir decisiones de grilling/wayfinder e implementar (sin gate HITL de revisión).
- Soft block 74←73: merge tip de 73 en worktree 74 antes de implementar 74 si hace falta.
- 74↔76 related en Linear; no bloqueo duro.
