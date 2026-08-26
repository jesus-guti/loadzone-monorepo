/**
 * Optional Player shirt number (dorsal).
 *
 * Persisted as nullable Int on Player. Streak Cromo shows the ink seal only
 * when set; empty omits the seal (no «Sin dorsal» placeholder).
 *
 * Import from `@repo/database/shirt-number` so client bundles avoid
 * `server-only` from `./client`.
 */

import { z } from "zod";

export const SHIRT_NUMBER_MIN = 1;
export const SHIRT_NUMBER_MAX = 99;

const INTEGER_SHIRT_NUMBER = /^\d+$/;

/**
 * Form transform: missing / empty → null; otherwise an integer 1–99.
 */
export const optionalShirtNumberSchema = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value || value.trim().length === 0) {
      return null;
    }
    const trimmed = value.trim();
    if (!INTEGER_SHIRT_NUMBER.test(trimmed)) {
      ctx.addIssue({
        code: "custom",
        message: "El dorsal debe ser un número entero.",
      });
      return z.NEVER;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (parsed < SHIRT_NUMBER_MIN || parsed > SHIRT_NUMBER_MAX) {
      ctx.addIssue({
        code: "custom",
        message: "El dorsal debe estar entre 1 y 99.",
      });
      return z.NEVER;
    }
    return parsed;
  });
