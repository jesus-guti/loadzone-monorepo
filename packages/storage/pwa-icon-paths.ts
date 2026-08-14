import { createHmac } from "node:crypto";

export type PwaIconKind = "club" | "team";

export const PWA_ICON_FILENAMES = [
  "180.png",
  "192.png",
  "512.png",
  "512-maskable.png",
] as const;

export type PwaIconFilename = (typeof PWA_ICON_FILENAMES)[number];

export const LOADZONE_PWA_ICON_URLS = {
  appleTouch: "/apple-touch-icon.png",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  icon512Maskable: "/icon-512.png",
} as const;

export type PwaIconUrls = {
  readonly appleTouch: string;
  readonly icon192: string;
  readonly icon512: string;
  readonly icon512Maskable: string;
};

export type PwaIconSource = "team" | "club" | "loadzone";

const KIND_PATH_SEGMENT: Record<PwaIconKind, "c" | "t"> = {
  club: "c",
  team: "t",
};

function normalizePublicBaseUrl(publicBaseUrl: string): string {
  return publicBaseUrl.replace(/\/+$/, "");
}

export function pwaIconOpaqueHash(
  kind: PwaIconKind,
  entityId: string,
  secret: string
): string {
  return createHmac("sha256", secret)
    .update(`${kind}:${entityId}`)
    .digest("hex")
    .slice(0, 32);
}

export function pwaIconObjectPath(
  kind: PwaIconKind,
  opaqueHash: string,
  filename: PwaIconFilename
): string {
  return `pwa-icons/${KIND_PATH_SEGMENT[kind]}/${opaqueHash}/${filename}`;
}

export function pwaIconPublicUrl(
  publicBaseUrl: string,
  kind: PwaIconKind,
  opaqueHash: string,
  filename: PwaIconFilename
): string {
  return `${normalizePublicBaseUrl(publicBaseUrl)}/${pwaIconObjectPath(kind, opaqueHash, filename)}`;
}

export function brandedPwaIconUrls(
  publicBaseUrl: string,
  kind: PwaIconKind,
  opaqueHash: string
): PwaIconUrls {
  return {
    appleTouch: pwaIconPublicUrl(publicBaseUrl, kind, opaqueHash, "180.png"),
    icon192: pwaIconPublicUrl(publicBaseUrl, kind, opaqueHash, "192.png"),
    icon512: pwaIconPublicUrl(publicBaseUrl, kind, opaqueHash, "512.png"),
    icon512Maskable: pwaIconPublicUrl(
      publicBaseUrl,
      kind,
      opaqueHash,
      "512-maskable.png"
    ),
  };
}

type OrgLogoRef = {
  readonly id: string;
  readonly logoUrl: string | null;
};

export function resolvePwaIconUrls(input: {
  readonly team: OrgLogoRef | null;
  readonly club: OrgLogoRef | null;
  readonly secret: string | undefined;
  readonly publicBaseUrl: string | undefined;
}): { source: PwaIconSource; urls: PwaIconUrls } {
  const secret = input.secret?.trim();
  const publicBaseUrl = input.publicBaseUrl?.trim();

  if (!secret || !publicBaseUrl) {
    return { source: "loadzone", urls: LOADZONE_PWA_ICON_URLS };
  }

  if (input.team?.logoUrl) {
    return {
      source: "team",
      urls: brandedPwaIconUrls(
        publicBaseUrl,
        "team",
        pwaIconOpaqueHash("team", input.team.id, secret)
      ),
    };
  }

  if (input.club?.logoUrl) {
    return {
      source: "club",
      urls: brandedPwaIconUrls(
        publicBaseUrl,
        "club",
        pwaIconOpaqueHash("club", input.club.id, secret)
      ),
    };
  }

  return { source: "loadzone", urls: LOADZONE_PWA_ICON_URLS };
}
