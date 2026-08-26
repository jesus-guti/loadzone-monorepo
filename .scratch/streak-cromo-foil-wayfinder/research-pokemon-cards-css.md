# Research: `pokemon-cards-css` holographic techniques (primary sources only)

**Question:** What holographic / foil / 3D techniques does this project use, how are rarity types structured, and what legal/technical constraints apply if LoadZone rewrites an inspired player Streak Cromo (GPL-3 — we will **not** copy CSS or Pokémon textures into LoadZone)?

**Local tree:** `/Users/jesus-guti/Code/external/pokemon-cards-css`  
**Author / LICENSE:** Simon Goellner (`@simeydotme`), GNU GPL v3, 29 June 2007 (`LICENSE`).  
**Stack:** Vite 3 + Svelte 3 (`package.json`). Demo described in `README.md` as CSS Transforms, Gradients, Blend-modes and Filters simulating Sword & Shield–era holofoil.

This note is **facts from that repo**. It is not LoadZone implementation.

---

## 1. Architecture (interaction vs paint)

The project splits **motion/state** (Svelte) from **foil recipes** (CSS modules).

- **Svelte** writes CSS custom properties on `.card` from springs (`src/lib/components/Card.svelte`).
- **CSS** reads those variables on `.card__rotator`, `.card__shine`, `.card__glare` (`public/css/cards/base.css`, rarity files).
- **Rarity** is a `data-rarity` string (lowercased in `Card.svelte`). Extra flags: `data-subtypes`, `data-supertype`, `data-trainer-gallery`, `data-set`, `data-number`, class `.masked`.
- **Foil/mask bitmaps** are not in the CSS repo’s committed `public/img` (`.gitignore` ignores `public/img/foils/`). URLs are built in `CardProxy.svelte` from `VITE_CDN` plus set/number/etch/style. Fallback textures are local paths like `/img/grain.webp`, `/img/glitter.png`, `/img/illusion.png`.

`App.svelte` states the contract: Svelte assigns CSS custom properties which drive effects and 3D transforms.

---

## 2. Pointer CSS variables

Set on the card `style` from Svelte springs (`Card.svelte` `dynamicStyles` / `:root` defaults in the component `<style>`).

| Variable | Source | Role |
| --- | --- | --- |
| `--pointer-x`, `--pointer-y` | `$springGlare.x/y` as `%` | Cursor (or gyro-mapped) position; glare radial centre; many shine gradients use `at var(--pointer-x) var(--pointer-y)` |
| `--pointer-from-center` | Distance of glare xy from 50,50, clamped 0–1 | Intensity of filters/opacity as the “light” leaves the card centre |
| `--pointer-from-top`, `--pointer-from-left` | glare y/100, x/100 | Cosmos/glitter background-position, secret-rare shift |
| `--card-opacity` | `$springGlare.o` | Shine/glare layer opacity (0 idle → 1 interacting) |
| `--rotate-x`, `--rotate-y` | rotate spring + popover delta | `rotateY` / `rotateX` on `.card__rotator` (**note:** `--rotate-x` drives `rotateY`, `--rotate-y` drives `rotateX`) |
| `--background-x`, `--background-y` | `$springBackground` | Holo gradient `background-position` (narrower range than pointer: mouse maps to ~37–63% / 33–67%) |
| `--card-scale`, `--translate-x`, `--translate-y` | popover springs | Scale + translate for “active” card |
| `--seedx`, `--seedy`, `--cosmosbg` | per-card random | Cosmos sheet offset |
| `--mask`, `--foil` | set after image load if mask/foil URLs exist | `mask-image` / foil `url()` in shine stacks |

Pointer math (`interact` in `Card.svelte`):

- Percent of pointer in card rect, clamped 0–100 (`src/lib/helpers/Math.js`: `clamp`, `round`, `adjust`).
- Rotate: `x: -(center.x / 3.5)`, `y: center.y / 3.5` (degrees).
- Background: `adjust(percent, 0, 100, 37, 63)` / `(33, 67)`.
- Glare: percent xy, `o: 1`. Updates coalesced with `requestAnimationFrame`.
- End: springs snap to rotate 0, glare 50/50/`o: 0`, background 50/50 (soft, delayed).

**Non-JS hover fallback** (`.card:not(.interactive):hover` in `base.css`): hardcoded pointer/rotate/scale/opacity so CSS-only demos still tilt.

**README hover-tilt:** `README.md` points to a **separate** repo `https://github.com/simeydotme/hover-tilt` as a component “without much effort” — not vendored in this tree.

---

## 3. Tilt / orientation / 3D

### Device orientation (`src/lib/stores/orientation.js`)

- `readable` store from `window` `deviceorientation`.
- First event sets `baseOrientation`; later events expose `relative` = current − base (`alpha`, `beta`, `gamma`).
- `resetBaseOrientation()` is called when a card is **activated** (`Card.svelte` `activate`).

### Gyro → springs (`orientate` in `Card.svelte`)

Runs only while this card is `$activeCard`. Maps `relative.gamma` → x, `relative.beta` → y, clamped ±16° / ±18°. Same `updateSprings` as pointer: background 37–63 / 33–67, rotate `(-x, y)`, glare 0–100, `o: 1`.

### 3D CSS (`public/css/cards/base.css`)

- `perspective: 600px` on translater/rotator.
- `transform-style: preserve-3d`; `translate3d(..., 0.01px)` for a compositing layer.
- `.card__translater`: `translate3d(var(--translate-x), var(--translate-y), var(--translate-z)) scale(var(--card-scale))` with `--translate-z: calc(var(--card-scale) * 150px + 0.01px)`.
- `.card__rotator`: `rotateY(var(--rotate-x)) rotateX(var(--rotate-y))`.
- Flip: `.card__back` `rotateY(180deg)`; loading state shows back at `rotateY(0)`. Front `backface-visibility: hidden`.
- Shine/glare stacked with `translateZ(1px)` / `1.2px` / `1.41px`.
- Active card: extra glow `box-shadow` using `--card-glow` (type-tinted) and `--card-edge`.
- Showcase loop (`onMount`): sine/cosine rotate and glare for ~4s.

`src/lib/stores/activeCard.js`: one writable; other cards ignore pointer while another is active.

---

## 4. Shine / glare layers and blend modes

**DOM** (`Card.svelte`): front image, then empty `.card__shine`, then `.card__glare`. Pseudo-elements `:before` / `:after` on those layers carry extra stacks.

**Base shine** (`base.css`):

- `filter: brightness(.85) contrast(2.75) saturate(.65)`
- `mix-blend-mode: color-dodge`
- `opacity: var(--card-opacity)`
- Sunpillar HSL palette (`--sunpillar-1`…`6`) rotated on `:before` / `:after`

**Base glare:**

- `radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y), … white → black)`
- `mix-blend-mode: overlay`
- Same `--card-opacity`

**Masking:** `.card.masked` applies `mask-image: var(--mask)` to shine and its pseudos. Reverse/holo/cosmos glare `:after` uses `--clip` / `--clip-stage` / `--clip-trainer` from `public/css/cards.css` (Pokémon card window geometry).

Rarity files **override** `background-image`, `background-blend-mode`, `mix-blend-mode`, `filter`, and sometimes glare. Common blend modes in this tree: `color-dodge`, `color-burn`, `overlay`, `hard-light`, `soft-light`, `exclusion`, `hue`, `luminosity`, `multiply`, `screen`, `lighten`, `darken`, `difference`.

`cards.css` also sets `will-change` on shine/glare for transform, opacity, backgrounds, blend-mode, filter.

---

## 5. Grain / glitter / foil assets

Defined on `.card` in `public/css/cards.css`:

- `--grain: url("/img/grain.webp")`
- `--glitter: url("/img/glitter.png")`
- `--glittersize: 25%`

**Used as CSS layers (not Pokémon card scans):**

- Grain: e.g. V regular shine (`public/css/cards/v-regular.css`).
- Glitter (often doubled, opposite positions): amazing rare, secret rare, rainbow, rainbow-alt, shiny vmax, radiant `:before`, trainer-gallery secret, swsh-pikachu secret.

**CDN foils/masks** (`CardProxy.svelte` `foilMaskImage`):  
`{VITE_CDN}/foils/{set}/{masks|foils}/upscaled/{number}_foil_{etch}_{style}_2x.webp`  
`etch` ∈ `holo` | `etched`; `style` ∈ `reverse`, `swholo`, `cosmos`, `radiantholo`, `sunpillar`, `swsecret`, `rainbow`, plus promo overrides from `promos.json`.

**Local fallbacks when not `.masked`:** e.g. `--foil: url("/img/illusion.png")`, `illusion-mask.png`, `geometric.png`, `trainerbg.png`, `vmaxbg.jpg`, `cosmos-bottom.png` (and `cosmos-*.png` in cosmos-holo).

`public/img_scrape.sh` fetches foil/mask trees from JSON (Pokémon TCG image pipeline). `public/foils.txt` is a pokemontcg.io API query.

**README attribution (third-party art, not GPL grant of Pokémon IP):** Galaxy Holo from aschefield101 DeviantArt; some backgrounds from Vecteezy.

Those raster files are **not** in the glob of this checkout (gitignored / not committed). LoadZone must not import them.

---

## 6. Inventory: `public/css/cards/`

Loaded in this order from `index.html`:

| File | Primary `data-rarity` / selectors | Technique (author + CSS) |
| --- | --- | --- |
| `base.css` | All cards | 3D, springs vars, default shine/glare, type glow, clip for holo/reverse/cosmos |
| `../cards.css` | `.card` tokens | grain, glitter, clip polygons, will-change |
| `basic.css` | (almost empty; common/uncommon) | Glare-only per `App.svelte` |
| `reverse-holo.css` | `[data-rarity$="reverse holo"]` | Foil+mask, clipped glare, `--foil-brightness` by type |
| `regular-holo.css` | `rare holo` | Vertical rainbow + scanlines + bar gradients; `clip-path`; bg-position from `--background-*` |
| `cosmos-holo.css` | `rare holo cosmos` | Galaxy PNG + rainbow repeating-linear + color-burn/multiply; `--cosmosbg` |
| `amazing-rare.css` | `amazing rare` | Glitter + foil; lighten; mask |
| `radiant-holo.css` | `radiant rare` | Criss-cross linear gradients; foil; glitter `:before` |
| `v-regular.css` | `rare holo v`, `v-union` | Diagonal “sunpillar” repeating gradients + grain; color-dodge |
| `v-full-art.css` | `rare ultra` Pokémon/supporter; TG `rare holo v` | Same family + extra foil/exclusion texture |
| `v-max.css` | `rare holo vmax` | Larger slower gradient; `vmaxbg.jpg` fallback |
| `v-star.css` | `rare holo vstar` | Diagonal + texture, pastel/brighter filters |
| `trainer-full-art.css` | `rare ultra` + supporter | Texture foil; screen/multiply glare |
| `rainbow-holo.css` | `rare rainbow` | Glitter + pastel gradients; color-burn/hard-light |
| `rainbow-alt.css` | `rare rainbow alt`; TG vmax | Glitter sandwich; also used by TG vmax file |
| `secret-rare.css` | `rare secret` | Dual glitter sliding opposite; masked foil vs glitter |
| `trainer-gallery-holo.css` | TG `rare holo` | Metallic: color-dodge linear + hard-light radial at pointer |
| `trainer-gallery-v-regular.css` | TG `rare holo v` | Glare tweak; shine inherited from `v-full-art.css` (file comment) |
| `trainer-gallery-v-max.css` | TG `rare holo vmax` | Glare tweak; shine inherited from `rainbow-alt.css` |
| `trainer-gallery-secret-rare.css` | TG `rare secret` | Gold/glitter variant |
| `shiny-rare.css` | `rare shiny` | Silver foil + radials; Firefox called out in `App.svelte` |
| `shiny-v.css` | `rare shiny v` | Sunpillar + foil (ultra rare shiny) |
| `shiny-vmax.css` | `rare shiny vmax` | Glitter + foil; `swsecret` etch in proxy |
| `swsh-pikachu.css` | `rare secret` + set `swsh12pt5` + number `160` | One-card special glitter/foil |

**Rarity string pipeline (`CardProxy.svelte`):** API rarity can be rewritten — Reverse Holo suffix; Trainer Gallery prefix stripped; promo SWSH076/077 → Rare Secret; shiny numbers `sv*` → Rare Shiny V / VMAX; alt-art VMAX → Rare Rainbow Alt. `Card.svelte` lowercases before `data-rarity`. Trainer Gallery also `data-trainer-gallery="true"` if number matches `/^[tg]g/i` or those two promo ids.

---

## 7. Legal / technical constraints for an independent LoadZone rewrite

### GPL-3 (`LICENSE`)

- The Program is copyrighted software licensed **GPL-3**. A **modified version** or work **based on** the Program must be licensed **as a whole** under GPL-3 if conveyed (GPL §0, §5).
- **Copying** CSS, Svelte, JS helpers, clip-path polygons, or asset URLs into LoadZone would be modification/adaptation requiring copyright permission — which GPL only grants if LoadZone (or that combined work) is also GPL-3 for recipients.
- LoadZone’s stated path: **do not copy CSS or Pokémon textures**. An **independent rewrite** that reimplements *ideas* (pointer-driven custom properties, CSS 3D, overlay shine, gyro) without copying expression is the intended boundary. This note is not legal advice; “based on” is a legal question if someone pastes large unique CSS.
- `package.json` has **no** `"license"` field; the `LICENSE` file is still GPL-3 with named copyright holder.
- GPL does **not** license Pokémon Company / Nintendo **card art**, names, or holofoil bitmaps. `Card.svelte` default back image is `https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg`. Fronts from `images.pokemontcg.io`. Using those in a football wellness app would be **third-party IP**, independent of GPL.
- README third-party textures (galaxy holo, Vecteezy) have their own terms; do not treat them as LoadZone-free assets.

### Technical constraints if rewriting (no copy)

Reuse **concepts**, not strings/selectors from this repo:

1. Drive tilt/shine from **CSS variables** updated from pointer (and optionally DeviceOrientation), not from copying `Card.svelte` spring constants.
2. Keep **2–3 foil recipes** (wayfinder preference), not 20+ SWSH rarities and TCG clip-paths.
3. Generate **original** grain/glitter (or CSS-only noise) — do not ship `/img/grain.webp`, `/img/glitter.png`, or CDN `_foil_*_2x.webp`.
4. **prefers-reduced-motion**, iOS orientation permission, and battery are **not** specified in this repo (no reduced-motion media in the files reviewed).
5. Blend-mode stacks + `will-change` are expensive on mobile; this demo assumes desktop-ish interaction plus gyro on an expanded card.
6. Author’s **hover-tilt** is a separate GitHub project; check **its** license before depending on it. This research did not fetch that repo.

---

## 8. Sources (this tree)

- `LICENSE`
- `README.md`
- `package.json`
- `index.html`
- `.gitignore`
- `src/lib/components/Card.svelte`
- `src/lib/components/CardProxy.svelte`
- `src/lib/stores/orientation.js`
- `src/lib/stores/activeCard.js`
- `src/lib/helpers/Math.js`
- `src/App.svelte`
- `public/css/cards.css`
- `public/css/cards/*.css` (all modules listed in §6)
- `public/foils.txt`, `public/img_scrape.sh`
- `src/lib/components/promos.json`, `alternate-arts.json` (rarity/foil routing only)

No blogs. CSS-Tricks / CodePen are mentioned only as README outbound links, not used as sources.
