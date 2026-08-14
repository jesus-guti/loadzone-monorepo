import { describe, expect, it } from "vitest";
import {
  RECOMMENDED_SETUP_STEP_COUNT,
  RECOMMENDED_SETUP_STEP_IDS,
  resolveRecommendedSetup,
  type RecommendedSetupClubFacts,
  type RecommendedSetupInput,
} from "@/lib/recommended-setup";

const allIncompleteFacts: RecommendedSetupClubFacts = {
  hasClubLogo: false,
  hasAnySeason: false,
  hasAnyPlayer: false,
  hasMembershipExerciseFavorite: false,
  hasExerciseOnSession: false,
  hasAnySession: false,
};

const allCompleteFacts: RecommendedSetupClubFacts = {
  hasClubLogo: true,
  hasAnySeason: true,
  hasAnyPlayer: true,
  hasMembershipExerciseFavorite: true,
  hasExerciseOnSession: false,
  hasAnySession: true,
};

function baseInput(
  overrides: {
    clubFacts?: Partial<RecommendedSetupClubFacts>;
    panelChrome?: RecommendedSetupInput["panelChrome"];
    activeTeam?: RecommendedSetupInput["activeTeam"];
  } = {},
): RecommendedSetupInput {
  return {
    clubFacts: { ...allIncompleteFacts, ...overrides.clubFacts },
    panelChrome: overrides.panelChrome ?? "expanded",
    activeTeam: overrides.activeTeam ?? {
      hasActiveSeason: false,
      hasPlayers: false,
    },
  };
}

describe("resolveRecommendedSetup", () => {
  it("returns five steps in fixed order with totalCount 5", () => {
    const result = resolveRecommendedSetup(baseInput());
    expect(result.steps.map((s) => s.id)).toEqual([...RECOMMENDED_SETUP_STEP_IDS]);
    expect(result.totalCount).toBe(5);
    expect(result.totalCount).toBe(RECOMMENDED_SETUP_STEP_COUNT);
  });

  it("all incomplete + expanded → visibility expanded, counts 0/5, both needs* true", () => {
    const result = resolveRecommendedSetup(baseInput());
    expect(result.panelVisibility).toBe("expanded");
    expect(result.completedCount).toBe(0);
    expect(result.steps.every((s) => s.done === false)).toBe(true);
    expect(result.needsSeason).toBe(true);
    expect(result.needsPlayers).toBe(true);
  });

  it("partial completion counts done steps only", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: {
          hasClubLogo: true,
          hasAnySeason: true,
          hasAnyPlayer: false,
        },
      }),
    );
    expect(result.completedCount).toBe(2);
    expect(result.steps.find((s) => s.id === "clubLogo")?.done).toBe(true);
    expect(result.steps.find((s) => s.id === "season")?.done).toBe(true);
    expect(result.steps.find((s) => s.id === "player")?.done).toBe(false);
  });

  it("5/5 + dismissed → hidden", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: allCompleteFacts,
        panelChrome: "dismissed",
        activeTeam: { hasActiveSeason: true, hasPlayers: true },
      }),
    );
    expect(result.completedCount).toBe(5);
    expect(result.panelVisibility).toBe("hidden");
  });

  it("5/5 + expanded → expanded (post-restore path; does not force-hide)", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: allCompleteFacts,
        panelChrome: "expanded",
        activeTeam: { hasActiveSeason: true, hasPlayers: true },
      }),
    );
    expect(result.completedCount).toBe(5);
    expect(result.panelVisibility).toBe("expanded");
  });

  it("dismissed + incomplete → hidden but needs* still true", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        panelChrome: "dismissed",
        activeTeam: { hasActiveSeason: false, hasPlayers: false },
      }),
    );
    expect(result.panelVisibility).toBe("hidden");
    expect(result.completedCount).toBe(0);
    expect(result.needsSeason).toBe(true);
    expect(result.needsPlayers).toBe(true);
  });

  it("minimized → minimized and still returns counts", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: { hasClubLogo: true },
        panelChrome: "minimized",
      }),
    );
    expect(result.panelVisibility).toBe("minimized");
    expect(result.completedCount).toBe(1);
  });

  it("exercise false when both exercise flags false", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: {
          hasMembershipExerciseFavorite: false,
          hasExerciseOnSession: false,
        },
      }),
    );
    expect(result.steps.find((s) => s.id === "exercise")?.done).toBe(false);
  });

  it("exercise true on membership favorite alone", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: {
          hasMembershipExerciseFavorite: true,
          hasExerciseOnSession: false,
        },
      }),
    );
    expect(result.steps.find((s) => s.id === "exercise")?.done).toBe(true);
  });

  it("exercise true on session placement alone", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: {
          hasMembershipExerciseFavorite: false,
          hasExerciseOnSession: true,
        },
      }),
    );
    expect(result.steps.find((s) => s.id === "exercise")?.done).toBe(true);
  });

  it("Club season/player steps can be done while activeTeam baseline is still false", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        clubFacts: {
          hasAnySeason: true,
          hasAnyPlayer: true,
        },
        activeTeam: { hasActiveSeason: false, hasPlayers: false },
      }),
    );
    expect(result.steps.find((s) => s.id === "season")?.done).toBe(true);
    expect(result.steps.find((s) => s.id === "player")?.done).toBe(true);
    expect(result.needsSeason).toBe(true);
    expect(result.needsPlayers).toBe(true);
  });

  it("baseline flags unchanged when panel is hidden", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        panelChrome: "dismissed",
        activeTeam: { hasActiveSeason: true, hasPlayers: false },
      }),
    );
    expect(result.panelVisibility).toBe("hidden");
    expect(result.needsSeason).toBe(false);
    expect(result.needsPlayers).toBe(true);
  });

  it("always returns all five steps even when panelVisibility is hidden", () => {
    const result = resolveRecommendedSetup(
      baseInput({ panelChrome: "dismissed" }),
    );
    expect(result.panelVisibility).toBe("hidden");
    expect(result.steps).toHaveLength(5);
  });

  it("clears needs* when activeTeam baseline is met", () => {
    const result = resolveRecommendedSetup(
      baseInput({
        activeTeam: { hasActiveSeason: true, hasPlayers: true },
      }),
    );
    expect(result.needsSeason).toBe(false);
    expect(result.needsPlayers).toBe(false);
  });
});
