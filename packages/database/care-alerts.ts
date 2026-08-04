/**
 * Guardian Care Alert evaluation, graduated care-slice allow-list, and ledger emit.
 *
 * Distinct from miss reminders (PushDispatch). Quiet hours do not apply (JES-47 HITL B).
 * Transport is stubbed until Guardian contacts exist.
 * Payload boundary: JES-49 `GuardianCareSlice` (allow-list projection, Zod `.strict()`).
 *
 * Import from `@repo/database/care-alerts` so client bundles avoid `server-only`.
 */

import { z } from "zod";
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

export const INJURY_SIDES = [
  "LEFT",
  "RIGHT",
  "BILATERAL",
  "CENTRAL",
] as const;

export type InjurySideCode = (typeof INJURY_SIDES)[number];

/** Care-flag presentation: stable code + labelKey only (no numeric value — JES-49 HITL C). */
export const guardianCareFlagSchema = z
  .object({
    code: z.string().min(1),
    labelKey: z.string().min(1),
  })
  .strict();

export type CareAlertFlag = z.infer<typeof guardianCareFlagSchema>;

/** Structured injury location only — no title / description / severity (JES-49 HITL B). */
export const guardianCareInjurySchema = z
  .object({
    bodyPart: z.string().nullable().optional(),
    side: z.enum(INJURY_SIDES).nullable().optional(),
    injuryType: z.string().nullable().optional(),
    reportedAt: z.string().min(1).optional(),
  })
  .strict();

export type GuardianCareInjury = z.infer<typeof guardianCareInjurySchema>;

/**
 * Graduated Guardian care-slice allow-list (JES-49).
 * Closed type: projection builds this object; Zod `.strict()` rejects staff-only keys.
 */
export const guardianCareSliceSchema = z
  .object({
    playerDisplayName: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkInCompleted: z.boolean(),
    triggerClass: z.enum(CARE_ALERT_TRIGGER_CLASSES),
    careFlags: z.array(guardianCareFlagSchema),
    injury: guardianCareInjurySchema.optional(),
  })
  .strict();

export type GuardianCareSlice = z.infer<typeof guardianCareSliceSchema>;

/** @deprecated Use GuardianCareSlice — alias kept for ledger JSON typing during transition. */
export type ProvisionalCareAlertPayload = GuardianCareSlice;

export const GUARDIAN_CARE_SLICE_KEYS = [
  "playerDisplayName",
  "date",
  "checkInCompleted",
  "triggerClass",
  "careFlags",
  "injury",
] as const;

export const GUARDIAN_CARE_FLAG_KEYS = ["code", "labelKey"] as const;

export const GUARDIAN_CARE_INJURY_KEYS = [
  "bodyPart",
  "side",
  "injuryType",
  "reportedAt",
] as const;

/** Staff-only / permanently excluded keys that must never appear on a Guardian payload. */
export const STAFF_ONLY_CARE_SLICE_KEYS = [
  "acwr",
  "acuteLoad",
  "chronicLoad",
  "srpe",
  "tqrAvg7d",
  "rpeAvg7d",
  "riskLevel",
  "loadRatio",
  "loadRatios",
  "acuteChronic",
  "staffNotes",
  "peerComparison",
  "title",
  "description",
  "severity",
  "recovery",
  "energy",
  "soreness",
  "sleepHours",
  "sleepQuality",
  "physioAlert",
  "duration",
  "rpe",
  "value",
] as const;

export type GuardianCareSliceSource = {
  playerDisplayName: string;
  date: string;
  checkInCompleted: boolean;
  triggerClass: CareAlertTriggerClass;
  careFlags: ReadonlyArray<{ code: string; labelKey: string }>;
  injury?: {
    bodyPart?: string | null;
    side?: string | null;
    injuryType?: string | null;
    reportedAt?: string | Date | null;
  } | null;
};

function normalizeInjurySide(side: unknown): InjurySideCode | null {
  const parsed = z.enum(INJURY_SIDES).safeParse(side);
  return parsed.success ? parsed.data : null;
}

function normalizeReportedAt(
  reportedAt: string | Date | null | undefined
): string | undefined {
  if (reportedAt == null) {
    return undefined;
  }
  if (reportedAt instanceof Date) {
    return reportedAt.toISOString();
  }
  if (typeof reportedAt === "string" && reportedAt.length > 0) {
    return reportedAt;
  }
  return undefined;
}

/**
 * Allow-list projector: builds a GuardianCareSlice from source fields only.
 * Extra / staff-only keys on `source` are ignored (never copied). Output is Zod-strict.
 */
export function toGuardianCareSlice(
  source: GuardianCareSliceSource
): GuardianCareSlice {
  const careFlags: CareAlertFlag[] = source.careFlags.map((flag) => ({
    code: flag.code,
    labelKey: flag.labelKey,
  }));

  const projected: Record<string, unknown> = {
    playerDisplayName: source.playerDisplayName,
    date: source.date,
    checkInCompleted: source.checkInCompleted,
    triggerClass: source.triggerClass,
    careFlags,
  };

  if (source.injury) {
    const reportedAt = normalizeReportedAt(source.injury.reportedAt);
    const injury: Record<string, unknown> = {
      bodyPart: source.injury.bodyPart ?? null,
      side: normalizeInjurySide(source.injury.side),
      injuryType: source.injury.injuryType ?? null,
    };
    if (reportedAt !== undefined) {
      injury.reportedAt = reportedAt;
    }
    projected.injury = injury;
  }

  return guardianCareSliceSchema.parse(projected);
}

/**
 * Returns staff-only / forbidden keys found as JSON object keys in a payload.
 * Used by visibility tests — fail if a staff field leaks onto a Guardian slice.
 */
export function findStaffOnlyKeysOnGuardianPayload(
  payload: unknown
): string[] {
  const serialized = JSON.stringify(payload);
  const found: string[] = [];
  for (const key of STAFF_ONLY_CARE_SLICE_KEYS) {
    if (new RegExp(`"${key}"\\s*:`).test(serialized)) {
      found.push(key);
    }
  }
  return found;
}

/** @deprecated Prefer findStaffOnlyKeysOnGuardianPayload. */
export function payloadContainsForbiddenFields(
  payload: GuardianCareSlice
): string[] {
  return findStaffOnlyKeysOnGuardianPayload(payload);
}

export type CareAlertEvaluationSignals = {
  /** Player Pain Alert (InjuryReport with reportedByPlayer). */
  painAlert?: {
    bodyPart?: string | null;
    side?: string | null;
    injuryType?: string | null;
    reportedAt?: string | Date | null;
  };
  /** Explicit check-in injury/pain flag (DailyEntry.physioAlert). */
  physioAlert?: boolean;
  /** Immediate wellness flags from JES-41 evaluator (metric + careRelevant only). */
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
  injury?: GuardianCareSliceSource["injury"];
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
  let injury: GuardianCareSliceSource["injury"];

  if (signals.painAlert) {
    injuryFlags.push({
      code: "pain_alert",
      labelKey: "care.flag.painAlert",
    });
    injury = {
      bodyPart: signals.painAlert.bodyPart ?? null,
      side: signals.painAlert.side ?? null,
      injuryType: signals.painAlert.injuryType ?? null,
      reportedAt: signals.painAlert.reportedAt ?? null,
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
      injury,
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

export type CareAlertDispatchWriter = {
  careAlertDispatch: {
    create: (args: {
      data: {
        playerId: string;
        triggerClass: CareAlertTriggerClass;
        civilDate: Date;
        payload: GuardianCareSlice;
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

  const db = input.db ?? (await import("./client")).database;

  for (const item of classified) {
    const payload = toGuardianCareSlice({
      playerDisplayName: input.playerDisplayName,
      date: civilDate,
      checkInCompleted: input.checkInCompleted,
      triggerClass: item.triggerClass,
      careFlags: item.careFlags,
      injury: item.injury,
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

/**
 * Stub transport until Guardian contact channels exist.
 * No-op by default; optional structured log without free-text injury notes.
 */
export async function deliverCareAlertStub(
  payload: GuardianCareSlice
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info("[care-alert-stub]", {
      triggerClass: payload.triggerClass,
      date: payload.date,
      flagCodes: payload.careFlags.map((flag) => flag.code),
    });
  }
}

/** Calm Spanish Player confirmation when a care flag is present. */
export const PLAYER_CARE_CONFIRM_MESSAGE = "Tu equipo ya lo tiene";
