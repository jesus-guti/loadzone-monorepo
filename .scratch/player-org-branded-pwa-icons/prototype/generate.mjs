#!/usr/bin/env node
// PROTOTYPE / throwaway — JES-92: "Prototype ambient-gradient PWA icon look".
//
// One line plan: 4 structurally different install-icon treatments (tight
// padding / larger logo + stronger gradient / opaque plate / maskable-safe
// zone), each rendered at 180 / 192 / 512 (+ a dedicated 512 maskable
// candidate), compared side by side in ./out/index.html.
//
// Run: node generate.mjs [path/to/logo.png]
// Defaults to logos/vimenor.png (CF Vimenor shield, JES-92 test asset).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { boostSaturation, extractAmbientPalette, toHex } from "./palette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "gallery");
const ICONS_DIR = path.join(OUT_DIR, "icons");
const SIZES = [180, 192, 512];
// Diagonal of a square logo inscribed at this fraction of the canvas stays
// within the ~80%-diameter maskable "safe zone" (fraction * sqrt(2) <= 0.8),
// with a little headroom since the shield already has internal padding.
const MASKABLE_SAFE_FRACTION = 0.56;

const logoArgument = process.argv[2];
const LOGO_PATH = logoArgument
  ? path.resolve(process.cwd(), logoArgument)
  : path.join(__dirname, "logos", "vimenor.png");
const LOGO_LABEL = path.basename(LOGO_PATH, path.extname(LOGO_PATH));

const VARIANTS = [
  {
    key: "A",
    name: "Tight padding, soft ambient",
    summary:
      "Logo fills most of the canvas; the ambient glow is a quiet backdrop, not a focal point.",
    logoFraction: 0.82,
    intensity: "soft",
    plate: false,
  },
  {
    key: "B",
    name: "Larger logo, stronger gradient",
    summary:
      "Logo pushed almost edge to edge; the ambient glow is saturated and layered for a punchier home-screen presence.",
    logoFraction: 0.92,
    intensity: "strong",
    plate: false,
  },
  {
    key: "C",
    name: "Opaque plate, ambient behind",
    summary:
      "A rounded, opaque plate sits on top of the ambient glow (visible in the margin) and holds the logo — classic app-icon sticker feel.",
    logoFraction: 0.6,
    intensity: "medium",
    plate: true,
    plateFraction: 0.88,
    plateCorner: 0.24,
  },
  {
    key: "D",
    name: "Maskable-safe zone",
    summary:
      "Logo deliberately confined to the ~80% safe-zone circle so Android's circle/squircle/rounded-square masks never clip it.",
    logoFraction: MASKABLE_SAFE_FRACTION,
    intensity: "medium",
    plate: false,
    maskableSafe: true,
  },
];

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

/** Builds the layered ambient-radial-gradient background as an SVG string. */
function buildBackgroundSvg(size, palette, { intensity, plate, plateFraction, plateCorner }) {
  const primary = boostSaturation(palette.primary, 1);
  const secondary = boostSaturation(palette.secondary, 1);
  const highlight = palette.highlight;
  const deep = palette.deep;

  const strength = { soft: 0.55, medium: 0.78, strong: 1 }[intensity] ?? 0.78;

  const primaryAlpha = clamp01(0.85 * strength);
  const secondaryAlpha = clamp01(0.6 * strength);
  const highlightAlpha = clamp01(0.5 * strength);
  const secondaryRadius = 42 + strength * 18;
  const highlightRadius = 30 + strength * 10;

  const primaryHex = toHex(primary);
  const secondaryHex = toHex(secondary);
  const highlightHex = toHex(highlight);
  const deepHex = toHex(deep);

  const plateMarkup = plate
    ? (() => {
        const plateSize = (plateFraction ?? 0.88) * 100;
        const offset = (100 - plateSize) / 2;
        const radius = plateSize * (plateCorner ?? 0.22);
        return `
    <filter id="plateShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1.6" stdDeviation="2.4" flood-color="${deepHex}" flood-opacity="0.35" />
    </filter>
    <rect
      x="${offset}" y="${offset}" width="${plateSize}" height="${plateSize}" rx="${radius}"
      fill="rgba(255,255,255,0.92)" filter="url(#plateShadow)"
    />
    <rect
      x="${offset}" y="${offset}" width="${plateSize}" height="${plateSize}" rx="${radius}"
      fill="url(#plateWash)"
    />`;
      })()
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="main" cx="34" cy="30" r="98" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${highlightHex}" stop-opacity="1" />
      <stop offset="38%" stop-color="${primaryHex}" stop-opacity="1" />
      <stop offset="100%" stop-color="${deepHex}" stop-opacity="1" />
    </radialGradient>
    <radialGradient id="secondaryGlow" cx="74" cy="72" r="${secondaryRadius}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${secondaryHex}" stop-opacity="${secondaryAlpha}" />
      <stop offset="100%" stop-color="${secondaryHex}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="highlightGlow" cx="30" cy="24" r="${highlightRadius}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${highlightHex}" stop-opacity="${highlightAlpha}" />
      <stop offset="100%" stop-color="${highlightHex}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="plateWash" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${highlightHex}" stop-opacity="0.16" />
      <stop offset="100%" stop-color="${secondaryHex}" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#main)" />
  <rect width="100" height="100" fill="url(#secondaryGlow)" opacity="${primaryAlpha}" />
  <rect width="100" height="100" fill="url(#highlightGlow)" />
  ${plateMarkup}
</svg>`;
}

async function loadTrimmedLogo(logoPath) {
  const raw = await readFile(logoPath);
  try {
    const trimmed = await sharp(raw).trim({ threshold: 8 }).toBuffer();
    return trimmed;
  } catch {
    // trim() throws if the image has no uniform border to trim (e.g. already tight).
    return raw;
  }
}

async function renderVariantIcon({ variant, size, trimmedLogo, palette, forceMaskableSafe }) {
  const backgroundSvg = buildBackgroundSvg(size, palette, variant);
  const backgroundBuffer = await sharp(Buffer.from(backgroundSvg))
    .resize(size, size)
    .png()
    .toBuffer();

  const fraction = forceMaskableSafe
    ? MASKABLE_SAFE_FRACTION
    : variant.logoFraction;
  const boxSize = Math.round(size * (variant.plate ? fraction : fraction));
  const logoResized = await sharp(trimmedLogo)
    .resize(boxSize, boxSize, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  const logoMeta = await sharp(logoResized).metadata();
  const left = Math.round((size - (logoMeta.width ?? boxSize)) / 2);
  const top = Math.round((size - (logoMeta.height ?? boxSize)) / 2);

  return sharp(backgroundBuffer)
    .composite([{ input: logoResized, left, top }])
    .png()
    .toBuffer();
}

function paletteSwatches(palette) {
  return Object.fromEntries(
    Object.entries(palette).map(([key, rgb]) => [
      key,
      { hex: toHex(rgb), rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    ])
  );
}

function buildGalleryHtml({ logoLabel, palette, variants }) {
  const swatches = paletteSwatches(palette);
  const swatchesHtml = Object.entries(swatches)
    .map(
      ([key, { hex, rgb }]) => `
        <div class="swatch">
          <span class="swatch-color" style="background:${hex}"></span>
          <div>
            <div class="swatch-name">${key}</div>
            <div class="swatch-value">${hex} · ${rgb}</div>
          </div>
        </div>`
    )
    .join("");

  const mockSizes = [
    { label: "iOS home screen (60pt @3x = 180)", size: 180, frame: "squircle", display: 72 },
    { label: "Android adaptive (192)", size: 192, frame: "circle", display: 72 },
    { label: "Install / splash (512)", size: 512, frame: "squircle", display: 128 },
    { label: "Maskable 512 (circle-masked preview)", size: "512-maskable", frame: "circle", display: 128 },
  ];

  const variantsHtml = variants
    .map((variant) => {
      const tilesHtml = mockSizes
        .map(({ label, size, frame, display }) => {
          const fileName = `${variant.key}-${size}.png`;
          return `
            <figure class="tile">
              <div class="frame frame-${frame}" style="width:${display}px;height:${display}px;">
                <img src="icons/${fileName}" alt="${variant.name} — ${label}" width="${display}" height="${display}" />
              </div>
              <figcaption>${label}<br /><code>${fileName}</code></figcaption>
            </figure>`;
        })
        .join("");

      return `
      <section class="variant">
        <header>
          <h2>${variant.key} — ${variant.name}</h2>
          <p>${variant.summary}</p>
          <ul class="meta">
            <li>Logo fraction: ${Math.round((variant.maskableSafe ? MASKABLE_SAFE_FRACTION : variant.logoFraction) * 100)}% of canvas</li>
            <li>Gradient intensity: ${variant.intensity}</li>
            <li>Plate: ${variant.plate ? "yes (opaque, rounded)" : "no"}</li>
            <li>Maskable-safe by design: ${variant.maskableSafe ? "yes" : "no (see dedicated maskable-512)"}</li>
          </ul>
        </header>
        <div class="tiles">${tilesHtml}</div>
      </section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>JES-92 — Ambient PWA icon prototype (${logoLabel})</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px 24px 80px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    background: #f4f5f3;
    color: #1c231f;
  }
  .wrap { max-width: 1080px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 999px;
    background: #fde68a;
    color: #713f12;
    margin-bottom: 12px;
  }
  .subtitle { color: #555; font-size: 14px; margin: 0 0 20px; max-width: 68ch; }
  .palette {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #e2e4df;
    border-radius: 10px;
    margin-bottom: 28px;
  }
  .swatch { display: flex; align-items: center; gap: 8px; }
  .swatch-color { width: 22px; height: 22px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.08); flex-shrink: 0; }
  .swatch-name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .swatch-value { font-size: 11px; color: #666; font-variant-numeric: tabular-nums; }
  section.variant {
    background: #fff;
    border: 1px solid #e2e4df;
    border-radius: 14px;
    padding: 20px 22px 24px;
    margin-bottom: 20px;
  }
  section.variant h2 { font-size: 16px; margin: 0 0 4px; }
  section.variant > header > p { margin: 0 0 10px; font-size: 13px; color: #444; max-width: 70ch; }
  ul.meta { list-style: none; display: flex; flex-wrap: wrap; gap: 6px 16px; padding: 0; margin: 0 0 16px; font-size: 12px; color: #555; }
  ul.meta li { background: #f1f2ef; padding: 3px 9px; border-radius: 999px; }
  .tiles { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-end; }
  .tile { margin: 0; text-align: center; }
  .tile figcaption { margin-top: 8px; font-size: 11px; color: #666; line-height: 1.4; }
  .tile figcaption code { font-size: 10px; color: #888; }
  .frame { display: flex; align-items: center; justify-content: center; overflow: hidden; background: repeating-conic-gradient(#eee 0% 25%, #fafafa 0% 50%) 50% / 14px 14px; }
  .frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .frame-circle { border-radius: 50%; }
  .frame-squircle { border-radius: 26%; }
  footer { margin-top: 32px; font-size: 12px; color: #777; }
  footer code { background: #eceeea; padding: 1px 5px; border-radius: 4px; }
</style>
</head>
<body>
  <div class="wrap">
    <span class="badge">Prototype · JES-92 · throwaway</span>
    <h1>Ambient-gradient PWA install icon — variant gallery</h1>
    <p class="subtitle">
      Test asset: <strong>${logoLabel}</strong> (CF Vimenor shield). Palette extracted from the logo
      pixels, same method family as
      <code>apps/app/components/layouts/team-branding.tsx</code> (dominant colors →
      boostSaturation → layered radial gradients), ported to Node + sharp for static PNG export.
      Checkerboard = transparency in the source frame (not present in final opaque PNGs, shown
      only where relevant).
    </p>
    <div class="palette">${swatchesHtml}</div>
    ${variantsHtml}
    <footer>
      Regenerate with <code>node generate.mjs</code> (or <code>node generate.mjs path/to/other-logo.png</code>) from this folder.
      See <code>README.md</code> for setup.
    </footer>
  </div>
</body>
</html>`;
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  const trimmedLogo = await loadTrimmedLogo(LOGO_PATH);
  const palette = await extractAmbientPalette(sharp(trimmedLogo));

  const manifestEntries = [];

  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      const buffer = await renderVariantIcon({
        variant,
        size,
        trimmedLogo,
        palette,
        forceMaskableSafe: false,
      });
      const fileName = `${variant.key}-${size}.png`;
      await writeFile(path.join(ICONS_DIR, fileName), buffer);
      manifestEntries.push(fileName);
    }

    const maskableBuffer = await renderVariantIcon({
      variant,
      size: 512,
      trimmedLogo,
      palette,
      forceMaskableSafe: true,
    });
    const maskableFileName = `${variant.key}-512-maskable.png`;
    await writeFile(path.join(ICONS_DIR, maskableFileName), maskableBuffer);
    manifestEntries.push(maskableFileName);
  }

  const paletteJson = paletteSwatches(palette);
  await writeFile(
    path.join(OUT_DIR, "palette.json"),
    JSON.stringify({ logo: LOGO_LABEL, palette: paletteJson }, null, 2)
  );

  const html = buildGalleryHtml({ logoLabel: LOGO_LABEL, palette, variants: VARIANTS });
  await writeFile(path.join(OUT_DIR, "index.html"), html);

  console.log(`Generated ${manifestEntries.length} PNGs in ${ICONS_DIR}`);
  console.log(`Gallery: ${path.join(OUT_DIR, "index.html")}`);
  console.log("Palette:", paletteJson);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
