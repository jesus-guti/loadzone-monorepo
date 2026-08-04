import type { BodyRegionCatalogId } from "@repo/database/body-region-catalog";

export type YearFilter = "total" | number;

export type HistoryInjuryEpisode = {
  readonly id: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly cause: string;
  readonly regionIds: readonly BodyRegionCatalogId[];
  readonly regionLabels: readonly string[];
};

const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

/** Calendar year of an episode's startDate (YYYY-MM-DD). */
export function episodeYear(injury: {
  readonly startDate: string;
}): number {
  return Number(injury.startDate.slice(0, 4));
}

/** Distinct startDate years, newest first. */
export function listInjuryYears(
  injuries: readonly HistoryInjuryEpisode[]
): number[] {
  const years = new Set(injuries.map(episodeYear));
  return Array.from(years).sort((a, b) => b - a);
}

/** Episodes matching the year tab (before region filter). */
export function filterInjuriesByYear(
  injuries: readonly HistoryInjuryEpisode[],
  yearFilter: YearFilter
): HistoryInjuryEpisode[] {
  if (yearFilter === "total") {
    return [...injuries];
  }
  return injuries.filter((injury) => episodeYear(injury) === yearFilter);
}

/**
 * Per-region episode counts under the active year filter.
 * Multi-region episodes increment each region by 1.
 */
export function countRegionsByYear(
  injuries: readonly HistoryInjuryEpisode[],
  yearFilter: YearFilter
): ReadonlyMap<BodyRegionCatalogId, number> {
  const counts = new Map<BodyRegionCatalogId, number>();
  for (const injury of filterInjuriesByYear(injuries, yearFilter)) {
    for (const regionId of injury.regionIds) {
      counts.set(regionId, (counts.get(regionId) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Histórico rows: year ∩ optional region, newest startDate first.
 * Region filter does not affect badge counts (use countRegionsByYear separately).
 */
export function filterHistoryList(
  injuries: readonly HistoryInjuryEpisode[],
  yearFilter: YearFilter,
  regionFilter: BodyRegionCatalogId | null
): HistoryInjuryEpisode[] {
  let list = filterInjuriesByYear(injuries, yearFilter);
  if (regionFilter !== null) {
    list = list.filter((injury) => injury.regionIds.includes(regionFilter));
  }
  return list.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
}

export function formatDateEs(isoDate: string): string {
  const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12
  ) {
    return isoDate;
  }
  return `${day} ${MONTHS_ES[month - 1]} ${year}`;
}

/** Closed: «Desde … hasta …»; open: «Desde … · Abierta». */
export function formatInjuryDateRangeEs(
  startDate: string,
  endDate: string | null
): string {
  if (endDate === null) {
    return `Desde ${formatDateEs(startDate)} · Abierta`;
  }
  return `Desde ${formatDateEs(startDate)} hasta ${formatDateEs(endDate)}`;
}
