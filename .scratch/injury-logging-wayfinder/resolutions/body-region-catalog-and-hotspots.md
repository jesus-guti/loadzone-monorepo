# Body region catalog and hotspots

**Ticket:** [Define body region catalog and hotspots](https://linear.app/jesus-guti-workspace/issue/JES-31/define-body-region-catalog-and-hotspots)

## Answer

### Assets

- Canonical pair: `assets/front.png` and `assets/back.png` (768×1376, matching crop, no ball).
- Legacy `assets/player-body-map.png` is not the product map asset.

### Catalog (v1)

Discrete regions with anatomical L/R in the id. Each region belongs to one primary view (`front` | `back`). Multi-select across views is allowed for one injury episode.

Full machine-readable list + seed hotspots: [`body-region-catalog.json`](./body-region-catalog.json).

### Free-text detail

- Catalog selection is **required** for map counts and history.
- Optional free-text field **Detalle de zona** (`regionDetail`) for precision (e.g. “isquio proximal”).
- No `OTHER` region in v1.

### Hotspot contract

- Percent of canvas: `cx`, `cy`, `r` in 0–100.
- Seed coordinates are approximate; refine visually in the staff log prototype.

### Domain term

**BodyRegion** added to root `CONTEXT.md`.
