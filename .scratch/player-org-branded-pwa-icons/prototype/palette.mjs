// PROTOTYPE / throwaway — JES-92.
// Ported from apps/app/components/layouts/team-branding.tsx (dominant-color
// extraction + ambient palette). Kept algorithmically faithful; adapted from
// canvas ImageData (browser) to a raw RGBA buffer (Node + sharp).

export function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;

  let hue = 0;
  if (delta !== 0) {
    if (maximum === red) {
      hue = ((((green - blue) / delta) % 6) + 6) % 6;
    } else if (maximum === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
  }

  const lightness = (maximum + minimum) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return { h: hue * 60, s: saturation, l: lightness };
}

export function hslToRgb({ h, s, l }) {
  const hue = ((h % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = (hue / 360) * 6;
  const intermediate = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let redPrime = 0;
  let greenPrime = 0;
  let bluePrime = 0;

  if (huePrime >= 0 && huePrime < 1) {
    redPrime = chroma;
    greenPrime = intermediate;
  } else if (huePrime >= 1 && huePrime < 2) {
    redPrime = intermediate;
    greenPrime = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    greenPrime = chroma;
    bluePrime = intermediate;
  } else if (huePrime >= 3 && huePrime < 4) {
    greenPrime = intermediate;
    bluePrime = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    redPrime = intermediate;
    bluePrime = chroma;
  } else {
    redPrime = chroma;
    bluePrime = intermediate;
  }

  const match = l - chroma / 2;
  return {
    r: Math.round((redPrime + match) * 255),
    g: Math.round((greenPrime + match) * 255),
    b: Math.round((bluePrime + match) * 255),
  };
}

export function getColorSaturation({ r, g, b }) {
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  if (maximum === 0) {
    return 0;
  }
  return (maximum - minimum) / maximum;
}

export function getColorLightness({ r, g, b }) {
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  return (maximum + minimum) / 510;
}

export function getColorDistance(first, second) {
  const rd = first.r - second.r;
  const gd = first.g - second.g;
  const bd = first.b - second.b;
  return Math.sqrt(rd ** 2 + gd ** 2 + bd ** 2);
}

export function mixWithWhite(color, amount) {
  return {
    r: Math.round(color.r + (255 - color.r) * amount),
    g: Math.round(color.g + (255 - color.g) * amount),
    b: Math.round(color.b + (255 - color.b) * amount),
  };
}

export function mixWithBlack(color, amount) {
  return {
    r: Math.round(color.r * (1 - amount)),
    g: Math.round(color.g * (1 - amount)),
    b: Math.round(color.b * (1 - amount)),
  };
}

export function boostSaturation(color, factor) {
  const hsl = rgbToHsl(color);
  const nextSaturation = Math.min(1, hsl.s * factor);
  const nextLightness = Math.min(0.62, Math.max(0.34, hsl.l));
  return hslToRgb({ h: hsl.h, s: nextSaturation, l: nextLightness });
}

export function toHex({ r, g, b }) {
  const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

const NEUTRAL_AVERAGE_COLOR = { r: 52, g: 138, b: 112 };

function quantizeColor(color) {
  return {
    r: Math.round(color.r / 24) * 24,
    g: Math.round(color.g / 24) * 24,
    b: Math.round(color.b / 24) * 24,
  };
}

function shouldSkipVibrantBucket(color, alpha) {
  const saturation = getColorSaturation(color);
  const lightness = getColorLightness(color);
  return (
    alpha < 80 || saturation < 0.14 || lightness < 0.08 || lightness > 0.92
  );
}

function scoreColor(color, alpha) {
  const saturation = getColorSaturation(color);
  const lightness = getColorLightness(color);
  return (
    1 + saturation * 5 + (1 - Math.abs(lightness - 0.55)) * 2.5 + alpha / 255
  );
}

function getAverageColor(colors) {
  if (colors.length === 0) {
    return NEUTRAL_AVERAGE_COLOR;
  }
  const totals = colors.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
    { r: 0, g: 0, b: 0 }
  );
  return {
    r: Math.round(totals.r / colors.length),
    g: Math.round(totals.g / colors.length),
    b: Math.round(totals.b / colors.length),
  };
}

function pickDistinctColors(candidates) {
  const picked = [];
  for (const candidate of candidates) {
    const isDistinct = picked.every(
      (current) => getColorDistance(current, candidate) > 64
    );
    if (isDistinct) {
      picked.push(candidate);
    }
    if (picked.length === 2) {
      break;
    }
  }
  return picked;
}

/**
 * @param {Buffer} data raw RGBA buffer (e.g. from sharp `.raw()`)
 */
export function getDominantColors(data) {
  const buckets = new Map();
  const visibleColors = [];

  // Small sampled buffer (see extractAmbientPalette) so we can afford to
  // walk every pixel instead of the every-4th-pixel stride used in the
  // browser version (there the source canvas is far larger).
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 0;
    if (alpha < 80) {
      continue;
    }

    const color = {
      r: data[index] ?? 0,
      g: data[index + 1] ?? 0,
      b: data[index + 2] ?? 0,
    };
    visibleColors.push(color);

    if (shouldSkipVibrantBucket(color, alpha)) {
      continue;
    }

    const quantized = quantizeColor(color);
    const key = `${quantized.r}-${quantized.g}-${quantized.b}`;
    const score = scoreColor(color, alpha);
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, { color: quantized, score });
      continue;
    }
    buckets.set(key, { color: quantized, score: existing.score + score });
  }

  const sorted = Array.from(buckets.values())
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.color);

  const picked = [...pickDistinctColors(sorted)];

  if (picked.length === 0) {
    picked.push(getAverageColor(visibleColors));
  }
  if (picked.length === 1) {
    picked.push(mixWithWhite(picked[0], 0.32));
  }

  return picked;
}

export function buildAmbientPalette(colors) {
  const rawPrimary = colors[0] ?? NEUTRAL_AVERAGE_COLOR;
  const rawSecondary = colors[1] ?? rawPrimary;
  const primary = boostSaturation(rawPrimary, 1.85);
  const secondary = boostSaturation(rawSecondary, 1.65);
  const highlight = mixWithWhite(boostSaturation(rawPrimary, 1.2), 0.12);
  const deep = mixWithBlack(boostSaturation(rawPrimary, 1.4), 0.62);

  return { primary, secondary, highlight, deep };
}

/**
 * @param {import('sharp').Sharp} sharpInstance already-loaded sharp pipeline
 */
export async function extractAmbientPalette(sharpInstance) {
  const size = 32;
  const { data } = await sharpInstance
    .clone()
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const dominant = getDominantColors(data);
  return buildAmbientPalette(dominant);
}
