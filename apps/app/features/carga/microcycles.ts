import { addCivilDays } from "@repo/database/recoverable-streak";

/** Training and other non-match sessions until staff can edit duration. */
export const SESSION_MINUTES = 80;

/** Match sessions until staff can edit duration. */
export const MATCH_MINUTES = 95;

export type AcBand = "bajo" | "optimo" | "transicion" | "peligro";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;

const MONTHS = [
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

export type DayColumn = {
  readonly key: string;
  readonly weekday: string;
  readonly dateLabel: string;
  /** Null on a Monday–Sunday week with no match. */
  readonly matchDay: string | null;
  readonly minutes: number;
  /** Mean personal load of players who reported RPE. Rest days are 0. */
  readonly teamLoad: number;
  readonly jump: boolean;
  readonly acute: number;
  readonly chronic: number;
  readonly ac: number;
};

export type Microcycle = {
  readonly index: number;
  readonly days: readonly DayColumn[];
  /** Sum of each day's mean team load across this Monday–Sunday week. */
  readonly loadSum: number;
};

export type PlayerRow = {
  readonly id: string;
  readonly name: string;
  /** Session load (RPE × shared minutes). Feeds team daily load. */
  readonly loads: readonly number[];
  /** Reported RPE (1–10). Null when the player did not report that day. */
  readonly rpe: readonly (number | null)[];
};

export type MicrocycleSheet = {
  readonly microcycles: readonly Microcycle[];
  readonly days: readonly DayColumn[];
  readonly players: readonly PlayerRow[];
};

export type MicrocyclePlayerInput = {
  readonly id: string;
  readonly name: string;
  /** Reported RPE keyed by civil date (YYYY-MM-DD). Missing key means no report. */
  readonly rpeByDate: Readonly<Record<string, number>>;
};

export type MicrocycleSheetInput = {
  readonly seasonStart: string;
  readonly seasonEnd: string;
  /** Civil dates of MATCH sessions. */
  readonly matchDates: readonly string[];
  /** Civil dates with at least one non-cancelled session, including matches. */
  readonly sessionDates: readonly string[];
  readonly players: readonly MicrocyclePlayerInput[];
};

function utcNoon(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00.000Z`);
}

/** Monday = 0 … Sunday = 6. */
function weekdayIndex(isoDate: string): number {
  const day = utcNoon(isoDate).getUTCDay();
  return day === 0 ? 6 : day - 1;
}

function mondayOf(isoDate: string): string {
  return addCivilDays(isoDate, -weekdayIndex(isoDate));
}

function sundayOf(isoDate: string): string {
  return addCivilDays(mondayOf(isoDate), 6);
}

function daysBetween(start: string, end: string): number {
  const ms = utcNoon(end).getTime() - utcNoon(start).getTime();
  return Math.round(ms / 86_400_000);
}

function dateLabel(isoDate: string): string {
  const date = utcNoon(isoDate);
  const month = MONTHS[date.getUTCMonth()] ?? "";
  return `${date.getUTCDate()} ${month}`;
}

/** Column to land on when the sheet opens: today, or the nearest later day. */
export function anchorDayKey(
  days: readonly { readonly key: string }[],
  today: string
): string | null {
  if (days.length === 0) {
    return null;
  }
  if (days.some((day) => day.key === today)) {
    return today;
  }
  return days.find((day) => day.key > today)?.key ?? days.at(-1)?.key ?? null;
}

/** "A. Apellido": initial plus first surname. A single word is truncated. */
export function abbreviatePlayerName(name: string): string {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);
  const first = parts[0];
  if (!first) {
    return "";
  }
  if (parts.length === 1) {
    return first.length > 10 ? `${first.slice(0, 9)}…` : first;
  }
  const surname = parts[1] ?? first;
  const shortSurname = surname.length > 12 ? `${surname.slice(0, 11)}…` : surname;
  return `${first[0]?.toUpperCase() ?? ""}. ${shortSurname}`;
}

export function acBand(ac: number): AcBand {
  if (ac < 0.8) {
    return "bajo";
  }
  if (ac <= 1.3) {
    return "optimo";
  }
  if (ac <= 1.5) {
    return "transicion";
  }
  return "peligro";
}

function listDays(startMonday: string, endSunday: string): string[] {
  const days: string[] = [];
  let cursor = startMonday;
  while (cursor <= endSunday) {
    days.push(cursor);
    cursor = addCivilDays(cursor, 1);
  }
  return days;
}

/**
 * Labels only on a Monday–Sunday week that contains a match.
 * The day after a match is MD+1. Other days count down to the next match
 * in that week, or count up after the week's last match.
 */
export function matchDayLabel(
  isoDate: string,
  weekDates: readonly string[],
  matchDates: ReadonlySet<string>
): string | null {
  const weekMatches = weekDates.filter((day) => matchDates.has(day));
  if (weekMatches.length === 0) {
    return null;
  }
  if (matchDates.has(isoDate)) {
    return "MD";
  }
  if (matchDates.has(addCivilDays(isoDate, -1))) {
    return "MD+1";
  }
  const next = weekMatches.find((day) => day > isoDate);
  if (next) {
    return `MD-${daysBetween(isoDate, next)}`;
  }
  const previous = [...weekMatches].reverse().find((day) => day < isoDate);
  if (!previous) {
    return null;
  }
  return `MD+${daysBetween(previous, isoDate)}`;
}

function dayMinutes(
  date: string,
  sessions: ReadonlySet<string>,
  matches: ReadonlySet<string>
): number {
  if (matches.has(date)) {
    return MATCH_MINUTES;
  }
  if (sessions.has(date)) {
    return SESSION_MINUTES;
  }
  return 0;
}

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildMicrocycleSheet(
  input: MicrocycleSheetInput
): MicrocycleSheet {
  if (input.seasonStart > input.seasonEnd) {
    return { microcycles: [], days: [], players: [] };
  }

  const dates = listDays(mondayOf(input.seasonStart), sundayOf(input.seasonEnd));
  const matches = new Set(input.matchDates);
  const sessions = new Set(input.sessionDates);
  const weeks: string[][] = [];
  for (let index = 0; index < dates.length; index += 7) {
    weeks.push(dates.slice(index, index + 7));
  }

  const players: PlayerRow[] = input.players.map((player) => ({
    id: player.id,
    name: player.name,
    rpe: dates.map((date) => player.rpeByDate[date] ?? null),
    loads: dates.map((date) => {
      const rpe = player.rpeByDate[date];
      const minutes = dayMinutes(date, sessions, matches);
      if (rpe === undefined || minutes === 0) {
        return 0;
      }
      return Math.round(rpe * minutes);
    }),
  }));

  const teamLoads = dates.map((date, dayIndex) => {
    const reported = players.flatMap((player, playerIndex) => {
      if (input.players[playerIndex]?.rpeByDate[date] === undefined) {
        return [];
      }
      return [player.loads[dayIndex] ?? 0];
    });
    return Math.round(mean(reported));
  });

  const days: DayColumn[] = [];
  let acuteWindow: number[] = [];
  let chronicWindow: number[] = [];

  dates.forEach((date, index) => {
    const week = weeks[Math.floor(index / 7)] ?? [];
    const teamLoad = teamLoads[index] ?? 0;
    const previous = days.at(-1)?.teamLoad;
    acuteWindow = [...acuteWindow, teamLoad].slice(-7);
    chronicWindow = [...chronicWindow, teamLoad].slice(-28);
    const acute = mean(acuteWindow);
    const chronic = mean(chronicWindow);
    days.push({
      key: date,
      weekday: WEEKDAYS[weekdayIndex(date)] ?? "",
      dateLabel: dateLabel(date),
      matchDay: matchDayLabel(date, week, matches),
      minutes: dayMinutes(date, sessions, matches),
      teamLoad,
      jump:
        previous !== undefined &&
        previous > 0 &&
        (teamLoad - previous) / previous >= 0.15,
      acute: Math.round(acute),
      chronic: Math.round(chronic),
      ac: chronic === 0 ? 0 : Number((acute / chronic).toFixed(2)),
    });
  });

  return {
    microcycles: weeks.map((week, index) => {
      const weekDays = days.slice(index * 7, index * 7 + week.length);
      return {
        index: index + 1,
        days: weekDays,
        loadSum: weekDays.reduce((sum, day) => sum + day.teamLoad, 0),
      };
    }),
    days,
    players,
  };
}
