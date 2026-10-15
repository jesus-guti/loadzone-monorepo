import { describe, expect, it } from "vitest";
import {
  displayedDurationMinutes,
  shouldShowDurationBanner,
  stepDurationMinutes,
} from "./session-duration";

describe("session duration", () => {
  it("starts a non-match session at 80 shared minutes when unset", () => {
    expect(displayedDurationMinutes("TRAINING", null)).toBe(80);
    expect(displayedDurationMinutes("RECOVERY", null)).toBe(80);
    expect(displayedDurationMinutes("OTHER", null)).toBe(80);
  });

  it("starts a match at 95 minutes when unset", () => {
    expect(displayedDurationMinutes("MATCH", null)).toBe(95);
  });

  it("shows the saved duration instead of the default", () => {
    expect(displayedDurationMinutes("TRAINING", 70)).toBe(70);
    expect(displayedDurationMinutes("MATCH", 98)).toBe(98);
  });

  it("steps by one minute and stays inside 1–240", () => {
    expect(stepDurationMinutes(80, 1)).toBe(81);
    expect(stepDurationMinutes(80, -1)).toBe(79);
    expect(stepDurationMinutes(1, -1)).toBe(1);
    expect(stepDurationMinutes(240, 1)).toBe(240);
  });

  it("offers the banner only after the session end", () => {
    const endsAt = new Date("2026-10-05T18:00:00.000Z");
    expect(
      shouldShowDurationBanner(endsAt, new Date("2026-10-05T17:59:00.000Z"))
    ).toBe(false);
    expect(
      shouldShowDurationBanner(endsAt, new Date("2026-10-05T18:00:00.000Z"))
    ).toBe(false);
    expect(
      shouldShowDurationBanner(endsAt, new Date("2026-10-05T18:00:01.000Z"))
    ).toBe(true);
  });
});
