import type { Prisma } from "@repo/database";

/**
 * Projection shared by the primary staff library query and the
 * `MembershipExerciseFavorite` compatibility fallback ({@link getExerciseLibraryPayload}).
 * Keeps core list fields mechanically identical across branches — do not drift.
 */
export const exerciseLibraryListRowBaseSelect = {
  id: true,
  name: true,
  slug: true,
  clubId: true,
  isSystem: true,
  durationMinutes: true,
  complexity: true,
  strategy: true,
  tacticalIntention: true,
  dynamicType: true,
  coordinativeSkill: true,
  gameSituation: true,
  coordinationType: true,
  visibility: true,
  createdByMembershipId: true,
  updatedAt: true,
  diagramData: true,
  diagramThumbnailUrl: true,
  createdBy: {
    select: {
      user: { select: { name: true } },
    },
  },
} satisfies Prisma.ExerciseSelect;

/** Select for happy path — return type inferred so Prisma narrows {@link ExerciseLibraryListDbRow}. */
export function exerciseLibraryListRowSelectWithMembership(
  membershipId: string,
) {
  return {
    ...exerciseLibraryListRowBaseSelect,
    membershipFavorites: {
      where: { membershipId },
      select: { membershipId: true },
    },
  } satisfies Prisma.ExerciseSelect;
}

/** Row shape returned by fallback `findMany` before synthetic `membershipFavorites`. */
export type ExerciseLibraryListDbRowWithoutFavorites =
  Prisma.ExerciseGetPayload<{
    select: typeof exerciseLibraryListRowBaseSelect;
  }>;

export type ExerciseLibraryListDbRow = ExerciseLibraryListDbRowWithoutFavorites & {
  membershipFavorites: Array<{ membershipId: string }>;
};
