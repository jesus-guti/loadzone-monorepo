import { describe, expect, it } from "vitest";
import {
  resolveWellnessCivilDay,
  serializeWellnessDateCookie,
} from "./resolve-wellness-civil-day";

describe("resolveWellnessCivilDay", () => {
  const today = "2026-09-29";

  it("returns today when the stored date is from an earlier civil day", () => {
    expect(
      resolveWellnessCivilDay({
        cookieValue: "2026-09-28",
        todayCivilDay: today,
      })
    ).toBe(today);
  });

  it("keeps the stored date when it is already today", () => {
    expect(
      resolveWellnessCivilDay({
        cookieValue: "2026-09-29",
        todayCivilDay: today,
      })
    ).toBe(today);
  });

  it("keeps a past day picked on the same civil day", () => {
    expect(
      resolveWellnessCivilDay({
        cookieValue: serializeWellnessDateCookie("2026-09-27", today),
        todayCivilDay: today,
      })
    ).toBe("2026-09-27");
  });

  it("returns today when that pick belongs to an earlier civil day", () => {
    expect(
      resolveWellnessCivilDay({
        cookieValue: serializeWellnessDateCookie("2026-09-27", "2026-09-28"),
        todayCivilDay: today,
      })
    ).toBe(today);
  });
});
