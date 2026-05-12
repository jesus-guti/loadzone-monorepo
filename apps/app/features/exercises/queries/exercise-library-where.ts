import type { Prisma } from "@repo/database";

/** Campos mínimos del ejercicio para evaluar el contrato de visibilidad (sin Prisma). */
export type StaffExerciseLibraryVisibility = {
  readonly clubId: string | null;
  readonly isSystem: boolean;
  readonly isArchived: boolean;
};

/**
 * Contrato observable de la biblioteca de staff para un club: entradas no archivadas
 * del club activo más entradas no archivadas del catálogo de sistema.
 * Debe permanecer alineado con {@link exerciseLibraryWhere}.
 */
export function matchesStaffExerciseLibraryVisibility(
  viewingClubId: string,
  exercise: StaffExerciseLibraryVisibility
): boolean {
  if (exercise.isArchived) {
    return false;
  }
  return exercise.isSystem || exercise.clubId === viewingClubId;
}

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
