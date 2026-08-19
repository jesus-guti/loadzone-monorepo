import { database } from "@repo/database";
import {
  civilDateToUtcMidnight,
  toCivilDateString,
} from "@repo/database/recoverable-streak";
import type { TeamWellnessCsvRow } from "./team-wellness-csv";

function toIsoOrNull(value: Date | null): string | null {
  if (value === null) {
    return null;
  }
  return value.toISOString();
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return Number(value);
}

export async function loadTeamWellnessCsvRows(
  teamId: string,
  from: string,
  to: string
): Promise<TeamWellnessCsvRow[]> {
  const entries = await database.dailyEntry.findMany({
    where: {
      date: {
        gte: civilDateToUtcMidnight(from),
        lte: civilDateToUtcMidnight(to),
      },
      player: {
        teamId,
      },
    },
    orderBy: [{ date: "asc" }, { player: { name: "asc" } }],
    select: {
      date: true,
      recovery: true,
      energy: true,
      soreness: true,
      sleepHours: true,
      sleepQuality: true,
      rpe: true,
      duration: true,
      physioAlert: true,
      preFilledAt: true,
      postFilledAt: true,
      player: {
        select: {
          name: true,
        },
      },
      season: {
        select: {
          name: true,
        },
      },
    },
  });

  return entries.map((entry) => ({
    playerName: entry.player.name,
    date: toCivilDateString(entry.date, "UTC"),
    seasonName: entry.season.name,
    recovery: entry.recovery,
    energy: entry.energy,
    soreness: entry.soreness,
    sleepHours: toNumberOrNull(entry.sleepHours),
    sleepQuality: entry.sleepQuality,
    rpe: entry.rpe,
    duration: entry.duration,
    physioAlert: entry.physioAlert,
    preFilledAt: toIsoOrNull(entry.preFilledAt),
    postFilledAt: toIsoOrNull(entry.postFilledAt),
  }));
}
