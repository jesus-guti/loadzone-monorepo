import { describe, expect, it } from "vitest";
import {
  exerciseLibraryListRowBaseSelect,
  exerciseLibraryListRowSelectWithMembership,
} from "@/features/exercises/queries/exercise-library-list-select";

describe("exerciseLibraryListRow select (primary vs fallback projection)", () => {
  it("full select equals base spread plus membershipFavorites filter (same core fields)", () => {
    const membershipId = "mem-contract-test";
    const full = exerciseLibraryListRowSelectWithMembership(membershipId);

    expect(Object.keys(full).sort()).toEqual(
      [...Object.keys(exerciseLibraryListRowBaseSelect), "membershipFavorites"].sort(),
    );

    const { membershipFavorites, ...rest } = full;
    expect(rest).toEqual(exerciseLibraryListRowBaseSelect);
    expect(membershipFavorites).toEqual({
      where: { membershipId },
      select: { membershipId: true },
    });
  });
});
