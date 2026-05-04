import "server-only";

import { del, get, put } from "@vercel/blob";
import { validateImageFile } from "./image-validation";
import { keys } from "./keys";
import { resolveStorageUrl } from "./shared";

export const DEFAULT_CACHE_MAX_AGE = 60 * 60 * 24 * 30;

type ImageTarget = "club" | "player" | "user";

type BuildObjectKeyInput = {
  readonly target: ImageTarget;
  readonly entityId: string;
  readonly clubId?: string;
  readonly teamId?: string;
  readonly fileName: string;
};

type UploadImageInput = {
  readonly file: File;
  readonly objectKey: string;
  readonly previousUrl?: string | null;
  readonly cacheControlMaxAge?: number;
};

type UploadImageResult = {
  readonly pathname: string;
  readonly url: string;
};

function ensureBlobToken(): void {
  if (!keys().BLOB_READ_WRITE_TOKEN) {
    throw new Error("Vercel Blob no está configurado.");
  }
}

function sanitizeFileName(fileName: string): string {
  const trimmedFileName = fileName.trim().toLowerCase();
  const [baseName = "image", extension = "webp"] = trimmedFileName.split(".");
  const sanitizedBaseName = baseName
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const sanitizedExtension = extension.replace(/[^a-z0-9]+/g, "").slice(0, 10);

  return `${sanitizedBaseName || "image"}.${sanitizedExtension || "webp"}`;
}

export function buildObjectKey({
  target,
  entityId,
  clubId,
  teamId,
  fileName,
}: BuildObjectKeyInput): string {
  const safeFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();

  switch (target) {
    case "club":
      return `clubs/${entityId}/logo/${timestamp}-${safeFileName}`;
    case "user":
      return clubId
        ? `clubs/${clubId}/users/${entityId}/profile/${timestamp}-${safeFileName}`
        : `users/${entityId}/profile/${timestamp}-${safeFileName}`;
    case "player":
      if (!teamId) {
        throw new Error("El equipo es obligatorio para la foto de jugador.");
      }

      return `teams/${teamId}/players/${entityId}/${timestamp}-${safeFileName}`;
    default:
      throw new Error("Destino de imagen no soportado.");
  }
}

export async function uploadImage({
  file,
  objectKey,
  previousUrl,
  cacheControlMaxAge = DEFAULT_CACHE_MAX_AGE,
}: UploadImageInput): Promise<UploadImageResult> {
  ensureBlobToken();
  await validateImageFile(file);

  const result = await put(objectKey, file, {
    access: "private",
    addRandomSuffix: false,
    cacheControlMaxAge,
    contentType: file.type,
  });

  if (previousUrl && previousUrl !== result.url) {
    try {
      await del(previousUrl);
    } catch {
      // Ignore cleanup errors to avoid failing the primary upload flow.
    }
  }

  return {
    pathname: result.pathname,
    url: resolveStorageUrl(result.pathname) ?? result.url,
  };
}

export async function deleteObject(url: string | null | undefined): Promise<void> {
  ensureBlobToken();

  if (!url) {
    return;
  }

  await del(url);
}

export function getPrivateBlob(
  pathname: string,
  ifNoneMatch?: string
): Promise<Awaited<ReturnType<typeof get>>> {
  ensureBlobToken();

  return get(pathname, {
    access: "private",
    ifNoneMatch,
  });
}

// biome-ignore lint/performance/noBarrelFile: re-exporting
export { isPrivateImagePathname, resolveStorageUrl } from "./shared";
