# Inventory Pokémon Cards CSS techniques and GPL boundary

Type: research  
Status: resolved  
Blocked by:

## Question

What holographic, foil, and 3D-tilt techniques does the `pokemon-cards-css` reference actually use (rarity CSS modules, pointer variables, orientation, shine/glare), and what must LoadZone **not** copy given GPL-3 and Pokémon IP — so an inspired rewrite stays legally and technically clean?

## Answer

The reference splits **Svelte springs → CSS variables** (`--pointer-*`, `--rotate-*`, `--background-*`, `--card-opacity`) from **per-rarity shine/glare CSS**. Gyro maps deviceorientation into the same springs. Paint is blend-mode stacks plus grain/glitter and CDN Pokémon foil masks.

The tree is **GPL-3**. Copying CSS/Svelte or TCG foil bitmaps is out. An independent rewrite of the *ideas* (pointer/gyro-driven variables, 2–3 original recipes, original or CSS-only noise) is the clean path. `prefers-reduced-motion` is not handled in that repo.

Asset: [research-pokemon-cards-css.md](../research-pokemon-cards-css.md) ([Research Pokémon CSS](8c932ba6-4e74-4372-89d3-0ee64da521f6)).

## Comments

Resolved from research subagent output.
