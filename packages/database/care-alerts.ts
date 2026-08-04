/**
 * Guardian Care Alert evaluation, provisional payload, and ledger emit.
 *
 * Distinct from miss reminders (PushDispatch). Quiet hours do not apply (JES-47 HITL B).
 * Transport is stubbed until Guardian contacts exist. JES-49 hardens the payload allow-list.
 *
 * Import from `@repo/database/care-alerts` so client bundles avoid `server-only`.
 */

import {
  reminderConsentBandKeyFor,
  resolveEffectiveReminderConsentPolicy,
  type ReminderConsentPolicy,
} from "./reminder-consent";
import {
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
  type AgeBand,
  type ResolvedAgeBandPolicy,
} from "./age-band-policy";
import type { ImmediateWellnessFlag, WellnessMetric } from "./wellness-limits";

export const CARE_ALERT_TRIGGER_CLASSES = [
  "INJURY_PAIN",
  "CARE_RELEVANT_WELLNESS",
] as const;

export type CareAlertTriggerClass =
  (typeof CARE_ALERT_TRIGGER_CLASSES)[number];

export type CareAlertFlag = {
  code: string;
  labelKey: string;
};

/** Provisional allow-list shape — never include load/ACWR/staffNotes/peer/raw scores. */
export type ProvisionalCareAlertPayload = {
  playerDisplayName: string;
  date: string;
  triggerClass: CareAlertTriggerClass;
  checkInCompleted: boolean;
  careFlags: CareAlertFlag[];
  injuryLocation?: {
    bodyPart?: string | null;
    side?: string | null;
  };
};

export type CareAlertEvaluationSignals = {
  /** Player Pain Alert (InjuryReport with reportedByPlayer). */
  painAlert?: {
    bodyPart?: string | null;
    side?: string | null;
  };
  /** Explicit check-in injury/pain flag (DailyEntry.physioAlert). */
  physioAlert?: boolean;
  /** Immediate wellness flags from JES-41 evaluator. */
  wellnessFlags?: ImmediateWellnessFlag[];
  /**
   * Miss / adherence signals must never enter Care Alerts.
   * If true, evaluation rejects care emit for this call.
   */
  missSignal?: boolean;
};

export type ClassifiedCareAlert = {
  triggerClass: CareAlertTriggerClass;
  careFlags: CareAlertFlag[];
  injuryLocation?: ProvisionalCareAlertPayload["injuryLocation"];
};

type Ymd = { year: number; month: number; day: number };

function parseYmdParts(value: string): Ymd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/**
 * Civil calendar day string (YYYY-MM-DD) in the given IANA timezone.
 * Defaults team clock is Europe/Madrid (JES-32 / injury wellness exemption).
 */
export function getCivilDateString(
  now: Date,
  timeZone: string = "Europe/Madrid"
): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export function civilDateToUtcNoon(civilDate: string): Date {
  const parts = parseYmdParts(civilDate);
  if (!parts) {
    throw new Error(`Invalid civil date: ${civilDate}`);
  }
  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0)
  );
}

/**
 * Policy gate: Parental Supervision Layer on ∧ age-band Care Alert receive ∧
 * Reminder Consent band guardian receive. Quiet hours are intentionally ignored.
 */
export function isCareAlertReceiveAllowed(input: {
  resolvedAge: ResolvedAgeBandPolicy;
  reminderConsentPolicy: ReminderConsentPolicy;
}): boolean {
  if (!input.resolvedAge.parentalSupervisionActive) {
    return false;
  }
  if (!input.resolvedAge.guardianCareAlertReceive) {
    return false;
  }
  const bandKey = reminderConsentBandKeyFor(
    input.resolvedAge.ageBand,
    input.resolvedAge.ageYearsComplete,
    input.resolvedAge.policy
  );
  return input.reminderConsentPolicy[bandKey].guardianReceiveEnabled;
}

const WELLNESS_LABEL_KEYS: Record<WellnessMetric, string> = {
  recovery: "care.flag.recovery",
  energy: "care.flag.energy",
  soreness: "care.flag.soreness",
  sleepHours: "care.flag.sleepHours",
  sleepQuality: "care.flag.sleepQuality",
};

/**
 * Classify player-originated signals into Care Alert trigger classes.
 * Miss signals yield no classes. Staff Injury is never a signal here (HITL C).
 */
export function classifyCareAlertTriggers(
  signals: CareAlertEvaluationSignals
): ClassifiedCareAlert[] {
  if (signals.missSignal) {
    return [];
  }

  const classified: ClassifiedCareAlert[] = [];

  const injuryFlags: CareAlertFlag[] = [];
  let injuryLocation: ProvisionalCareAlertPayload["injuryLocation"];

  if (signals.painAlert) {
    injuryFlags.push({
      code: "pain_alert",
      labelKey: "care.flag.painAlert",
    });
    injuryLocation = {
      bodyPart: signals.painAlert.bodyPart ?? null,
      side: signals.painAlert.side ?? null,
    };
  }

  if (signals.physioAlert) {
    injuryFlags.push({
      code: "physio_alert",
      labelKey: "care.flag.physioAlert",
    });
  }

  if (injuryFlags.length > 0) {
    classified.push({
      triggerClass: "INJURY_PAIN",
      careFlags: injuryFlags,
      injuryLocation,
    });
  }

  const careRelevant = (signals.wellnessFlags ?? []).filter(
    (flag) => flag.careRelevant
  );
  if (careRelevant.length > 0) {
    classified.push({
      triggerClass: "CARE_RELEVANT_WELLNESS",
      careFlags: careRelevant.map((flag) => ({
        code: `wellness.${flag.metric}`,
        labelKey: WELLNESS_LABEL_KEYS[flag.metric],
      })),
    });
  }

  return classified;
}

export function buildProvisionalCareAlertPayload(input: {
  playerDisplayName: string;
  civilDate: string;
  triggerClass: CareAlertTriggerClass;
  checkInCompleted: boolean;
  careFlags: CareAlertFlag[];
  injuryLocation?: ProvisionalCareAlertPayload["injuryLocation"];
}): ProvisionalCareAlertPayload {
  const payload: ProvisionalCareAlertPayload = {
    playerDisplayName: input.playerDisplayName,
    date: input.civilDate,
    triggerClass: input.triggerClass,
    checkInCompleted: input.checkInCompleted,
    careFlags: input.careFlags,
  };

  if (input.injuryLocation) {
    payload.injuryLocation = {
      bodyPart: input.injuryLocation.bodyPart ?? null,
      side: input.injuryLocation.side ?? null,
    };
  }

  return payload;
}

const FORBIDDEN_PAYLOAD_KEYS = [
  "acwr",
  "acuteChronic",
  "loadRatio",
  "loadRatios",
  "staffNotes",
  "peerComparison",
  "riskLevel",
  "title",
  "description",
  "severity",
  "recovery",
  "energy",
  "soreness",
  "sleepHours",
  "sleepQuality",
] as const;

/** Assert provisional payload stays on the allow-list (used by tests + JES-49 prep). */
export function payloadContainsForbiddenFields(
  payload: ProvisionalCareAlertPayload
): string[] {
  const serialized = JSON.stringify(payload);
  const found: string[] = [];
  for (const key of FORBIDDEN_PAYLOAD_KEYS) {
    // Match JSON object keys only ("key":)
    if (new RegExp(`"${key}"\\s*:`).test(serialized)) {
      found.push(key);
    }
  }
  return found;
}

/**
 * Stub transport until Guardian contact channels exist.
 * No-op by default; optional structured log without free-text injury notes.
 */
export async function deliverCareAlertStub(
  payload: ProvisionalCareAlertPayload
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info("[care-alert-stub]", {
      triggerClass: payload.triggerClass,
      date: payload.date,
      flagCodes: payload.careFlags.map((flag) => flag.code),
    });
  }
}

export type CareAlertDispatchWriter = {
  careAlertDispatch: {
    create: (args: {
      data: {
        playerId: string;
        triggerClass: CareAlertTriggerClass;
        civilDate: Date;
        payload: ProvisionalCareAlertPayload;
      };
    }) => Promise<unknown>;
  };
};

export type EvaluateAndEmitCareAlertInput = {
  playerId: string;
  playerDisplayName: string;
  teamTimezone: string;
  teamAgeBandPolicy: unknown;
  clubAgeBandPolicy: unknown;
  reminderConsentPolicy: unknown;
  dateOfBirth?: Date | null;
  ageBandOverride?: AgeBand | null;
  signals: CareAlertEvaluationSignals;
  checkInCompleted: boolean;
  now?: Date;
  /** Injected for tests; defaults to package database client. */
  db?: CareAlertDispatchWriter;
};

export type EvaluateAndEmitCareAlertResult = {
  /** True when any care signal was present (Player calm confirm). */
  careFlagPresent: boolean;
  /** Trigger classes successfully written to the ledger this call. */
  emitted: CareAlertTriggerClass[];
  /** True when policy blocked emit (layer/receive off). */
  policyBlocked: boolean;
};

function resolvePlayerCareGate(input: {
  teamAgeBandPolicy: unknown;
  clubAgeBandPolicy: unknown;
  reminderConsentPolicy: unknown;
  dateOfBirth?: Date | null;
  ageBandOverride?: AgeBand | null;
  teamTimezone: string;
  now: Date;
}): { allowed: boolean; resolvedAge: ResolvedAgeBandPolicy } {
  const { policy, source } = resolveEffectiveAgeBandPolicy({
    teamPolicy: input.teamAgeBandPolicy,
    clubPolicy: input.clubAgeBandPolicy,
  });
  const resolvedAge = resolveAgeBandPolicy({
    policy,
    policySource: source,
    dateOfBirth: input.dateOfBirth ?? null,
    ageBandOverride: input.ageBandOverride ?? null,
    teamTimezone: input.teamTimezone,
    now: input.now,
  });
  const { policy: reminderPolicy } = resolveEffectiveReminderConsentPolicy({
    teamPolicy: input.reminderConsentPolicy,
  });
  return {
    allowed: isCareAlertReceiveAllowed({
      resolvedAge,
      reminderConsentPolicy: reminderPolicy,
    }),
    resolvedAge,
  };
}

/**
 * Evaluate policy + classify + rate-limit + ledger write + stub transport.
 * Idempotent per (playerId, triggerClass, civilDate). Does not consult quiet hours.
 */
export async function evaluateAndEmitCareAlert(
  input: EvaluateAndEmitCareAlertInput
): Promise<EvaluateAndEmitCareAlertResult> {
  const classified = classifyCareAlertTriggers(input.signals);
  const careFlagPresent = classified.length > 0;

  if (!careFlagPresent) {
    return { careFlagPresent: false, emitted: [], policyBlocked: false };
  }

  const now = input.now ?? new Date();
  const { allowed } = resolvePlayerCareGate({
    teamAgeBandPolicy: input.teamAgeBandPolicy,
    clubAgeBandPolicy: input.clubAgeBandPolicy,
    reminderConsentPolicy: input.reminderConsentPolicy,
    dateOfBirth: input.dateOfBirth,
    ageBandOverride: input.ageBandOverride,
    teamTimezone: input.teamTimezone,
    now,
  });

  if (!allowed) {
    return { careFlagPresent: true, emitted: [], policyBlocked: true };
  }

  const civilDate = getCivilDateString(now, input.teamTimezone);
  const civilDateUtc = civilDateToUtcNoon(civilDate);
  const emitted: CareAlertTriggerClass[] = [];

  const db =
    input.db ?? (await import("./client")).database;

  for (const item of classified) {
    const payload = buildProvisionalCareAlertPayload({
      playerDisplayName: input.playerDisplayName,
      civilDate,
      triggerClass: item.triggerClass,
      checkInCompleted: input.checkInCompleted,
      careFlags: item.careFlags,
      injuryLocation: item.injuryLocation,
    });

    try {
      await db.careAlertDispatch.create({
        data: {
          playerId: input.playerId,
          triggerClass: item.triggerClass,
          civilDate: civilDateUtc,
          payload,
        },
      });
      await deliverCareAlertStub(payload);
      emitted.push(item.triggerClass);
    } catch (error) {
      // Unique violation = already emitted today for this class (rate limit).
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: unknown }).code)
          : null;
      if (code !== "P2002") {
        throw error;
      }
    }
  }

  return { careFlagPresent: true, emitted, policyBlocked: false };
}

/** Calm Spanish Player confirmation when a care flag is present. */
export const PLAYER_CARE_CONFIRM_MESSAGE = "Tu equipo ya lo tiene";
