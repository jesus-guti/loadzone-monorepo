import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import { config as loadEnv } from "dotenv";
import ws from "ws";
import { ensureBaseFormTemplatesWithDb } from "../bootstrap/base-form-templates";
import { PrismaClient } from "../generated/client";
import { keys } from "../keys";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");

loadEnv({ path: join(packageRoot, ".env") });
loadEnv({ path: join(packageRoot, ".env.local"), override: true });

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: keys().DATABASE_URL });
const database = new PrismaClient({ adapter });

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createPassword(): string {
  return randomBytes(9).toString("base64url");
}

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

async function getOrCreateClubSlug(
  databaseClient: PrismaClient,
  baseSlug: string
): Promise<string> {
  const existingClub = await databaseClient.club.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });

  if (!existingClub) {
    return baseSlug;
  }

  const similarClubs = await databaseClient.club.findMany({
    where: {
      slug: {
        startsWith: `${baseSlug}-`,
      },
    },
    select: { slug: true },
  });

  return `${baseSlug}-${similarClubs.length + 2}`;
}

async function main(): Promise<void> {
  const adminEmail =
    process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() ||
    "admin@loadzone.local";
  const generatedPassword = !process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const adminPassword =
    process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim() || createPassword();
  const adminName = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "LoadZone Admin";
  const clubName = process.env.BOOTSTRAP_CLUB_NAME?.trim() || "Club Demo";
  const teamName = process.env.BOOTSTRAP_TEAM_NAME?.trim() || "Primer Equipo";
  const teamCategory = process.env.BOOTSTRAP_TEAM_CATEGORY?.trim() || "Senior";
  const samplePlayerName =
    process.env.BOOTSTRAP_SAMPLE_PLAYER_NAME?.trim() || "Jugador Demo";
  const createSamplePlayer =
    process.env.BOOTSTRAP_CREATE_SAMPLE_PLAYER !== "false";

  await ensureBaseFormTemplatesWithDb(database);

  const passwordHash = await hash(adminPassword, 12);

  const user = await database.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      platformRole: "SUPER_ADMIN",
    },
    update: {
      name: adminName,
      passwordHash,
      platformRole: "SUPER_ADMIN",
    },
    select: {
      id: true,
      email: true,
      platformRole: true,
    },
  });

  const baseSlug = slugify(clubName);
  const existingClub = await database.club.findFirst({
    where: {
      OR: [{ name: clubName }, { slug: baseSlug }],
    },
    select: {
      id: true,
      slug: true,
    },
  });

  const club =
    existingClub ??
    (await database.club.create({
      data: {
        name: clubName,
        slug: await getOrCreateClubSlug(database, baseSlug),
      },
      select: {
        id: true,
        slug: true,
      },
    }));

  const membership = await database.membership.upsert({
    where: {
      userId_clubId_role: {
        userId: user.id,
        clubId: club.id,
        role: "COORDINATOR",
      },
    },
    create: {
      userId: user.id,
      clubId: club.id,
      role: "COORDINATOR",
      hasAllTeams: true,
    },
    update: {
      hasAllTeams: true,
    },
    select: {
      id: true,
    },
  });

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
    select: {
      id: true,
      name: true,
    },
  });

  await database.membershipTeam.upsert({
    where: {
      membershipId_teamId: {
        membershipId: membership.id,
        teamId: team.id,
      },
    },
    create: {
      membershipId: membership.id,
      teamId: team.id,
    },
    update: {},
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
    const existingPreAssignment = await database.formAssignment.findFirst({
      where: {
        teamId: team.id,
        fillMoment: "PRE_SESSION",
      },
      select: { id: true },
    });

    if (!existingPreAssignment) {
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
    const existingPostAssignment = await database.formAssignment.findFirst({
      where: {
        teamId: team.id,
        fillMoment: "POST_SESSION",
      },
      select: { id: true },
    });

    if (!existingPostAssignment) {
      await database.formAssignment.create({
        data: {
          teamId: team.id,
          templateId: postTemplate.id,
          fillMoment: "POST_SESSION",
        },
      });
    }
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
    select: {
      id: true,
      name: true,
    },
  });

  let samplePlayer:
    | {
        id: string;
        name: string;
        token: string;
      }
    | null = null;

  if (createSamplePlayer) {
    const existingPlayer = await database.player.findFirst({
      where: {
        teamId: team.id,
        name: samplePlayerName,
      },
      select: {
        id: true,
        name: true,
        token: true,
      },
    });

    samplePlayer =
      existingPlayer ??
      (await database.player.create({
        data: {
          teamId: team.id,
          name: samplePlayerName,
        },
        select: {
          id: true,
          name: true,
          token: true,
        },
      }));
  }

  console.log("");
  console.log("Bootstrap completado.");
  console.log(`Admin email: ${user.email}`);
  console.log(`Admin role: ${user.platformRole}`);
  console.log(`Club: ${clubName} (${club.slug})`);
  console.log(`Team: ${team.name}`);
  console.log(`Season: ${season.name}`);

  if (generatedPassword) {
    console.log(`Admin password generado: ${adminPassword}`);
  } else {
    console.log("Admin password: el valor de BOOTSTRAP_ADMIN_PASSWORD");
  }

  if (samplePlayer) {
    console.log(`Jugador demo: ${samplePlayer.name}`);
    console.log(`Token jugador demo: ${samplePlayer.token}`);
  }

  console.log("");
  console.log("Siguiente paso recomendado:");
  console.log("1. Inicia la app staff y entra con el admin creado.");
  console.log("2. Abre onboarding/settings solo si quieres cambiar club o equipo.");
  console.log("3. Usa el token del jugador demo para probar el check-in.");
}

main()
  .catch((error: unknown) => {
    console.error("Error during bootstrap:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
