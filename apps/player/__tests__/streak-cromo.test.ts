import { describe, expect, it } from "vitest";

import {
  CROMO_CLAIM,
  CROMO_SEAL_ARC_TOP,
  CROMO_SHIRT_OVERPRINT_ROTATION_DEG,
  CROMO_SHIRT_SEAL_ROTATION_DEG,
  CROMO_TIER_LABEL,
  CROMO_TIER_SHELL,
  CROMO_TIERS,
  cromoFoilKind,
  cromoMediaUrl,
  cromoSealArcBottom,
  cromoShirtOverprintLabel,
  cromoTeamRankLabel,
  resolveCromoShirtNumber,
  resolveTeamStreakRank,
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
    expect(streakCountToCromoTier(29)).toBe(4);
    expect(streakCountToCromoTier(30)).toBe(5);
    expect(streakCountToCromoTier(59)).toBe(5);
    expect(streakCountToCromoTier(60)).toBe(6);
    expect(streakCountToCromoTier(400)).toBe(6);
  });
});

describe("Streak Cromo Spanish copy", () => {
  it("uses material tier labels and claim without performance scoring", () => {
    expect(CROMO_TIER_LABEL[1]).toBe("Bronce");
    expect(CROMO_TIER_LABEL[2]).toBe("Plata");
    expect(CROMO_TIER_LABEL[3]).toBe("Oro");
    expect(CROMO_TIER_LABEL[4]).toBe("Platino");
    expect(CROMO_TIER_LABEL[5]).toBe("Esmeralda");
    expect(CROMO_TIER_LABEL[6]).toBe("Diamante");
    expect(CROMO_CLAIM).toBe("Tu constancia fuera del campo");
  });

  it("wires each tier to distinct player-local vivid CSS tokens (not sage brand mix)", () => {
    const tops = CROMO_TIERS.map(
      (tier) => CROMO_TIER_SHELL[tier]["--cromo-top"]
    );
    expect(new Set(tops).size).toBe(CROMO_TIERS.length);
    for (const tier of CROMO_TIERS) {
      expect(CROMO_TIER_SHELL[tier]["--cromo-top"]).toBe(
        `var(--cromo-${tier}-top)`
      );
      expect(CROMO_TIER_SHELL[tier]["--cromo-top"]).not.toContain("var(--brand)");
      expect(CROMO_TIER_SHELL[tier]["--cromo-bottom"]).not.toContain(
        "var(--brand)"
      );
    }
  });

  it("paints each tier on the card article via data-streak-cromo-tier CSS", async () => {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const globalsPath = fileURLToPath(
      new URL("../app/globals.css", import.meta.url)
    );
    const foilPath = fileURLToPath(
      new URL(
        "../app/[token]/components/streak-cromo.css",
        import.meta.url
      )
    );
    const globals = await readFile(globalsPath, "utf8");
    const foil = await readFile(foilPath, "utf8");
    for (const tier of CROMO_TIERS) {
      expect(globals).toContain(`[data-streak-cromo-tier="${tier}"]`);
      expect(globals).toContain(`--cromo-${tier}-top:`);
      expect(foil).toContain(`[data-streak-cromo-tier="${tier}"]`);
    }
    expect(foil).toContain("linear-gradient(180deg, var(--cromo-top)");
    expect(foil).toContain(".cromo-frame");
    expect(foil).toContain(".cromo-shine");
    expect(foil).toContain(".cromo-glare");
  });

  it("maps plate, holo, and spark onto existing CromoTiers", () => {
    expect(cromoFoilKind(1)).toBe("plate");
    expect(cromoFoilKind(2)).toBe("plate");
    expect(cromoFoilKind(3)).toBe("holo");
    expect(cromoFoilKind(4)).toBe("holo");
    expect(cromoFoilKind(5)).toBe("holo");
    expect(cromoFoilKind(6)).toBe("spark");
  });

  it("keeps glow tokens as CSS vars so shells stay whisper-highlight", () => {
    for (const tier of CROMO_TIERS) {
      expect(CROMO_TIER_SHELL[tier]["--cromo-glow"]).toBe(
        `var(--cromo-${tier}-glow)`
      );
    }
  });
});

describe("resolveCromoShirtNumber", () => {
  it("omits the portrait overprint when the Player has no shirt number", () => {
    expect(resolveCromoShirtNumber(null)).toBeNull();
    expect(resolveCromoShirtNumber(undefined)).toBeNull();
  });

  it("uses Player.shirtNumber for the overprint, not streak rank", () => {
    expect(resolveCromoShirtNumber(10)).toBe(10);
    expect(resolveCromoShirtNumber(1)).toBe(1);
  });
});

describe("resolveTeamStreakRank", () => {
  it("gives #1 to the longest Recoverable Streak on the Team", () => {
    expect(
      resolveTeamStreakRank({
        playerStreak: 30,
        teamStreaks: [3, 0, 30, 12],
      })
    ).toEqual({ position: 1, teamSize: 4 });
  });

  it("omits a rank when this Player’s streak is 0", () => {
    expect(
      resolveTeamStreakRank({
        playerStreak: 0,
        teamStreaks: [0, 5],
      })
    ).toEqual({ position: null, teamSize: 2 });
  });

  it("shares the best place on a tie (competition ranking)", () => {
    expect(
      resolveTeamStreakRank({
        playerStreak: 7,
        teamStreaks: [14, 7, 7],
      })
    ).toEqual({ position: 2, teamSize: 3 });
  });
});

describe("cromo shirt seal copy", () => {
  it("labels team rank for assistive tech and keeps circular copy on rank", () => {
    expect(cromoTeamRankLabel(1, 9)).toBe(
      "Puesto 1 de 9 por racha en el equipo"
    );
    expect(cromoShirtOverprintLabel(10)).toBe("Dorsal 10");
    expect(CROMO_SEAL_ARC_TOP).toBe("RACHA DEL EQUIPO");
    expect(cromoSealArcBottom(9)).toBe("DE 9");
    expect(CROMO_SHIRT_SEAL_ROTATION_DEG).toBe(25);
    expect(CROMO_SHIRT_OVERPRINT_ROTATION_DEG).toBe(25);
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

  it("lab presets land on all six cromo tiers", () => {
    expect(LAB_CROMO_STREAKS.map(streakCountToCromoTier)).toEqual([
      ...CROMO_TIERS,
    ]);
  });
});
