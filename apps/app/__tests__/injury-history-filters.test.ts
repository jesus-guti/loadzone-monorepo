import { describe, expect, it } from "vitest";
import type { BodyRegionCatalogId } from "@repo/database/body-region-catalog";
import {
  countRegionsByYear,
  episodeYear,
  filterHistoryList,
  filterInjuriesByYear,
  formatDateEs,
  formatInjuryDateRangeEs,
  listInjuryYears,
  type HistoryInjuryEpisode,
} from "@/features/injuries/lib/injury-history-filters";

function episode(
  partial: Partial<HistoryInjuryEpisode> &
    Pick<HistoryInjuryEpisode, "id" | "startDate" | "regionIds">
): HistoryInjuryEpisode {
  return {
    endDate: null,
    cause: "Causa",
    regionLabels: partial.regionIds,
    ...partial,
  };
}

const fixtures: HistoryInjuryEpisode[] = [
  episode({
    id: "a",
    startDate: "2026-03-08",
    endDate: "2026-03-22",
    cause: "Partido — esguince",
    regionIds: ["ANKLE_R"],
  }),
  episode({
    id: "b",
    startDate: "2025-11-01",
    endDate: "2025-11-20",
    cause: "Entrenamiento — isquios + rodilla",
    regionIds: ["THIGH_BACK_R", "KNEE_R"],
  }),
  episode({
    id: "c",
    startDate: "2025-06-15",
    endDate: null,
    cause: "Abierta — tobillo",
    regionIds: ["ANKLE_R"],
  }),
  episode({
    id: "d",
    startDate: "2024-02-10",
    endDate: "2024-03-01",
    cause: "Partido — hombro",
    regionIds: ["SHOULDER_R"],
  }),
];

describe("episodeYear / listInjuryYears", () => {
  it("derives year from startDate", () => {
    expect(episodeYear({ startDate: "2026-03-08" })).toBe(2026);
  });

  it("lists distinct years newest first", () => {
    expect(listInjuryYears(fixtures)).toEqual([2026, 2025, 2024]);
  });
});

describe("filterInjuriesByYear", () => {
  it("returns all episodes for Total", () => {
    expect(filterInjuriesByYear(fixtures, "total")).toHaveLength(4);
  });

  it("filters by startDate year", () => {
    const ids = filterInjuriesByYear(fixtures, 2025).map((i) => i.id);
    expect(ids).toEqual(["b", "c"]);
  });
});

describe("countRegionsByYear", () => {
  it("increments each region once per episode (multi-region)", () => {
    const counts = countRegionsByYear(fixtures, "total");
    expect(counts.get("ANKLE_R")).toBe(2);
    expect(counts.get("THIGH_BACK_R")).toBe(1);
    expect(counts.get("KNEE_R")).toBe(1);
    expect(counts.get("SHOULDER_R")).toBe(1);
  });

  it("respects year filter for badge counts", () => {
    const counts = countRegionsByYear(fixtures, 2025);
    expect(counts.get("ANKLE_R")).toBe(1);
    expect(counts.get("THIGH_BACK_R")).toBe(1);
    expect(counts.get("KNEE_R")).toBe(1);
    expect(counts.get("SHOULDER_R")).toBeUndefined();
  });

  it("includes open injuries in counts", () => {
    const counts = countRegionsByYear(fixtures, 2025);
    expect(counts.get("ANKLE_R")).toBe(1);
  });
});

describe("filterHistoryList", () => {
  it("sorts newest-first by startDate", () => {
    const ids = filterHistoryList(fixtures, "total", null).map((i) => i.id);
    expect(ids).toEqual(["a", "b", "c", "d"]);
  });

  it("applies year ∩ region without changing year-only count semantics", () => {
    const region: BodyRegionCatalogId = "ANKLE_R";
    const list = filterHistoryList(fixtures, 2025, region);
    expect(list.map((i) => i.id)).toEqual(["c"]);
    // Badge counts still year-only (multi-region episode still counted fully):
    expect(countRegionsByYear(fixtures, 2025).get("KNEE_R")).toBe(1);
  });

  it("clears to year-only when regionFilter is null", () => {
    expect(filterHistoryList(fixtures, 2025, null)).toHaveLength(2);
  });
});

describe("formatInjuryDateRangeEs", () => {
  it("formats closed and open ranges in Spanish", () => {
    expect(formatDateEs("2026-03-08")).toBe("8 mar 2026");
    expect(formatInjuryDateRangeEs("2026-03-08", "2026-03-22")).toBe(
      "Desde 8 mar 2026 hasta 22 mar 2026"
    );
    expect(formatInjuryDateRangeEs("2025-06-15", null)).toBe(
      "Desde 15 jun 2025 · Abierta"
    );
  });
});
