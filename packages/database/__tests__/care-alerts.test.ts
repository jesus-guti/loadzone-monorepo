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
  PLAYER_CARE_CONFIRM_MESSAGE,
  buildProvisionalCareAlertPayload,
  civilDateToUtcNoon,
  classifyCareAlertTriggers,
  evaluateAndEmitCareAlert,
  getCivilDateString,
  isCareAlertReceiveAllowed,
  payloadContainsForbiddenFields,
  type ProvisionalCareAlertPayload,
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

describe("getCivilDateString / timezone boundary", () => {
  it("uses Team timezone civil day (Europe/Madrid late evening vs UTC)", () => {
    // 2026-03-15 23:30 Madrid (CET = UTC+1) → still 15th in Madrid, 16th in UTC-ish wait:
    // 2026-03-15T22:30:00.000Z = 23:30 Madrid → civil 2026-03-15
    const madridEvening = new Date("2026-03-15T22:30:00.000Z");
    expect(getCivilDateString(madridEvening, "Europe/Madrid")).toBe(
      "2026-03-15"
    );

    // 2026-03-15T23:30:00.000Z = 00:30 Madrid next day → civil 2026-03-16
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

  it("maps Pain Alert + physioAlert to INJURY_PAIN", () => {
    const result = classifyCareAlertTriggers({
      painAlert: { bodyPart: "ankle", side: "LEFT" },
      physioAlert: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.triggerClass).toBe("INJURY_PAIN");
    expect(result[0]?.careFlags.map((f) => f.code)).toEqual([
      "pain_alert",
      "physio_alert",
    ]);
    expect(result[0]?.injuryLocation).toEqual({
      bodyPart: "ankle",
      side: "LEFT",
    });
  });

  it("maps care-relevant wellness flags to CARE_RELEVANT_WELLNESS", () => {
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

describe("provisional payload exclusions", () => {
  it("does not include forbidden staff / load fields", () => {
    const payload = buildProvisionalCareAlertPayload({
      playerDisplayName: "Alex",
      civilDate: "2026-08-04",
      triggerClass: "INJURY_PAIN",
      checkInCompleted: true,
      careFlags: [{ code: "pain_alert", labelKey: "care.flag.painAlert" }],
      injuryLocation: { bodyPart: "knee", side: null },
    });

    expect(payloadContainsForbiddenFields(payload)).toEqual([]);
    expect(payload).not.toHaveProperty("staffNotes");
    expect(payload).not.toHaveProperty("acwr");
    expect(payload).not.toHaveProperty("severity");
    expect(payload).not.toHaveProperty("title");
    expect(PLAYER_CARE_CONFIRM_MESSAGE).toBe("Tu equipo ya lo tiene");
  });

  it("detects accidental forbidden keys", () => {
    const bad = {
      playerDisplayName: "Alex",
      date: "2026-08-04",
      triggerClass: "CARE_RELEVANT_WELLNESS" as const,
      checkInCompleted: true,
      careFlags: [],
      staffNotes: "secret",
      acwr: 1.5,
    } as unknown as ProvisionalCareAlertPayload;
    expect(payloadContainsForbiddenFields(bad)).toEqual(
      expect.arrayContaining(["staffNotes", "acwr"])
    );
  });
});

describe("evaluateAndEmitCareAlert", () => {
  it("rate-limits to one ledger row per class per civil day", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: "1" })
      .mockRejectedValueOnce({ code: "P2002" });

    const db = { careAlertDispatch: { create } };

    const baseInput = {
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
      db,
    };

    const first = await evaluateAndEmitCareAlert(baseInput);
    expect(first.emitted).toEqual(["CARE_RELEVANT_WELLNESS"]);
    expect(first.careFlagPresent).toBe(true);

    const second = await evaluateAndEmitCareAlert(baseInput);
    expect(second.emitted).toEqual([]);
    expect(second.careFlagPresent).toBe(true);
    expect(create).toHaveBeenCalledTimes(2);
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
});
