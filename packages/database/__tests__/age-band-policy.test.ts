import { describe, expect, it } from "vitest";
import {
  DEFAULT_AGE_BAND_POLICY,
  getAgeYearsComplete,
  parseAgeBandPolicy,
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
  ageBandPolicySchema,
  type AgeBandPolicy,
} from "../age-band-policy";

const customPolicy: AgeBandPolicy = {
  assistedMaxAgeExclusive: 8,
  guidedMaxAgeExclusive: 12,
  adultMajorityAge: 16,
  independentYouthSupervisionEnabled: true,
  guardianMissReceiveEnabled: true,
  guardianCareAlertReceiveEnabled: false,
};

describe("ageBandPolicySchema / parseAgeBandPolicy", () => {
  it("accepts documented defaults", () => {
    expect(parseAgeBandPolicy(DEFAULT_AGE_BAND_POLICY)).toEqual(
      DEFAULT_AGE_BAND_POLICY
    );
  });

  it("rejects overlapping or gapped cutoffs", () => {
    const result = ageBandPolicySchema.safeParse({
      ...DEFAULT_AGE_BAND_POLICY,
      assistedMaxAgeExclusive: 14,
      guidedMaxAgeExclusive: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects guidedMax above adultMajorityAge", () => {
    const result = ageBandPolicySchema.safeParse({
      ...DEFAULT_AGE_BAND_POLICY,
      guidedMaxAgeExclusive: 17,
      adultMajorityAge: 16,
    });
    expect(result.success).toBe(false);
  });

  it("returns null for invalid JSON shapes", () => {
    expect(parseAgeBandPolicy(null)).toBeNull();
    expect(parseAgeBandPolicy("nope")).toBeNull();
    expect(parseAgeBandPolicy({ assistedMaxAgeExclusive: 10 })).toBeNull();
  });
});

describe("resolveEffectiveAgeBandPolicy", () => {
  it("uses Team override when valid", () => {
    const result = resolveEffectiveAgeBandPolicy({
      teamPolicy: customPolicy,
      clubPolicy: DEFAULT_AGE_BAND_POLICY,
    });
    expect(result.source).toBe("team");
    expect(result.policy).toEqual(customPolicy);
  });

  it("falls back to Club when Team is null", () => {
    const result = resolveEffectiveAgeBandPolicy({
      teamPolicy: null,
      clubPolicy: customPolicy,
    });
    expect(result.source).toBe("club");
    expect(result.policy).toEqual(customPolicy);
  });

  it("falls back to defaults when both null or invalid", () => {
    expect(
      resolveEffectiveAgeBandPolicy({
        teamPolicy: null,
        clubPolicy: null,
      })
    ).toEqual({ policy: DEFAULT_AGE_BAND_POLICY, source: "defaults" });

    expect(
      resolveEffectiveAgeBandPolicy({
        teamPolicy: { bad: true },
        clubPolicy: "x",
      }).source
    ).toBe("defaults");
  });

  it("ignores invalid Team and uses Club", () => {
    const result = resolveEffectiveAgeBandPolicy({
      teamPolicy: { assistedMaxAgeExclusive: 99 },
      clubPolicy: customPolicy,
    });
    expect(result.source).toBe("club");
  });
});

describe("getAgeYearsComplete", () => {
  it("computes completed years in Team timezone", () => {
    const dob = new Date(Date.UTC(2010, 5, 15)); // 2010-06-15
    const beforeBirthday = new Date("2024-06-14T12:00:00Z");
    const onBirthday = new Date("2024-06-15T12:00:00Z");
    expect(getAgeYearsComplete(dob, "UTC", beforeBirthday)).toBe(13);
    expect(getAgeYearsComplete(dob, "UTC", onBirthday)).toBe(14);
  });
});

describe("resolveAgeBandPolicy matrix", () => {
  const now = new Date("2024-08-01T12:00:00Z");
  const policy = DEFAULT_AGE_BAND_POLICY;

  function resolve(partial: {
    dateOfBirth?: Date | null;
    ageBandOverride?: "ASSISTED" | "GUIDED" | "INDEPENDENT" | null;
    policyOverride?: AgeBandPolicy;
  }) {
    return resolveAgeBandPolicy({
      policy: partial.policyOverride ?? policy,
      dateOfBirth: partial.dateOfBirth,
      ageBandOverride: partial.ageBandOverride,
      teamTimezone: "UTC",
      now,
      policySource: "defaults",
    });
  }

  it("null DOB and no override → UNASSIGNED, supervision off", () => {
    const result = resolve({});
    expect(result.ageBand).toBe("UNASSIGNED");
    expect(result.parentalSupervisionActive).toBe(false);
    expect(result.guardianMissReceive).toBe(false);
    expect(result.guardianCareAlertReceive).toBe(false);
  });

  it("Assisted from DOB (age < assistedMax)", () => {
    const result = resolve({
      dateOfBirth: new Date(Date.UTC(2018, 0, 1)), // age 6
    });
    expect(result.ageBand).toBe("ASSISTED");
    expect(result.parentalSupervisionActive).toBe(true);
    expect(result.guardianMissReceive).toBe(true);
    expect(result.guardianCareAlertReceive).toBe(true);
  });

  it("Guided from DOB", () => {
    const result = resolve({
      dateOfBirth: new Date(Date.UTC(2012, 0, 1)), // age 12
    });
    expect(result.ageBand).toBe("GUIDED");
    expect(result.parentalSupervisionActive).toBe(true);
  });

  it("Independent youth with supervision off → layer off", () => {
    const result = resolve({
      dateOfBirth: new Date(Date.UTC(2009, 0, 1)), // age 15
    });
    expect(result.ageBand).toBe("INDEPENDENT");
    expect(result.ageYearsComplete).toBe(15);
    expect(result.parentalSupervisionActive).toBe(false);
  });

  it("Independent youth with supervision on → layer on", () => {
    const result = resolve({
      dateOfBirth: new Date(Date.UTC(2009, 0, 1)), // age 15
      policyOverride: {
        ...DEFAULT_AGE_BAND_POLICY,
        independentYouthSupervisionEnabled: true,
      },
    });
    expect(result.ageBand).toBe("INDEPENDENT");
    expect(result.parentalSupervisionActive).toBe(true);
    expect(result.guardianMissReceive).toBe(true);
  });

  it("Independent at adultMajorityAge → layer always off", () => {
    const result = resolve({
      dateOfBirth: new Date(Date.UTC(2008, 0, 1)), // age 16
      policyOverride: {
        ...DEFAULT_AGE_BAND_POLICY,
        independentYouthSupervisionEnabled: true,
      },
    });
    expect(result.ageBand).toBe("INDEPENDENT");
    expect(result.parentalSupervisionActive).toBe(false);
  });

  it("override wins over DOB for band", () => {
    const result = resolve({
      dateOfBirth: new Date(Date.UTC(2018, 0, 1)),
      ageBandOverride: "INDEPENDENT",
    });
    expect(result.ageBand).toBe("INDEPENDENT");
  });

  it("Independent override without DOB → majority-equivalent, layer off", () => {
    const result = resolve({
      ageBandOverride: "INDEPENDENT",
      policyOverride: {
        ...DEFAULT_AGE_BAND_POLICY,
        independentYouthSupervisionEnabled: true,
      },
    });
    expect(result.ageBand).toBe("INDEPENDENT");
    expect(result.parentalSupervisionActive).toBe(false);
  });

  it("Guided override enables supervision without DOB", () => {
    const result = resolve({ ageBandOverride: "GUIDED" });
    expect(result.ageBand).toBe("GUIDED");
    expect(result.parentalSupervisionActive).toBe(true);
  });

  it("guardian receive flags respect policy toggles when layer active", () => {
    const result = resolve({
      ageBandOverride: "ASSISTED",
      policyOverride: {
        ...DEFAULT_AGE_BAND_POLICY,
        guardianMissReceiveEnabled: false,
        guardianCareAlertReceiveEnabled: true,
      },
    });
    expect(result.guardianMissReceive).toBe(false);
    expect(result.guardianCareAlertReceive).toBe(true);
  });

  it("uses policy cutoffs, not hard-coded ages", () => {
    const result = resolve({
      dateOfBirth: new Date(Date.UTC(2015, 0, 1)), // age 9
      policyOverride: {
        ...DEFAULT_AGE_BAND_POLICY,
        assistedMaxAgeExclusive: 8,
        guidedMaxAgeExclusive: 12,
      },
    });
    expect(result.ageBand).toBe("GUIDED");
  });
});
