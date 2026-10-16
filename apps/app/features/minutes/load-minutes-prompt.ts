import { database } from "@repo/database";
import {
  civilDateToUtcMidnight,
  toCivilDateString,
} from "@repo/database/recoverable-streak";
import { shouldPromptMinutes } from "@/features/minutes/derive";
import { getCurrentStaffContext } from "@/lib/auth-context";

export type PendingMinutesSession = {
  readonly id: string;
  readonly title: string;
  readonly type: "MATCH" | "TRAINING" | "RECOVERY" | "OTHER";
  readonly sharedMinutes: number | null;
};

export type MinutesPromptState = {
  readonly visible: boolean;
  readonly pendingSessions: readonly PendingMinutesSession[];
  readonly players: readonly { id: string; name: string }[];
};

function teamHour(timeZone: string, now: Date): number {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).format(now);
  return Number(formatted);
}

export async function loadMinutesPromptState(): Promise<MinutesPromptState | null> {
  const staff = await getCurrentStaffContext();
  const team = staff?.activeTeam;
  if (!team) {
    return null;
  }

  const now = new Date();
  const today = toCivilDateString(now, team.timezone);
  const windowStart = civilDateToUtcMidnight(today);
  windowStart.setUTCDate(windowStart.getUTCDate() - 1);
  const windowEnd = civilDateToUtcMidnight(today);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 2);

  const rows = await database.teamSession.findMany({
    where: {
      teamId: team.id,
      startsAt: { gte: windowStart, lt: windowEnd },
    },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      startsAt: true,
      sharedMinutes: true,
    },
    orderBy: { startsAt: "asc" },
  });

  const todayRows = rows.filter(
    (row) => toCivilDateString(row.startsAt, team.timezone) === today
  );

  const promptHour = team.minutesPromptHour ?? 20;
  const visible = shouldPromptMinutes({
    hour: teamHour(team.timezone, now),
    promptHour,
    sessions: todayRows.map((row) => ({
      cancelled: row.status === "CANCELLED",
      type: row.type,
      sharedMinutes: row.sharedMinutes,
      hasLineup: false,
    })),
  });

  const pendingSessions = todayRows
    .filter((row) => row.status !== "CANCELLED" && row.sharedMinutes === null)
    .map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      sharedMinutes: row.sharedMinutes,
    }));

  const players = await database.player.findMany({
    where: { teamId: team.id, isArchived: false },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return {
    visible,
    pendingSessions,
    players,
  };
}
