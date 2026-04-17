export const REMEMBER_ME_COOKIE_NAME = "loadzone_remember_me";
export const REMEMBERED_EMAIL_STORAGE_KEY = "loadzone.remembered-email";

export const SHORT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
export const LONG_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const REMEMBER_ME_COOKIE_MAX_AGE_SECONDS = LONG_SESSION_MAX_AGE_SECONDS;

export function parseRememberMeValue(value: string | undefined): boolean {
  return value === "true";
}

export function getSessionMaxAgeSeconds(rememberMe: boolean): number {
  return rememberMe ? LONG_SESSION_MAX_AGE_SECONDS : SHORT_SESSION_MAX_AGE_SECONDS;
}
