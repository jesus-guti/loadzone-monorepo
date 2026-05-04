"use client";

import { ShieldCheckIcon } from "@phosphor-icons/react/ssr";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useState } from "react";

type TeamBrandingProperties = {
  readonly clubName: string;
  readonly clubLogoUrl: string | null;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly compact?: boolean;
  readonly showClubOnly?: boolean;
  readonly logoTreatment?: "default" | "ambient";
  /** Clases extra para el bloque de texto (nombre / subtítulo). */
  readonly detailsClassName?: string;
};

type RgbColor = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
};

type AmbientPalette = {
  readonly primary: string;
  readonly secondary: string;
  readonly highlight: string;
};

const FALLBACK_AMBIENT_PALETTE: AmbientPalette = {
  primary: "rgba(59, 130, 246, 0.92)",
  secondary: "rgba(168, 85, 247, 0.78)",
  highlight: "rgba(255, 255, 255, 0.55)",
};
const WHITESPACE_PATTERN = /\s+/;

function getInitials(value: string | null): string {
  if (!value) {
    return "LZ";
  }

  return value
    .trim()
    .split(WHITESPACE_PATTERN)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getColorSaturation(color: RgbColor): number {
  const maximum = Math.max(color.r, color.g, color.b);
  const minimum = Math.min(color.r, color.g, color.b);

  if (maximum === 0) {
    return 0;
  }

  return (maximum - minimum) / maximum;
}

function getColorLightness(color: RgbColor): number {
  const maximum = Math.max(color.r, color.g, color.b);
  const minimum = Math.min(color.r, color.g, color.b);

  return (maximum + minimum) / 510;
}

function getColorDistance(first: RgbColor, second: RgbColor): number {
  const redDelta = first.r - second.r;
  const greenDelta = first.g - second.g;
  const blueDelta = first.b - second.b;

  return Math.sqrt(redDelta ** 2 + greenDelta ** 2 + blueDelta ** 2);
}

function mixWithWhite(color: RgbColor, amount: number): RgbColor {
  return {
    r: Math.round(color.r + (255 - color.r) * amount),
    g: Math.round(color.g + (255 - color.g) * amount),
    b: Math.round(color.b + (255 - color.b) * amount),
  };
}

function toRgba(color: RgbColor, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

type HslColor = {
  readonly h: number;
  readonly s: number;
  readonly l: number;
};

function rgbToHsl(color: RgbColor): HslColor {
  const red = color.r / 255;
  const green = color.g / 255;
  const blue = color.b / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;

  let hue = 0;
  if (delta !== 0) {
    if (maximum === red) {
      hue = (((green - blue) / delta) % 6 + 6) % 6;
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

function hslToRgb(hsl: HslColor): RgbColor {
  const hue = ((hsl.h % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
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

  const match = hsl.l - chroma / 2;
  return {
    r: Math.round((redPrime + match) * 255),
    g: Math.round((greenPrime + match) * 255),
    b: Math.round((bluePrime + match) * 255),
  };
}

function boostSaturation(color: RgbColor, factor: number): RgbColor {
  const hsl = rgbToHsl(color);
  const nextSaturation = Math.min(1, hsl.s * factor);
  const nextLightness = Math.min(0.62, Math.max(0.34, hsl.l));
  return hslToRgb({ h: hsl.h, s: nextSaturation, l: nextLightness });
}

function getAverageColor(colors: readonly RgbColor[]): RgbColor {
  if (colors.length === 0) {
    return { r: 59, g: 130, b: 246 };
  }

  const totals = colors.reduce(
    (accumulator, current) => ({
      r: accumulator.r + current.r,
      g: accumulator.g + current.g,
      b: accumulator.b + current.b,
    }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: Math.round(totals.r / colors.length),
    g: Math.round(totals.g / colors.length),
    b: Math.round(totals.b / colors.length),
  };
}

function shouldSkipVibrantBucket(color: RgbColor, alpha: number): boolean {
  const saturation = getColorSaturation(color);
  const lightness = getColorLightness(color);

  return (
    alpha < 80 || saturation < 0.14 || lightness < 0.08 || lightness > 0.92
  );
}

function quantizeColor(color: RgbColor): RgbColor {
  return {
    r: Math.round(color.r / 24) * 24,
    g: Math.round(color.g / 24) * 24,
    b: Math.round(color.b / 24) * 24,
  };
}

function scoreColor(color: RgbColor, alpha: number): number {
  const saturation = getColorSaturation(color);
  const lightness = getColorLightness(color);

  return (
    1 + saturation * 5 + (1 - Math.abs(lightness - 0.55)) * 2.5 + alpha / 255
  );
}

function pickDistinctColors(
  candidates: readonly RgbColor[]
): readonly RgbColor[] {
  const pickedColors: RgbColor[] = [];

  for (const candidate of candidates) {
    const isDistinct = pickedColors.every(
      (currentColor) => getColorDistance(currentColor, candidate) > 64
    );

    if (isDistinct) {
      pickedColors.push(candidate);
    }

    if (pickedColors.length === 2) {
      break;
    }
  }

  return pickedColors;
}

function getDominantColors(data: Uint8ClampedArray): readonly RgbColor[] {
  const buckets = new Map<
    string,
    {
      color: RgbColor;
      score: number;
    }
  >();
  const visibleColors: RgbColor[] = [];

  // Sample every few pixels to keep the extraction cheap.
  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3] ?? 0;
    if (alpha < 80) {
      continue;
    }

    const color: RgbColor = {
      r: data[index] ?? 0,
      g: data[index + 1] ?? 0,
      b: data[index + 2] ?? 0,
    };

    visibleColors.push(color);

    if (shouldSkipVibrantBucket(color, alpha)) {
      continue;
    }

    const quantizedColor = quantizeColor(color);
    const bucketKey = `${quantizedColor.r}-${quantizedColor.g}-${quantizedColor.b}`;
    const score = scoreColor(color, alpha);

    const existingBucket = buckets.get(bucketKey);
    if (!existingBucket) {
      buckets.set(bucketKey, { color: quantizedColor, score });
      continue;
    }

    buckets.set(bucketKey, {
      color: quantizedColor,
      score: existingBucket.score + score,
    });
  }

  const sortedCandidates = Array.from(buckets.values())
    .sort((first, second) => second.score - first.score)
    .map((entry) => entry.color);

  const pickedColors = [...pickDistinctColors(sortedCandidates)];

  if (pickedColors.length === 0) {
    pickedColors.push(getAverageColor(visibleColors));
  }

  if (pickedColors.length === 1) {
    pickedColors.push(mixWithWhite(pickedColors[0], 0.32));
  }

  return pickedColors;
}

function buildAmbientPalette(colors: readonly RgbColor[]): AmbientPalette {
  const rawPrimary = colors[0] ?? { r: 59, g: 130, b: 246 };
  const rawSecondary = colors[1] ?? rawPrimary;
  const primaryColor = boostSaturation(rawPrimary, 1.85);
  const secondaryColor = boostSaturation(rawSecondary, 1.65);
  const highlightColor = mixWithWhite(boostSaturation(rawPrimary, 1.2), 0.12);

  return {
    primary: toRgba(primaryColor, 0.88),
    secondary: toRgba(secondaryColor, 0.72),
    highlight: toRgba(highlightColor, 0.62),
  };
}

function getAmbientPaletteFromImage(image: HTMLImageElement): AmbientPalette {
  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    return FALLBACK_AMBIENT_PALETTE;
  }

  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return FALLBACK_AMBIENT_PALETTE;
  }

  const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
  const drawWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const drawHeight = Math.max(1, Math.round(image.naturalHeight * scale));
  const offsetX = Math.floor((size - drawWidth) / 2);
  const offsetY = Math.floor((size - drawHeight) / 2);

  context.clearRect(0, 0, size, size);
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  const imageData = context.getImageData(0, 0, size, size);
  const dominantColors = getDominantColors(imageData.data);
  return buildAmbientPalette(dominantColors);
}

async function loadAmbientPaletteFromDecodedImage(
  image: HTMLImageElement,
  getCancelled: () => boolean
): Promise<AmbientPalette> {
  if (getCancelled()) {
    return FALLBACK_AMBIENT_PALETTE;
  }

  if ("decode" in image) {
    await image.decode();
  }

  if (getCancelled()) {
    return FALLBACK_AMBIENT_PALETTE;
  }

  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    return FALLBACK_AMBIENT_PALETTE;
  }

  return getAmbientPaletteFromImage(image);
}

function shouldUseAnonymousCrossOrigin(imageUrl: string): boolean {
  if (imageUrl.startsWith("/")) {
    return false;
  }

  try {
    const resolved = new URL(imageUrl, window.location.href);
    return resolved.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function useAmbientPalette(
  imageUrl: string | null,
  enabled: boolean
): AmbientPalette {
  const [palette, setPalette] = useState<AmbientPalette>(
    FALLBACK_AMBIENT_PALETTE
  );

  useEffect(() => {
    if (!enabled) {
      setPalette(FALLBACK_AMBIENT_PALETTE);
      return;
    }

    if (imageUrl === null) {
      setPalette(FALLBACK_AMBIENT_PALETTE);
      return;
    }

    let isCancelled = false;
    const image = new Image();

    if (shouldUseAnonymousCrossOrigin(imageUrl)) {
      image.crossOrigin = "anonymous";
    }

    image.decoding = "async";
    image.onload = () => {
      if (isCancelled) {
        return;
      }

      loadAmbientPaletteFromDecodedImage(image, () => isCancelled)
        .then((nextPalette) => {
          if (!isCancelled) {
            setPalette(nextPalette);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setPalette(FALLBACK_AMBIENT_PALETTE);
          }
        });
    };

    image.onerror = () => {
      if (!isCancelled) {
        setPalette(FALLBACK_AMBIENT_PALETTE);
      }
    };

    image.src = imageUrl;

    return () => {
      isCancelled = true;
    };
  }, [enabled, imageUrl]);

  return palette;
}

function getSecondaryLabel(
  clubName: string,
  teamName: string | null,
  showClubOnly: boolean
): string | null {
  if (showClubOnly) {
    return null;
  }

  if (teamName) {
    return clubName;
  }

  return "Workspace operativo";
}

function getAmbientGlowStyle(
  palette: AmbientPalette,
  type: "outer" | "inner"
): { backgroundImage: string } {
  if (type === "outer") {
    return {
      backgroundImage: [
        `radial-gradient(circle at 30% 28%, ${palette.highlight} 0%, rgba(255, 255, 255, 0) 12%)`,
        `radial-gradient(circle at 32% 30%, ${palette.primary} 0%, rgba(255, 255, 255, 0) 34%)`,
        `radial-gradient(circle at 32% 30%, ${palette.primary} 0%, rgba(255, 255, 255, 0) 48%)`,
        `radial-gradient(circle at 74% 68%, ${palette.secondary} 0%, rgba(255, 255, 255, 0) 36%)`,
        `radial-gradient(circle at 74% 68%, ${palette.secondary} 0%, rgba(255, 255, 255, 0) 52%)`,
      ].join(", "),
    };
  }

  return {
    backgroundImage: [
      `radial-gradient(circle at 38% 34%, ${palette.highlight} 0%, rgba(255, 255, 255, 0) 10%)`,
      `radial-gradient(circle at 44% 40%, ${palette.primary} 0%, rgba(255, 255, 255, 0) 30%)`,
      `radial-gradient(circle at 44% 40%, ${palette.primary} 0%, rgba(255, 255, 255, 0) 44%)`,
    ].join(", "),
  };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: branding layout needs a few visual variants in one place
export function TeamBranding({
  clubName,
  clubLogoUrl,
  teamName,
  teamLogoUrl,
  compact = false,
  showClubOnly = false,
  logoTreatment = "default",
  detailsClassName,
}: TeamBrandingProperties) {
  const primaryLabel = showClubOnly ? clubName : (teamName ?? clubName);
  const secondaryLabel = getSecondaryLabel(clubName, teamName, showClubOnly);
  const imageUrl = teamLogoUrl ?? clubLogoUrl;
  const hasImage = imageUrl !== null;
  const isAmbientLogo = logoTreatment === "ambient" && hasImage;
  const ambientPalette = useAmbientPalette(imageUrl, isAmbientLogo);
  const avatarSizeClass = compact ? "size-10" : "size-9";
  const outerGlowStyle = getAmbientGlowStyle(ambientPalette, "outer");
  const innerGlowStyle = getAmbientGlowStyle(ambientPalette, "inner");
  const rootClassName = isAmbientLogo
    ? "flex min-w-0 items-center gap-2"
    : "flex min-w-0 items-center gap-3";
  const avatarClassName = isAmbientLogo
    ? "bg-transparent"
    : "border border-border-secondary";
  const avatarImageClassName = isAmbientLogo
    ? "p-0.5 drop-shadow-[0_10px_24px_rgba(255,255,255,0.48)]"
    : "p-1";
  const avatarFallbackClassName = isAmbientLogo
    ? "bg-bg-primary/75 backdrop-blur-sm"
    : "bg-brand/10";
  const detailsBlockClassName = cn(
    compact ? "hidden min-w-0" : "min-w-0",
    detailsClassName
  );
  const ambientAvatarContainerClassName = compact
    ? "relative shrink-0 size-10"
    : "relative shrink-0 size-12";
  const avatarContainerClassName = isAmbientLogo
    ? ambientAvatarContainerClassName
    : cn("relative shrink-0", avatarSizeClass);
  const avatarAnchorClassName = isAmbientLogo
    ? "absolute left-1/2 top-1/2 z-10 size-9 -translate-x-1/2 -translate-y-1/2"
    : "relative";
  const primaryLabelClassName = cn(
    "truncate",
    "text-sm",
    "font-semibold",
    "text-text-primary"
  );
  const secondaryLabelClassName = cn(
    "truncate",
    "text-xs",
    "uppercase",
    "tracking-[0.14em]",
    "text-text-secondary"
  );

  return (
    <div className={rootClassName}>
      <div className={cn("relative -left-[7px]", avatarContainerClassName)}>
        {isAmbientLogo ? (
          <>
            <div
              aria-hidden
              // biome-ignore lint/nursery/useSortedClasses: radial halo positioning is easier to read spatially
              className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm"
              style={outerGlowStyle}
            />
            <div
              aria-hidden
              // biome-ignore lint/nursery/useSortedClasses: radial halo positioning is easier to read spatially
              className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-95 blur-sm"
              style={innerGlowStyle}
            />
          </>
        ) : null}
        <div className={avatarAnchorClassName}>
          <Avatar
            className={cn(
              "relative rounded-xl",
              avatarSizeClass,
              avatarClassName
            )}
          >
            {imageUrl ? (
              <AvatarImage
                alt={primaryLabel}
                className={cn("object-contain", avatarImageClassName)}
                src={imageUrl}
              />
            ) : null}
            <AvatarFallback
              className={cn(
                "rounded-xl font-semibold text-text-primary text-xs",
                avatarFallbackClassName
              )}
            >
              {imageUrl ? (
                <ShieldCheckIcon className="size-4" />
              ) : (
                getInitials(primaryLabel)
              )}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className={cn("relative -left-3 top-0.5", detailsBlockClassName)}>
        <p className={primaryLabelClassName}>{primaryLabel}</p>
        {secondaryLabel ? (
          <p className={secondaryLabelClassName}>{secondaryLabel}</p>
        ) : null}
      </div>
    </div>
  );
}
