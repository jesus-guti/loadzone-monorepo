/** PROTOTYPE — placeholder numbers for the Carga microcycles screen. Not production data. */

export type AcBand = "bajo" | "optimo" | "transicion" | "peligro";

/** Shared minutes for a day that has a session, when no match length is known. */
export const SHARED_DAY_MINUTES = 95;

export type DayColumn = {
  readonly key: string;
  readonly weekday: string;
  readonly dateLabel: string;
  /** Null on a Monday–Sunday week with no match: show the weekday only. */
  readonly matchDay: string | null;
  /** One duration for the civil day. Rest days are 0. */
  readonly minutes: number;
  /** Mean of the personal loads of players who reported that day. */
  readonly teamLoad: number;
  /** Day-over-day rise of at least 15%. */
  readonly jump: boolean;
  readonly acute: number;
  readonly chronic: number;
  readonly ac: number;
};

export type Microcycle = {
  readonly index: number;
  readonly days: readonly DayColumn[];
};

export type PlayerRow = {
  readonly name: string;
  /** Personal load (RPE × that day's minutes) for each civil day, in season order. */
  readonly loads: readonly number[];
};

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;

type DaySeed = {
  key: string;
  weekday: string;
  dateLabel: string;
  matchDay: string | null;
  minutes: number;
  targetLoad: number;
};

function band(ac: number): AcBand {
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

export function acBand(ac: number): AcBand {
  return band(ac);
}

function seedWeek(
  start: { month: string; days: readonly number[] },
  matchDays: readonly (string | null)[],
  targetLoads: readonly number[]
): DaySeed[] {
  return WEEKDAYS.map((weekday, index) => {
    const targetLoad = targetLoads[index] ?? 0;
    return {
      key: `${start.month}-${start.days[index]}`,
      weekday,
      dateLabel: `${start.days[index]} ${start.month}`,
      matchDay: matchDays[index] ?? null,
      minutes: targetLoad === 0 ? 0 : SHARED_DAY_MINUTES,
      targetLoad,
    };
  });
}

const WEEK_SEEDS: readonly { index: number; days: readonly DaySeed[] }[] = [
  {
    index: 1,
    days: seedWeek(
      { month: "ago", days: [3, 4, 5, 6, 7, 8, 9] },
      [null, null, null, null, null, null, null],
      [280, 310, 0, 420, 390, 180, 0]
    ),
  },
  {
    index: 2,
    days: seedWeek(
      { month: "ago", days: [10, 11, 12, 13, 14, 15, 16] },
      ["MD-6", "MD-5", "MD-4", "MD-3", "MD-2", "MD-1", "MD"],
      [260, 340, 0, 510, 470, 220, 640]
    ),
  },
  {
    index: 3,
    days: seedWeek(
      { month: "ago", days: [17, 18, 19, 20, 21, 22, 23] },
      ["MD+1", "MD-5", "MD-4", "MD-3", "MD-2", "MD-1", "MD"],
      [90, 300, 0, 360, 410, 200, 610]
    ),
  },
];

const DAY_SEEDS: readonly DaySeed[] = WEEK_SEEDS.flatMap((week) => week.days);

const PLAYER_PATTERNS: readonly { name: string; pattern: readonly number[] }[] =
  [
    { name: "Aitor", pattern: [1, 1.1, 0, 1.2, 1, 0.6, 1.3] },
    { name: "Bruno", pattern: [0.9, 1, 0, 1.1, 0.95, 0.5, 1.2] },
    { name: "Carlos", pattern: [1.05, 0.95, 0, 1, 1.1, 0.7, 1.15] },
    { name: "Diego", pattern: [0.8, 1.15, 0, 1.25, 1, 0.4, 1.4] },
    { name: "Elena", pattern: [1.1, 1, 0, 0.9, 1.05, 0.55, 1.1] },
    { name: "Farid", pattern: [0.95, 1.05, 0, 1.15, 0.9, 0.65, 1.25] },
    { name: "Gorka", pattern: [1, 0.85, 0, 1.05, 1.2, 0.5, 1] },
    { name: "Hugo", pattern: [1.15, 1.1, 0, 1.3, 1, 0.6, 1.35] },
  ];

function personalLoad(targetLoad: number, factor: number, meanFactor: number): number {
  if (targetLoad === 0 || factor === 0 || meanFactor === 0) {
    return 0;
  }
  return Math.round((targetLoad * factor) / meanFactor);
}

export const PLAYERS: readonly PlayerRow[] = PLAYER_PATTERNS.map((player) => ({
  name: player.name,
  loads: DAY_SEEDS.map((day, index) => {
    const weekday = index % 7;
    const factors = PLAYER_PATTERNS.map(
      (candidate) => candidate.pattern[weekday] ?? 0
    ).filter((factor) => factor > 0);
    const meanFactor =
      factors.reduce((sum, factor) => sum + factor, 0) / Math.max(factors.length, 1);
    return personalLoad(
      day.targetLoad,
      player.pattern[weekday] ?? 0,
      meanFactor
    );
  }),
}));

function meanReportedLoad(dayIndex: number): number {
  const reported = PLAYERS.map((player) => player.loads[dayIndex] ?? 0).filter(
    (load) => load > 0
  );
  if (reported.length === 0) {
    return 0;
  }
  return Math.round(
    reported.reduce((sum, load) => sum + load, 0) / reported.length
  );
}

function withTeamMetrics(seeds: readonly DaySeed[]): DayColumn[] {
  const days: DayColumn[] = [];
  let acuteWindow: number[] = [];
  let chronicWindow: number[] = [];

  seeds.forEach((seed, index) => {
    const teamLoad = meanReportedLoad(index);
    const previous = days.at(-1)?.teamLoad;
    acuteWindow = [...acuteWindow, teamLoad].slice(-7);
    chronicWindow = [...chronicWindow, teamLoad].slice(-28);
    const acute =
      acuteWindow.reduce((sum, value) => sum + value, 0) / acuteWindow.length;
    const chronic =
      chronicWindow.reduce((sum, value) => sum + value, 0) /
      chronicWindow.length;
    days.push({
      key: seed.key,
      weekday: seed.weekday,
      dateLabel: seed.dateLabel,
      matchDay: seed.matchDay,
      minutes: seed.minutes,
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

  return days;
}

const SEASON_DAYS = withTeamMetrics(DAY_SEEDS);

/** Microcycle 1 = first Monday–Sunday of preseason. One week has no match. */
export const MICROCYCLES: readonly Microcycle[] = WEEK_SEEDS.map((week, weekIndex) => ({
  index: week.index,
  days: SEASON_DAYS.slice(weekIndex * 7, weekIndex * 7 + 7),
}));

export const ALL_DAYS: readonly DayColumn[] = SEASON_DAYS;
