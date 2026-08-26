# Map: Streak Cromo foil and check-in shine

Labels: `wayfinder:map`  
Tracker: local markdown (`.scratch/streak-cromo-foil-wayfinder/`)

**Superseded for remaining work.** Keep this file as the decision archive. Continue on [Streak Cromo as a TCG-like card](../streak-cromo-tcg-card-wayfinder/map.md).

## Destination

An **in-place implementation plan** for the player **Streak Cromo** and the check-in **CromoTier-up** beat: collectible foil/tilt that makes a longer **Recoverable Streak** feel worth it — ready to code in `apps/player`, not a staff kit and not a design-system promotion.

## Notes

- Domain: player check-in. Glossary: **Streak Cromo**, **Recoverable Streak**. Consult `CONTEXT.md`, `apps/player` cromo CSS, reference workspace `pokemon-cards-css`.
- Skills: `/grilling`, `/domain-modeling`, `/research`, `/prototype`. This map is **planning**; production foil lands after the destination plan exists.
- Charting preferences (human): pointer + gyro; **inspired rewrite** (2–3 recipes, no copy of GPL CSS / Pokémon textures); extra animation **only on tier-up**; surfaces = resting cromo + check-in.
- Language: map/tickets English; product UI Spanish.
- Children: `.scratch/streak-cromo-foil-wayfinder/issues/`. Frontier = open, unblocked, unclaimed, lowest number first.

## Decisions so far

- [Inventory Pokémon Cards CSS techniques and GPL boundary](issues/01-inventory-pokemon-cards-css.md) — Drive tilt/shine with original CSS variables; do not copy GPL CSS or TCG foil bitmaps ([research](research-pokemon-cards-css.md)).
- [Catalog current Streak Cromo foil and check-in hooks](issues/02-catalog-current-streak-cromo.md) — Ambient plate/holo today; full cromo in racha sheet + completion only; pointer on `CromoFoilShell`; no tier-up beat yet ([research](research-streak-cromo-current.md)).
- [Map 2–3 foil recipes onto existing CromoTiers](issues/03-map-foil-recipes-to-tiers.md) — plate (Bronce/Plata, two patterns), holo (Oro–Esmeralda, three patterns), spark (Diamante only).
- [Decide pointer and gyro interaction contract](issues/04-pointer-gyro-contract.md) — Full cromo (sheet + today’s completion): pointer default, modest 3D, ambient-until-interact; gyro opt-in on the Racha sheet; reduced-motion = static.
- [Decide cromo frame and foil regions](issues/08-cromo-frame-and-foil-regions.md) — TCG-like frame; foil on frame + LOADZONE pill + rank seal + dorsal; portrait matte; name/team ink.
- [Decide CromoTier-up check-in choreography](issues/05-tier-up-checkin-choreography.md) — Morph old→new ≤300ms on today’s completion; no material names; reduced-motion skips morph; Racha replays once in that visit.

## Not yet specified

- Visual specifics of the six patterns and exact frame proportions (prototype).
- Share / high-res export (not ruled out; not required for destination).
- Performance budget for blend-mode stacks on low-end phones.

## Out of scope

- Staff Wellness Tarjetas / admin cromos.
- Literal Pokémon art, rarity names, or TCG IP.
- Promoting foil into `@repo/design-system` in this effort.
- New material tiers beyond Bronce→Diamante.
- Porting `pokemon-cards-css` (GPL-3) or its grain/glitter assets into the monorepo.
