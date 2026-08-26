export type CromoTier = 1 | 2 | 3 | 4 | 5 | 6;

export const CROMO_TIERS = [1, 2, 3, 4, 5, 6] as const;

export const CROMO_TIER_MIN_DAYS = {
  1: 0,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
  6: 60,
} as const satisfies Record<CromoTier, number>;

/** Plate (Bronce/Plata), holo (Oro–Esmeralda), spark (Diamante). Distinct CSS per tier. */
export type CromoFoilKind = "plate" | "holo" | "spark";

export const CROMO_FOIL_INTENSITY: Record<CromoTier, number> = {
  1: 0.18,
  2: 0.38,
  3: 0.56,
  4: 0.72,
  5: 0.86,
  6: 1,
};

export function cromoFoilKind(tier: CromoTier): CromoFoilKind {
  if (tier <= 2) {
    return "plate";
  }
  if (tier <= 5) {
    return "holo";
  }
  return "spark";
}

export function streakCountToCromoTier(streakCount: number): CromoTier {
  if (streakCount >= CROMO_TIER_MIN_DAYS[6]) {
    return 6;
  }
  if (streakCount >= CROMO_TIER_MIN_DAYS[5]) {
    return 5;
  }
  if (streakCount >= CROMO_TIER_MIN_DAYS[4]) {
    return 4;
  }
  if (streakCount >= CROMO_TIER_MIN_DAYS[3]) {
    return 3;
  }
  if (streakCount >= CROMO_TIER_MIN_DAYS[2]) {
    return 2;
  }
  return 1;
}

export const CROMO_TIER_LABEL: Record<CromoTier, string> = {
  1: "Bronce",
  2: "Plata",
  3: "Oro",
  4: "Platino",
  5: "Esmeralda",
  6: "Diamante",
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
 * Shell var map — keep in sync with `[data-streak-cromo-tier]` in `globals.css`.
 * Paint lives in CSS on `.cromo-shell` so the photo cannot cover the tier.
 * Do not mix brand sage into these shells — staff / design-system hue stays untouched.
 */
function tierShell(tier: CromoTier): CromoShellVars {
  return {
    "--cromo-top": `var(--cromo-${tier}-top)`,
    "--cromo-bottom": `var(--cromo-${tier}-bottom)`,
    "--cromo-glow": `var(--cromo-${tier}-glow)`,
    "--cromo-edge": `var(--cromo-${tier}-edge)`,
    "--cromo-inset": `var(--cromo-${tier}-inset)`,
    "--cromo-fg": `var(--cromo-${tier}-fg)`,
  };
}

export const CROMO_TIER_SHELL: Record<CromoTier, CromoShellVars> = {
  1: tierShell(1),
  2: tierShell(2),
  3: tierShell(3),
  4: tierShell(4),
  5: tierShell(5),
  6: tierShell(6),
};

export type CromoMediaKind = "photo" | "crest";

/**
 * Same-origin display URL for cromo media.
 * Auth is the `lz_player_token` cookie — never put the player token in the URL.
 */
export function cromoMediaUrl(kind: CromoMediaKind): string {
  return `/api/cromo-media?kind=${kind}`;
}

/** Ink-seal tilt from the closed rank-stamp lab (variant A). */
export const CROMO_SHIRT_SEAL_ROTATION_DEG = 25;

/** Oversized hollow dorsal on the portrait — rank-stamp lab variant C. */
export const CROMO_SHIRT_OVERPRINT_ROTATION_DEG = 25;

export const CROMO_SEAL_ARC_TOP = "RACHA DEL EQUIPO";

export function cromoSealArcBottom(teamSize: number): string {
  return `DE ${teamSize}`;
}

export type TeamStreakRank = {
  /** Competition rank (1224): ties share the best position. `null` = no streak. */
  readonly position: number | null;
  readonly teamSize: number;
};

/**
 * Team Recoverable Streak rank: longest streak is #1.
 * `teamStreaks` must include this Player’s current display streak.
 */
export function resolveTeamStreakRank({
  playerStreak,
  teamStreaks,
}: {
  readonly playerStreak: number;
  readonly teamStreaks: readonly number[];
}): TeamStreakRank {
  const teamSize = teamStreaks.length;

  if (playerStreak <= 0) {
    return { position: null, teamSize };
  }

  const ahead = teamStreaks.filter((streak) => streak > playerStreak).length;
  return { position: ahead + 1, teamSize };
}

/**
 * Shirt number on the portrait overprint: set → show hollow numeral; null → omit.
 */
export function resolveCromoShirtNumber(
  shirtNumber: number | null | undefined
): number | null {
  if (shirtNumber === null || shirtNumber === undefined) {
    return null;
  }
  return shirtNumber;
}

export function cromoTeamRankLabel(rank: number, teamSize: number): string {
  return `Puesto ${rank} de ${teamSize} por racha en el equipo`;
}

export function cromoShirtOverprintLabel(shirtNumber: number): string {
  return `Dorsal ${shirtNumber}`;
}
