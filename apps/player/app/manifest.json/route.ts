import { database } from "@repo/database";
import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";
import { resolvePlayerPwaIcons } from "@/lib/pwa-icons";

const CUID_PATTERN = /^c[a-z0-9]{24,}$/;

function baseManifest(
  startUrl: string,
  scope: string | undefined,
  icons: MetadataRoute.Manifest["icons"]
): MetadataRoute.Manifest {
  return {
    name: "LoadZone",
    short_name: "LoadZone",
    description: "Registro diario de bienestar y rendimiento deportivo",
    start_url: startUrl,
    scope,
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait",
    icons,
  };
}

function manifestIconsFromUrls(
  icon192: string,
  icon512: string,
  icon512Maskable: string
): MetadataRoute.Manifest["icons"] {
  return [
    {
      src: icon192,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: icon512,
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: icon512Maskable,
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ];
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!CUID_PATTERN.test(token)) {
    const fallback = resolvePlayerPwaIcons({ team: null, club: null });
    return NextResponse.json(
      baseManifest(
        "/",
        undefined,
        manifestIconsFromUrls(
          fallback.icon192,
          fallback.icon512,
          fallback.icon512Maskable
        )
      )
    );
  }

  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: {
      team: {
        select: {
          id: true,
          logoUrl: true,
          club: {
            select: {
              id: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  const urls = resolvePlayerPwaIcons({
    team: player?.team ?? null,
    club: player?.team?.club ?? null,
  });

  return NextResponse.json(
    baseManifest(
      `/${token}`,
      `/${token}/`,
      manifestIconsFromUrls(urls.icon192, urls.icon512, urls.icon512Maskable)
    )
  );
}
