# Judge holo and spark on Bezel A with a Racha tier control

Type: prototype  
Status: resolved  
Claimed by: me  
Blocked by: 03, 04

## Question

On the Racha-sheet Bezel A cromo, with a throwaway CromoTier switcher (not `?variant=`, not `prototype-cromo-foil`), do **holo** (Oro+) and **spark** (Diamante) still feel collectible with pointer tilt and foil only on chrome — or does either recipe wash the portrait / fail the tilt read?

## Answer

**Collectible.** Six judged recipes graduate to production (product names, not TCG rarities): Bronce plate (glare only), Plata plate (silver bands), Oro holo (gold burst), Platino holo (steel rainbow), Esmeralda holo (lattice), Diamante spark (nacre + iridescent oil). Portrait stays matte; sleeve glare may cross it. Labs deleted; `StreakCromo` is the only mount.

## Comments

**Course correction (2026-08-26):** Stop inventing plate/holo/spark on Bezel A before the TCG recipes feel right. Lab now judges **named rarity replicas** one at a time via `?rarity=` (first: `reverse-holo`). Inspired rewrite only — no GPL CSS / TCG bitmaps. When reverse-holo is a yes, add the next rarity (`cosmos-holo`, then `regular-holo`); map winners to CromoTiers only after that. Ticket body question stays; answer may record the rarity-first path.

**2026-08-26 later:** Reverse-holo judged collectible (tone jump on hover softened). Direction shift: **one rarity per CromoTier (6)**, not the prior plate/holo/spark trio. Lab ladder: reverse-holo→Bronce, shiny-rare→Plata, regular-holo→Oro, radiant-holo→Platino, cosmos-holo→Esmeralda, secret-rare→Diamante. Switcher cycles all six (`?rarity=`). Still throwaway — production `cromoFoilKind` unchanged until this map graduates the decision.

**2026-08-26 Esmeralda:** `?rarity=cosmos-holo` now judges a **radiant-style criss-cross** (inspired rewrite — original angles/period/hues, not GPL CSS). Jewel emerald plate + grain (no hex stamps), darker emerald bezel, lattice + iridescent wash on the mat only. Portrait stays matte.

**2026-08-26 Diamante:** `?rarity=secret-rare` now judges a **VSTAR-family** recipe (inspired rewrite — original 118° / 7.5% period / pastel oil hues, not GPL CSS). Whitish nacre bezel with oil ring, crystal-cut mat, diagonal pastel bands over texture. Drops production `--cromo-6-*` cyan. Portrait stays matte.

**2026-08-26 Diamante hall color:** Oil hues punched to magenta / gold / mint / cyan / violet / rose. Shine group uses `hard-light` (was `hue` on a pearl mat — washed chroma). Bezel ring `overlay`. Portrait still matte.

**2026-08-26 Platino:** Hex reverse dropped. `?rarity=trainer-gallery-holo` (alias `radiant-holo`) now judges a **Trainer Gallery–family** metallic iridescence (inspired rewrite — 34° / 6.25% period / steel-oil hues, not GPL CSS). Dark steel plate so color-dodge has room; large rainbow on the mat, hard-light radial at the pointer for shimmer. Portrait stays matte.
