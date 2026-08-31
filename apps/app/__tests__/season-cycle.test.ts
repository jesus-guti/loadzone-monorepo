import { describe, expect, it } from "vitest";
import { createSeasonSchema } from "@/features/seasons/lib/create-season-schema";
import {
  addWeeksToCivilDate,
  defaultSeasonCycle,
  officialStartDate,
  roundedWeeks,
  seasonCycleLabel,
  seasonPersistedName,
  seasonRangeError,
} from "@/features/seasons/lib/season-cycle";

describe("defaultSeasonCycle", () => {
  it("fills amateur football ranges for the start year", () => {
    expect(defaultSeasonCycle(2026)).toEqual({
      startYear: 2026,
      startDate: "2026-07-01",
      preSeasonEnd: "2026-08-15",
      endDate: "2027-05-31",
    });
    expect(officialStartDate("2026-08-15")).toBe("2026-08-16");
    expect(seasonCycleLabel(2026)).toBe("Temporada 2026/2027");
    expect(seasonPersistedName(2026)).toBe("2026/2027");
  });

  it("matches the spec week counts on defaults", () => {
    const cycle = defaultSeasonCycle(2026);
    expect(roundedWeeks(cycle.startDate, cycle.preSeasonEnd)).toBe(6);
    expect(roundedWeeks("2026-08-16", cycle.endDate)).toBe(41);
  });
});

describe("seasonRangeError", () => {
  it("rejects overlapping or inverted ranges", () => {
    expect(
      seasonRangeError({
        startDate: "2026-07-01",
        preSeasonEnd: "2026-06-30",
        endDate: "2027-05-31",
      })
    ).not.toBeNull();
    expect(
      seasonRangeError({
        startDate: "2026-07-01",
        preSeasonEnd: "2026-08-15",
        endDate: "2026-08-15",
      })
    ).not.toBeNull();
  });

  it("accepts chained official start", () => {
    expect(seasonRangeError(defaultSeasonCycle(2026))).toBeNull();
  });
});

describe("week shifts", () => {
  it("moves preseason end by seven days", () => {
    expect(addWeeksToCivilDate("2026-08-15", 1)).toBe("2026-08-22");
    expect(addWeeksToCivilDate("2026-08-15", -1)).toBe("2026-08-08");
  });
});

describe("createSeasonSchema", () => {
  it("requires preseason end and a coherent range", () => {
    const ok = createSeasonSchema.safeParse({
      name: "2026/2027",
      ...defaultSeasonCycle(2026),
    });
    expect(ok.success).toBe(true);

    const missing = createSeasonSchema.safeParse({
      name: "2026/2027",
      startDate: "2026-07-01",
      endDate: "2027-05-31",
    });
    expect(missing.success).toBe(false);
  });
});
