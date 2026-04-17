"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

type ActionResult = {
  success: boolean;
  error?: string;
  exerciseId?: string;
};

const COMPLEXITY = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;
const STRATEGY = [
  "SET_PIECES",
  "COMBINED_ACTIONS",
  "CIRCUITS",
  "CONSERVATION",
  "FOOTBALL_ADAPTED_GAME",
  "POSITIONAL_PLAY",
  "SPECIFIC_POSITIONAL_PLAY",
  "WAVES",
  "MATCHES",
  "POSSESSION",
  "PASSING_WHEEL",
  "SMALL_SIDED_SITUATIONS",
  "LINE_WORK",
] as const;
const COORDINATIVE_SKILL = [
  "STARTING",
  "BRAKING",
  "CHANGE_OF_DIRECTION",
  "DRIBBLING_CARRY",
  "BALL_CONTROL",
  "CLEARANCES",
  "MOVEMENT_PATTERNS",
  "SHOOTING",
  "TACKLING",
  "BALANCING",
  "TURNING",
  "INTERCEPTION",
  "PASSING",
  "PROTECTION",
  "DRIBBLING_1V1",
  "JUMPING",
] as const;
const TACTICAL_INTENTION = [
  "ONE_VS_ONE",
  "TWO_VS_ONE",
  "TWO_VS_TWO",
  "THREE_VS_THREE",
  "FOUR_VS_FOUR",
  "DEFENSIVE_SET_PIECES",
  "OFFENSIVE_SET_PIECES",
  "WIDTH",
  "SUPPORTS",
  "ORGANIZED_ATTACK",
  "COVER",
  "KEEP_POSSESSION",
  "COUNTERATTACK",
  "BUILD_UP_DEFENSE",
  "DIRECT_PLAY_DEFENSE",
  "ORGANIZED_DEFENSE",
  "RUNS_OFF_THE_BALL",
  "SPLIT_LINES",
  "PREVENT_PROGRESSION",
] as const;
const DYNAMIC_TYPE = [
  "EXTENSIVE",
  "STRENGTH",
  "INTENSIVE_ACTION",
  "INTENSIVE_INTERACTION",
  "RECOVERY",
  "ENDURANCE",
  "SPEED",
] as const;
const GAME_SITUATION = ["FULL_STRUCTURE", "INTERSECTORAL", "SECTORAL"] as const;
const COORDINATION_TYPE = [
  "TEAM_COORDINATION",
  "SINGLE_PLAYER_COORDINATION",
  "MULTI_PLAYER_COORDINATION",
] as const;

const baseExerciseSchema = z.object({
  name: z.string().min(2).max(120),
  objectivesText: z.string().min(2).max(2000),
  explanationText: z.string().min(2).max(4000),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  spaceWidthMeters: z.coerce.number().min(1).max(200),
  spaceLengthMeters: z.coerce.number().min(1).max(200),
  minPlayers: z.coerce.number().int().min(1).max(50),
  maxPlayers: z.coerce.number().int().min(1).max(60),
  complexity: z.enum(COMPLEXITY),
  strategy: z.enum(STRATEGY),
  coordinativeSkill: z.enum(COORDINATIVE_SKILL),
  tacticalIntention: z.enum(TACTICAL_INTENTION),
  dynamicType: z.enum(DYNAMIC_TYPE),
  gameSituation: z.enum(GAME_SITUATION),
  coordinationType: z.enum(COORDINATION_TYPE),
});

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function buildUniqueSlug(
  clubId: string,
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(name) || `exercise-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await database.exercise.findFirst({
      where: {
        clubId,
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

function parseFormDataToExerciseInput(formData: FormData): Record<string, unknown> {
  return {
    name: formData.get("name") ?? "",
    objectivesText: formData.get("objectivesText") ?? "",
    explanationText: formData.get("explanationText") ?? "",
    durationMinutes: formData.get("durationMinutes") ?? "",
    spaceWidthMeters: formData.get("spaceWidthMeters") ?? "",
    spaceLengthMeters: formData.get("spaceLengthMeters") ?? "",
    minPlayers: formData.get("minPlayers") ?? "",
    maxPlayers: formData.get("maxPlayers") ?? "",
    complexity: formData.get("complexity") ?? "",
    strategy: formData.get("strategy") ?? "",
    coordinativeSkill: formData.get("coordinativeSkill") ?? "",
    tacticalIntention: formData.get("tacticalIntention") ?? "",
    dynamicType: formData.get("dynamicType") ?? "",
    gameSituation: formData.get("gameSituation") ?? "",
    coordinationType: formData.get("coordinationType") ?? "",
  };
}

export async function createExercise(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  let createdId: string | undefined;

  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.club) {
      return { success: false, error: "Club no encontrado" };
    }

    const parsed = baseExerciseSchema.safeParse(
      parseFormDataToExerciseInput(formData)
    );

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      };
    }

    if (parsed.data.maxPlayers < parsed.data.minPlayers) {
      return {
        success: false,
        error: "El máximo de jugadores no puede ser menor al mínimo.",
      };
    }

    const slug = await buildUniqueSlug(staffContext.club.id, parsed.data.name);

    const created = await database.exercise.create({
      data: {
        clubId: staffContext.club.id,
        slug,
        name: parsed.data.name,
        objectivesText: parsed.data.objectivesText,
        explanationText: parsed.data.explanationText,
        durationMinutes: parsed.data.durationMinutes,
        spaceWidthMeters: parsed.data.spaceWidthMeters,
        spaceLengthMeters: parsed.data.spaceLengthMeters,
        minPlayers: parsed.data.minPlayers,
        maxPlayers: parsed.data.maxPlayers,
        complexity: parsed.data.complexity,
        strategy: parsed.data.strategy,
        coordinativeSkill: parsed.data.coordinativeSkill,
        tacticalIntention: parsed.data.tacticalIntention,
        dynamicType: parsed.data.dynamicType,
        gameSituation: parsed.data.gameSituation,
        coordinationType: parsed.data.coordinationType,
      },
      select: { id: true },
    });

    createdId = created.id;
    revalidatePath("/exercises");
  } catch {
    return { success: false, error: "Error al crear el ejercicio." };
  }

  if (createdId) {
    redirect(`/exercises/${createdId}`);
  }

  return { success: true };
}

const updateExerciseSchema = baseExerciseSchema.extend({
  id: z.string().min(1),
});

export async function updateExercise(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.club) {
      return { success: false, error: "Club no encontrado" };
    }

    const parsed = updateExerciseSchema.safeParse({
      ...parseFormDataToExerciseInput(formData),
      id: formData.get("id"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      };
    }

    if (parsed.data.maxPlayers < parsed.data.minPlayers) {
      return {
        success: false,
        error: "El máximo de jugadores no puede ser menor al mínimo.",
      };
    }

    const exercise = await database.exercise.findFirst({
      where: {
        id: parsed.data.id,
        clubId: staffContext.club.id,
      },
      select: { id: true, slug: true, name: true },
    });

    if (!exercise) {
      return { success: false, error: "Ejercicio no encontrado." };
    }

    const newSlug =
      exercise.name === parsed.data.name
        ? exercise.slug
        : await buildUniqueSlug(
            staffContext.club.id,
            parsed.data.name,
            exercise.id
          );

    await database.exercise.update({
      where: { id: exercise.id },
      data: {
        slug: newSlug,
        name: parsed.data.name,
        objectivesText: parsed.data.objectivesText,
        explanationText: parsed.data.explanationText,
        durationMinutes: parsed.data.durationMinutes,
        spaceWidthMeters: parsed.data.spaceWidthMeters,
        spaceLengthMeters: parsed.data.spaceLengthMeters,
        minPlayers: parsed.data.minPlayers,
        maxPlayers: parsed.data.maxPlayers,
        complexity: parsed.data.complexity,
        strategy: parsed.data.strategy,
        coordinativeSkill: parsed.data.coordinativeSkill,
        tacticalIntention: parsed.data.tacticalIntention,
        dynamicType: parsed.data.dynamicType,
        gameSituation: parsed.data.gameSituation,
        coordinationType: parsed.data.coordinationType,
      },
    });

    revalidatePath("/exercises");
    revalidatePath(`/exercises/${exercise.id}`);
    return { success: true, exerciseId: exercise.id };
  } catch {
    return { success: false, error: "Error al actualizar el ejercicio." };
  }
}

export async function archiveExercise(exerciseId: string): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.club) {
    throw new Error("Club no encontrado");
  }

  await database.exercise.update({
    where: { id: exerciseId, clubId: staffContext.club.id },
    data: { isArchived: true },
  });

  revalidatePath("/exercises");
}
