import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_AGE_BAND_POLICY,
  type AgeBandPolicy,
} from "../age-band-policy";
import {
  DEFAULT_REMINDER_CONSENT_POLICY,
  type ReminderConsentPolicy,
} from "../reminder-consent";
import {
  GUARDIAN_CARE_FLAG_KEYS,
  GUARDIAN_CARE_INJURY_KEYS,
  GUARDIAN_CARE_SLICE_KEYS,
  PLAYER_CARE_CONFIRM_MESSAGE,
  STAFF_ONLY_CARE_SLICE_KEYS,
  civilDateToUtcNoon,
  classifyCareAlertTriggers,
  evaluateAndEmitCareAlert,
  findStaffOnlyKeysOnGuardianPayload,
  getCivilDateString,
  guardianCareFlagSchema,
  guardianCareSliceSchema,
  isCareAlertReceiveAllowed,
  toGuardianCareSlice,
  type GuardianCareSlice,
} from "../care-alerts";
import type { ResolvedAgeBandPolicy } from "../age-band-policy";

function resolvedAge(
  partial: Partial<ResolvedAgeBandPolicy> &
    Pick<ResolvedAgeBandPolicy, "ageBand">
): ResolvedAgeBandPolicy {
  const parentalSupervisionActive =
    partial.parentalSupervisionActive ??
    (partial.ageBand === "ASSISTED" || partial.ageBand === "GUIDED");
  const careReceive =
    partial.guardianCareAlertReceive ??
    (parentalSupervisionActive &&
      (partial.policy ?? DEFAULT_AGE_BAND_POLICY).guardianCareAlertReceiveEnabled);

  return {
    ageYearsComplete: partial.ageYearsComplete ?? 12,
    parentalSupervisionActive,
    guardianMissReceive: false,
    guardianCareAlertReceive: careReceive,
    policy: partial.policy ?? DEFAULT_AGE_BAND_POLICY,
    policySource: "defaults",
    ageBand: partial.ageBand,
  };
}

/** Staff Injury-shaped fixture — full operational visibility (not Guardian). */
const staffInjuryFixture = {
  id: "inj-1",
  title: "Esguince de tobillo",
  description: "Dolor al cargar peso",
  bodyPart: "ankle",
  injuryType: "sprain",
  side: "LEFT" as const,
  severity: "MODERATE" as const,
  staffNotes: "Revisar con fisio el jueves",
  reportedAt: new Date("2026-08-04T09:00:00.000Z"),
  acwr: 1.4,
  riskLevel: "elevated",
};

describe("getCivilDateString / timezone boundary", () => {
  it("uses Team timezone civil day (Europe/Madrid late evening vs UTC)", () => {
    const madridEvening = new Date("2026-03-15T22:30:00.000Z");
    expect(getCivilDateString(madridEvening, "Europe/Madrid")).toBe(
      "2026-03-15"
    );

    const afterMidnightMadrid = new Date("2026-03-15T23:30:00.000Z");
    expect(getCivilDateString(afterMidnightMadrid, "Europe/Madrid")).toBe(
      "2026-03-16"
    );
    expect(getCivilDateString(afterMidnightMadrid, "UTC")).toBe("2026-03-15");
  });

  it("civilDateToUtcNoon is stable for Date storage", () => {
    const noon = civilDateToUtcNoon("2026-08-04");
    expect(noon.toISOString()).toBe("2026-08-04T12:00:00.000Z");
  });
});

describe("isCareAlertReceiveAllowed", () => {
  it("blocks when Parental Supervision Layer is off", () => {
    expect(
      isCareAlertReceiveAllowed({
        resolvedAge: resolvedAge({
          ageBand: "INDEPENDENT",
          ageYearsComplete: 18,
          parentalSupervisionActive: false,
          guardianCareAlertReceive: false,
        }),
        reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      })
    ).toBe(false);
  });

  it("blocks when age-band Care Alert receive is off", () => {
    const policy: AgeBandPolicy = {
      ...DEFAULT_AGE_BAND_POLICY,
      guardianCareAlertReceiveEnabled: false,
    };
    expect(
      isCareAlertReceiveAllowed({
        resolvedAge: resolvedAge({
          ageBand: "GUIDED",
          parentalSupervisionActive: true,
          guardianCareAlertReceive: false,
          policy,
        }),
        reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      })
    ).toBe(false);
  });

  it("blocks when Reminder Consent guardian receive is off for the band", () => {
    const reminder: ReminderConsentPolicy = {
      ...DEFAULT_REMINDER_CONSENT_POLICY,
      guided: {
        ...DEFAULT_REMINDER_CONSENT_POLICY.guided,
        guardianReceiveEnabled: false,
      },
    };
    expect(
      isCareAlertReceiveAllowed({
        resolvedAge: resolvedAge({
          ageBand: "GUIDED",
          parentalSupervisionActive: true,
          guardianCareAlertReceive: true,
        }),
        reminderConsentPolicy: reminder,
      })
    ).toBe(false);
  });

  it("allows when layer on and both receive gates on", () => {
    expect(
      isCareAlertReceiveAllowed({
        resolvedAge: resolvedAge({
          ageBand: "GUIDED",
          parentalSupervisionActive: true,
          guardianCareAlertReceive: true,
        }),
        reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      })
    ).toBe(true);
  });
});

describe("classifyCareAlertTriggers", () => {
  it("rejects miss signals", () => {
    expect(
      classifyCareAlertTriggers({
        missSignal: true,
        physioAlert: true,
        wellnessFlags: [{ metric: "soreness", careRelevant: true }],
      })
    ).toEqual([]);
  });

  it("maps Pain Alert + physioAlert to INJURY_PAIN with structured injury", () => {
    const reportedAt = new Date("2026-08-04T09:15:00.000Z");
    const result = classifyCareAlertTriggers({
      painAlert: {
        bodyPart: "ankle",
        side: "LEFT",
        injuryType: "sprain",
        reportedAt,
      },
      physioAlert: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.triggerClass).toBe("INJURY_PAIN");
    expect(result[0]?.careFlags.map((f) => f.code)).toEqual([
      "pain_alert",
      "physio_alert",
    ]);
    expect(result[0]?.injury).toEqual({
      bodyPart: "ankle",
      side: "LEFT",
      injuryType: "sprain",
      reportedAt,
    });
  });

  it("maps care-relevant wellness flags to CARE_RELEVANT_WELLNESS without numeric values", () => {
    const result = classifyCareAlertTriggers({
      wellnessFlags: [
        { metric: "soreness", careRelevant: true },
        { metric: "recovery", careRelevant: false },
      ],
    });
    expect(result).toEqual([
      {
        triggerClass: "CARE_RELEVANT_WELLNESS",
        careFlags: [
          { code: "wellness.soreness", labelKey: "care.flag.soreness" },
        ],
      },
    ]);
    for (const flag of result[0]?.careFlags ?? []) {
      expect(Object.keys(flag).sort()).toEqual([...GUARDIAN_CARE_FLAG_KEYS].sort());
      expect(flag).not.toHaveProperty("value");
    }
  });

  it("allows both classes on the same evaluation", () => {
    const result = classifyCareAlertTriggers({
      physioAlert: true,
      wellnessFlags: [{ metric: "soreness", careRelevant: true }],
    });
    expect(result.map((r) => r.triggerClass)).toEqual([
      "INJURY_PAIN",
      "CARE_RELEVANT_WELLNESS",
    ]);
  });
});

describe("GuardianCareSlice allow-list (JES-49)", () => {
  it("projects only allow-listed keys (golden payload)", () => {
    const slice = toGuardianCareSlice({
      playerDisplayName: "Alex",
      date: "2026-08-04",
      checkInCompleted: true,
      triggerClass: "INJURY_PAIN",
      careFlags: [{ code: "pain_alert", labelKey: "care.flag.painAlert" }],
      injury: {
        bodyPart: "knee",
        side: "LEFT",
        injuryType: "contusion",
        reportedAt: new Date("2026-08-04T08:00:00.000Z"),
      },
    });

    expect(Object.keys(slice).sort()).toEqual(
      [...GUARDIAN_CARE_SLICE_KEYS].sort()
    );
    expect(slice.injury && Object.keys(slice.injury).sort()).toEqual(
      [...GUARDIAN_CARE_INJURY_KEYS].sort()
    );
    expect(findStaffOnlyKeysOnGuardianPayload(slice)).toEqual([]);
    expect(guardianCareSliceSchema.safeParse(slice).success).toBe(true);
    expect(PLAYER_CARE_CONFIRM_MESSAGE).toBe("Tu equipo ya lo tiene");
  });

  it("ignores staff-only fields on the source (allow-list, not deny-list strip)", () => {
    const pollutedSource = {
      playerDisplayName: "Alex",
      date: "2026-08-04",
      checkInCompleted: true,
      triggerClass: "CARE_RELEVANT_WELLNESS" as const,
      careFlags: [
        { code: "wellness.soreness", labelKey: "care.flag.soreness", value: 5 },
      ],
      staffNotes: "secret",
      acwr: 1.5,
      severity: "MAJOR",
      title: "Should not leak",
      description: "Should not leak",
      recovery: 2,
      injury: {
        bodyPart: "knee",
        side: "RIGHT",
        injuryType: null,
        reportedAt: "2026-08-04T08:00:00.000Z",
        staffNotes: "physio note",
        severity: "MODERATE",
        title: "hidden",
      },
    };

    const slice = toGuardianCareSlice(
      pollutedSource as Parameters<typeof toGuardianCareSlice>[0]
    );

    expect(findStaffOnlyKeysOnGuardianPayload(slice)).toEqual([]);
    expect(slice).not.toHaveProperty("staffNotes");
    expect(slice).not.toHaveProperty("acwr");
    expect(slice).not.toHaveProperty("severity");
    expect(slice).not.toHaveProperty("title");
    expect(slice.careFlags[0]).not.toHaveProperty("value");
    expect(slice.injury).not.toHaveProperty("staffNotes");
    expect(slice.injury).not.toHaveProperty("severity");
    expect(slice.injury).not.toHaveProperty("title");
  });

  it("Zod .strict() rejects staff-only keys on a Guardian payload", () => {
    const withStaffNotes = {
      playerDisplayName: "Alex",
      date: "2026-08-04",
      checkInCompleted: true,
      triggerClass: "INJURY_PAIN",
      careFlags: [],
      staffNotes: "leak",
    };
    expect(guardianCareSliceSchema.safeParse(withStaffNotes).success).toBe(
      false
    );

    const withFlagValue = {
      playerDisplayName: "Alex",
      date: "2026-08-04",
      checkInCompleted: true,
      triggerClass: "CARE_RELEVANT_WELLNESS",
      careFlags: [
        {
          code: "wellness.soreness",
          labelKey: "care.flag.soreness",
          value: 5,
        },
      ],
    };
    expect(guardianCareSliceSchema.safeParse(withFlagValue).success).toBe(
      false
    );
    expect(guardianCareFlagSchema.safeParse(withFlagValue.careFlags[0]).success).toBe(
      false
    );

    const withInjurySeverity = {
      playerDisplayName: "Alex",
      date: "2026-08-04",
      checkInCompleted: true,
      triggerClass: "INJURY_PAIN",
      careFlags: [],
      injury: {
        bodyPart: "knee",
        side: "LEFT",
        severity: "MAJOR",
      },
    };
    expect(guardianCareSliceSchema.safeParse(withInjurySeverity).success).toBe(
      false
    );
  });

  it("fails visibility check when a staff-only field is present on a payload", () => {
    const leaked = {
      playerDisplayName: "Alex",
      date: "2026-08-04",
      triggerClass: "CARE_RELEVANT_WELLNESS",
      checkInCompleted: true,
      careFlags: [],
      staffNotes: "secret",
      acwr: 1.5,
      value: 5,
    } as unknown as GuardianCareSlice;

    expect(findStaffOnlyKeysOnGuardianPayload(leaked)).toEqual(
      expect.arrayContaining(["staffNotes", "acwr", "value"])
    );
  });

  it("staff fixture still exposes excluded fields (staff visibility unchanged)", () => {
    for (const key of [
      "title",
      "description",
      "severity",
      "staffNotes",
      "acwr",
      "riskLevel",
    ] as const) {
      expect(staffInjuryFixture).toHaveProperty(key);
      expect(STAFF_ONLY_CARE_SLICE_KEYS).toContain(key);
    }

    const guardianFromStaffAttempt = {
      ...staffInjuryFixture,
      playerDisplayName: "Alex",
      date: "2026-08-04",
      checkInCompleted: true,
      triggerClass: "INJURY_PAIN",
      careFlags: [{ code: "pain_alert", labelKey: "care.flag.painAlert" }],
    };
    expect(
      guardianCareSliceSchema.safeParse(guardianFromStaffAttempt).success
    ).toBe(false);
  });
});

describe("evaluateAndEmitCareAlert", () => {
  it("does not emit while Age Band policy is postponed (parental layer off)", async () => {
    const create = vi.fn();

    const result = await evaluateAndEmitCareAlert({
      playerId: "player-1",
      playerDisplayName: "Alex",
      teamTimezone: "Europe/Madrid",
      teamAgeBandPolicy: null,
      clubAgeBandPolicy: null,
      reminderConsentPolicy: null,
      dateOfBirth: new Date("2014-01-01T12:00:00.000Z"),
      signals: {
        wellnessFlags: [{ metric: "soreness" as const, careRelevant: true }],
      },
      checkInCompleted: true,
      now: new Date("2026-08-04T10:00:00.000Z"),
      db: { careAlertDispatch: { create } },
    });

    expect(result).toEqual({
      careFlagPresent: true,
      emitted: [],
      policyBlocked: true,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("does not emit when policy blocked but still reports careFlagPresent", async () => {
    const create = vi.fn();
    const policyOff: AgeBandPolicy = {
      ...DEFAULT_AGE_BAND_POLICY,
      guardianCareAlertReceiveEnabled: false,
    };

    const result = await evaluateAndEmitCareAlert({
      playerId: "player-1",
      playerDisplayName: "Alex",
      teamTimezone: "Europe/Madrid",
      teamAgeBandPolicy: policyOff,
      clubAgeBandPolicy: null,
      reminderConsentPolicy: null,
      dateOfBirth: new Date("2014-01-01T12:00:00.000Z"),
      signals: { physioAlert: true },
      checkInCompleted: true,
      now: new Date("2026-08-04T10:00:00.000Z"),
      db: { careAlertDispatch: { create } },
    });

    expect(result).toEqual({
      careFlagPresent: true,
      emitted: [],
      policyBlocked: true,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("ignores miss-only signals", async () => {
    const create = vi.fn();
    const result = await evaluateAndEmitCareAlert({
      playerId: "player-1",
      playerDisplayName: "Alex",
      teamTimezone: "Europe/Madrid",
      teamAgeBandPolicy: null,
      clubAgeBandPolicy: null,
      reminderConsentPolicy: null,
      dateOfBirth: new Date("2014-01-01T12:00:00.000Z"),
      signals: { missSignal: true },
      checkInCompleted: false,
      db: { careAlertDispatch: { create } },
    });
    expect(result.careFlagPresent).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("does not write guardian payload while Age Band policy is postponed", async () => {
    const create = vi.fn();
    const reportedAt = new Date("2026-08-04T09:00:00.000Z");

    const result = await evaluateAndEmitCareAlert({
      playerId: "player-1",
      playerDisplayName: "Alex",
      teamTimezone: "Europe/Madrid",
      teamAgeBandPolicy: null,
      clubAgeBandPolicy: null,
      reminderConsentPolicy: null,
      dateOfBirth: new Date("2014-01-01T12:00:00.000Z"),
      signals: {
        painAlert: {
          bodyPart: "ankle",
          side: "LEFT",
          injuryType: "sprain",
          reportedAt,
        },
      },
      checkInCompleted: false,
      now: new Date("2026-08-04T10:00:00.000Z"),
      db: { careAlertDispatch: { create } },
    });

    expect(result.policyBlocked).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });
});
