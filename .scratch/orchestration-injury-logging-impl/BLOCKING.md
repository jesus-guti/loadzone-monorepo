# Lote injury-logging-impl — grafo de bloqueos

**Base**: `dev` · **Fecha**: 2026-08-04 · **Linear**: activo  
**Origen**: [JES-28 Injury logging wayfinder](https://linear.app/jesus-guti-workspace/issue/JES-28) (mapa cerrado) · SPEC + BACKLOG en `.scratch/injury-logging-wayfinder/`

## Grafo

```
JES-50 schema/catalog/status ──► JES-51 staff log/close/edit
         │                              │
         ├──► JES-52 team /injuries     └──► JES-55 history map
         ├──► JES-53 wellness exemption
         └──► JES-54 pain alert + promote
```

Wave 1: JES-50 ✓ · Wave 2: 51–54 ✓ tips · Wave 3: JES-55 (JES-51 tip soft-merged)

## Issues

| Issue | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|
| JES-50 Schema Injury + BodyRegion + Pain Alert | `jgutierrez/jes-50-schema-injury` · PR [#46](https://github.com/jesus-guti/loadzone-monorepo/pull/46) | — | PR abierta · review ✓ merge-ready |
| JES-51 Staff profile log + close/edit/reopen | `jgutierrez/jes-51-staff-injury-log` · PR [#50](https://github.com/jesus-guti/loadzone-monorepo/pull/50) | JES-50 tip ✓ | PR abierta · HIGH fixed (`8fceb79`) · review ✓ |
| JES-52 Team `/injuries` list | `jgutierrez/jes-52-team-injuries-list` · PR [#47](https://github.com/jesus-guti/loadzone-monorepo/pull/47) | JES-50 tip ✓ | PR abierta · review ✓ (0 high) |
| JES-53 Wellness exemption | `jgutierrez/jes-53-wellness-exemption` · PR [#49](https://github.com/jesus-guti/loadzone-monorepo/pull/49) | JES-50 tip ✓ | PR abierta · review ✓ (0 high) |
| JES-54 Pain Alert + promote | `jgutierrez/jes-54-pain-alert-promote` · PR [#48](https://github.com/jesus-guti/loadzone-monorepo/pull/48) | JES-50 tip ✓ | PR abierta · review ✓ (0 high; medium: ES copy / Button) |
| JES-55 Profile injury history map | `jgutierrez/jes-55-injury-history-map` · PR [#51](https://github.com/jesus-guti/loadzone-monorepo/pull/51) | JES-51 tip ✓ | PR abierta · review ✓ · soft-merged HIGH fix (`427dfa3`) |

## Notas

- Soft-merge: JES-50 → 51–54; JES-51 → 55 (done).
- Stack: children base on `jgutierrez/jes-50-schema-injury` until #46 → `dev`. After #46 merges, retarget 47–50 (and 55) to `dev` or keep stack on 51 for #55.
- User oks 2026-08-04: JES-50…JES-55 todos aceptados.
