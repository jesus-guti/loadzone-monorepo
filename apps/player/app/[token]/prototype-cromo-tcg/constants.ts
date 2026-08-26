/**
 * PROTOTYPE: one named TCG-rarity replica per CromoTier on the Racha cromo.
 * Switch with ?rarity=… (never ?variant= — that is DD-05).
 * Inspired rewrite of pokemon-cards-css techniques — no GPL CSS or TCG bitmaps.
 * Throwaway — not production foil.
 */

import type { CromoTier } from "../lib/streak-cromo";
import { CROMO_TIER_LABEL, CROMO_TIER_MIN_DAYS } from "../lib/streak-cromo";

/** Escalating ladder — revises the old plate/holo/spark trio for this lab. */
export const CROMO_RARITY_KEYS = [
  "reverse-holo",
  "shiny-rare",
  "regular-holo",
  "trainer-gallery-holo",
  "cosmos-holo",
  "secret-rare",
] as const;

export type CromoRarity = (typeof CROMO_RARITY_KEYS)[number];

export const CROMO_RARITY_TIER: Record<CromoRarity, CromoTier> = {
  "reverse-holo": 1,
  "shiny-rare": 2,
  "regular-holo": 3,
  "trainer-gallery-holo": 4,
  "cosmos-holo": 5,
  "secret-rare": 6,
};

export const CROMO_RARITY_META: Record<
  CromoRarity,
  { readonly name: string; readonly thesis: string }
> = {
  "reverse-holo": {
    name: "Common",
    thesis: "Sin textura foil · solo glare de manga · cromo bronce.",
  },
  "shiny-rare": {
    name: "Shiny rare",
    thesis: "Plata fría · bandas metálicas · sin flash amarillo.",
  },
  "regular-holo": {
    name: "Secret gold",
    thesis: "Bezel/mat oro secret · burst radial · sin textura de celdas.",
  },
  "trainer-gallery-holo": {
    name: "Trainer gallery",
    thesis: "Acero platino · rainbow color-dodge · shimmer hard-light.",
  },
  "cosmos-holo": {
    name: "Radiant holo",
    thesis: "Placa esmeralda + criss-cross · borde joya · grain premium.",
  },
  "secret-rare": {
    name: "VSTAR nacre",
    thesis: "Borde nácar · cristal · oil diagonal pastel.",
  },
};

export function parseCromoRarity(
  raw: string | null | undefined
): CromoRarity | null {
  if (raw === "radiant-holo") {
    return "trainer-gallery-holo";
  }
  if (
    raw === "reverse-holo" ||
    raw === "shiny-rare" ||
    raw === "regular-holo" ||
    raw === "trainer-gallery-holo" ||
    raw === "cosmos-holo" ||
    raw === "secret-rare"
  ) {
    return raw;
  }
  return null;
}

export function labStreakForRarity(rarity: CromoRarity): number {
  const tier = CROMO_RARITY_TIER[rarity];
  return Math.max(1, CROMO_TIER_MIN_DAYS[tier]);
}

export function rarityCaption(rarity: CromoRarity): string {
  const tier = CROMO_RARITY_TIER[rarity];
  return `${CROMO_TIER_LABEL[tier]} · ${CROMO_RARITY_META[rarity].name}`;
}
