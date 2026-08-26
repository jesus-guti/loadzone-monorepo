/**
 * PROTOTYPE (cromo foil): three foil recipes on a TCG-like Streak Cromo,
 * switchable via ?variant=A|B|C and ?tier=1–6 on /[token]/prototype-cromo-foil.
 * Throwaway — not production foil.
 */

import type { CromoTier } from "../lib/streak-cromo";
import { CROMO_TIER_LABEL, CROMO_TIER_MIN_DAYS } from "../lib/streak-cromo";

export const VARIANT_KEYS = ["A", "B", "C"] as const;
export type PrototypeVariant = (typeof VARIANT_KEYS)[number];

export const VARIANT_META: Record<
  PrototypeVariant,
  {
    readonly name: string;
    readonly thesis: string;
    readonly recipe: "plate" | "holo" | "spark";
    readonly defaultTier: CromoTier;
    readonly tiers: readonly CromoTier[];
  }
> = {
  A: {
    name: "Plate",
    thesis: "Metal cepillado en marco y chrome · sin arcoíris",
    recipe: "plate",
    defaultTier: 2,
    tiers: [1, 2],
  },
  B: {
    name: "Holo",
    thesis: "Prisma en chrome · retrato mate",
    recipe: "holo",
    defaultTier: 4,
    tiers: [3, 4, 5],
  },
  C: {
    name: "Spark",
    thesis: "Puntos especulares en chrome · Diamante",
    recipe: "spark",
    defaultTier: 6,
    tiers: [6],
  },
};

export const DEMO_PLAYER_NAME = "Alex";
export const DEMO_TEAM_NAME = "Cadete A";
export const DEMO_POSITION = "MED";

export function parseVariant(raw: string | undefined): PrototypeVariant {
  const upper = raw?.toUpperCase();
  if (upper === "A" || upper === "B" || upper === "C") {
    return upper;
  }
  return "A";
}

export function parseTier(
  raw: string | undefined,
  variant: PrototypeVariant
): CromoTier {
  const allowed = VARIANT_META[variant].tiers;
  const parsed = Number.parseInt(raw ?? "", 10);
  if (allowed.includes(parsed as CromoTier)) {
    return parsed as CromoTier;
  }
  return VARIANT_META[variant].defaultTier;
}

export function labStreakForTier(tier: CromoTier): number {
  return CROMO_TIER_MIN_DAYS[tier];
}

export function labTierCaption(tier: CromoTier): string {
  return `${CROMO_TIER_LABEL[tier]} · ${CROMO_TIER_MIN_DAYS[tier]}d`;
}
