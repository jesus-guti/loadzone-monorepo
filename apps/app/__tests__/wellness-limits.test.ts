import { describe, expect, it } from "vitest";
import { parseWellnessLimits } from "@/lib/wellness-limits";

describe("parseWellnessLimits", () => {
  it("normaliza limites validos y rellena campos ausentes con null", () => {
    expect(parseWellnessLimits({ recovery: 4, sleepHours: 6 })).toEqual({
      recovery: 4,
      energy: null,
      soreness: null,
      sleepHours: 6,
      sleepQuality: null,
    });
  });

  it("devuelve null cuando la estructura no es valida", () => {
    expect(parseWellnessLimits("invalid")).toBeNull();
    expect(parseWellnessLimits({ recovery: "4" })).toBeNull();
  });
});
