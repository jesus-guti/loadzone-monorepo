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
  readonly "--cromo-fg": string;
};

/**
 * Shell chrome reads player-local vivid tier tokens from `globals.css`.
 * Do not mix brand sage into these shells — staff / design-system hue stays untouched.
 */
export const CROMO_TIER_SHELL: Record<CromoTier, CromoShellVars> = {
  1: {
    "--cromo-top": "var(--cromo-1-top)",
    "--cromo-bottom": "var(--cromo-1-bottom)",
    "--cromo-glow": "var(--cromo-1-glow)",
    "--cromo-edge": "var(--cromo-1-edge)",
    "--cromo-inset": "var(--cromo-1-inset)",
    "--cromo-fg": "var(--cromo-1-fg)",
  },
  2: {
    "--cromo-top": "var(--cromo-2-top)",
    "--cromo-bottom": "var(--cromo-2-bottom)",
    "--cromo-glow": "var(--cromo-2-glow)",
    "--cromo-edge": "var(--cromo-2-edge)",
    "--cromo-inset": "var(--cromo-2-inset)",
    "--cromo-fg": "var(--cromo-2-fg)",
  },
  3: {
    "--cromo-top": "var(--cromo-3-top)",
    "--cromo-bottom": "var(--cromo-3-bottom)",
    "--cromo-glow": "var(--cromo-3-glow)",
    "--cromo-edge": "var(--cromo-3-edge)",
    "--cromo-inset": "var(--cromo-3-inset)",
    "--cromo-fg": "var(--cromo-3-fg)",
  },
  4: {
    "--cromo-top": "var(--cromo-4-top)",
    "--cromo-bottom": "var(--cromo-4-bottom)",
    "--cromo-glow": "var(--cromo-4-glow)",
    "--cromo-edge": "var(--cromo-4-edge)",
    "--cromo-inset": "var(--cromo-4-inset)",
    "--cromo-fg": "var(--cromo-4-fg)",
  },
};

export type CromoMediaKind = "photo" | "crest";

/** Display URL for token-scoped cromo media; omit when the source field is null. */
export function cromoMediaUrl(
  token: string,
  kind: CromoMediaKind
): string {
  const params = new URLSearchParams({ token, kind });
  return `/api/cromo-media?${params.toString()}`;
}
