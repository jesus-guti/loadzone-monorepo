import { describe, expect, it } from "vitest";
import {
  CARE_RELEVANT_WELLNESS_METRICS,
  DEFAULT_NEW_TEAM_WELLNESS_LIMITS,
  evaluateImmediateWellnessFlags,
  parseWellnessLimits,
  WELLNESS_LIMIT_PLACEHOLDERS,
} from "../wellness-limits";

describe("parseWellnessLimits", () => {
  it("normalizes valid limits and fills missing fields with null", () => {
    expect(parseWellnessLimits({ recovery: 4, sleepHours: 6 })).toEqual({
      recovery: 4,
      energy: null,
      soreness: null,
      sleepHours: 6,
      sleepQuality: null,
    });
  });

  it("accepts all-null config (every metric disabled)", () => {
    expect(parseWellnessLimits({})).toEqual({
      recovery: null,
      energy: null,
      soreness: null,
      sleepHours: null,
      sleepQuality: null,
    });
  });

  it("rejects invalid structure or out-of-range values (fail closed)", () => {
    expect(parseWellnessLimits("invalid")).toBeNull();
    expect(parseWellnessLimits({ recovery: "4" })).toBeNull();
    expect(parseWellnessLimits({ recovery: 4.5 })).toBeNull();
    expect(parseWellnessLimits({ recovery: 11 })).toBeNull();
    expect(parseWellnessLimits({ energy: 0 })).toBeNull();
    expect(parseWellnessLimits({ soreness: 6 })).toBeNull();
    expect(parseWellnessLimits({ sleepHours: 25 })).toBeNull();
    expect(parseWellnessLimits({ sleepQuality: 0 })).toBeNull();
  });
});

describe("evaluateImmediateWellnessFlags", () => {
  const limits = {
    recovery: 4,
    energy: 2,
    soreness: 4,
    sleepHours: 6,
    sleepQuality: 2,
  };

  it("fires on inclusive boundaries with locked directions", () => {
    expect(
      evaluateImmediateWellnessFlags(
        {
          recovery: 4,
          energy: 2,
          soreness: 4,
          sleepHours: 5.9,
          sleepQuality: 2,
        },
        limits
      )
    ).toEqual([
      { metric: "recovery", careRelevant: false },
      { metric: "energy", careRelevant: false },
      { metric: "soreness", careRelevant: true },
      { metric: "sleepHours", careRelevant: false },
      { metric: "sleepQuality", careRelevant: false },
    ]);
  });

  it("does not fire just outside thresholds", () => {
    expect(
      evaluateImmediateWellnessFlags(
        {
          recovery: 5,
          energy: 3,
          soreness: 3,
          sleepHours: 6,
          sleepQuality: 3,
        },
        limits
      )
    ).toEqual([]);
  });

  it("treats null threshold as disabled and ignores null entry metrics", () => {
    expect(
      evaluateImmediateWellnessFlags(
        {
          recovery: 1,
          energy: null,
          soreness: 5,
          sleepHours: null,
          sleepQuality: 1,
        },
        {
          recovery: null,
          energy: 2,
          soreness: 4,
          sleepHours: 6,
          sleepQuality: null,
        }
      )
    ).toEqual([{ metric: "soreness", careRelevant: true }]);
  });

  it("marks only soreness as care-relevant (HITL A)", () => {
    expect([...CARE_RELEVANT_WELLNESS_METRICS]).toEqual(["soreness"]);
    const flags = evaluateImmediateWellnessFlags(
      { recovery: 1, energy: 1, soreness: 5, sleepHours: 3, sleepQuality: 1 },
      limits
    );
    expect(flags.filter((flag) => flag.careRelevant).map((f) => f.metric)).toEqual([
      "soreness",
    ]);
  });

  it("never classifies ACWR — ACWR is not a wellnessLimits metric", () => {
    const flags = evaluateImmediateWellnessFlags(
      { recovery: 10, energy: 5, soreness: 1, sleepHours: 8, sleepQuality: 5 },
      limits
    );
    expect(flags).toEqual([]);
    expect(flags.some((flag) => (flag.metric as string) === "acwr")).toBe(false);
  });
});

describe("defaults", () => {
  it("exposes HITL B placeholders and new-team soreness seed", () => {
    expect(WELLNESS_LIMIT_PLACEHOLDERS).toEqual({
      recovery: 4,
      energy: 2,
      soreness: 4,
      sleepHours: 6,
      sleepQuality: 2,
    });
    expect(DEFAULT_NEW_TEAM_WELLNESS_LIMITS).toEqual({
      recovery: null,
      energy: null,
      soreness: 4,
      sleepHours: null,
      sleepQuality: null,
    });
  });
});
