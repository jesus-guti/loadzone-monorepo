const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type SeasonCycleDates = {
  readonly startYear: number;
  readonly startDate: string;
  readonly preSeasonEnd: string;
  readonly endDate: string;
};

export function parseCivilDate(value: string): Date | undefined {
  const match = CIVIL_DATE_PATTERN.exec(value);
  if (!match) {
    return;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return;
  }

  return parsed;
}

export function formatCivilDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function civilDate(year: number, monthIndex: number, day: number): string {
  return formatCivilDate(new Date(year, monthIndex, day));
}

export function seasonCycleLabel(startYear: number): string {
  return `Temporada ${startYear}/${startYear + 1}`;
}

export function seasonPersistedName(startYear: number): string {
  return `${startYear}/${startYear + 1}`;
}

export function defaultSeasonCycle(startYear: number): SeasonCycleDates {
  return {
    startYear,
    startDate: civilDate(startYear, 6, 1),
    preSeasonEnd: civilDate(startYear, 7, 15),
    endDate: civilDate(startYear + 1, 4, 31),
  };
}

export function currentStartYear(now: Date = new Date()): number {
  return now.getFullYear();
}

export function startYearOptions(now: Date = new Date()): readonly number[] {
  const current = currentStartYear(now);
  return [current - 1, current, current + 1, current + 2, current + 3];
}

export function addWeeksToCivilDate(value: string, weeks: number): string | undefined {
  const date = parseCivilDate(value);
  if (!date) {
    return;
  }
  date.setDate(date.getDate() + weeks * 7);
  return formatCivilDate(date);
}

export function dayAfter(value: string): string | undefined {
  const date = parseCivilDate(value);
  if (!date) {
    return;
  }
  date.setDate(date.getDate() + 1);
  return formatCivilDate(date);
}

export function officialStartDate(preSeasonEnd: string): string | undefined {
  return dayAfter(preSeasonEnd);
}

export function roundedWeeks(start: string, end: string): number | undefined {
  const startDate = parseCivilDate(start);
  const endDate = parseCivilDate(end);
  if (!startDate || !endDate) {
    return;
  }
  const days = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
  if (days < 0) {
    return;
  }
  return Math.round(days / 7);
}

export function seasonRangeError(input: {
  readonly startDate: string;
  readonly preSeasonEnd: string;
  readonly endDate: string;
}): string | null {
  const start = parseCivilDate(input.startDate);
  const preEnd = parseCivilDate(input.preSeasonEnd);
  const end = parseCivilDate(input.endDate);
  const officialStart = officialStartDate(input.preSeasonEnd);

  if (!start || !preEnd || !end || !officialStart) {
    return "Fechas no válidas.";
  }
  if (!(start < preEnd)) {
    return "La pretemporada debe terminar después de su inicio.";
  }
  const officialStartDateParsed = parseCivilDate(officialStart);
  if (!officialStartDateParsed || !(officialStartDateParsed <= end)) {
    return "La temporada oficial debe empezar el día posterior al fin de pretemporada y terminar después.";
  }
  return null;
}

export function canShiftPreseasonEnd(
  cycle: SeasonCycleDates,
  weeks: number
): boolean {
  const nextEnd = addWeeksToCivilDate(cycle.preSeasonEnd, weeks);
  if (!nextEnd) {
    return false;
  }
  return seasonRangeError({
    startDate: cycle.startDate,
    preSeasonEnd: nextEnd,
    endDate: cycle.endDate,
  }) === null;
}

export function canShiftOfficialEnd(
  cycle: SeasonCycleDates,
  weeks: number
): boolean {
  const nextEnd = addWeeksToCivilDate(cycle.endDate, weeks);
  if (!nextEnd) {
    return false;
  }
  return seasonRangeError({
    startDate: cycle.startDate,
    preSeasonEnd: cycle.preSeasonEnd,
    endDate: nextEnd,
  }) === null;
}

export function cycleMonthSpan(cycle: SeasonCycleDates): {
  readonly totalMonths: number;
  readonly preseasonRatio: number;
} {
  const start = parseCivilDate(cycle.startDate);
  const preEnd = parseCivilDate(cycle.preSeasonEnd);
  const end = parseCivilDate(cycle.endDate);
  if (!start || !preEnd || !end || end <= start) {
    return { totalMonths: 0, preseasonRatio: 0 };
  }
  const total = end.getTime() - start.getTime();
  const pre = Math.max(0, preEnd.getTime() - start.getTime());
  const monthApprox = 30.44 * MS_PER_DAY;
  return {
    totalMonths: Math.max(1, Math.round(total / monthApprox)),
    preseasonRatio: pre / total,
  };
}
