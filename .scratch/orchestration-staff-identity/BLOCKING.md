# Lote staff-identity — grafo de bloqueos

**Base**: dev · **Fecha**: 2026-08-31 · **Linear**: MCP offline (tickets locales `.scratch/staff-identity-invites/issues/`)

Clasificación (sin header forge; matriz de autonomía + handoff): no bundle — 01/03/04/05 no son `plan:direct`+`risk:low`. 02 es `direct`/`low` pero unidad propia (bloqueada por 01).

| Unidad | plan | risk |
|---|---|---|
| SI-01 | auto | med |
| SI-02 | direct | low |
| SI-03 | auto | med |
| SI-04 | auto | med |
| SI-05 | auto | med |

## Grafo

```
SI-01 (wave 1)
  ├─ SI-02
  ├─ SI-03 ── SI-05
  └─ SI-04
```

## Unidades de entrega

| Unidad | Issues | Rama / worktree | Bloqueada por | Estado |
|---|---|---|---|---|
| SI-01 | 01-staff-invitation-accept | `jgutierrez/si-01-staff-invitation` · `../worktrees/loadzone/si-01` | — | PR abierta https://github.com/jesus-guti/loadzone-monorepo/pull/93 |
| SI-02 | 02-close-public-staff-signup | `jgutierrez/si-02-close-staff-signup` · `../worktrees/loadzone/si-02` | SI-01 | PR abierta (stack #93) |
| SI-03 | 03-membership-revoke-and-roles | `jgutierrez/si-03-membership-revoke` · `../worktrees/loadzone/si-03` | SI-01 | PR abierta (stack #93) |
| SI-04 | 04-password-reset-and-change | `jgutierrez/si-04-password-reset` · `../worktrees/loadzone/si-04` | SI-01 | PR abierta (stack #93) |
| SI-05 | 05-super-admin-operator | `jgutierrez/si-05-super-admin` · `../worktrees/loadzone/si-05` | SI-03 | PR abierta (stack #95) |

## Notas

- Spec, ADR 0003, tickets y `CONTEXT.md` (glosario) copiados al worktree; no están en `origin/dev`. No mezclar WIP de injuries del checkout principal.
- Tras aterrizar SI-01, mergear su tip en SI-02/03/04 para stack. SI-05 mergea tip de SI-03.
- PRs stacked: si GitHub borra la rama padre al mergear, reabrir hijas (`git-runbook.md`).
- Hallazgo high SI-01 (acceptUrl): `dc380f7` en #93. Propagado a SI-02, SI-03, SI-04 y SI-05.
