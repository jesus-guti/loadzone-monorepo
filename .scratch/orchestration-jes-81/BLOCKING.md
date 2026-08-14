# Lote jes-81 — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-10 · **Linear**: activo

Parent: [JES-81](https://linear.app/jesus-guti-workspace/issue/JES-81/primeros-pasos-recommended-setup-for-staff-first-run-guidance) — Primeros pasos (Recommended Setup). PRD: `.scratch/primeros-pasos-recommended-setup/PRD.md`.

## Grafo

```
JES-82 (resolver + tests)
  ├─► JES-83 (Club facts + sidebar panel)
  │     └─► JES-85 (reopen Settings → Club)
  └─► JES-84 (Wellness Operational Baseline empty states)
```

Wave 1: JES-82  
Wave 2 (tras tip de 82): JES-83 ∥ JES-84  
Wave 3 (tras tip de 83): JES-85

## Issues

| Issue | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|
| JES-82 | `jesusgutierrezsiliceo/jes-82-…` · `../worktrees/rely/jes-82` | — | PR abierta (#75) |
| JES-83 | `jesusgutierrezsiliceo/jes-83-…` · `../worktrees/rely/jes-83` | JES-82 | PR abierta (#78, base=82) · fix auto-hide `ecd7b5d` |
| JES-84 | `jesusgutierrezsiliceo/jes-84-…` · `../worktrees/rely/jes-84` | JES-82 | PR abierta (#77, base=82) |
| JES-85 | `jesusgutierrezsiliceo/jes-85-…` · `../worktrees/rely/jes-85` | JES-83 | PR abierta (#79, base=83) |

## Notas

- Sin cabecera `plan:`/`risk:` en Linear → clasificado como `plan:auto` (PRD + grill ya cerraron el dominio; planifica y reporta, no `direct`).
- Bloqueos blandos: al aterrizar JES-82, mergear tip en worktrees de 83/84; al aterrizar 83, mergear tip en 85.
- JES-81 es el epic padre; no tiene worktree de implementación.
- Stack PR: base de 83/84 = rama 82 (o `dev` si 82 ya merged); base de 85 = rama 83. Avisar riesgo de cierre de hijas si GitHub borra la rama padre.
- **2026-08-10** `jes-81: ok` cerró HITLs de 83–85 con recomendaciones (móvil offcanvas; Season/Exercise CTAs; restore/auto-hide). `jes-84: ok` reconfirmó 84.
