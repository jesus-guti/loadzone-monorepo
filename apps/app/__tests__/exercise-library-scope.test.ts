import { describe, expect, it } from "vitest";
import { isExerciseInLibraryScope } from "@/features/exercises/exercise-library-sort-filter";
import type { ExerciseLibraryListItem } from "@/features/exercises/types";

const baseItem: ExerciseLibraryListItem = {
  id: "e1",
  name: "Test",
  slug: "test",
  clubId: "c1",
  isSystem: false,
  createdByMembershipId: null,
  durationMinutes: 10,
  complexity: "LOW",
  strategy: "S1",
  tacticalIntention: "T1",
  dynamicType: "D1",
  coordinativeSkill: "C1",
  gameSituation: "G1",
  coordinationType: "X1",
  visibility: "CLUB_SHARED" as const,
  createdByUserName: null,
  updatedAt: new Date().toISOString(),
  isFavorite: false,
  diagramDataJson: null,
  diagramThumbnailUrl: null,
};

function item(overrides: Partial<ExerciseLibraryListItem>): ExerciseLibraryListItem {
  return { ...baseItem, ...overrides };
}

describe("isExerciseInLibraryScope", () => {
  const me = "m1";

  it("club incluye catálogo sistema", () => {
    expect(
      isExerciseInLibraryScope(
        item({ isSystem: true, createdByMembershipId: null }),
        me,
        "club"
      )
    ).toBe(true);
  });

  it("club incluye ejercicio de otro miembro", () => {
    expect(
      isExerciseInLibraryScope(
        item({ isSystem: false, createdByMembershipId: "other" }),
        me,
        "club"
      )
    ).toBe(true);
  });

  it("club excluye ejercicio propio", () => {
    expect(
      isExerciseInLibraryScope(
        item({ isSystem: false, createdByMembershipId: me }),
        me,
        "club"
      )
    ).toBe(false);
  });

  it("club incluye custom sin autor (anómalo)", () => {
    expect(
      isExerciseInLibraryScope(
        item({ isSystem: false, createdByMembershipId: null }),
        me,
        "club"
      )
    ).toBe(true);
  });

  it("mine solo incluye creaciones del membership", () => {
    expect(
      isExerciseInLibraryScope(
        item({ isSystem: false, createdByMembershipId: me }),
        me,
        "mine"
      )
    ).toBe(true);
    expect(
      isExerciseInLibraryScope(
        item({ isSystem: true, createdByMembershipId: null }),
        me,
        "mine"
      )
    ).toBe(false);
    expect(
      isExerciseInLibraryScope(
        item({ isSystem: false, createdByMembershipId: "other" }),
        me,
        "mine"
      )
    ).toBe(false);
  });
});
