import { describe, expect, it, vi } from "vitest";
import {
  injuryNotDeletedWhere,
  softDeleteInjuryRecord,
  visibleInjuryRows,
} from "../injury-visibility";

describe("injury soft-delete regression", () => {
  it("softDeleteInjuryRecord sets deletedAt instead of hard delete", async () => {
    const update = vi.fn().mockResolvedValue({});
    const deletedAt = new Date("2026-10-15T12:00:00.000Z");

    await softDeleteInjuryRecord(
      { injury: { update } },
      "inj-closed",
      deletedAt
    );

    expect(update).toHaveBeenCalledWith({
      where: { id: "inj-closed" },
      data: { deletedAt },
    });
  });

  it("keeps sibling injury regions when one episode is edited", () => {
    type Episode = {
      readonly id: string;
      readonly deletedAt: Date | null;
      regionIds: string[];
    };

    const episodes: Episode[] = [
      { id: "closed", deletedAt: null, regionIds: ["ANKLE_R"] },
      { id: "open", deletedAt: null, regionIds: ["KNEE_R"] },
    ];

    const open = episodes.find((row) => row.id === "open");
    if (!open) {
      throw new Error("missing open episode");
    }
    open.regionIds = ["THIGH_FRONT_L"];

    expect(episodes.find((row) => row.id === "closed")?.regionIds).toEqual([
      "ANKLE_R",
    ]);
  });

  it("excludes soft-deleted rows from staff-visible injury lists", () => {
    const rows = [
      {
        id: "open",
        deletedAt: null,
        endDate: null,
      },
      {
        id: "closed",
        deletedAt: new Date("2026-10-15T12:00:00.000Z"),
        endDate: "2026-08-01",
      },
    ];

    expect(visibleInjuryRows(rows).map((row) => row.id)).toEqual(["open"]);
    expect(injuryNotDeletedWhere).toEqual({ deletedAt: null });
  });
});
