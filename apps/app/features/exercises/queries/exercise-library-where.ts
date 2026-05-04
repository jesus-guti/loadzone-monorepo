import type { Prisma } from "@repo/database";

/** Ejercicios visibles en la biblioteca del club: propios del club + catálogo de sistema. */
export function exerciseLibraryWhere(clubId: string): Prisma.ExerciseWhereInput {
  return {
    isArchived: false,
    OR: [
      { clubId, isArchived: false },
      { isSystem: true, isArchived: false },
    ],
  };
}
