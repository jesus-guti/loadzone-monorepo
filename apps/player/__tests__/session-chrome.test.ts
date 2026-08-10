import { describe, expect, it } from "vitest";
import {
  SESSION_FIXED_SAVE_CLEARANCE_CLASS,
  sessionPageBottomPaddingClass,
  shouldReserveFixedSaveClearance,
} from "../app/[token]/lib/session-chrome";

describe("shouldReserveFixedSaveClearance", () => {
  const base = {
    showCelebration: false,
    activeTab: "pre",
    preCompleted: false,
    postCompleted: false,
    editingPre: false,
    editingPost: false,
    hasPreTemplate: true,
    hasPostTemplate: true,
  } as const;

  it("reserves clearance while editing an incomplete pre form", () => {
    expect(shouldReserveFixedSaveClearance(base)).toBe(true);
  });

  it("reserves clearance while re-editing a completed pre form", () => {
    expect(
      shouldReserveFixedSaveClearance({
        ...base,
        preCompleted: true,
        editingPre: true,
      })
    ).toBe(true);
  });

  it("does not reserve when pre is done and not editing", () => {
    expect(
      shouldReserveFixedSaveClearance({
        ...base,
        preCompleted: true,
        editingPre: false,
      })
    ).toBe(false);
  });

  it("reserves clearance on the post tab while filling", () => {
    expect(
      shouldReserveFixedSaveClearance({
        ...base,
        activeTab: "post",
        preCompleted: true,
      })
    ).toBe(true);
  });

  it("does not reserve during celebration", () => {
    expect(
      shouldReserveFixedSaveClearance({
        ...base,
        showCelebration: true,
        preCompleted: true,
        postCompleted: true,
      })
    ).toBe(false);
  });

  it("does not reserve without a template for the active tab", () => {
    expect(
      shouldReserveFixedSaveClearance({
        ...base,
        hasPreTemplate: false,
      })
    ).toBe(false);
  });
});

describe("sessionPageBottomPaddingClass", () => {
  it("uses fixed-save clearance class (globals.css owns the calc)", () => {
    const className = sessionPageBottomPaddingClass(true);
    expect(className).toBe(SESSION_FIXED_SAVE_CLEARANCE_CLASS);
    expect(className).toBe("session-fixed-save-clearance");
  });

  it("uses default padding when Guardar chrome is absent", () => {
    expect(sessionPageBottomPaddingClass(false)).toBe("pb-10");
  });
});
