import { describe, expect, it } from "vitest";
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
