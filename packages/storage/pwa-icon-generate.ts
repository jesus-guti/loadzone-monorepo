import sharp from "sharp";
import {
  type AmbientPalette,
  boostSaturation,
  buildAmbientPalette,
  getDominantColors,
  toHex,
} from "./pwa-icon-palette";
import type { PwaIconFilename } from "./pwa-icon-paths";

export const PWA_ANY_LOGO_FRACTION = 0.82;
export const PWA_MASKABLE_LOGO_FRACTION = 0.56;

type GeneratedPwaIcon = {
  readonly filename: PwaIconFilename;
  readonly body: Buffer;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function buildBackgroundSvg(size: number, palette: AmbientPalette): string {
  const primary = boostSaturation(palette.primary, 1);
  const secondary = boostSaturation(palette.secondary, 1);
  const strength = 1;
  const primaryAlpha = clamp01(0.85 * strength);
  const secondaryAlpha = clamp01(0.6 * strength);
  const highlightAlpha = clamp01(0.5 * strength);
  const secondaryRadius = 42 + strength * 18;
  const highlightRadius = 30 + strength * 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="main" cx="34" cy="30" r="98" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${toHex(palette.highlight)}" stop-opacity="1" />
      <stop offset="38%" stop-color="${toHex(primary)}" stop-opacity="1" />
      <stop offset="100%" stop-color="${toHex(palette.deep)}" stop-opacity="1" />
    </radialGradient>
    <radialGradient id="secondaryGlow" cx="74" cy="72" r="${secondaryRadius}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${toHex(secondary)}" stop-opacity="${secondaryAlpha}" />
      <stop offset="100%" stop-color="${toHex(secondary)}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="highlightGlow" cx="30" cy="24" r="${highlightRadius}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${toHex(palette.highlight)}" stop-opacity="${highlightAlpha}" />
      <stop offset="100%" stop-color="${toHex(palette.highlight)}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#main)" />
  <rect width="100" height="100" fill="url(#secondaryGlow)" opacity="${primaryAlpha}" />
  <rect width="100" height="100" fill="url(#highlightGlow)" />
</svg>`;
}

async function loadTrimmedLogo(logoBytes: Buffer): Promise<Buffer> {
  try {
    return await sharp(logoBytes).trim({ threshold: 8 }).toBuffer();
  } catch {
    return logoBytes;
  }
}

async function extractAmbientPalette(logoBytes: Buffer): Promise<AmbientPalette> {
  const { data } = await sharp(logoBytes)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return buildAmbientPalette(getDominantColors(data));
}

async function renderIcon(
  size: number,
  logoFraction: number,
  trimmedLogo: Buffer,
  palette: AmbientPalette
): Promise<Buffer> {
  const backgroundSvg = buildBackgroundSvg(size, palette);
  const backgroundBuffer = await sharp(Buffer.from(backgroundSvg))
    .resize(size, size)
    .removeAlpha()
    .png()
    .toBuffer();

  const boxSize = Math.round(size * logoFraction);
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
    .removeAlpha()
    .png()
    .toBuffer();
}

export async function generateOrgPwaIcons(
  logoBytes: Buffer
): Promise<readonly GeneratedPwaIcon[]> {
  const trimmedLogo = await loadTrimmedLogo(logoBytes);
  const palette = await extractAmbientPalette(trimmedLogo);

  const anySizes: Array<{ filename: PwaIconFilename; size: number }> = [
    { filename: "180.png", size: 180 },
    { filename: "192.png", size: 192 },
    { filename: "512.png", size: 512 },
  ];

  const icons: GeneratedPwaIcon[] = [];
  for (const { filename, size } of anySizes) {
    icons.push({
      filename,
      body: await renderIcon(size, PWA_ANY_LOGO_FRACTION, trimmedLogo, palette),
    });
  }

  icons.push({
    filename: "512-maskable.png",
    body: await renderIcon(
      512,
      PWA_MASKABLE_LOGO_FRACTION,
      trimmedLogo,
      palette
    ),
  });

  return icons;
}
