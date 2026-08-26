# Gap: production Streak Cromo vs a TCG-like card

Type: research  
Status: resolved  
Blocked by:

## Question

In the current `StreakCromo` DOM, CSS, and surfaces (header pill vs Racha sheet vs completion), what is already a “card” and what is missing for a **physical TCG-like frame** plus **working pointer tilt** — facts only, no new design?

## Answer (facts gist)

**Already a card:** `StreakCromo` is a rounded rectangle (`width: min(100%, 16.5rem)`, `0.5rem` radius) with a **3px** plate/holo rim, tier-painted `.cromo-shell`, arched **photo crop** (`rounded-t-full`), name/position, ink seal, LOADZONE pill, Team name, crest. Full component mounts in the **Racha sheet** and **today’s completion**. Header pill is fire + count + photo disc — **not** a cromo.

**Missing vs ticket 08:** no thick TCG frame or inner arched **window** (arch is the photo’s radius inside `p-4`). Holo/plate shine is **full-bleed** (`inset-0` on frame/article), so the portrait is not matte. LOADZONE pill, rank seal, and dorsal have **no** foil layers (ink / photo stroke). Production foil kinds are still `plate | holo` only.

**Missing pointer tilt:** no `--pointer-*` / `rotateX/Y`, no pointer/gyro handlers on `CromoFoilShell`. Shine is `pointer-events-none`; motion is ambient CSS keyframes. Reduced motion kills holo **animation** only. Ticket 04 contract (full cromo only) is glossary/grill, not code.

Research: [research-production-cromo-vs-tcg.md](../research-production-cromo-vs-tcg.md)
