import { describe, expect, it } from "vitest";
import {
  clampScaleLevel,
  riskLevelToThermometerLevel,
  rpeLabel,
  rpeTrafficTone,
} from "@/features/wellness/components/wellness-scales";

describe("wellness metric scales helpers", () => {
  it("clamps discrete levels into the metric range", () => {
    expect(clampScaleLevel(0, 1, 5)).toBe(1);
    expect(clampScaleLevel(9, 1, 5)).toBe(5);
    expect(clampScaleLevel(3.6, 0, 10)).toBe(4);
  });

  it("maps risk enums to thermometer levels and leaves empty calm", () => {
    expect(riskLevelToThermometerLevel("CRITICAL")).toBe(5);
    expect(riskLevelToThermometerLevel("HIGH")).toBe(4);
    expect(riskLevelToThermometerLevel("MODERATE")).toBe(3);
    expect(riskLevelToThermometerLevel("LOW")).toBe(2);
    expect(riskLevelToThermometerLevel(null)).toBeNull();
    expect(riskLevelToThermometerLevel(undefined)).toBeNull();
  });

  it("labels RPE in Spanish by band", () => {
    expect(rpeLabel(1)).toBe("Muy suave");
    expect(rpeLabel(4)).toBe("Ligero");
    expect(rpeLabel(6)).toBe("Moderado");
    expect(rpeLabel(8)).toBe("Exigente");
    expect(rpeLabel(10)).toBe("Máximo");
  });

  it("maps RPE to traffic tone by gravity band", () => {
    expect(rpeTrafficTone(0)).toBe("good");
    expect(rpeTrafficTone(4)).toBe("good");
    expect(rpeTrafficTone(7)).toBe("watch");
    expect(rpeTrafficTone(8)).toBe("bad");
    expect(rpeTrafficTone(10)).toBe("bad");
  });
});
