import { z } from "zod";
import {
  COMPLEXITY_OPTIONS,
  COORDINATION_TYPE_OPTIONS,
  COORDINATIVE_SKILL_OPTIONS,
  DYNAMIC_TYPE_OPTIONS,
  enumValuesFromOptions,
  GAME_SITUATION_OPTIONS,
  STRATEGY_OPTIONS,
  TACTICAL_INTENTION_OPTIONS,
  VISIBILITY_OPTIONS,
} from "./exercise-attribute-vocabulary";

export const baseExerciseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre es demasiado largo."),
  objectivesText: z
    .string()
    .trim()
    .min(2, "Los objetivos deben tener al menos 2 caracteres.")
    .max(2000, "Los objetivos son demasiado largos."),
  explanationText: z
    .string()
    .trim()
    .max(4000, "La explicación es demasiado larga."),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  spaceWidthMeters: z.coerce.number().min(1).max(200),
  spaceLengthMeters: z.coerce.number().min(1).max(200),
  playersCount: z.coerce.number().int().min(1).max(60),
  complexity: z.enum(enumValuesFromOptions(COMPLEXITY_OPTIONS)),
  strategy: z.enum(enumValuesFromOptions(STRATEGY_OPTIONS)),
  coordinativeSkill: z.enum(enumValuesFromOptions(COORDINATIVE_SKILL_OPTIONS)),
  tacticalIntention: z.enum(enumValuesFromOptions(TACTICAL_INTENTION_OPTIONS)),
  dynamicType: z.enum(enumValuesFromOptions(DYNAMIC_TYPE_OPTIONS)),
  gameSituation: z.enum(enumValuesFromOptions(GAME_SITUATION_OPTIONS)),
  coordinationType: z.enum(enumValuesFromOptions(COORDINATION_TYPE_OPTIONS)),
  visibility: z
    .enum(enumValuesFromOptions(VISIBILITY_OPTIONS))
    .default("CLUB_SHARED"),
  diagramData: z.string().optional(),
});

export const updateExerciseSchema = baseExerciseSchema.extend({
  id: z.string().min(1),
});
