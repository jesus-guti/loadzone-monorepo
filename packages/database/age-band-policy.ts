/**
 * Age Band cutoffs and Guardian receive / Parental Supervision policy.
 *
 * Persist as nullable JSON on Club (defaults) and Team (override). Effective policy:
 * Team override if set, else Club defaults, else DEFAULT_AGE_BAND_POLICY.
 *
 * Safe defaults (JES-43 human override): Assisted [0, 10), Guided [10, 14),
 * Independent 14+; optional youth Independent supervision covers ages below
 * adultMajorityAge (default 16 → Independent 14–15). See CONTEXT.md Age Band.
 *
 * Import from `@repo/database/age-band-policy` (not the default entry) so client
 * bundles avoid `server-only` from `./client`.
 */

import { z } from "zod";

export const AGE_BANDS = ["ASSISTED", "GUIDED", "INDEPENDENT"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export type ResolvedAgeBand = AgeBand | "UNASSIGNED";

export type AgeBandPolicy = {
  assistedMaxAgeExclusive: number;
  guidedMaxAgeExclusive: number;
  adultMajorityAge: number;
  /** When true, Parental Supervision Layer stays on for Independent below adultMajorityAge. */
  independentYouthSupervisionEnabled: boolean;
  guardianMissReceiveEnabled: boolean;
  guardianCareAlertReceiveEnabled: boolean;
};

/**
 * Documented safe defaults when Club/Team JSON is null or invalid.
 * Not fixed-only runtime constants elsewhere — always resolve through this module.
 */
export const DEFAULT_AGE_BAND_POLICY: AgeBandPolicy = {
  assistedMaxAgeExclusive: 10,
  guidedMaxAgeExclusive: 14,
  adultMajorityAge: 16,
  independentYouthSupervisionEnabled: false,
  guardianMissReceiveEnabled: true,
  guardianCareAlertReceiveEnabled: true,
};

const contiguousCutoffsMessage =
  "Los tramos de edad deben ser contiguos: 0 ≤ asistida < guiada ≤ mayoría de edad (enteros, sin huecos ni solapes).";

export const ageBandPolicySchema = z
  .object({
    assistedMaxAgeExclusive: z.number().int().min(0).max(100),
    guidedMaxAgeExclusive: z.number().int().min(0).max(100),
    adultMajorityAge: z.number().int().min(0).max(100),
    independentYouthSupervisionEnabled: z.boolean(),
    guardianMissReceiveEnabled: z.boolean(),
    guardianCareAlertReceiveEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const { assistedMaxAgeExclusive, guidedMaxAgeExclusive, adultMajorityAge } =
      value;
    if (
      !(
        assistedMaxAgeExclusive < guidedMaxAgeExclusive &&
        guidedMaxAgeExclusive <= adultMajorityAge
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: contiguousCutoffsMessage,
        path: ["guidedMaxAgeExclusive"],
      });
    }
  });

export type ResolvedAgeBandPolicy = {
  ageBand: ResolvedAgeBand;
  ageYearsComplete: number | null;
  parentalSupervisionActive: boolean;
  guardianMissReceive: boolean;
  guardianCareAlertReceive: boolean;
  policy: AgeBandPolicy;
  policySource: "team" | "club" | "defaults";
};

export function parseAgeBandPolicy(input: unknown): AgeBandPolicy | null {
  const parsed = ageBandPolicySchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

/**
 * Effective policy for a Team: Team JSON override if valid, else Club JSON if valid,
 * else documented package defaults.
 */
export function resolveEffectiveAgeBandPolicy(input: {
  teamPolicy: unknown;
  clubPolicy: unknown;
}): { policy: AgeBandPolicy; source: "team" | "club" | "defaults" } {
  const teamParsed = parseAgeBandPolicy(input.teamPolicy);
  if (teamParsed) {
    return { policy: teamParsed, source: "team" };
  }

  const clubParsed = parseAgeBandPolicy(input.clubPolicy);
  if (clubParsed) {
    return { policy: clubParsed, source: "club" };
  }

  return { policy: { ...DEFAULT_AGE_BAND_POLICY }, source: "defaults" };
}

type Ymd = { year: number; month: number; day: number };

function parseYmdParts(value: string): Ymd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }
  return { year, month, day };
}

function formatYmdInTimeZone(date: Date, timeZone: string): Ymd | null {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return parseYmdParts(formatter.format(date));
}

/**
 * Completed civil years between DOB and "today" in the Team timezone.
 * DOB is treated as a calendar date (UTC noon avoids DST edge cases for @db.Date).
 */
export function getAgeYearsComplete(
  dateOfBirth: Date,
  teamTimezone: string,
  now: Date = new Date()
): number {
  const today = formatYmdInTimeZone(now, teamTimezone);
  const birth = formatYmdInTimeZone(
    new Date(
      Date.UTC(
        dateOfBirth.getUTCFullYear(),
        dateOfBirth.getUTCMonth(),
        dateOfBirth.getUTCDate(),
        12,
        0,
        0
      )
    ),
    "UTC"
  );

  if (!(today && birth)) {
    return 0;
  }

  let age = today.year - birth.year;
  const birthdayPassed =
    today.month > birth.month ||
    (today.month === birth.month && today.day >= birth.day);
  if (!birthdayPassed) {
    age -= 1;
  }
  return Math.max(0, age);
}

function bandFromAge(ageYearsComplete: number, policy: AgeBandPolicy): AgeBand {
  if (ageYearsComplete < policy.assistedMaxAgeExclusive) {
    return "ASSISTED";
  }
  if (ageYearsComplete < policy.guidedMaxAgeExclusive) {
    return "GUIDED";
  }
  return "INDEPENDENT";
}

function parentalSupervisionForBand(
  ageBand: AgeBand,
  ageYearsComplete: number | null,
  policy: AgeBandPolicy
): boolean {
  if (ageBand === "ASSISTED" || ageBand === "GUIDED") {
    return true;
  }

  // Independent: layer only below adult majority when youth supervision is enabled.
  // Missing age for Independent override → treat as majority-equivalent (layer off).
  if (ageYearsComplete === null) {
    return false;
  }
  if (ageYearsComplete >= policy.adultMajorityAge) {
    return false;
  }
  return policy.independentYouthSupervisionEnabled;
}

export type ResolveAgeBandPolicyInput = {
  policy: AgeBandPolicy;
  policySource?: "team" | "club" | "defaults";
  dateOfBirth?: Date | null;
  ageBandOverride?: AgeBand | null;
  teamTimezone: string;
  now?: Date;
};

/**
 * Resolve Player Age Band and Parental Supervision flags from effective policy + assignment.
 * Neither DOB nor override → UNASSIGNED (Independent copy register; supervision off).
 */
export function resolveAgeBandPolicy(
  input: ResolveAgeBandPolicyInput
): ResolvedAgeBandPolicy {
  const policy = input.policy;
  const policySource = input.policySource ?? "defaults";
  const override = input.ageBandOverride ?? null;
  const dob = input.dateOfBirth ?? null;
  const now = input.now ?? new Date();

  const ageYearsComplete =
    dob === null ? null : getAgeYearsComplete(dob, input.teamTimezone, now);

  let ageBand: ResolvedAgeBand;
  if (override) {
    ageBand = override;
  } else if (ageYearsComplete !== null) {
    ageBand = bandFromAge(ageYearsComplete, policy);
  } else {
    ageBand = "UNASSIGNED";
  }

  if (ageBand === "UNASSIGNED") {
    return {
      ageBand,
      ageYearsComplete,
      parentalSupervisionActive: false,
      guardianMissReceive: false,
      guardianCareAlertReceive: false,
      policy,
      policySource,
    };
  }

  const parentalSupervisionActive = parentalSupervisionForBand(
    ageBand,
    ageYearsComplete,
    policy
  );

  return {
    ageBand,
    ageYearsComplete,
    parentalSupervisionActive,
    guardianMissReceive:
      parentalSupervisionActive && policy.guardianMissReceiveEnabled,
    guardianCareAlertReceive:
      parentalSupervisionActive && policy.guardianCareAlertReceiveEnabled,
    policy,
    policySource,
  };
}

export const ageBandOverrideSchema = z.enum(AGE_BANDS);
