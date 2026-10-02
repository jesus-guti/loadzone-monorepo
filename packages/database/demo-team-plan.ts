/** Calendar and check-in script for the sales demo team. */

export const DEMO_TEAM_NAME = "Primer Equipo Vimenor";
export const DEMO_SEASON_START = "2026-07-06";
export const DEMO_PRESEASON_END = "2026-08-22";
export const DEMO_LEAGUE_START = "2026-08-23";
export const DEMO_TIMEZONE = "Europe/Madrid";
export const DEMO_RNG_SEED = 20260706;

const TRAINING_MINUTES = [70, 75, 80, 85, 90] as const;

export type DemoSessionType = "TRAINING" | "MATCH";

export type PlannedDemoSession = {
  readonly date: string;
  readonly type: DemoSessionType;
  readonly title: string;
  readonly startHour: number;
  readonly minutes: number;
};

export type DemoAttendance = "PRESENT" | "ABSENT" | "EXCUSED";

export type ScriptedDemoPlayer = {
  readonly playerIndex: number;
  readonly injured: boolean;
  readonly fills: boolean;
  readonly rpe: number;
  readonly recovery: number;
  readonly energy: number;
  readonly soreness: number;
  readonly sleepHours: number;
  readonly sleepQuality: number;
  readonly attendance: DemoAttendance | null;
  readonly minutesPlayed: number | null;
};

export type ScriptedDemoSession = PlannedDemoSession & {
  readonly startsAt: Date;
  readonly completed: boolean;
  readonly players: readonly ScriptedDemoPlayer[];
};

type InjuryWindow = {
  readonly playerIndex: number;
  readonly start: string;
  readonly end: string;
};

const INJURIES: readonly InjuryWindow[] = [
  { playerIndex: 4, start: "2026-08-11", end: "2026-08-30" },
  { playerIndex: 11, start: "2026-09-02", end: "2026-09-20" },
  { playerIndex: 16, start: "2026-09-15", end: "2026-10-06" },
];

export function addCivilDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function civilDateInTimeZone(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00.000Z`).getUTCDay();
}

export function madridStart(iso: string, hour: number, minute: number): Date {
  const utcHour = hour - 2;
  return new Date(
    `${iso}T${String(utcHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function planDemoSessions(through: string): PlannedDemoSession[] {
  const sessions: PlannedDemoSession[] = [];
  let durationIndex = 0;
  for (let date = DEMO_SEASON_START; date <= through; date = addCivilDays(date, 1)) {
    const day = weekday(date);
    if (date <= DEMO_PRESEASON_END) {
      if (
        day === 0 &&
        (date === "2026-07-19" || date === "2026-08-02" || date === "2026-08-16")
      ) {
        sessions.push({
          date,
          type: "MATCH",
          title: "Amistoso",
          startHour: 18,
          minutes: 95,
        });
      } else if (day === 1 || day === 2 || day === 4 || day === 5) {
        const minutes = TRAINING_MINUTES[durationIndex % TRAINING_MINUTES.length] ?? 80;
        durationIndex += 1;
        sessions.push({
          date,
          type: "TRAINING",
          title: "Entreno",
          startHour: 19,
          minutes,
        });
      }
      continue;
    }
    if (date < DEMO_LEAGUE_START) {
      continue;
    }
    if (day === 0) {
      sessions.push({
        date,
        type: "MATCH",
        title: "Partido",
        startHour: 12,
        minutes: 95,
      });
    } else if (day === 2 || day === 4 || day === 5) {
      const minutes = TRAINING_MINUTES[durationIndex % TRAINING_MINUTES.length] ?? 80;
      durationIndex += 1;
      sessions.push({
        date,
        type: "TRAINING",
        title: day === 5 ? "Activación" : "Entreno",
        startHour: day === 5 ? 18 : 19,
        minutes,
      });
    }
  }
  return sessions;
}

function microcycleIndex(date: string): number {
  const ms =
    new Date(`${date}T12:00:00.000Z`).getTime() -
    new Date(`${DEMO_SEASON_START}T12:00:00.000Z`).getTime();
  return Math.floor(ms / (7 * 86_400_000));
}

function targetRpe(date: string, type: DemoSessionType, playerIndex: number): number {
  const week = microcycleIndex(date);
  const wave = 6 + Math.round(Math.sin(week / 2) * 1.6 + (week % 3 === 0 ? -1 : 0.4));
  const matchBump = type === "MATCH" ? 1 : weekday(date) === 5 ? -1 : 0;
  return clamp(
    wave + matchBump + (playerIndex % 3 === 0 ? 1 : 0) - (playerIndex % 4 === 0 ? 1 : 0),
    3,
    9
  );
}

export function demoPlayerInjured(playerIndex: number, date: string): boolean {
  return INJURIES.some(
    (injury) =>
      injury.playerIndex === playerIndex && date >= injury.start && date <= injury.end
  );
}

export function scriptDemoSeason(
  playerCount: number,
  through: string
): ScriptedDemoSession[] {
  const rand = mulberry32(DEMO_RNG_SEED);
  return planDemoSessions(through).map((session) => {
    const startsAt = madridStart(session.date, session.startHour, 0);
    const completed = true;
    const called = new Set<number>();
    if (session.type === "MATCH") {
      for (let index = 0; index < Math.min(18, playerCount); index += 1) {
        if (!demoPlayerInjured(index, session.date)) {
          called.add(index);
        }
      }
    }
    const players: ScriptedDemoPlayer[] = [];
    for (let index = 0; index < playerCount; index += 1) {
      const injured = demoPlayerInjured(index, session.date);
      let attendance: DemoAttendance | null = null;
      let minutesPlayed: number | null = null;
      if (completed && session.type === "MATCH") {
        minutesPlayed = 0;
        if (called.has(index)) {
          const order = [...called].indexOf(index);
          if (order < 11) {
            minutesPlayed = order % 5 === 0 ? 78 : 95;
          } else if (order < 16) {
            minutesPlayed = 12 + ((order * 7) % 28);
          }
        }
        attendance = injured
          ? "EXCUSED"
          : minutesPlayed > 0 || called.has(index)
            ? "PRESENT"
            : "ABSENT";
        if (injured) {
          minutesPlayed = 0;
        }
      } else if (completed && injured) {
        attendance = "EXCUSED";
      }

      let fills = false;
      let rpe = 0;
      if (completed && !injured) {
        const flaky = index % 7 === 0;
        fills = rand() < (flaky ? 0.42 : 0.88);
        rpe = targetRpe(session.date, session.type, index);
      }
      const recovery = clamp(11 - rpe + (index % 2), 3, 9);
      players.push({
        playerIndex: index,
        injured,
        fills,
        rpe,
        recovery,
        energy: clamp(recovery + (index % 3 === 0 ? -1 : 1), 3, 9),
        soreness: clamp(Math.max(rpe, 3) - 2, 1, 8),
        sleepHours: clamp(9 - Math.round(Math.max(rpe, 3) / 4) + (index % 2), 5, 9),
        sleepQuality: clamp(recovery, 3, 9),
        attendance,
        minutesPlayed,
      });
    }
    return { ...session, startsAt, completed, players };
  });
}
