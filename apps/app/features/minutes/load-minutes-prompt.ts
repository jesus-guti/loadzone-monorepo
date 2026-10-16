import { database } from "@repo/database";
import {
  civilDateToUtcMidnight,
  toCivilDateString,
} from "@repo/database/recoverable-streak";
import { shouldPromptMinutes } from "@/features/minutes/derive";
import type { MinutesPromptState } from "@/features/minutes/minutes-prompt-types";
import { getCurrentStaffContext } from "@/lib/auth-context";

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
      lineup: { select: { id: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const todayRows = rows.filter(
    (row) => toCivilDateString(row.startsAt, team.timezone) === today,
  );

  const promptHour = team.minutesPromptHour ?? 20;
  const visible = shouldPromptMinutes({
    hour: teamHour(team.timezone, now),
    promptHour,
    sessions: todayRows.map((row) => ({
      cancelled: row.status === "CANCELLED",
      type: row.type,
      sharedMinutes: row.sharedMinutes,
      hasLineup: row.lineup !== null,
    })),
  });

  if (!visible) {
    return null;
  }

  const pendingSessions = todayRows
    .filter((row) => {
      if (row.status === "CANCELLED") {
        return false;
      }
      if (row.type === "MATCH") {
        return row.lineup === null;
      }
      return row.sharedMinutes === null;
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      sharedMinutes: row.sharedMinutes,
    }));

  if (pendingSessions.length === 0) {
    return null;
  }

  const players = await database.player.findMany({
    where: { teamId: team.id, isArchived: false },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return {
    pendingSessions,
    players,
    promptHour,
  };
}
