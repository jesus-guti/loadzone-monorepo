import { describe, expect, it } from "vitest";
import {
  matchesStaffExerciseLibraryVisibility,
} from "@/features/exercises/queries/exercise-library-where";

type Row = {
  clubId: string | null;
  isSystem: boolean;
  isArchived: boolean;
};

describe("matchesStaffExerciseLibraryVisibility (staff club library contract)", () => {
  const viewingClub = "club-view";

  const cases: ReadonlyArray<{
    name: string;
    exercise: Row;
    expected: boolean;
  }> = [
    {
      name: "ejercicio del club activo, no sistema, no archivado",
      exercise: { clubId: viewingClub, isSystem: false, isArchived: false },
      expected: true,
    },
    {
      name: "catálogo sistema no archivado (clubId ajeno o null)",
      exercise: { clubId: "other-club", isSystem: true, isArchived: false },
      expected: true,
    },
    {
      name: "catálogo sistema con clubId null",
      exercise: { clubId: null, isSystem: true, isArchived: false },
      expected: true,
    },
    {
      name: "ejercicio de otro club, no sistema",
      exercise: { clubId: "other-club", isSystem: false, isArchived: false },
      expected: false,
    },
    {
      name: "ejercicio propio del club pero archivado",
      exercise: { clubId: viewingClub, isSystem: false, isArchived: true },
      expected: false,
    },
    {
      name: "catálogo sistema archivado",
      exercise: { clubId: null, isSystem: true, isArchived: true },
      expected: false,
    },
    {
      name: "sin club y no sistema (no visible)",
      exercise: { clubId: null, isSystem: false, isArchived: false },
      expected: false,
    },
  ];

  it.each(cases)("$name → $expected", ({ exercise, expected }) => {
    expect(matchesStaffExerciseLibraryVisibility(viewingClub, exercise)).toBe(
      expected
    );
  });
});
