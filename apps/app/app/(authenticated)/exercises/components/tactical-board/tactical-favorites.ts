export const TACTICS_FAVORITES_STORAGE_KEY = "lz-tactics-favorites-v1";

export const DEFAULT_FAVORITE_IDS: ReadonlyArray<string> = [
  "player-red",
  "player-blue",
  "material-ball",
  "material-cone",
];

export function loadFavoriteIds(): string[] {
  if (typeof window === "undefined") {
    return [...DEFAULT_FAVORITE_IDS];
  }

  try {
    const raw = window.localStorage.getItem(TACTICS_FAVORITES_STORAGE_KEY);

    if (!raw) {
      return [...DEFAULT_FAVORITE_IDS];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [...DEFAULT_FAVORITE_IDS];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [...DEFAULT_FAVORITE_IDS];
  }
}

export function saveFavoriteIds(ids: ReadonlyArray<string>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TACTICS_FAVORITES_STORAGE_KEY,
    JSON.stringify([...ids])
  );
}

export function toggleFavoriteId(
  ids: ReadonlyArray<string>,
  assetId: string
): string[] {
  const next = new Set(ids);

  if (next.has(assetId)) {
    next.delete(assetId);
  } else {
    next.add(assetId);
  }

  return [...next];
}
