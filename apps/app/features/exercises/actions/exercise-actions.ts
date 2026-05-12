"use server";

import { database, type Prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getCurrentStaffContext } from "@/lib/auth-context";
import {
  baseExerciseSchema,
  updateExerciseSchema,
} from "../exercise-form-schema";
import { exerciseLibraryWhere } from "../queries/exercise-library-where";

type ActionResult = {
  success: boolean;
  error?: string;
  exerciseId?: string;
};

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

    revalidatePath("/exercises");
    return { success: true, exerciseId: created.id };
  } catch {
    return { success: false, error: "Error al crear el ejercicio." };
  }
}

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

function isMissingFavoritesTableError(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    !("message" in error)
  ) {
    return false;
  }

  const code = typeof error.code === "string" ? error.code : "";
  const message = typeof error.message === "string" ? error.message : "";

  return code === "P2021" && message.includes("MembershipExerciseFavorite");
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
        AND: [{ id: exerciseId }, exerciseLibraryWhere(clubId)],
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

export async function toggleExerciseFavorite(
  exerciseId: string
): Promise<
  { ok: true; isFavorite: boolean } | { ok: false; error: string }
> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.club) {
      return { ok: false, error: "Club no encontrado" };
    }

    const exercise = await database.exercise.findFirst({
      where: {
        AND: [{ id: exerciseId }, exerciseLibraryWhere(staffContext.club.id)],
      },
      select: { id: true },
    });

    if (!exercise) {
      return { ok: false, error: "Ejercicio no encontrado." };
    }

    const favoriteWhere = {
      membershipId_exerciseId: {
        membershipId: staffContext.membershipId,
        exerciseId,
      },
    };

    const existing = await database.membershipExerciseFavorite.findUnique({
      where: favoriteWhere,
      select: { membershipId: true },
    });

    if (existing) {
      await database.membershipExerciseFavorite.delete({
        where: favoriteWhere,
      });
      revalidatePath("/exercises");
      return { ok: true, isFavorite: false };
    }

    await database.membershipExerciseFavorite.create({
      data: {
        membershipId: staffContext.membershipId,
        exerciseId,
      },
    });
    revalidatePath("/exercises");
    return { ok: true, isFavorite: true };
  } catch (error) {
    if (isMissingFavoritesTableError(error)) {
      return {
        ok: false,
        error:
          "Los favoritos todavia no estan disponibles en este entorno. Aplica la migracion de base de datos y vuelve a intentarlo.",
      };
    }
    return { ok: false, error: "No se pudo actualizar el favorito." };
  }
}
