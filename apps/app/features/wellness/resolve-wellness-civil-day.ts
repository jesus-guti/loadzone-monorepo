import { toCivilDateString } from "@repo/database/recoverable-streak";

const CIVIL_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_TEAM_TIME_ZONE = "Europe/Madrid";

export function teamCivilToday(
  timeZone: string | null | undefined,
  now: Date = new Date()
): string {
  return toCivilDateString(now, timeZone || DEFAULT_TEAM_TIME_ZONE);
}

type WellnessDateCookie = {
  readonly viewed: string;
  readonly anchor: string | null;
};

function isCivilDay(value: string): boolean {
  return CIVIL_DAY.test(value);
}

function parseWellnessDateCookie(
  cookieValue: string | null
): WellnessDateCookie | null {
  if (!cookieValue) {
    return null;
  }

  const [viewed, anchor] = cookieValue.split("|");
  if (!viewed || !isCivilDay(viewed)) {
    return null;
  }

  if (anchor === undefined) {
    return { viewed, anchor: null };
  }

  if (!isCivilDay(anchor)) {
    return null;
  }

  return { viewed, anchor };
}

/** Cookie value: viewed civil day, anchored to the civil day it was chosen. */
export function serializeWellnessDateCookie(
  viewedCivilDay: string,
  anchorCivilDay: string
): string {
  return `${viewedCivilDay}|${anchorCivilDay}`;
}

/**
 * A new civil day resets the evaluated day to today.
 * A day picked earlier the same civil day stays selected.
 * A legacy cookie (date only) resets unless it is already today.
 */
export function resolveWellnessCivilDay(input: {
  readonly cookieValue: string | null;
  readonly todayCivilDay: string;
}): string {
  const today = input.todayCivilDay;
  const stored = parseWellnessDateCookie(input.cookieValue);
  if (!stored) {
    return today;
  }

  if (stored.anchor === today && stored.viewed <= today) {
    return stored.viewed;
  }

  if (stored.anchor === null && stored.viewed === today) {
    return today;
  }

  return today;
}
