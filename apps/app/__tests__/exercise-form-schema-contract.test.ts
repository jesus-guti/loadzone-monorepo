import { describe, expect, it } from "vitest";
import {
  COMPLEXITY_OPTIONS,
  COORDINATION_TYPE_OPTIONS,
  COORDINATIVE_SKILL_OPTIONS,
  DYNAMIC_TYPE_OPTIONS,
  GAME_SITUATION_OPTIONS,
  STRATEGY_OPTIONS,
  TACTICAL_INTENTION_OPTIONS,
} from "@/features/exercises/exercise-attribute-vocabulary";
import { baseExerciseSchema } from "@/features/exercises/exercise-form-schema";

function minimalValidExercisePayload() {
  return {
    name: "Nombre mínimo",
    objectivesText: "Objetivos mínimos",
    explanationText: "",
    durationMinutes: 15,
    spaceWidthMeters: 20,
    spaceLengthMeters: 30,
    playersCount: 12,
    complexity: COMPLEXITY_OPTIONS[0].value,
    strategy: STRATEGY_OPTIONS[0].value,
    coordinativeSkill: COORDINATIVE_SKILL_OPTIONS[0].value,
    tacticalIntention: TACTICAL_INTENTION_OPTIONS[0].value,
    dynamicType: DYNAMIC_TYPE_OPTIONS[0].value,
    gameSituation: GAME_SITUATION_OPTIONS[0].value,
    coordinationType: COORDINATION_TYPE_OPTIONS[0].value,
    visibility: "CLUB_SHARED",
    diagramData: "",
  };
}

describe("baseExerciseSchema (enum vocabulary contract)", () => {
  it("acepta un payload cuyos enums coinciden con el vocabulario compartido", () => {
    const parsed = baseExerciseSchema.safeParse(minimalValidExercisePayload());
    expect(parsed.success).toBe(true);
  });

  it("rechaza un valor de enum inválido con issue en el campo y código estable", () => {
    const parsed = baseExerciseSchema.safeParse({
      ...minimalValidExercisePayload(),
      complexity: "NOT_A_REAL_COMPLEXITY",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    const first = parsed.error.issues[0];
    expect(first?.path).toEqual(["complexity"]);
    expect(first?.code).toBe("invalid_value");
  });
});
