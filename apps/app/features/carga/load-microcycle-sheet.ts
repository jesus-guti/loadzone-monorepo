import "server-only";

import { database } from "@repo/database";
import {
  civilDateToUtcMidnight,
  toCivilDateString,
} from "@repo/database/recoverable-streak";
import {
  buildMicrocycleSheet,
  type MicrocycleSheet,
} from "./microcycles";

export async function loadMicrocycleSheet(
  teamId: string,
  seasonId: string,
  timeZone: string
): Promise<MicrocycleSheet | null> {
  const season = await database.season.findFirst({
    where: { id: seasonId, teamId },
    select: { startDate: true, endDate: true },
  });
  if (!season) {
    return null;
  }

  const seasonStart = toCivilDateString(season.startDate, "UTC");
  const seasonEnd = toCivilDateString(season.endDate, "UTC");
  const queryStart = civilDateToUtcMidnight(seasonStart);
  queryStart.setUTCDate(queryStart.getUTCDate() - 7);
  const queryEnd = civilDateToUtcMidnight(seasonEnd);
  queryEnd.setUTCDate(queryEnd.getUTCDate() + 2);

  const [players, sessions, entries] = await Promise.all([
    database.player.findMany({
      where: { teamId, isArchived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    database.teamSession.findMany({
      where: {
        teamId,
        status: { not: "CANCELLED" },
        startsAt: { gte: queryStart, lt: queryEnd },
      },
      select: { type: true, startsAt: true },
    }),
    database.dailyEntry.findMany({
      where: {
        seasonId,
        rpe: { not: null },
        date: {
          gte: queryStart,
          lte: queryEnd,
        },
      },
      select: { playerId: true, date: true, rpe: true },
    }),
  ]);

  const rpeByPlayer = new Map<string, Record<string, number>>();
  for (const entry of entries) {
    if (entry.rpe === null) {
      continue;
    }
    const date = toCivilDateString(entry.date, "UTC");
    const current = rpeByPlayer.get(entry.playerId) ?? {};
    current[date] = entry.rpe;
    rpeByPlayer.set(entry.playerId, current);
  }

  const matchDates: string[] = [];
  const sessionDates: string[] = [];
  for (const session of sessions) {
    const date = toCivilDateString(session.startsAt, timeZone);
    sessionDates.push(date);
    if (session.type === "MATCH") {
      matchDates.push(date);
    }
  }

  return buildMicrocycleSheet({
    seasonStart,
    seasonEnd,
    matchDates,
    sessionDates,
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      rpeByDate: rpeByPlayer.get(player.id) ?? {},
    })),
  });
}
