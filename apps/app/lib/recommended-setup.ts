/** Fixed Primeros pasos step ids in display / completion order. */
export const RECOMMENDED_SETUP_STEP_IDS = [
  "clubLogo",
  "season",
  "player",
  "exercise",
  "session",
] as const;

export type RecommendedSetupStepId = (typeof RECOMMENDED_SETUP_STEP_IDS)[number];

export const RECOMMENDED_SETUP_STEP_COUNT = RECOMMENDED_SETUP_STEP_IDS.length;

/** Stored User×Club panel chrome preference. */
export type RecommendedSetupPanelChrome =
  | "expanded"
  | "minimized"
  | "dismissed";

/** Effective shell visibility derived from stored chrome. */
export type RecommendedSetupPanelVisibility =
  | "expanded"
  | "minimized"
  | "hidden";

export type RecommendedSetupClubFacts = {
  hasClubLogo: boolean;
  hasAnySeason: boolean;
  hasAnyPlayer: boolean;
  hasMembershipExerciseFavorite: boolean;
  hasExerciseOnSession: boolean;
  hasAnySession: boolean;
};

export const EMPTY_RECOMMENDED_SETUP_FACTS: RecommendedSetupClubFacts = {
  hasClubLogo: false,
  hasAnySeason: false,
  hasAnyPlayer: false,
  hasMembershipExerciseFavorite: false,
  hasExerciseOnSession: false,
  hasAnySession: false,
};

export type RecommendedSetupActiveTeam = {
  hasActiveSeason: boolean;
  hasPlayers: boolean;
};

export type RecommendedSetupInput = {
  clubFacts: RecommendedSetupClubFacts;
  panelChrome: RecommendedSetupPanelChrome;
  activeTeam: RecommendedSetupActiveTeam;
};

export type RecommendedSetupStep = {
  id: RecommendedSetupStepId;
  done: boolean;
};

export type RecommendedSetupResult = {
  steps: RecommendedSetupStep[];
  completedCount: number;
  totalCount: typeof RECOMMENDED_SETUP_STEP_COUNT;
  panelVisibility: RecommendedSetupPanelVisibility;
  needsSeason: boolean;
  needsPlayers: boolean;
};

function resolvePanelVisibility(
  panelChrome: RecommendedSetupPanelChrome,
): RecommendedSetupPanelVisibility {
  if (panelChrome === "dismissed") {
    return "hidden";
  }
  if (panelChrome === "minimized") {
    return "minimized";
  }
  return "expanded";
}

/**
 * Maps Club setup facts + User×Club panel chrome + active-Team baseline inputs
 * to Primeros pasos steps, progress, effective visibility, and Operational Baseline flags.
 * Pure — no DB, no UI, no Spanish product strings.
 */
export function resolveRecommendedSetup(
  input: RecommendedSetupInput,
): RecommendedSetupResult {
  const { clubFacts, panelChrome, activeTeam } = input;

  const steps: RecommendedSetupStep[] = [
    { id: "clubLogo", done: clubFacts.hasClubLogo },
    { id: "season", done: clubFacts.hasAnySeason },
    { id: "player", done: clubFacts.hasAnyPlayer },
    {
      id: "exercise",
      done:
        clubFacts.hasMembershipExerciseFavorite ||
        clubFacts.hasExerciseOnSession,
    },
    { id: "session", done: clubFacts.hasAnySession },
  ];

  const completedCount = steps.filter((step) => step.done).length;

  return {
    steps,
    completedCount,
    totalCount: RECOMMENDED_SETUP_STEP_COUNT,
    panelVisibility: resolvePanelVisibility(panelChrome),
    needsSeason: !activeTeam.hasActiveSeason,
    needsPlayers: !activeTeam.hasPlayers,
  };
}
