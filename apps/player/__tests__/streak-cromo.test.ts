import { describe, expect, it } from "vitest";

import {
  CROMO_CLAIM,
  CROMO_TIER_LABEL,
  CROMO_TIER_SHELL,
  streakCountToCromoTier,
} from "../app/[token]/lib/streak-cromo";
import {
  DEMO_STREAK,
  LAB_CROMO_STREAKS,
  parseLabStreak,
} from "../app/[token]/prototype-dd-05/constants";

describe("streakCountToCromoTier", () => {
  it("maps Recoverable Streak days onto discrete cromo tiers", () => {
    expect(streakCountToCromoTier(0)).toBe(1);
    expect(streakCountToCromoTier(1)).toBe(1);
    expect(streakCountToCromoTier(2)).toBe(1);
    expect(streakCountToCromoTier(3)).toBe(2);
    expect(streakCountToCromoTier(6)).toBe(2);
    expect(streakCountToCromoTier(7)).toBe(3);
    expect(streakCountToCromoTier(13)).toBe(3);
    expect(streakCountToCromoTier(14)).toBe(4);
    expect(streakCountToCromoTier(40)).toBe(4);
  });
});

describe("Streak Cromo Spanish copy", () => {
  it("uses habit-framed tier labels and claim without performance scoring", () => {
    expect(CROMO_TIER_LABEL[1]).toBe("Calentamiento");
    expect(CROMO_TIER_LABEL[2]).toBe("En racha");
    expect(CROMO_TIER_LABEL[3]).toBe("En forma");
    expect(CROMO_TIER_LABEL[4]).toBe("Leyenda");
    expect(CROMO_CLAIM).toBe("Tu constancia fuera del campo");
  });

  it("gives each tier a distinct sage mix so 0d and 14d cannot share a shell", () => {
    const tops = ([1, 2, 3, 4] as const).map(
      (tier) => CROMO_TIER_SHELL[tier]["--cromo-top"]
    );
    expect(new Set(tops).size).toBe(4);
    expect(CROMO_TIER_SHELL[1]["--cromo-top"]).toContain("22%");
    expect(CROMO_TIER_SHELL[4]["--cromo-top"]).toContain("88%");
  });

  it("keeps the radial highlight a whisper so it does not read as a spotlight on dark shells", () => {
    for (const tier of [1, 2, 3, 4] as const) {
      expect(Number.parseFloat(CROMO_TIER_SHELL[tier]["--cromo-glow"])).toBeLessThan(
        0.1
      );
    }
  });
});

describe("parseLabStreak", () => {
  it("defaults to DEMO_STREAK and rejects invalid query values", () => {
    expect(parseLabStreak(undefined)).toBe(DEMO_STREAK);
    expect(parseLabStreak("")).toBe(DEMO_STREAK);
    expect(parseLabStreak("nope")).toBe(DEMO_STREAK);
    expect(parseLabStreak("-1")).toBe(DEMO_STREAK);
    expect(parseLabStreak("14")).toBe(14);
  });

  it("lab presets land on all four cromo tiers", () => {
    expect(LAB_CROMO_STREAKS.map(streakCountToCromoTier)).toEqual([1, 2, 3, 4]);
  });
});
