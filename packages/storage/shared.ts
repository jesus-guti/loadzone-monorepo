const PRIVATE_BLOB_ROUTE = "/api/blob";

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getPathnameFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.pathname.replace(/^\/+/, "") || null;
  } catch {
    return null;
  }
}

export function resolveStorageUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value.startsWith(`${PRIVATE_BLOB_ROUTE}?pathname=`)) {
    return value;
  }

  if (isAbsoluteUrl(value)) {
    if (value.includes(".private.blob.vercel-storage.com/")) {
      const pathname = getPathnameFromUrl(value);
      return pathname
        ? `${PRIVATE_BLOB_ROUTE}?pathname=${encodeURIComponent(pathname)}`
        : null;
    }

    return value;
  }

  return `${PRIVATE_BLOB_ROUTE}?pathname=${encodeURIComponent(value)}`;
}

export function isPrivateImagePathname(value: string | null | undefined): boolean {
  if (!value || isAbsoluteUrl(value)) {
    return false;
  }

  return (
    value.startsWith("clubs/") ||
    value.startsWith("teams/") ||
    value.startsWith("users/")
  );
}
