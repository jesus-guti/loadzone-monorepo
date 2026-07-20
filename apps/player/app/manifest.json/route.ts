import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";

const CUID_PATTERN = /^c[a-z0-9]{24,}$/;

function baseManifest(
  startUrl: string,
  scope?: string
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
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

export function GET(request: Request): Response {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!CUID_PATTERN.test(token)) {
    return NextResponse.json(baseManifest("/"));
  }

  return NextResponse.json(baseManifest(`/${token}`, `/${token}/`));
}
