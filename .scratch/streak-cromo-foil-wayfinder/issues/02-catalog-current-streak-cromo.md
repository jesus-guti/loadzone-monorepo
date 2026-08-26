# Catalog current Streak Cromo foil and check-in hooks

Type: research  
Status: resolved  
Blocked by:

## Question

How does today’s player **Streak Cromo** foil work (tiers, plate vs holo, ambient CSS, reduced motion), where does the card render (check-in vs racha sheet), and which hooks would pointer/gyro and a **CromoTier-up** celebration need to touch?

## Answer

Foil is **ambient CSS only**: plate on Bronce/Plata, looping holo from Oro up; reduced-motion kills the loop, not the static paint. Glossary still forbids pointer tracking.

The full card is **not** on PRE/POST forms. Compact header is the racha pill. The cromo lives in the **Racha sheet** overlay and on **today’s completion** screen (lab variant C also during questions).

Pointer/gyro would attach to `CromoFoilShell` / `.cromo-foil-frame`. There is **no CromoTier-up beat** yet; that would compare `streakCountToCromoTier` when streak persist runs after the last DailyEntry obligation.

Asset: [research-streak-cromo-current.md](../research-streak-cromo-current.md) ([Research Streak Cromo](f92965f1-0ebe-41c6-95a0-f26aa4d2572a)).

## Comments

Resolved from research subagent output.
