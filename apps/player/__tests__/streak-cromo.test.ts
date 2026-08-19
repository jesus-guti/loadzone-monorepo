import { describe, expect, it } from "vitest";

import {
  CROMO_CLAIM,
  CROMO_TIER_LABEL,
  CROMO_TIER_SHELL,
  cromoMediaUrl,
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

  it("wires each tier to distinct player-local vivid CSS tokens (not sage brand mix)", () => {
    const tops = ([1, 2, 3, 4] as const).map(
      (tier) => CROMO_TIER_SHELL[tier]["--cromo-top"]
    );
    expect(new Set(tops).size).toBe(4);
    expect(CROMO_TIER_SHELL[1]["--cromo-top"]).toBe("var(--cromo-1-top)");
    expect(CROMO_TIER_SHELL[2]["--cromo-top"]).toBe("var(--cromo-2-top)");
    expect(CROMO_TIER_SHELL[3]["--cromo-top"]).toBe("var(--cromo-3-top)");
    expect(CROMO_TIER_SHELL[4]["--cromo-top"]).toBe("var(--cromo-4-top)");
    for (const tier of [1, 2, 3, 4] as const) {
      expect(CROMO_TIER_SHELL[tier]["--cromo-top"]).not.toContain("var(--brand)");
      expect(CROMO_TIER_SHELL[tier]["--cromo-bottom"]).not.toContain(
        "var(--brand)"
      );
    }
  });

  it("keeps glow tokens as CSS vars so shells stay whisper-highlight", () => {
    for (const tier of [1, 2, 3, 4] as const) {
      expect(CROMO_TIER_SHELL[tier]["--cromo-glow"]).toBe(
        `var(--cromo-${tier}-glow)`
      );
    }
  });
});

describe("cromoMediaUrl", () => {
  it("builds kind-only same-origin proxy URLs without the player token", () => {
    expect(cromoMediaUrl("photo")).toBe("/api/cromo-media?kind=photo");
    expect(cromoMediaUrl("crest")).toBe("/api/cromo-media?kind=crest");
    expect(cromoMediaUrl("photo")).not.toContain("token=");
    expect(cromoMediaUrl("crest")).not.toContain("token=");
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
