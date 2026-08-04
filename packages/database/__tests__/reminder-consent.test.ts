import { describe, expect, it } from "vitest";
import {
  DEFAULT_AGE_BAND_POLICY,
  type ResolvedAgeBandPolicy,
} from "../age-band-policy";
import {
  DEFAULT_REMINDER_CONSENT_POLICY,
  consentStateAfterOptOut,
  consentStateAfterSubscribe,
  parseReminderConsentPolicy,
  reminderConsentBandKeyFor,
  reminderConsentPolicySchema,
  resolveEffectiveReminderConsentPolicy,
  resolvePushConsent,
  type ReminderConsentPolicy,
} from "../reminder-consent";

function resolvedAge(
  partial: Partial<ResolvedAgeBandPolicy> &
    Pick<ResolvedAgeBandPolicy, "ageBand">
): ResolvedAgeBandPolicy {
  return {
    ageYearsComplete: partial.ageYearsComplete ?? null,
    parentalSupervisionActive: partial.parentalSupervisionActive ?? false,
    guardianMissReceive: false,
    guardianCareAlertReceive: false,
    policy: partial.policy ?? DEFAULT_AGE_BAND_POLICY,
    policySource: "defaults",
    ageBand: partial.ageBand,
  };
}

describe("reminderConsentPolicySchema / parse", () => {
  it("accepts SPEC defaults", () => {
    expect(parseReminderConsentPolicy(DEFAULT_REMINDER_CONSENT_POLICY)).toEqual(
      DEFAULT_REMINDER_CONSENT_POLICY
    );
  });

  it("rejects incomplete policy", () => {
    expect(parseReminderConsentPolicy({ assisted: { playerRemindersMode: "OFF" } })).toBeNull();
  });

  it("rejects invalid mode", () => {
    const result = reminderConsentPolicySchema.safeParse({
      ...DEFAULT_REMINDER_CONSENT_POLICY,
      guided: {
        playerRemindersMode: "NOPE",
        guardianReceiveEnabled: true,
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("resolveEffectiveReminderConsentPolicy", () => {
  it("uses team policy when valid", () => {
    const custom: ReminderConsentPolicy = {
      ...DEFAULT_REMINDER_CONSENT_POLICY,
      guided: {
        playerRemindersMode: "OFF",
        guardianReceiveEnabled: false,
      },
    };
    expect(
      resolveEffectiveReminderConsentPolicy({ teamPolicy: custom })
    ).toEqual({ policy: custom, source: "team" });
  });

  it("falls back to defaults", () => {
    expect(
      resolveEffectiveReminderConsentPolicy({ teamPolicy: null })
    ).toEqual({
      policy: DEFAULT_REMINDER_CONSENT_POLICY,
      source: "defaults",
    });
  });
});

describe("reminderConsentBandKeyFor", () => {
  it("maps Assisted / Guided / Independent youth / majority", () => {
    expect(
      reminderConsentBandKeyFor("ASSISTED", 8, DEFAULT_AGE_BAND_POLICY)
    ).toBe("assisted");
    expect(
      reminderConsentBandKeyFor("GUIDED", 12, DEFAULT_AGE_BAND_POLICY)
    ).toBe("guided");
    expect(
      reminderConsentBandKeyFor("INDEPENDENT", 14, DEFAULT_AGE_BAND_POLICY)
    ).toBe("independentYouth");
    expect(
      reminderConsentBandKeyFor("INDEPENDENT", 15, DEFAULT_AGE_BAND_POLICY)
    ).toBe("independentYouth");
    expect(
      reminderConsentBandKeyFor("INDEPENDENT", 16, DEFAULT_AGE_BAND_POLICY)
    ).toBe("independentMajority");
    expect(
      reminderConsentBandKeyFor("UNASSIGNED", null, DEFAULT_AGE_BAND_POLICY)
    ).toBe("independentMajority");
  });
});

describe("resolvePushConsent matrix", () => {
  it("Assisted: no independent CTA without guardian grant", () => {
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "ASSISTED",
        ageYearsComplete: 8,
        parentalSupervisionActive: true,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "ELIGIBLE",
      hasActiveSubscription: false,
    });
    expect(decision.bandKey).toBe("assisted");
    expect(decision.mode).toBe("GUARDIAN_CONSENTS");
    expect(decision.canSubscribe).toBe(false);
    expect(decision.uiMode).toBe("needs_guardian_consent");
  });

  it("Assisted: adult-present device may subscribe after staff grant", () => {
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "ASSISTED",
        ageYearsComplete: 8,
        parentalSupervisionActive: true,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "ASSISTED_GUARDIAN_GRANTED",
      hasActiveSubscription: false,
    });
    expect(decision.canSubscribe).toBe(true);
    expect(decision.uiMode).toBe("offer_assisted_adult");
  });

  it("Guided: Player may opt in", () => {
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "GUIDED",
        ageYearsComplete: 12,
        parentalSupervisionActive: true,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "ELIGIBLE",
      hasActiveSubscription: false,
    });
    expect(decision.bandKey).toBe("guided");
    expect(decision.mode).toBe("PLAYER_OPT_IN");
    expect(decision.canSubscribe).toBe(true);
    expect(decision.uiMode).toBe("offer_opt_in");
  });

  it("Guided: staff supervision revoke blocks subscribe", () => {
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "GUIDED",
        ageYearsComplete: 12,
        parentalSupervisionActive: true,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "GUARDIAN_BLOCKED",
      hasActiveSubscription: false,
    });
    expect(decision.canSubscribe).toBe(false);
    expect(decision.uiMode).toBe("blocked");
  });

  it("Independent youth (14–15): Player consents", () => {
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "INDEPENDENT",
        ageYearsComplete: 14,
        parentalSupervisionActive: false,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "ELIGIBLE",
      hasActiveSubscription: false,
    });
    expect(decision.bandKey).toBe("independentYouth");
    expect(decision.mode).toBe("PLAYER_CONSENTS");
    expect(decision.canSubscribe).toBe(true);
    expect(decision.uiMode).toBe("offer_opt_in");
  });

  it("Independent majority (16+): Player consents; guardian receive off by default", () => {
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "INDEPENDENT",
        ageYearsComplete: 17,
        parentalSupervisionActive: false,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "OPTED_OUT",
      hasActiveSubscription: false,
    });
    expect(decision.bandKey).toBe("independentMajority");
    expect(decision.canSubscribe).toBe(true);
    expect(decision.effectiveGuardianReceive).toBe(false);
    expect(decision.guardianReceivePolicyDefault).toBe(false);
  });

  it("subscribed surface exposes opt-out", () => {
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "INDEPENDENT",
        ageYearsComplete: 16,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "OPTED_IN",
      hasActiveSubscription: true,
    });
    expect(decision.uiMode).toBe("subscribed");
    expect(decision.canOptOut).toBe(true);
    expect(decision.canSubscribe).toBe(false);
  });

  it("OFF mode blocks subscribe", () => {
    const policy: ReminderConsentPolicy = {
      ...DEFAULT_REMINDER_CONSENT_POLICY,
      guided: {
        playerRemindersMode: "OFF",
        guardianReceiveEnabled: false,
      },
    };
    const decision = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "GUIDED",
        ageYearsComplete: 11,
        parentalSupervisionActive: true,
      }),
      reminderConsentPolicy: policy,
      playerConsentState: "ELIGIBLE",
      hasActiveSubscription: false,
    });
    expect(decision.canSubscribe).toBe(false);
    expect(decision.uiMode).toBe("blocked");
  });

  it("guardian receive requires parental supervision active", () => {
    const withLayer = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "INDEPENDENT",
        ageYearsComplete: 14,
        parentalSupervisionActive: true,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "ELIGIBLE",
      hasActiveSubscription: false,
    });
    expect(withLayer.effectiveGuardianReceive).toBe(true);

    const withoutLayer = resolvePushConsent({
      resolvedAge: resolvedAge({
        ageBand: "INDEPENDENT",
        ageYearsComplete: 14,
        parentalSupervisionActive: false,
      }),
      reminderConsentPolicy: DEFAULT_REMINDER_CONSENT_POLICY,
      playerConsentState: "ELIGIBLE",
      hasActiveSubscription: false,
    });
    expect(withoutLayer.effectiveGuardianReceive).toBe(false);
  });
});

describe("consent transitions", () => {
  it("subscribe → OPTED_IN", () => {
    expect(consentStateAfterSubscribe("ELIGIBLE")).toBe("OPTED_IN");
    expect(consentStateAfterSubscribe("ASSISTED_GUARDIAN_GRANTED")).toBe(
      "OPTED_IN"
    );
    expect(consentStateAfterSubscribe("GUARDIAN_BLOCKED")).toBe(
      "GUARDIAN_BLOCKED"
    );
  });

  it("opt-out keeps Assisted grant; Player modes → OPTED_OUT", () => {
    expect(
      consentStateAfterOptOut("OPTED_IN", "GUARDIAN_CONSENTS")
    ).toBe("ASSISTED_GUARDIAN_GRANTED");
    expect(consentStateAfterOptOut("OPTED_IN", "PLAYER_OPT_IN")).toBe(
      "OPTED_OUT"
    );
    expect(consentStateAfterOptOut("OPTED_IN", "PLAYER_CONSENTS")).toBe(
      "OPTED_OUT"
    );
  });
});
