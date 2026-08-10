import type { RecommendedSetupPanelChrome } from "@/lib/recommended-setup";

export const PRIMEROS_PASOS_CHROME_KEY_PREFIX =
  "loadzone.primerosPasos.chrome.v1" as const;

export function primerosPasosChromeKey(
  userId: string,
  clubId: string,
): string {
  return `${PRIMEROS_PASOS_CHROME_KEY_PREFIX}:${userId}:${clubId}`;
}

export function parsePrimerosPasosChrome(
  raw: string | null,
): RecommendedSetupPanelChrome {
  if (raw === "expanded" || raw === "minimized" || raw === "dismissed") {
    return raw;
  }
  return "expanded";
}

export function readPrimerosPasosChrome(
  userId: string,
  clubId: string,
): RecommendedSetupPanelChrome {
  if (typeof window === "undefined") {
    return "expanded";
  }
  return parsePrimerosPasosChrome(
    window.localStorage.getItem(primerosPasosChromeKey(userId, clubId)),
  );
}

export function writePrimerosPasosChrome(
  userId: string,
  clubId: string,
  chrome: RecommendedSetupPanelChrome,
): void {
  window.localStorage.setItem(
    primerosPasosChromeKey(userId, clubId),
    chrome,
  );
}
