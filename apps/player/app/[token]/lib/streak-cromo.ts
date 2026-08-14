export type CromoTier = 1 | 2 | 3 | 4;

const TIER_MIN_DAYS = {
  1: 0,
  2: 3,
  3: 7,
  4: 14,
} as const;

export function streakCountToCromoTier(streakCount: number): CromoTier {
  if (streakCount >= TIER_MIN_DAYS[4]) {
    return 4;
  }
  if (streakCount >= TIER_MIN_DAYS[3]) {
    return 3;
  }
  if (streakCount >= TIER_MIN_DAYS[2]) {
    return 2;
  }
  return 1;
}

export const CROMO_TIER_LABEL: Record<CromoTier, string> = {
  1: "Calentamiento",
  2: "En racha",
  3: "En forma",
  4: "Leyenda",
};

export const CROMO_CLAIM = "Tu constancia fuera del campo";

export type CromoShellVars = {
  readonly "--cromo-top": string;
  readonly "--cromo-bottom": string;
  readonly "--cromo-glow": string;
  readonly "--cromo-edge": string;
  readonly "--cromo-inset": string;
};

/**
 * Inline CSS variables — not Tailwind arbitrary properties.
 * `color-mix(...)` commas break Tailwind class parsing, which left the
 * card with an invalid gradient (empty shell, identical across tiers).
 */
export const CROMO_TIER_SHELL: Record<CromoTier, CromoShellVars> = {
  1: {
    "--cromo-top":
      "color-mix(in oklch, var(--brand) 22%, var(--bg-primary))",
    "--cromo-bottom":
      "color-mix(in oklch, var(--brand) 38%, var(--bg-tertiary))",
    "--cromo-glow": "0.04",
    "--cromo-edge": "0.28",
    "--cromo-inset": "0.08",
  },
  2: {
    "--cromo-top":
      "color-mix(in oklch, var(--brand) 42%, var(--bg-primary))",
    "--cromo-bottom":
      "color-mix(in oklch, var(--brand) 62%, var(--bg-quaternary))",
    "--cromo-glow": "0.05",
    "--cromo-edge": "0.38",
    "--cromo-inset": "0.12",
  },
  3: {
    "--cromo-top": "color-mix(in oklch, var(--brand) 78%, black)",
    "--cromo-bottom": "color-mix(in oklch, var(--brand) 92%, black)",
    "--cromo-glow": "0.06",
    "--cromo-edge": "0.45",
    "--cromo-inset": "0.18",
  },
  4: {
    "--cromo-top": "color-mix(in oklch, var(--brand) 88%, black)",
    "--cromo-bottom": "color-mix(in oklch, var(--brand) 100%, black)",
    "--cromo-glow": "0.08",
    "--cromo-edge": "0.55",
    "--cromo-inset": "0.22",
  },
};

export const CROMO_TIER_TEXT_CLASS: Record<CromoTier, string> = {
  1: "text-text-primary",
  2: "text-text-primary",
  3: "text-brand-foreground",
  4: "text-brand-foreground",
};
