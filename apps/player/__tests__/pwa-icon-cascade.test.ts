import { describe, expect, it } from "vitest";
import {
  LOADZONE_PWA_ICON_URLS,
  resolvePwaIconUrls,
} from "@repo/storage/pwa-icon-paths";

describe("player PWA icon cascade contract", () => {
  it("keeps LoadZone as the fallback set used by the token session", () => {
    expect(LOADZONE_PWA_ICON_URLS.icon192).toBe("/icon-192.png");
    expect(LOADZONE_PWA_ICON_URLS.icon512).toBe("/icon-512.png");
    expect(LOADZONE_PWA_ICON_URLS.appleTouch).toBe("/apple-touch-icon.png");
  });

  it("does not put raw club ids on branded URLs", () => {
    const resolved = resolvePwaIconUrls({
      team: { id: "team_1", logoUrl: null },
      club: { id: "club_raw_id", logoUrl: "logo" },
      secret: "test-pwa-secret",
      publicBaseUrl: "https://cdn.example",
    });

    expect(resolved.source).toBe("club");
    expect(resolved.urls.icon192).not.toContain("club_raw_id");
    expect(resolved.urls.icon192).toContain("/pwa-icons/c/");
  });
});
