/**
 * Anti-nag Policy helpers for Player miss reminders (JES-48 / SPEC §5).
 *
 * Quiet hours: 22:00–08:00 in TeamSession.timezone (fallback Team.timezone).
 * Automated reminders that would fire overnight are deferred to the next local
 * 08:00; staff re-nudges during quiet hours are blocked (no queue).
 *
 * Caps are per (teamSessionId, playerId, kind, origin) — see PushDispatch.
 * Care Alert vocabulary must never appear on this path (JES-47 owns care).
 *
 * Pure module — no `server-only` so scheduler tests can import freely.
 */

import {
  resolvePushConsent,
  type ResolvePushConsentInput,
} from "@repo/database/reminder-consent";

export type ReminderDispatchKind = "PRE_SESSION" | "POST_SESSION";
export type ReminderDispatchOrigin = "AUTOMATED" | "STAFF_RE_NUDGE";

/** Local quiet window: [22:00, 08:00) in the session/team timezone. */
export const QUIET_HOURS_START_HOUR = 22;
export const QUIET_HOURS_END_HOUR = 8;

/**
 * After quiet ends, deferred autos stay eligible longer than the normal cron
 * lookback so a missed 08:00 tick can still deliver the single reminder once.
 */
export const DEFERRED_AUTOMATED_CATCHUP_MS = 2 * 60 * 60 * 1000;

export const DEFAULT_REMINDER_LOOKBACK_MS = 15 * 60 * 1000;

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function readLocalParts(date: Date, timeZone: string): LocalParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    return value ? Number(value) : Number.NaN;
  };
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

/**
 * Approximate UTC instant for a civil local datetime in `timeZone`.
 * Iterates a few times to absorb DST offsets.
 */
export function utcInstantForLocalDateTime(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  let guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 4; i += 1) {
    const local = readLocalParts(new Date(guess), timeZone);
    const asUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      0
    );
    const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    guess += targetAsUtc - asUtc;
  }
  return new Date(guess);
}

function addLocalCalendarDays(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  deltaDays: number
): { year: number; month: number; day: number } {
  const noonUtc = utcInstantForLocalDateTime(timeZone, year, month, day, 12, 0);
  const shifted = new Date(noonUtc.getTime() + deltaDays * 24 * 60 * 60 * 1000);
  const parts = readLocalParts(shifted, timeZone);
  return { year: parts.year, month: parts.month, day: parts.day };
}

/** True when `date` falls in [22:00, 08:00) local time for `timeZone`. */
export function isInQuietHours(date: Date, timeZone: string): boolean {
  const { hour, minute } = readLocalParts(date, timeZone);
  const minutes = hour * 60 + minute;
  return (
    minutes >= QUIET_HOURS_START_HOUR * 60 ||
    minutes < QUIET_HOURS_END_HOUR * 60
  );
}

/**
 * If `configuredTarget` is inside quiet hours, return the next local 08:00;
 * otherwise return `configuredTarget` unchanged.
 */
export function resolveDeferredInstant(
  configuredTarget: Date,
  timeZone: string
): Date {
  if (!isInQuietHours(configuredTarget, timeZone)) {
    return configuredTarget;
  }

  const local = readLocalParts(configuredTarget, timeZone);
  const minutes = local.hour * 60 + local.minute;
  const dayOffset = minutes < QUIET_HOURS_END_HOUR * 60 ? 0 : 1;
  const day =
    dayOffset === 0
      ? { year: local.year, month: local.month, day: local.day }
      : addLocalCalendarDays(
          timeZone,
          local.year,
          local.month,
          local.day,
          1
        );

  return utcInstantForLocalDateTime(
    timeZone,
    day.year,
    day.month,
    day.day,
    QUIET_HOURS_END_HOUR,
    0
  );
}

export function isWithinDispatchWindow(
  targetDate: Date,
  now: Date,
  windowMs: number
): boolean {
  const diff = now.getTime() - targetDate.getTime();
  return diff >= 0 && diff <= windowMs;
}

/**
 * Whether the automated PRE/POST fire should run on this cron tick.
 * Defers overnight targets to quiet-hours end and widens catch-up for deferred rows.
 * Never true while `now` is still inside quiet hours.
 */
export function isAutomatedReminderDue(input: {
  configuredTarget: Date;
  now: Date;
  timeZone: string;
  lookbackMs?: number;
}): boolean {
  const lookbackMs = input.lookbackMs ?? DEFAULT_REMINDER_LOOKBACK_MS;
  if (isInQuietHours(input.now, input.timeZone)) {
    return false;
  }

  const configuredInQuiet = isInQuietHours(
    input.configuredTarget,
    input.timeZone
  );
  const effective = resolveDeferredInstant(
    input.configuredTarget,
    input.timeZone
  );
  const windowMs = configuredInQuiet
    ? Math.max(lookbackMs, DEFERRED_AUTOMATED_CATCHUP_MS)
    : lookbackMs;

  return isWithinDispatchWindow(effective, input.now, windowMs);
}

export function isObligationComplete(input: {
  kind: ReminderDispatchKind;
  preFilledAt: Date | null | undefined;
  postFilledAt: Date | null | undefined;
}): boolean {
  if (input.kind === "PRE_SESSION") {
    return Boolean(input.preFilledAt);
  }
  return Boolean(input.postFilledAt);
}

/**
 * Consent + subscription gate using JES-45 `resolvePushConsent`.
 * No PushSubscription → no delivery. Blocked / opted-out / OFF → no delivery.
 */
export function mayDeliverPlayerReminder(
  input: ResolvePushConsentInput
): boolean {
  if (!input.hasActiveSubscription) {
    return false;
  }
  const decision = resolvePushConsent(input);
  if (decision.mode === "OFF") {
    return false;
  }
  if (
    decision.state === "GUARDIAN_BLOCKED" ||
    decision.state === "OPTED_OUT"
  ) {
    return false;
  }
  return true;
}

export type ReminderGateReason =
  | "obligation_complete"
  | "already_dispatched"
  | "quiet_hours"
  | "consent_denied";

export type ReminderGateDecision =
  | { ok: true }
  | { ok: false; reason: ReminderGateReason };

/**
 * Shared send gate for cron + staff (caps, completion, consent, quiet).
 * Automated timing/deferral is handled by `isAutomatedReminderDue` before this.
 */
export function assertCanSendReminder(input: {
  origin: ReminderDispatchOrigin;
  now: Date;
  timeZone: string;
  obligationComplete: boolean;
  hasOriginDispatch: boolean;
  mayDeliverByConsent: boolean;
}): ReminderGateDecision {
  if (input.obligationComplete) {
    return { ok: false, reason: "obligation_complete" };
  }
  if (!input.mayDeliverByConsent) {
    return { ok: false, reason: "consent_denied" };
  }
  if (input.hasOriginDispatch) {
    return { ok: false, reason: "already_dispatched" };
  }
  if (isInQuietHours(input.now, input.timeZone)) {
    return { ok: false, reason: "quiet_hours" };
  }
  return { ok: true };
}

/** Invitational Spanish payloads — miss path only; never care/emergency framing. */
export const PLAYER_REMINDER_COPY = {
  PRE_SESSION: {
    title: "Tu check-in previo",
    body: (sessionTitle: string): string =>
      `Cuando puedas, completa el check-in previo de «${sessionTitle}».`,
  },
  POST_SESSION: {
    title: "Tu check-in posterior",
    body: (sessionTitle: string): string =>
      `Cuando puedas, completa el registro posterior de «${sessionTitle}».`,
  },
} as const;

export const STAFF_QUIET_HOURS_MESSAGE =
  "No se pueden enviar recordatorios entre las 22:00 y las 08:00 (horario de la sesión). Prueba más tarde.";
