import { describe, expect, it } from "vitest";
import {
  midpointForRange,
  sliderReadoutDigit,
} from "../app/[token]/lib/slider-readout";

describe("midpointForRange", () => {
  it("rounds the midpoint of a 0–10 recovery/RPE scale to 5", () => {
    expect(midpointForRange(0, 10)).toBe(5);
  });

  it("rounds odd spans toward the nearer integer", () => {
    expect(midpointForRange(1, 5)).toBe(3);
  });
});

describe("sliderReadoutDigit", () => {
  it("shows the muted mid digit while unset", () => {
    expect(sliderReadoutDigit(null, 0, 10)).toBe(5);
  });

  it("shows the committed digit after interaction", () => {
    expect(sliderReadoutDigit(7, 0, 10)).toBe(7);
    expect(sliderReadoutDigit(0, 0, 10)).toBe(0);
  });
});
