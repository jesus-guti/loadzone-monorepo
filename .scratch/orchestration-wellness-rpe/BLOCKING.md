# Lote wellness-rpe — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-09-28 · **Linear**: activo (JES-125). Las otras dos unidades viven solo en `.scratch/` (el forge no las publicó en Linear).

## Grafo

```
quitar-riesgo  --bloquea (blando)-->  orden-tarjetas
jes-125        (independiente)
```

Aplazadas: wellness abre en hoy; formulario mínimo de crear Session (`plan:hitl`).

## Unidades de entrega

| Unidad | Issues | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|---|
| quitar-riesgo | `.scratch/wellness-drop-risk/issues/01-remove-riesgo.md` | jgutierrez/wellness-drop-risk | — | PR abierta (https://github.com/jesus-guti/loadzone-monorepo/pull/102) |
| orden-tarjetas | `.scratch/wellness-cards-by-severity/issues/01-order-tarjetas-by-severity.md` | jgutierrez/wellness-cards-by-severity | quitar-riesgo | PR abierta (https://github.com/jesus-guti/loadzone-monorepo/pull/103). Review: 0 duras / spec limpia |
| JES-125 | JES-125 | jesusgutierrezsiliceo/jes-125-rewrite-the-player-rpe-question-off-que-tan-duro-se-sintio | — | PR abierta (https://github.com/jesus-guti/loadzone-monorepo/pull/101) |

## Notas

- `plan:direct` en las tres: sin fase de planificación.
- El orden de tarjetas no usa `riskLevel`. Se implementa después de quitar Riesgo para no pisar el mismo módulo.
- Modelo de implementadores: `cursor-grok-4.6-low` (`cursor-grok-4.5-low` no está en la lista de esta sesión).
