/**
 * Optional Player Playing Position (specific football role).
 *
 * Persisted as nullable Prisma enum on Player. Streak Cromo shows the Spanish
 * abbreviation only when set; empty omits the line (no «Sin posición»).
 *
 * Import from `@repo/database/playing-position` so client bundles avoid
 * `server-only` from `./client`.
 */

import { z } from "zod";

export const PLAYING_POSITIONS = [
  "POR",
  "DFC",
  "LD",
  "LI",
  "MCD",
  "MC",
  "MCO",
  "ED",
  "EI",
  "DC",
] as const;

export type PlayingPosition = (typeof PLAYING_POSITIONS)[number];

export const playingPositionSchema = z.enum(PLAYING_POSITIONS);

/** Staff form labels (Spanish). Cromo uses abbreviations via formatPlayingPositionCromoLine. */
export const PLAYING_POSITION_STAFF_LABEL: Record<PlayingPosition, string> = {
  POR: "Portero",
  DFC: "Central",
  LD: "Lateral derecho",
  LI: "Lateral izquierdo",
  MCD: "Pivote",
  MC: "Interior",
  MCO: "Mediapunta",
  ED: "Extremo derecho",
  EI: "Extremo izquierdo",
  DC: "Delantero centro",
};

/**
 * Cromo identity line: abbreviation when set; null when empty.
 * Never returns a placeholder such as «Sin posición».
 */
export function formatPlayingPositionCromoLine(
  position: PlayingPosition | null | undefined
): string | null {
  if (position == null) {
    return null;
  }
  return position;
}

/**
 * Form transform: missing / empty / "NONE" → null; otherwise a PlayingPosition.
 */
export const optionalPlayingPositionSchema = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value || value.trim().length === 0 || value === "NONE") {
      return null;
    }
    const parsed = playingPositionSchema.safeParse(value);
    if (!parsed.success) {
      ctx.addIssue({
        code: "custom",
        message: "La posición de juego no es válida.",
      });
      return z.NEVER;
    }
    return parsed.data;
  });
