import "server-only";

import { keys } from "./keys";
import { generateOrgPwaIcons } from "./pwa-icon-generate";
import {
  type PwaIconKind,
  PWA_ICON_FILENAMES,
  pwaIconObjectPath,
  pwaIconOpaqueHash,
} from "./pwa-icon-paths";
import { deletePublicPwaIcon, uploadPublicPwaIcon } from "./pwa-public";

export type PublishOrgPwaIconsInput = {
  readonly kind: PwaIconKind;
  readonly entityId: string;
  readonly logoBytes: Buffer;
};

function requirePathSecret(): string {
  const secret = keys().PWA_ICON_PATH_SECRET;
  if (!secret) {
    throw new Error("PWA_ICON_PATH_SECRET no está configurado.");
  }
  return secret;
}

/** Shared Club/Team publish hook. Team upload UI is out of scope; call this when Team.logoUrl is set. */
export async function publishOrgPwaIcons({
  kind,
  entityId,
  logoBytes,
}: PublishOrgPwaIconsInput): Promise<void> {
  const secret = requirePathSecret();
  const opaqueHash = pwaIconOpaqueHash(kind, entityId, secret);
  const icons = await generateOrgPwaIcons(logoBytes);

  for (const icon of icons) {
    await uploadPublicPwaIcon({
      pathname: pwaIconObjectPath(kind, opaqueHash, icon.filename),
      body: icon.body,
    });
  }
}

export async function deleteOrgPwaIcons(
  kind: PwaIconKind,
  entityId: string
): Promise<void> {
  const secret = requirePathSecret();
  const opaqueHash = pwaIconOpaqueHash(kind, entityId, secret);

  for (const filename of PWA_ICON_FILENAMES) {
    try {
      await deletePublicPwaIcon(pwaIconObjectPath(kind, opaqueHash, filename));
    } catch {
      // Ignore missing objects so logo-clear still succeeds.
    }
  }
}

export async function tryPublishOrgPwaIcons(
  input: PublishOrgPwaIconsInput
): Promise<void> {
  try {
    await publishOrgPwaIcons(input);
  } catch (error) {
    console.error("Failed to publish public PWA icons", error);
  }
}

export async function tryDeleteOrgPwaIcons(
  kind: PwaIconKind,
  entityId: string
): Promise<void> {
  try {
    await deleteOrgPwaIcons(kind, entityId);
  } catch (error) {
    console.error("Failed to delete public PWA icons", error);
  }
}
