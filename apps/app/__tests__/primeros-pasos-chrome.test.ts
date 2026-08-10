import { describe, expect, it } from "vitest";
import { shouldAutoHidePrimerosPasos } from "@/features/primeros-pasos/lib/auto-hide";
import {
  parsePrimerosPasosChrome,
  primerosPasosChromeKey,
} from "@/features/primeros-pasos/lib/chrome-storage";

describe("primerosPasos chrome storage", () => {
  it("builds User×Club key", () => {
    expect(primerosPasosChromeKey("user-1", "club-9")).toBe(
      "loadzone.primerosPasos.chrome.v1:user-1:club-9",
    );
  });

  it("parses known chrome values", () => {
    expect(parsePrimerosPasosChrome("expanded")).toBe("expanded");
    expect(parsePrimerosPasosChrome("minimized")).toBe("minimized");
    expect(parsePrimerosPasosChrome("dismissed")).toBe("dismissed");
  });

  it("defaults missing or unknown to expanded", () => {
    expect(parsePrimerosPasosChrome(null)).toBe("expanded");
    expect(parsePrimerosPasosChrome("")).toBe("expanded");
    expect(parsePrimerosPasosChrome("hidden")).toBe("expanded");
  });
});

describe("shouldAutoHidePrimerosPasos", () => {
  it("hides on incomplete→5/5 while expanded", () => {
    expect(
      shouldAutoHidePrimerosPasos({
        lastKnownCompletedCount: 4,
        completedCount: 5,
        totalCount: 5,
        chrome: "expanded",
      }),
    ).toBe(true);
  });

  it("hides on first observe of mature Club (null lastKnown → 0)", () => {
    expect(
      shouldAutoHidePrimerosPasos({
        lastKnownCompletedCount: null,
        completedCount: 5,
        totalCount: 5,
        chrome: "expanded",
      }),
    ).toBe(true);
  });

  it("does not re-hide after restore at 5/5", () => {
    expect(
      shouldAutoHidePrimerosPasos({
        lastKnownCompletedCount: 5,
        completedCount: 5,
        totalCount: 5,
        chrome: "expanded",
      }),
    ).toBe(false);
  });

  it("does not hide when chrome is minimized or dismissed", () => {
    expect(
      shouldAutoHidePrimerosPasos({
        lastKnownCompletedCount: 4,
        completedCount: 5,
        totalCount: 5,
        chrome: "minimized",
      }),
    ).toBe(false);
    expect(
      shouldAutoHidePrimerosPasos({
        lastKnownCompletedCount: 4,
        completedCount: 5,
        totalCount: 5,
        chrome: "dismissed",
      }),
    ).toBe(false);
  });
});
