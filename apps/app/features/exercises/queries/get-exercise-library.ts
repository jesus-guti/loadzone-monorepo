import { database } from "@repo/database";
import { compareExerciseLibraryItems } from "../exercise-library-sort-filter";
import type {
  ExerciseLibraryListItem,
  ExerciseLibraryPayload,
  ExerciseLibrarySortKey,
  ExercisePickerRow,
} from "../types";
import {
  exerciseLibraryListRowBaseSelect,
  exerciseLibraryListRowSelectWithMembership,
  type ExerciseLibraryListDbRow,
} from "./exercise-library-list-select";
import { exerciseLibraryWhere } from "./exercise-library-where";

function isMissingFavoritesTableError(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    !("message" in error)
  ) {
    return false;
  }

  const code =
    typeof error.code === "string" ? error.code : "";
  const message =
    typeof error.message === "string" ? error.message : "";

  return (
    code === "P2021" &&
    message.includes("MembershipExerciseFavorite")
  );
}

function diagramDataToJsonString(
  value: unknown
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function sortItems(
  items: ExerciseLibraryListItem[],
  sort: ExerciseLibrarySortKey
): ExerciseLibraryListItem[] {
  return [...items].sort((a, b) => compareExerciseLibraryItems(a, b, sort));
}

export async function getExerciseLibraryPayload(input: {
  readonly clubId: string;
  readonly membershipId: string;
  readonly sort?: ExerciseLibrarySortKey;
}): Promise<ExerciseLibraryPayload> {
  const sort: ExerciseLibrarySortKey = input.sort ?? "updated_desc";

  let rows: ExerciseLibraryListDbRow[];
  try {
    rows = await database.exercise.findMany({
      where: exerciseLibraryWhere(input.clubId),
      select: exerciseLibraryListRowSelectWithMembership(input.membershipId),
    });
  } catch (error) {
    if (!isMissingFavoritesTableError(error)) {
      throw error;
    }

    const fallbackRows = await database.exercise.findMany({
      where: exerciseLibraryWhere(input.clubId),
      select: exerciseLibraryListRowBaseSelect,
    });

    rows = fallbackRows.map((row) => ({
      ...row,
      membershipFavorites: [],
    }));
  }

  const items: ExerciseLibraryListItem[] = rows.map((row) => {
    const isFavorite = row.membershipFavorites.length > 0;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      clubId: row.clubId,
      isSystem: row.isSystem,
      durationMinutes: row.durationMinutes,
      complexity: row.complexity,
      strategy: row.strategy,
      tacticalIntention: row.tacticalIntention,
      dynamicType: row.dynamicType,
      coordinativeSkill: row.coordinativeSkill,
      gameSituation: row.gameSituation,
      coordinationType: row.coordinationType,
      visibility: row.visibility,
      createdByMembershipId: row.createdByMembershipId,
      createdByUserName: row.createdBy?.user?.name ?? null,
      updatedAt: row.updatedAt.toISOString(),
      isFavorite,
      diagramDataJson: diagramDataToJsonString(row.diagramData),
      diagramThumbnailUrl: row.diagramThumbnailUrl,
    };
  });

  const favorites = sortItems(
    items.filter((item) => item.isFavorite),
    sort
  );
  const rest = sortItems(
    items.filter((item) => !item.isFavorite),
    sort
  );

  return { favorites, rest };
}

export async function getExercisePickerRows(
  clubId: string
): Promise<ExercisePickerRow[]> {
  const rows = await database.exercise.findMany({
    where: exerciseLibraryWhere(clubId),
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      complexity: true,
    },
    orderBy: { name: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    durationMinutes: row.durationMinutes,
    complexity: row.complexity,
  }));
}
