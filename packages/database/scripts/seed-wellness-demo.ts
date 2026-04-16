import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config as loadEnv } from "dotenv";
import ws from "ws";
import { Prisma, PrismaClient } from "../generated/client";
import { keys } from "../keys";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");

loadEnv({ path: join(packageRoot, ".env") });
loadEnv({ path: join(packageRoot, ".env.local"), override: true });

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: keys().DATABASE_URL });
const database = new PrismaClient({ adapter });

const SEED_SESSION_TITLE_PREFIX = "[seed-wellness]";
const DEMO_PLAYER_PREFIX = "Demo QA";

function getSeasonWindow(now: Date): {
  seasonName: string;
  startDate: Date;
  endDate: Date;
  preSeasonEnd: Date;
} {
  const currentYear = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 6 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return {
    seasonName: `${startYear}/${endYear}`,
    startDate: new Date(Date.UTC(startYear, 6, 1)),
    endDate: new Date(Date.UTC(endYear, 5, 30)),
    preSeasonEnd: new Date(Date.UTC(startYear, 7, 31)),
  };
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function localDateTime(day: Date, hour: number, minute: number): Date {
  const x = new Date(day);
  x.setHours(hour, minute, 0, 0);
  return x;
}

function padPlayerIndex(i: number): string {
  return i.toString().padStart(2, "0");
}

async function main(): Promise<void> {
  const clubName = process.env.SEED_CLUB_NAME?.trim() || "Club Demo";
  const teamName =
    process.env.SEED_TEAM_NAME?.trim() || "Equipo Demo Wellness QA";
  const teamCategory =
    process.env.SEED_TEAM_CATEGORY?.trim() || "Senior — datos de prueba";

  const club = await database.club.findFirst({
    where: { name: clubName },
    select: { id: true, name: true },
  });

  if (!club) {
    console.error(
      `No se encontró el club "${clubName}". Ejecuta antes bootstrap o ajusta SEED_CLUB_NAME.`
    );
    process.exitCode = 1;
    return;
  }

  const team = await database.team.upsert({
    where: {
      clubId_name: {
        clubId: club.id,
        name: teamName,
      },
    },
    create: {
      clubId: club.id,
      name: teamName,
      category: teamCategory,
    },
    update: {
      category: teamCategory,
    },
    select: { id: true, name: true, clubId: true },
  });

  const coordinatorMembership = await database.membership.findFirst({
    where: {
      clubId: club.id,
      role: "COORDINATOR",
      OR: [{ hasAllTeams: true }, { teamLinks: { some: { teamId: team.id } } }],
    },
    select: { id: true, hasAllTeams: true },
  });

  if (coordinatorMembership && !coordinatorMembership.hasAllTeams) {
    await database.membershipTeam.upsert({
      where: {
        membershipId_teamId: {
          membershipId: coordinatorMembership.id,
          teamId: team.id,
        },
      },
      create: {
        membershipId: coordinatorMembership.id,
        teamId: team.id,
      },
      update: {},
    });
  }

  const { seasonName, startDate, endDate, preSeasonEnd } = getSeasonWindow(
    new Date()
  );

  const season = await database.season.upsert({
    where: {
      teamId_name: {
        teamId: team.id,
        name: seasonName,
      },
    },
    create: {
      teamId: team.id,
      name: seasonName,
      startDate,
      endDate,
      preSeasonEnd,
    },
    update: {
      startDate,
      endDate,
      preSeasonEnd,
    },
    select: { id: true, name: true },
  });

  const [preTemplate, postTemplate] = await Promise.all([
    database.formTemplate.findUnique({
      where: { code: "system-wellness-pre" },
      select: { id: true },
    }),
    database.formTemplate.findUnique({
      where: { code: "system-rpe-post" },
      select: { id: true },
    }),
  ]);

  if (preTemplate) {
    const existingPre = await database.formAssignment.findFirst({
      where: { teamId: team.id, fillMoment: "PRE_SESSION" },
      select: { id: true },
    });
    if (!existingPre) {
      await database.formAssignment.create({
        data: {
          teamId: team.id,
          templateId: preTemplate.id,
          fillMoment: "PRE_SESSION",
        },
      });
    }
  }

  if (postTemplate) {
    const existingPost = await database.formAssignment.findFirst({
      where: { teamId: team.id, fillMoment: "POST_SESSION" },
      select: { id: true },
    });
    if (!existingPost) {
      await database.formAssignment.create({
        data: {
          teamId: team.id,
          templateId: postTemplate.id,
          fillMoment: "POST_SESSION",
        },
      });
    }
  }

  const playerNames: string[] = [];
  for (let i = 1; i <= 16; i += 1) {
    playerNames.push(`${DEMO_PLAYER_PREFIX} ${padPlayerIndex(i)}`);
  }

  const players: { id: string; name: string }[] = [];
  for (let idx = 0; idx < playerNames.length; idx += 1) {
    const name = playerNames[idx];
    const existing = await database.player.findFirst({
      where: { teamId: team.id, name },
      select: { id: true, name: true },
    });
    const row =
      existing ??
      (await database.player.create({
        data: {
          teamId: team.id,
          name,
          status: iToStatus(idx + 1),
          currentStreak: 3 + (idx % 5),
        },
        select: { id: true, name: true },
      }));
    players.push(row);
  }

  const playerIds = players.map((p) => p.id);

  await database.dailyEntry.deleteMany({
    where: {
      seasonId: season.id,
      playerId: { in: playerIds },
    },
  });

  await database.playerDailyStats.deleteMany({
    where: {
      seasonId: season.id,
      playerId: { in: playerIds },
    },
  });

  await database.teamSession.deleteMany({
    where: {
      teamId: team.id,
      title: { startsWith: SEED_SESSION_TITLE_PREFIX },
    },
  });

  const today = startOfLocalDay(new Date());
  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - 42);
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + 10);

  type PlannedSession = {
    day: Date;
    type: "TRAINING" | "MATCH";
    title: string;
    hourStart: number;
    minuteStart: number;
    hourEnd: number;
    minuteEnd: number;
  };

  const planned: PlannedSession[] = [];
  for (
    let cursor = startOfLocalDay(rangeStart);
    cursor <= rangeEnd;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const dow = cursor.getDay();
    if (dow === 1) {
      planned.push({
        day: startOfLocalDay(new Date(cursor)),
        type: "TRAINING",
        title: `${SEED_SESSION_TITLE_PREFIX} Entreno`,
        hourStart: 18,
        minuteStart: 0,
        hourEnd: 20,
        minuteEnd: 0,
      });
    } else if (dow === 3) {
      planned.push({
        day: startOfLocalDay(new Date(cursor)),
        type: "TRAINING",
        title: `${SEED_SESSION_TITLE_PREFIX} Entreno`,
        hourStart: 18,
        minuteStart: 30,
        hourEnd: 20,
        minuteEnd: 15,
      });
    } else if (dow === 6) {
      planned.push({
        day: startOfLocalDay(new Date(cursor)),
        type: "MATCH",
        title: `${SEED_SESSION_TITLE_PREFIX} Partido`,
        hourStart: 11,
        minuteStart: 0,
        hourEnd: 13,
        minuteEnd: 15,
      });
    }
  }

  const sessionRecords: {
    id: string;
    day: Date;
    type: "TRAINING" | "MATCH";
  }[] = [];

  for (let i = 0; i < planned.length; i += 1) {
    const p = planned[i];
    const startsAt = localDateTime(p.day, p.hourStart, p.minuteStart);
    const endsAt = localDateTime(p.day, p.hourEnd, p.minuteEnd);
    const isPast = endsAt.getTime() < Date.now();
    const session = await database.teamSession.create({
      data: {
        clubId: club.id,
        teamId: team.id,
        title: `${p.title} · ${p.day.toISOString().slice(0, 10)}`,
        type: p.type,
        status: isPast ? "COMPLETED" : "SCHEDULED",
        startsAt,
        endsAt,
        timezone: "Europe/Madrid",
        appliesToAllPlayers: true,
      },
      select: { id: true },
    });
    sessionRecords.push({ id: session.id, day: p.day, type: p.type });
  }

  const wellnessFor = (
    seed: number,
    kind: "TRAINING" | "MATCH"
  ): {
    recovery: number;
    energy: number;
    soreness: number;
    sleepHours: Prisma.Decimal;
    sleepQuality: number;
    rpe: number;
    duration: number;
  } => {
    const base = (seed * 9301 + 49297) % 233280;
    const recovery =
      kind === "MATCH" ? 4 + (base % 4) : 5 + ((base >> 3) % 5);
    const energy = 2 + ((base >> 5) % 4);
    const soreness = 1 + ((base >> 7) % 4);
    const sleepQuality = 2 + ((base >> 9) % 4);
    const sleepH = kind === "MATCH" ? 6.5 + (base % 5) * 0.25 : 7 + (base % 8) * 0.25;
    const rpe = kind === "MATCH" ? 7 + (base % 4) : 5 + ((base >> 11) % 4);
    const duration = kind === "MATCH" ? 95 + (base % 25) : 110 + (base % 40);
    return {
      recovery,
      energy,
      soreness,
      sleepHours: new Prisma.Decimal(sleepH.toFixed(2)),
      sleepQuality,
      rpe,
      duration,
    };
  };

  for (let si = 0; si < sessionRecords.length; si += 1) {
    const s = sessionRecords[si];
    const entryDate = startOfLocalDay(s.day);
    for (let pi = 0; pi < players.length; pi += 1) {
      const skipEntirely = (si * 17 + pi * 13) % 17 === 0;
      if (skipEntirely) {
        continue;
      }

      const preOnly = (si * 11 + pi * 7) % 12 === 0;
      const skipPost = preOnly || (si * 9 + pi * 5) % 14 === 0;
      const w = wellnessFor(si + pi * 31, s.type);
      const preTime = new Date(localDateTime(s.day, 8, 15 + (pi % 5)));
      const postTime = skipPost
        ? null
        : new Date(localDateTime(s.day, s.type === "MATCH" ? 15 : 21, 5));

      await database.dailyEntry.create({
        data: {
          date: entryDate,
          playerId: players[pi].id,
          seasonId: season.id,
          teamSessionId: s.id,
          recovery: w.recovery,
          energy: w.energy,
          soreness: w.soreness,
          sleepHours: w.sleepHours,
          sleepQuality: w.sleepQuality,
          preFilledAt: preTime,
          rpe: skipPost ? null : w.rpe,
          duration: skipPost ? null : w.duration,
          postFilledAt: postTime,
          physioAlert: false,
        },
      });
    }
  }

  await seedTodayScenario({
    today,
    seasonId: season.id,
    players,
  });

  console.log("");
  console.log("Seed wellness demo completado.");
  console.log(`Club: ${club.name}`);
  console.log(`Equipo: ${team.name} (id: ${team.id})`);
  console.log(`Temporada: ${season.name}`);
  console.log(
    `Sesiones semanales (lun/mié entreno, sáb partido): ${sessionRecords.length} creadas.`
  );
  console.log(
    `Jugadores (${DEMO_PLAYER_PREFIX} 01–16): ${players.length}. Algunos días quedan sin fila; otros solo con pre.`
  );
  console.log(
    "Hoy: mezcla de completos, solo pre, sin fila, alerta fisioterapia y riesgo alto (revisa dashboard / wellness)."
  );
  console.log(
    "En la app staff, selecciona este equipo como activo para ver los datos."
  );
  console.log("");
}

function iToStatus(i: number): "AVAILABLE" | "MODIFIED_TRAINING" | "INJURED" {
  if (i === 12) {
    return "MODIFIED_TRAINING";
  }
  if (i === 14) {
    return "INJURED";
  }
  return "AVAILABLE";
}

async function seedTodayScenario(input: {
  today: Date;
  seasonId: string;
  players: { id: string; name: string }[];
}): Promise<void> {
  const { today, seasonId, players } = input;

  const upsertEntry = async (
    index: number,
    data: {
      preFilledAt: Date | null;
      postFilledAt: Date | null;
      recovery: number | null;
      energy: number | null;
      soreness: number | null;
      sleepHours: Prisma.Decimal | null;
      sleepQuality: number | null;
      rpe: number | null;
      duration: number | null;
      physioAlert: boolean;
    }
  ): Promise<void> => {
    const playerId = players[index].id;
    await database.dailyEntry.upsert({
      where: {
        playerId_date: {
          playerId,
          date: today,
        },
      },
      create: {
        date: today,
        playerId,
        seasonId,
        teamSessionId: null,
        ...data,
      },
      update: {
        teamSessionId: null,
        ...data,
      },
    });
  };

  for (let i = 0; i < 8; i += 1) {
    await upsertEntry(i, {
      preFilledAt: new Date(today.getTime() + 8 * 3600_000 + i * 120_000),
      postFilledAt: new Date(today.getTime() + 20 * 3600_000 + i * 60_000),
      recovery: 6 + (i % 3),
      energy: 3 + (i % 3),
      soreness: 2,
      sleepHours: new Prisma.Decimal((7 + (i % 4) * 0.25).toFixed(2)),
      sleepQuality: 4,
      rpe: 6,
      duration: 90,
      physioAlert: false,
    });
  }

  for (let i = 8; i < 12; i += 1) {
    await upsertEntry(i, {
      preFilledAt: new Date(today.getTime() + 7 * 3600_000 + i * 90_000),
      postFilledAt: null,
      recovery: 5,
      energy: 3,
      soreness: 3,
      sleepHours: new Prisma.Decimal("6.75"),
      sleepQuality: 3,
      rpe: null,
      duration: null,
      physioAlert: false,
    });
  }

  // 12–13: sin fila de hoy (índices 12 y 13 → jugadores 13 y 14)
  // 14: pre+post + alerta
  await upsertEntry(14, {
    preFilledAt: new Date(today.getTime() + 6 * 3600_000),
    postFilledAt: new Date(today.getTime() + 19 * 3600_000),
    recovery: 3,
    energy: 2,
    soreness: 5,
    sleepHours: new Prisma.Decimal("5.25"),
    sleepQuality: 2,
    rpe: 8,
    duration: 88,
    physioAlert: true,
  });

  await upsertEntry(15, {
    preFilledAt: new Date(today.getTime() + 8 * 3600_000),
    postFilledAt: new Date(today.getTime() + 21 * 3600_000),
    recovery: 7,
    energy: 4,
    soreness: 2,
    sleepHours: new Prisma.Decimal("8"),
    sleepQuality: 5,
    rpe: 5,
    duration: 75,
    physioAlert: false,
  });

  await database.playerDailyStats.upsert({
    where: {
      playerId_date: {
        playerId: players[15].id,
        date: today,
      },
    },
    create: {
      playerId: players[15].id,
      seasonId,
      date: today,
      riskLevel: "HIGH",
      acwr: new Prisma.Decimal("1.42"),
    },
    update: {
      riskLevel: "HIGH",
      acwr: new Prisma.Decimal("1.42"),
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error("Error en seed-wellness-demo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
