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
  "radiant-holo",
  "cosmos-holo",
  "secret-rare",
] as const;

export type CromoRarity = (typeof CROMO_RARITY_KEYS)[number];

export const CROMO_RARITY_TIER: Record<CromoRarity, CromoTier> = {
  "reverse-holo": 1,
  "shiny-rare": 2,
  "regular-holo": 3,
  "radiant-holo": 4,
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
  "radiant-holo": {
    name: "Hex reverse",
    thesis: "Placa plata + hex foil · haz amplio platino · tilt mueve la luz.",
  },
  "cosmos-holo": {
    name: "Cosmos holo",
    thesis: "Destellos + banda de color suave (galaxia CSS).",
  },
  "secret-rare": {
    name: "Secret rare",
    thesis: "Glitter dual + oro cálido · tope de escalera.",
  },
};

export function parseCromoRarity(
  raw: string | null | undefined
): CromoRarity | null {
  if (
    raw === "reverse-holo" ||
    raw === "shiny-rare" ||
    raw === "regular-holo" ||
    raw === "radiant-holo" ||
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
