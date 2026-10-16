import { describe, expect, it } from "vitest";
import {
  clampMinutesStepper,
  defaultSharedMinutesForType,
  stepMinutesStepper,
} from "./clamp-minutes";

describe("clampMinutesStepper", () => {
  it("clamps to 1..300", () => {
    expect(clampMinutesStepper(0)).toBe(1);
    expect(clampMinutesStepper(301)).toBe(300);
    expect(clampMinutesStepper(80)).toBe(80);
  });
});

describe("stepMinutesStepper", () => {
  it("steps within bounds", () => {
    expect(stepMinutesStepper(80, 5)).toBe(85);
    expect(stepMinutesStepper(2, -5)).toBe(1);
  });
});

describe("defaultSharedMinutesForType", () => {
  it("uses 95 for matches and 80 otherwise", () => {
    expect(defaultSharedMinutesForType("MATCH")).toBe(95);
    expect(defaultSharedMinutesForType("TRAINING")).toBe(80);
  });
});
