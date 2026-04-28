"use server";

import { database, type Prisma } from "@repo/database";
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
  complexity: z.enum(COMPLEXITY),
  strategy: z.enum(STRATEGY),
  coordinativeSkill: z.enum(COORDINATIVE_SKILL),
  tacticalIntention: z.enum(TACTICAL_INTENTION),
  dynamicType: z.enum(DYNAMIC_TYPE),
  gameSituation: z.enum(GAME_SITUATION),
  coordinationType: z.enum(COORDINATION_TYPE),
  visibility: z.enum(["PRIVATE", "CLUB_SHARED"]).default("CLUB_SHARED"),
  diagramData: z.string().optional(),
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

function readTrimmedString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function parseFormDataToExerciseInput(formData: FormData): Record<string, unknown> {
  return {
    name: readTrimmedString(formData, "name"),
    objectivesText: readTrimmedString(formData, "objectivesText"),
    explanationText: readTrimmedString(formData, "explanationText"),
    durationMinutes: formData.get("durationMinutes") ?? "",
    spaceWidthMeters: formData.get("spaceWidthMeters") ?? "",
    spaceLengthMeters: formData.get("spaceLengthMeters") ?? "",
    playersCount: formData.get("playersCount") ?? "",
    complexity: formData.get("complexity") ?? "",
    strategy: formData.get("strategy") ?? "",
    coordinativeSkill: formData.get("coordinativeSkill") ?? "",
    tacticalIntention: formData.get("tacticalIntention") ?? "",
    dynamicType: formData.get("dynamicType") ?? "",
    gameSituation: formData.get("gameSituation") ?? "",
    coordinationType: formData.get("coordinationType") ?? "",
    visibility: formData.get("visibility") ?? "CLUB_SHARED",
    diagramData: formData.get("diagramData") ?? "",
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
        minPlayers: parsed.data.playersCount,
        maxPlayers: parsed.data.playersCount,
        complexity: parsed.data.complexity,
        strategy: parsed.data.strategy,
        coordinativeSkill: parsed.data.coordinativeSkill,
        tacticalIntention: parsed.data.tacticalIntention,
        dynamicType: parsed.data.dynamicType,
        gameSituation: parsed.data.gameSituation,
        coordinationType: parsed.data.coordinationType,
        visibility: parsed.data.visibility as "PRIVATE" | "CLUB_SHARED",
        createdByMembershipId: staffContext.membershipId,
        ...(parsed.data.diagramData
          ? {
              diagramData: JSON.parse(parsed.data.diagramData) as Prisma.InputJsonValue,
              diagramVersion: 1,
            }
          : {}),
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
        minPlayers: parsed.data.playersCount,
        maxPlayers: parsed.data.playersCount,
        complexity: parsed.data.complexity,
        strategy: parsed.data.strategy,
        coordinativeSkill: parsed.data.coordinativeSkill,
        tacticalIntention: parsed.data.tacticalIntention,
        dynamicType: parsed.data.dynamicType,
        gameSituation: parsed.data.gameSituation,
        coordinationType: parsed.data.coordinationType,
        visibility: parsed.data.visibility as "PRIVATE" | "CLUB_SHARED",
        ...(parsed.data.diagramData
          ? {
              diagramData: JSON.parse(parsed.data.diagramData) as Prisma.InputJsonValue,
              diagramVersion: { increment: 1 },
            }
          : {}),
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

  const result = await database.exercise.updateMany({
    where: {
      id: exerciseId,
      clubId: staffContext.club.id,
      isSystem: false,
    },
    data: { isArchived: true },
  });

  if (result.count === 0) {
    throw new Error("No se puede archivar este ejercicio.");
  }

  revalidatePath("/exercises");
}

export async function toggleExerciseVisibility(exerciseId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.club) {
      return { ok: false, error: "Club no encontrado" };
    }

    const exercise = await database.exercise.findFirst({
      where: {
        id: exerciseId,
        clubId: staffContext.club.id,
        isSystem: false,
      },
      select: { id: true, visibility: true, createdByMembershipId: true },
    });

    if (!exercise) {
      return { ok: false, error: "Ejercicio no encontrado." };
    }

    if (exercise.createdByMembershipId !== staffContext.membershipId) {
      return { ok: false, error: "No tienes permiso para cambiar la visibilidad de este ejercicio." };
    }

    await database.exercise.update({
      where: { id: exercise.id },
      data: {
        visibility: exercise.visibility === "PRIVATE" ? "CLUB_SHARED" : "PRIVATE",
      },
    });

    revalidatePath("/exercises");
    return { ok: true };
  } catch {
    return { ok: false, error: "Error al cambiar la visibilidad." };
  }
}

function buildDuplicateExerciseName(sourceName: string): string {
  const suffix = " (copia)";
  const maxBase = 120 - suffix.length;
  const base =
    sourceName.length > maxBase
      ? sourceName.slice(0, maxBase).trimEnd()
      : sourceName;
  return `${base}${suffix}`;
}

export async function duplicateExercise(
  exerciseId: string
): Promise<{ ok: true; exerciseId: string } | { ok: false; error: string }> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.club) {
      return { ok: false, error: "Club no encontrado" };
    }

    const clubId = staffContext.club.id;

    const source = await database.exercise.findFirst({
      where: {
        id: exerciseId,
        isArchived: false,
        OR: [{ clubId }, { isSystem: true }],
      },
    });

    if (!source) {
      return { ok: false, error: "Ejercicio no encontrado." };
    }

    const duplicateName = buildDuplicateExerciseName(source.name);
    const slug = await buildUniqueSlug(clubId, duplicateName);

    const created = await database.exercise.create({
      data: {
        clubId,
        slug,
        name: duplicateName,
        objectivesText: source.objectivesText,
        explanationText: source.explanationText,
        durationMinutes: source.durationMinutes,
        spaceWidthMeters: source.spaceWidthMeters,
        spaceLengthMeters: source.spaceLengthMeters,
        minPlayers: source.minPlayers,
        maxPlayers: source.maxPlayers,
        complexity: source.complexity,
        strategy: source.strategy,
        coordinativeSkill: source.coordinativeSkill,
        tacticalIntention: source.tacticalIntention,
        dynamicType: source.dynamicType,
        gameSituation: source.gameSituation,
        coordinationType: source.coordinationType,
        visibility: source.visibility,
        createdByMembershipId: staffContext.membershipId,
        ...(source.diagramData !== null
          ? {
              diagramData: source.diagramData as Prisma.InputJsonValue,
            }
          : {}),
        diagramVersion: source.diagramVersion,
        diagramThumbnailUrl: source.diagramThumbnailUrl,
        isSystem: false,
      },
      select: { id: true },
    });

    revalidatePath("/exercises");
    return { ok: true, exerciseId: created.id };
  } catch {
    return { ok: false, error: "Error al duplicar el ejercicio." };
  }
}
