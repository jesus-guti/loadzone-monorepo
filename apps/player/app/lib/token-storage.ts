"use client";

const STORAGE_KEY = "loadzone:player-token";
const COOKIE_NAME = "lz_player_token";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function savePlayerToken(token: string): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Storage may be disabled in private mode.
  }

  const maxAge = 60 * 60 * 24 * 365; // 1 year
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not universally supported yet.
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function getPlayerToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) {
      return fromStorage;
    }
  } catch {
    // Ignore storage errors.
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearPlayerToken(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not universally supported yet.
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
