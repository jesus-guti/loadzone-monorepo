# Map: Streak Cromo as a TCG-like card

Labels: `wayfinder:map`  
Tracker: local markdown (`.scratch/streak-cromo-tcg-card-wayfinder/`). Promote to Linear when MCP is available.

## Destination

**Shipped 2026-08-26.** Production **Streak Cromo** (Racha sheet + today’s check-in completion) reads as a physical trading card: Bezel A frame, working pointer tilt, foil only on chrome. Judged on the real card, never on DD-05.

## Notes

- Domain: player check-in. Glossary: **Streak Cromo**, **Recoverable Streak**. `CONTEXT.md`.
- Prior map (decisions kept, remaining tickets parked): `.scratch/streak-cromo-foil-wayfinder/`.
- Skills: `/grilling`, `/domain-modeling`, `/research`, `/prototype`. This map is **planning**.
- **Judge rule:** any prototype must mount the production `StreakCromo` on Racha or completion. Do **not** use `?variant=A|B|C` (that is DD-05, an invented form).
- Reference `pokemon-cards-css` is GPL-3: inspired rewrite only — no copied CSS, Svelte, grain/glitter, or TCG bitmaps.
- Language: map/tickets English; product UI Spanish.
- Children: `.scratch/streak-cromo-tcg-card-wayfinder/issues/`. Frontier = open, unblocked, unclaimed, lowest number first.

## Decisions so far

Imported from the prior map (do not re-grill unless this map invalidates them):

- [Inventory Pokémon Cards CSS techniques and GPL boundary](../streak-cromo-foil-wayfinder/issues/01-inventory-pokemon-cards-css.md) — Original CSS variables; do not copy GPL CSS or TCG foil bitmaps.
- [Catalog current Streak Cromo foil and check-in hooks](../streak-cromo-foil-wayfinder/issues/02-catalog-current-streak-cromo.md) — Ambient plate/holo; full cromo in Racha + completion; no pointer tilt in production today.
- [Map 2–3 foil recipes onto existing CromoTiers](../streak-cromo-foil-wayfinder/issues/03-map-foil-recipes-to-tiers.md) — plate / holo / spark on existing CromoTiers.
- [Decide pointer and gyro interaction contract](../streak-cromo-foil-wayfinder/issues/04-pointer-gyro-contract.md) — Pointer on full cromo; modest 3D; ambient until interact; gyro opt-in on Racha; reduced-motion static.
- [Decide cromo frame and foil regions](../streak-cromo-foil-wayfinder/issues/08-cromo-frame-and-foil-regions.md) — TCG-like frame; foil on frame + LOADZONE pill + rank seal + dorsal; portrait matte; name/team ink.
- [Decide CromoTier-up check-in choreography](../streak-cromo-foil-wayfinder/issues/05-tier-up-checkin-choreography.md) — Morph ≤300ms on today’s completion only.
- [Gap: production Streak Cromo vs a TCG-like card](issues/02-gap-production-cromo-vs-tcg-frame.md) — Rim + arched photo, full-bleed foil, no pointer tilt; header pill is not a cromo.
- [Pin how a human judges the Streak Cromo](issues/01-pin-judge-surface.md) — Seed Player `/[token]`, tap header racha pill, judge sheet cromo on desktop pointer; no `?variant=`; completion is not the judge surface.
- [Prototype TCG frame and working tilt on the real Streak Cromo](issues/03-prototype-real-cromo-frame-tilt.md) — Collectible; start from Bezel A; pointer 3D is the acceptance signal. Throwaway: `prototype-cromo-tcg` + `?cromo=` on Racha (not `?variant=`).
- [Choose the first production foil recipe](issues/04-first-production-foil-recipe.md) — Ship plate + holo + spark together as already mapped; spark is new Diamante code; holo/spark still need a Racha Bezel A judge pass.
- [Lock Bezel A proportions for production](issues/06-lock-bezel-a-proportions.md) — Keep throwaway: 0.85rem bezel, 0.28rem radius, 50%/42% arch. Production later kept the judged radii (`0.58rem` / `0.32rem`).
- [Judge holo and spark on Bezel A](issues/07-judge-holo-spark-bezel.md) — Collectible; six recipes graduate; labs deleted.
- [Assemble the in-place Streak Cromo build plan](issues/05-assemble-inplace-build-plan.md) — Shipped into `StreakCromo` + `streak-cromo.css` + `public/cromo/`. Gyro still later.

Live after judging Bezel A: rank seal is **ink**; **sleeve glare** (full-card beam) is not foil. Glossary: `CONTEXT.md` **Streak Cromo**.

## Not yet specified

- Low-end phone budget for blend stacks.
- Racha-sheet gyro opt-in (pointer tilt ships; gyro still later).
- Share / high-res export (in scope of product later; not this destination).

## Out of scope

- The DD-05 check-in lab (`prototype-dd-05`, `?variant=`) as the judge surface.
- The unused `prototype-cromo-foil` route as a substitute for the real card (delete or ignore; do not extend).
- Staff Wellness Tarjetas / admin cromos.
- Literal Pokémon art, rarity names, or TCG IP.
- Promoting foil into `@repo/design-system`.
- New CromoTiers beyond Bronce→Diamante.
- Porting `pokemon-cards-css` (GPL-3) into the monorepo.
