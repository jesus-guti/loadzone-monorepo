import "server-only";

import { del, put } from "@vercel/blob";
import { keys } from "./keys";

export const PWA_ICON_CACHE_MAX_AGE = 60 * 60 * 24;

type UploadPublicPwaIconInput = {
  readonly pathname: string;
  readonly body: Buffer;
};

type UploadPublicPwaIconResult = {
  readonly pathname: string;
  readonly url: string;
};

function ensurePwaBlobToken(): string {
  const token = keys().PWA_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("El almacén público de iconos PWA no está configurado.");
  }
  return token;
}

export async function uploadPublicPwaIcon({
  pathname,
  body,
}: UploadPublicPwaIconInput): Promise<UploadPublicPwaIconResult> {
  const token = ensurePwaBlobToken();
  const result = await put(pathname, body, {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: "image/png",
    cacheControlMaxAge: PWA_ICON_CACHE_MAX_AGE,
  });

  return {
    pathname: result.pathname,
    url: result.url,
  };
}

export async function deletePublicPwaIcon(pathname: string): Promise<void> {
  const token = ensurePwaBlobToken();
  await del(pathname, { token });
}
