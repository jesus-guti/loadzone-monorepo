export const AGE_BANDS = ["assisted", "guided", "independent"] as const;

export type AgeBand = (typeof AGE_BANDS)[number];

/** Production default when policy resolves UNASSIGNED (missing DoB / override). */
export const DEFAULT_AGE_BAND: AgeBand = "guided";

export function isAgeBand(value: unknown): value is AgeBand {
  return (
    typeof value === "string" &&
    (AGE_BANDS as readonly string[]).includes(value)
  );
}

/** Map `@repo/database` ResolvedAgeBand → Focus-frame AgeBand keys. */
export function toFocusAgeBand(
  band: "ASSISTED" | "GUIDED" | "INDEPENDENT" | "UNASSIGNED"
): AgeBand {
  switch (band) {
    case "ASSISTED":
      return "assisted";
    case "INDEPENDENT":
      return "independent";
    case "GUIDED":
    case "UNASSIGNED":
      return "guided";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}
