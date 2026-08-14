# Lote player-mvp-ux — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-10 · **Linear**: activo

## Grafo

```
JES-78 (debounce + height anim) ──┐
JES-79 (slider thumb + affordance)─┼── independientes (relatedTo blando)
JES-80 (injury CTA under save) ───┘
```

Sin bloqueos duros. Wave 1 en paralelo.

## Issues

| Issue | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|
| JES-78 | `jesusgutierrezsiliceo/jes-78-…` → merge-queue | — | merged (#76) — debounce 500ms, motion deferred |
| JES-79 | `jesusgutierrezsiliceo/jes-79-…` → merge-queue | — | merged (#74) |
| JES-80 | `jesusgutierrezsiliceo/jes-80-…` → merge-queue | — | merged (#73) |

## Notas

- Temática común: Focus-frame check-in en `apps/player`.
- JES-80 es `plan:direct` → salta planificación.
- No stackear PRs; tres PRs independientes a `dev`.
