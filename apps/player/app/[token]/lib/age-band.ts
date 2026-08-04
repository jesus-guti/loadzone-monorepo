export const AGE_BANDS = ["assisted", "guided", "independent"] as const;

export type AgeBand = (typeof AGE_BANDS)[number];

/** Production default until staff Age Band settings (W1c). */
export const DEFAULT_AGE_BAND: AgeBand = "guided";

export function isAgeBand(value: unknown): value is AgeBand {
  return (
    typeof value === "string" &&
    (AGE_BANDS as readonly string[]).includes(value)
  );
}
