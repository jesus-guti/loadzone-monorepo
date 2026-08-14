import { describe, expect, it } from "vitest";
import {
  midpointForRange,
  sliderReadoutDigit,
  sliderThumbOffsetPercent,
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

describe("sliderThumbOffsetPercent", () => {
  it("maps the scale ends and midpoint", () => {
    expect(sliderThumbOffsetPercent(0, 0, 10)).toBe(0);
    expect(sliderThumbOffsetPercent(5, 0, 10)).toBe(50);
    expect(sliderThumbOffsetPercent(10, 0, 10)).toBe(100);
  });

  it("returns 0 when min equals max", () => {
    expect(sliderThumbOffsetPercent(3, 3, 3)).toBe(0);
  });
});
