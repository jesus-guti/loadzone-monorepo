import { describe, expect, it } from "vitest";
import { adjustSessionMinutes, clampSessionMinutes } from "./clamp-minutes";

describe("clampSessionMinutes", () => {
  it("clamps to 1..300", () => {
    expect(clampSessionMinutes(0)).toBe(1);
    expect(clampSessionMinutes(400)).toBe(300);
    expect(clampSessionMinutes(80.6)).toBe(81);
  });
});

describe("adjustSessionMinutes", () => {
  it("applies delta within bounds", () => {
    expect(adjustSessionMinutes(80, 5)).toBe(85);
    expect(adjustSessionMinutes(2, -5)).toBe(1);
  });
});
