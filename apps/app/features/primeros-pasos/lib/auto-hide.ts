import type { RecommendedSetupPanelChrome } from "@/lib/recommended-setup";

export const PRIMEROS_PASOS_LAST_COUNT_KEY_PREFIX =
  "loadzone.primerosPasos.lastCompletedCount.v1" as const;

export function primerosPasosLastCompletedCountKey(
  userId: string,
  clubId: string,
): string {
  return `${PRIMEROS_PASOS_LAST_COUNT_KEY_PREFIX}:${userId}:${clubId}`;
}

export function parsePrimerosPasosLastCompletedCount(
  raw: string | null,
): number | null {
  if (raw === null || raw === "") {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

/**
 * Transition-only auto-hide: dismiss when completedCount reaches total while
 * chrome is expanded and the last known count was still incomplete.
 * Missing lastKnown is treated as 0 so a mature Club first visit auto-hides once.
 * After Settings restore at 5/5, lastKnown stays at total → no re-hide.
 */
export function shouldAutoHidePrimerosPasos(input: {
  lastKnownCompletedCount: number | null;
  completedCount: number;
  totalCount: number;
  chrome: RecommendedSetupPanelChrome;
}): boolean {
  if (input.chrome !== "expanded") {
    return false;
  }
  if (input.completedCount !== input.totalCount) {
    return false;
  }
  const previous = input.lastKnownCompletedCount ?? 0;
  return previous < input.totalCount;
}

export function readPrimerosPasosLastCompletedCount(
  userId: string,
  clubId: string,
): number | null {
  if (typeof window === "undefined") {
    return null;
  }
  return parsePrimerosPasosLastCompletedCount(
    window.localStorage.getItem(
      primerosPasosLastCompletedCountKey(userId, clubId),
    ),
  );
}

export function writePrimerosPasosLastCompletedCount(
  userId: string,
  clubId: string,
  completedCount: number,
): void {
  window.localStorage.setItem(
    primerosPasosLastCompletedCountKey(userId, clubId),
    String(completedCount),
  );
}
