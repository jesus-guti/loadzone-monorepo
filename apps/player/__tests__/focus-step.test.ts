import { describe, expect, it } from "vitest";
import { nextFocusStepIndex } from "../app/[token]/lib/focus-step";

describe("nextFocusStepIndex", () => {
  it("advances to the next unanswered step after the current index", () => {
    expect(nextFocusStepIndex([true, false, false], 0)).toBe(1);
    expect(nextFocusStepIndex([true, true, false], 1)).toBe(2);
  });

  it("wraps to the first unanswered when later steps are done", () => {
    expect(nextFocusStepIndex([false, true, true], 2)).toBe(0);
  });

  it("returns total length when every step has a value", () => {
    expect(nextFocusStepIndex([true, true, true], 1)).toBe(3);
  });

  it("skips already-answered steps between current and next gap", () => {
    expect(nextFocusStepIndex([true, true, false, false], 0)).toBe(2);
  });
});
