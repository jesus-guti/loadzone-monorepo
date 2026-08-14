import { resolvePwaIconUrls, type PwaIconUrls } from "@repo/storage/pwa-icon-paths";
import { keys } from "@/keys";

type OrgLogoRef = {
  readonly id: string;
  readonly logoUrl: string | null;
};

export function resolvePlayerPwaIcons(input: {
  readonly team: OrgLogoRef | null;
  readonly club: OrgLogoRef | null;
}): PwaIconUrls {
  const env = keys();
  return resolvePwaIconUrls({
    team: input.team,
    club: input.club,
    secret: env.PWA_ICON_PATH_SECRET,
    publicBaseUrl: env.PWA_BLOB_PUBLIC_BASE_URL,
  }).urls;
}
