# Assemble the in-place Streak Cromo build plan

Type: grilling  
Status: resolved  
Claimed by: me  
Blocked by: 07

## Question

What is the ordered in-place plan (production files only, no DD-05, motion budget, CromoTier-up hook, what stays ambient) so an implementer can change `StreakCromo` in `apps/player` without reopening foil/IP/scope or confusing labs?

## Answer

**Shipped 2026-08-26.** Production `StreakCromo` is Bezel A with pointer tilt and one foil recipe per CromoTier.

1. **Anatomy** — `apps/player/app/[token]/components/streak-cromo.tsx` + `streak-cromo.css`: thick bezel (`--cromo-bezel: 0.85rem`, Diamante `0.95rem`), outer radius `0.58rem`, inner mat `0.32rem`, arched window `50% / 42%`. Foil on chrome (frame, mat, LOADZONE chip, dorsal); portrait matte; rank seal ink; sleeve glare may cross the photo.
2. **Recipes (no TCG rarity names in product)** — `cromoFoilKind`: **plate** Bronce/Plata, **holo** Oro/Platino/Esmeralda, **spark** Diamante. Distinct paint per `data-streak-cromo-tier`. Textures under `apps/player/public/cromo/`. Inspired rewrite only.
3. **Motion** — `use-cromo-pointer-tilt.ts` on the full cromo (Racha + today’s completion). Modest 3D; ambient loop until pointer; `prefers-reduced-motion` static. **Gyro remains opt-in later** (not in this change).
4. **CromoTier-up** — existing completion morph contract in the glossary is unchanged; this change does not add a new celebration.
5. **Labs gone** — deleted `prototype-cromo-tcg` and `prototype-cromo-foil`. Racha always mounts production `StreakCromo`. No `?rarity=` / `?cromo=` switcher.
6. **Out of scope still** — share/export, staff Wellness cards, `@repo/design-system` promotion, new CromoTiers, GPL port.
