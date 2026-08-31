import { describe, expect, it } from "vitest";
import { shouldRedirectOperatorToPlatform } from "@/lib/operator-platform-redirect";

describe("shouldRedirectOperatorToPlatform", () => {
  it("leaves product routes alone when there is an operating Club", () => {
    expect(shouldRedirectOperatorToPlatform("/", true)).toBe(false);
  });

  it("keeps Super Admin on Plataforma when there is no Club", () => {
    expect(shouldRedirectOperatorToPlatform("/settings/platform", false)).toBe(
      false
    );
  });

  it("sends product routes to Plataforma when there is no operating Club", () => {
    expect(shouldRedirectOperatorToPlatform("/players", false)).toBe(true);
    expect(shouldRedirectOperatorToPlatform("/settings/club", false)).toBe(true);
  });
});
