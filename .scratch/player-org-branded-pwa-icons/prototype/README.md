# Ambient PWA install-icon prototype (JES-92)

**PROTOTYPE / THROWAWAY.** Answers one question from
[JES-92](https://linear.app/jesus-guti-workspace/issue/JES-92/prototype-ambient-gradient-pwa-icon-look):
what should the v1 install-icon generator produce — logo centered on an ambient
radial gradient derived from the logo's own colors, exported at 180 / 192 / 512
and a maskable 512?

Not wired into any app, manifest, or upload flow. Nothing here should be
imported by production code — fold the winning variant into the real
generator by hand once a variant is picked, then delete this folder (see
"Cleanup" below).

## One-line plan

Four structurally different install-icon treatments — **A** tight padding +
soft ambient, **B** larger logo + stronger gradient, **C** opaque plate +
ambient behind, **D** maskable-safe zone — each rendered at 180 / 192 / 512
plus a dedicated 512 maskable candidate, compared side by side in
`gallery/index.html`.

## How to run

```bash
cd .scratch/player-org-branded-pwa-icons/prototype
npm install   # first time only — installs a local, throwaway `sharp` (not part of the pnpm workspace)
node generate.mjs
```

Then open `gallery/index.html` directly in a browser (double-click, or
`open gallery/index.html` on macOS). No dev server required.

To test with a different logo:

```bash
node generate.mjs path/to/other-logo.png
```

The Vimenor shield test asset lives at `logos/vimenor.png` (copied from
`docs/Shield_of_CF_Vimenor.png` in the repo root).

## What it does

1. Loads the source logo with `sharp`, trims its transparent border.
2. Extracts an ambient palette from the logo pixels — **the same algorithm
   family as** `apps/app/components/layouts/team-branding.tsx`
   (`getDominantColors` → `boostSaturation` → primary/secondary/highlight),
   ported from browser `<canvas>` to Node in `palette.mjs`. A `deep` tone
   (darkened primary) is added for the outer edge of the background gradient
   so every icon is fully opaque edge-to-edge — required for maskable icons,
   and just looks more finished for regular ones too.
3. Renders a layered radial-gradient background as SVG, rasterizes it with
   `sharp`, and composites the (resized, aspect-preserved) logo on top.
4. Writes PNGs to `gallery/icons/` and a static `gallery/index.html` gallery with
   the extracted palette swatches and every variant at home-screen-style
   mock sizes (iOS squircle, Android circle, install/splash, and a
   circle-clipped maskable preview).

## Variants

| Key | Name | Logo size | Gradient | Plate | Maskable-safe by design |
|---|---|---|---|---|---|
| A | Tight padding, soft ambient | 82% of canvas | soft | no | no |
| B | Larger logo, stronger gradient | 92% of canvas | strong | no | no |
| C | Opaque plate, ambient behind | 60% of plate | medium | yes (rounded, opaque) | no |
| D | Maskable-safe zone | 56% of canvas | medium | no | **yes** |

Every variant also gets a dedicated `{key}-512-maskable.png` that forces the
56%-of-canvas "safe zone" logo sizing (diagonal ≤ ~80% of the icon, per the
[maskable icon spec](https://web.dev/articles/maskable-icon)) while keeping
that variant's own background/plate treatment — so A/B/C's look can still be
judged in a masked context, not just D's.

## Files

```
prototype/
├── README.md          (this file)
├── package.json        throwaway, not part of the pnpm workspace
├── palette.mjs          ported color-extraction math
├── generate.mjs         entry point — run this
├── logos/vimenor.png     test asset (CF Vimenor shield)
└── gallery/
    ├── index.html        the gallery — open this
    ├── palette.json       extracted swatches, machine-readable
    └── icons/             16 generated PNGs (4 variants × [180, 192, 512, 512-maskable])
```

## Cleanup (once a variant is picked)

- Port the winning variant's SVG background + compositing logic into the
  real v1 generator (production code, wherever that lands — out of scope
  here).
- Delete this whole `.scratch/player-org-branded-pwa-icons/` folder from
  `main`/`dev` history; it stays reachable on the `prototype/ambient-pwa-icons`
  branch for reference.
