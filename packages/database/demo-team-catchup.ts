import type { PrismaClient } from "./generated/client";
import {
  DEMO_TEAM_NAME,
  DEMO_TIMEZONE,
  civilDateInTimeZone,
  scriptDemoSeason,
  type ScriptedDemoSession,
} from "./demo-team-plan";

export type DemoCatchUpResult = {
  readonly createdSessions: number;
  readonly createdEntries: number;
};

export class DemoTeamCatchUpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoTeamCatchUpError";
  }
}

function civilFromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type DemoEntryInsert = {
  date: Date;
  playerId: string;
  seasonId: string;
  teamSessionId: string;
  recovery: number;
  energy: number;
  soreness: number;
  sleepHours: number;
  sleepQuality: number;
  preFilledAt: Date;
  rpe: number;
  duration: number;
  postFilledAt: Date;
};

type DemoAttendanceInsert = {
  teamSessionId: string;
  playerId: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  minutesPlayed: number | null;
  markedAt: Date;
};

async function ensureDemoSession(
  db: PrismaClient,
  team: { id: string; clubId: string },
  session: ScriptedDemoSession,
  sessionIdByDate: Map<string, string>
): Promise<{ id: string; created: boolean }> {
  const existing = sessionIdByDate.get(session.date);
  if (existing) {
    return { id: existing, created: false };
  }
  const created = await db.teamSession.create({
    data: {
      clubId: team.clubId,
      teamId: team.id,
      title: session.title,
      type: session.type,
      status: "COMPLETED",
      startsAt: session.startsAt,
      endsAt: new Date(session.startsAt.getTime() + session.minutes * 60_000),
      timezone: DEMO_TIMEZONE,
      appliesToAllPlayers: true,
    },
    select: { id: true },
  });
  sessionIdByDate.set(session.date, created.id);
  return { id: created.id, created: true };
}

function collectMissingRows(input: {
  session: ScriptedDemoSession;
  sessionId: string;
  isNew: boolean;
  playerIds: readonly string[];
  seasonId: string;
  existingEntryDates: Set<string>;
  entries: DemoEntryInsert[];
  attendance: DemoAttendanceInsert[];
}): void {
  for (const player of input.session.players) {
    const playerId = input.playerIds[player.playerIndex];
    if (!playerId) {
      continue;
    }
    if (input.isNew && player.attendance) {
      input.attendance.push({
        teamSessionId: input.sessionId,
        playerId,
        status: player.attendance,
        minutesPlayed: player.minutesPlayed,
        markedAt: new Date(input.session.startsAt.getTime() + 30 * 60_000),
      });
    }
    if (!player.fills) {
      continue;
    }
    const key = `${playerId}:${input.session.date}`;
    if (input.existingEntryDates.has(key)) {
      continue;
    }
    input.entries.push({
      date: new Date(`${input.session.date}T00:00:00.000Z`),
      playerId,
      seasonId: input.seasonId,
      teamSessionId: input.sessionId,
      recovery: player.recovery,
      energy: player.energy,
      soreness: player.soreness,
      sleepHours: player.sleepHours,
      sleepQuality: player.sleepQuality,
      preFilledAt: new Date(input.session.startsAt.getTime() - 90 * 60_000),
      rpe: player.rpe,
      duration: input.session.minutes,
      postFilledAt: new Date(
        input.session.startsAt.getTime() + (input.session.minutes + 20) * 60_000
      ),
    });
    input.existingEntryDates.add(key);
  }
}

export async function catchUpDemoTeam(
  db: PrismaClient,
  input: { readonly clubId: string; readonly now: Date }
): Promise<DemoCatchUpResult> {
  const team = await db.team.findFirst({
    where: { clubId: input.clubId, name: DEMO_TEAM_NAME },
    select: {
      id: true,
      clubId: true,
      seasons: {
        orderBy: { startDate: "desc" },
        take: 1,
        select: { id: true, endDate: true },
      },
    },
  });
  if (!team) {
    throw new DemoTeamCatchUpError(
      "En este club no está el equipo Primer Equipo Vimenor."
    );
  }
  const season = team.seasons[0];
  if (!season) {
    throw new DemoTeamCatchUpError(
      "El equipo de demo no tiene temporada."
    );
  }

  const through = civilDateInTimeZone(input.now, DEMO_TIMEZONE);
  const players = await db.player.findMany({
    where: { teamId: team.id, isArchived: false },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const script = scriptDemoSeason(players.length, through);

  const existingSessions = await db.teamSession.findMany({
    where: { teamId: team.id },
    select: { id: true, startsAt: true },
  });
  const sessionIdByDate = new Map<string, string>();
  for (const session of existingSessions) {
    sessionIdByDate.set(civilDateInTimeZone(session.startsAt, DEMO_TIMEZONE), session.id);
  }

  const existingEntryDates = new Set(
    (
      await db.dailyEntry.findMany({
        where: { seasonId: season.id },
        select: { date: true, playerId: true },
      })
    ).map((entry) => `${entry.playerId}:${civilFromUtc(entry.date)}`)
  );

  let createdSessions = 0;
  const entries: DemoEntryInsert[] = [];
  const attendance: DemoAttendanceInsert[] = [];

  for (const session of script) {
    const ensured = await ensureDemoSession(db, team, session, sessionIdByDate);
    createdSessions += ensured.created ? 1 : 0;
    collectMissingRows({
      session,
      sessionId: ensured.id,
      isNew: ensured.created,
      playerIds: players.map((player) => player.id),
      seasonId: season.id,
      existingEntryDates,
      entries,
      attendance,
    });
  }

  if (entries.length > 0) {
    for (let offset = 0; offset < entries.length; offset += 400) {
      await db.dailyEntry.createMany({ data: entries.slice(offset, offset + 400) });
    }
  }
  if (attendance.length > 0) {
    await db.sessionAttendance.createMany({ data: attendance });
  }

  const seasonEnd = civilFromUtc(season.endDate);
  if (through > seasonEnd) {
    await db.season.update({
      where: { id: season.id },
      data: { endDate: new Date(`${through}T00:00:00.000Z`) },
    });
  }

  return { createdSessions, createdEntries: entries.length };
}
