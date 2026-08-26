/**
 * One-shot backfill: prove private Club/Player blobs are readable for Streak Cromo
 * (`/api/cromo-media`) and regenerate public PWA icons from logos already in Blob.
 *
 * Usage: `pnpm --filter @repo/storage backfill-org-media`
 * Loads `packages/database/.env*` then `apps/app/.env.local` (PWA + Blob tokens).
 */
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { get, put } from "@vercel/blob";
import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";
import { PrismaClient } from "../../database/generated/client.ts";
import { keys } from "../../database/keys.ts";
import { generateOrgPwaIcons } from "../pwa-icon-generate.ts";
import {
  type PwaIconKind,
  pwaIconObjectPath,
  pwaIconOpaqueHash,
} from "../pwa-icon-paths.ts";
import { toBlobDeleteTarget } from "../shared.ts";

const storageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(storageRoot, "../..");
const databaseRoot = join(repoRoot, "packages/database");

loadEnv({ path: join(databaseRoot, ".env") });
loadEnv({ path: join(databaseRoot, ".env.local"), override: true });
loadEnv({ path: join(repoRoot, "apps/app/.env.local"), override: true });

neonConfig.webSocketConstructor = ws;
const database = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: keys().DATABASE_URL }),
});

type ProbeResult = {
  readonly id: string;
  readonly label: string;
  readonly ok: boolean;
  readonly error?: string;
};

async function readStream(
  stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream
): Promise<Buffer> {
  if ("getReader" in stream) {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        chunks.push(value);
      }
    }
    return Buffer.concat(chunks);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function loadPrivateBytes(stored: string): Promise<Buffer> {
  const pathname = toBlobDeleteTarget(stored);
  const result = await get(pathname, { access: "private" });
  if (result.statusCode !== 200 || !result.stream) {
    throw new Error(`blob ${result.statusCode} for ${pathname}`);
  }
  return readStream(result.stream);
}

async function probeStored(
  id: string,
  label: string,
  stored: string | null
): Promise<ProbeResult> {
  if (!stored) {
    return { id, label, ok: false, error: "missing" };
  }
  try {
    await loadPrivateBytes(stored);
    return { id, label, ok: true };
  } catch (error) {
    return {
      id,
      label,
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

async function publishPwaIcons(
  kind: PwaIconKind,
  entityId: string,
  logoBytes: Buffer
): Promise<void> {
  const secret = process.env.PWA_ICON_PATH_SECRET;
  const token = process.env.PWA_BLOB_READ_WRITE_TOKEN;
  if (!secret || !token) {
    throw new Error("PWA public blob env is not configured.");
  }

  const opaqueHash = pwaIconOpaqueHash(kind, entityId, secret);
  const icons = await generateOrgPwaIcons(logoBytes);

  for (const icon of icons) {
    await put(pwaIconObjectPath(kind, opaqueHash, icon.filename), icon.body, {
      access: "public",
      token,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/png",
      cacheControlMaxAge: 60 * 60 * 24,
    });
  }
}

async function main(): Promise<void> {
  const [clubs, teams, players] = await Promise.all([
    database.club.findMany({
      select: { id: true, name: true, logoUrl: true },
    }),
    database.team.findMany({
      select: { id: true, name: true, logoUrl: true, clubId: true },
    }),
    database.player.findMany({
      where: { isArchived: false },
      select: { id: true, name: true, imageUrl: true, teamId: true },
    }),
  ]);

  const clubProbes: ProbeResult[] = [];
  const published: string[] = [];
  const publishErrors: string[] = [];

  for (const club of clubs) {
    if (!club.logoUrl) {
      clubProbes.push({
        id: club.id,
        label: club.name,
        ok: false,
        error: "missing",
      });
      continue;
    }
    const probe = await probeStored(club.id, club.name, club.logoUrl);
    clubProbes.push(probe);
    if (!probe.ok) {
      continue;
    }
    try {
      const bytes = await loadPrivateBytes(club.logoUrl);
      await publishPwaIcons("club", club.id, bytes);
      published.push(`club:${club.name}`);
    } catch (error) {
      publishErrors.push(
        `club ${club.name}: ${error instanceof Error ? error.message : "unknown"}`
      );
    }
  }

  for (const team of teams) {
    if (!team.logoUrl) {
      continue;
    }
    try {
      const bytes = await loadPrivateBytes(team.logoUrl);
      await publishPwaIcons("team", team.id, bytes);
      published.push(`team:${team.name}`);
    } catch (error) {
      publishErrors.push(
        `team ${team.name}: ${error instanceof Error ? error.message : "unknown"}`
      );
    }
  }

  const playerProbes: ProbeResult[] = [];
  for (const player of players) {
    if (!player.imageUrl) {
      continue;
    }
    playerProbes.push(
      await probeStored(player.id, player.name, player.imageUrl)
    );
  }

  const playersWithPhoto = players.filter((player) => player.imageUrl).length;
  const photoOk = playerProbes.filter((probe) => probe.ok).length;
  const crestOk = clubProbes.filter((probe) => probe.ok).length;

  console.log(
    JSON.stringify(
      {
        clubs: clubs.length,
        clubsWithReadableCrest: crestOk,
        clubsMissingLogo: clubProbes
          .filter((probe) => probe.error === "missing")
          .map((probe) => probe.label),
        clubsUnreadable: clubProbes
          .filter((probe) => !probe.ok && probe.error !== "missing")
          .map((probe) => ({ name: probe.label, error: probe.error })),
        players: players.length,
        playersWithPhoto,
        playerPhotosReadable: photoOk,
        playerPhotosUnreadable: playerProbes
          .filter((probe) => !probe.ok)
          .map((probe) => ({ name: probe.label, error: probe.error })),
        pwaIconsPublished: published,
        pwaPublishErrors: publishErrors,
      },
      null,
      2
    )
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
