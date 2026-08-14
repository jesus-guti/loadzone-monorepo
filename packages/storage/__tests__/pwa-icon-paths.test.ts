import { describe, expect, it } from "vitest";
import {
  LOADZONE_PWA_ICON_URLS,
  pwaIconObjectPath,
  pwaIconOpaqueHash,
  pwaIconPublicUrl,
  resolvePwaIconUrls,
} from "../pwa-icon-paths";

const SECRET = "test-pwa-secret";
const BASE = "https://example.public.blob.vercel-storage.com";

describe("pwa icon opaque paths", () => {
  it("hashes kind and entity id with HMAC-SHA256 truncated to 32 hex chars", () => {
    expect(pwaIconOpaqueHash("club", "club_abc", SECRET)).toBe(
      "e7dfa23f3efaec0b2c332a31d56313b6"
    );
    expect(pwaIconOpaqueHash("team", "team_xyz", SECRET)).toBe(
      "bd4d50cdc0c4badf61fcbe8779e0b9e9"
    );
  });

  it("builds public URLs without raw entity ids", () => {
    const hash = pwaIconOpaqueHash("club", "club_abc", SECRET);
    const url = pwaIconPublicUrl(BASE, "club", hash, "192.png");

    expect(url).toBe(
      `${BASE}/pwa-icons/c/${hash}/192.png`
    );
    expect(url).not.toContain("club_abc");
    expect(pwaIconObjectPath("team", hash, "512-maskable.png")).toBe(
      `pwa-icons/t/${hash}/512-maskable.png`
    );
  });

  it("strips a trailing slash from the public base URL", () => {
    const hash = pwaIconOpaqueHash("club", "club_abc", SECRET);
    expect(pwaIconPublicUrl(`${BASE}/`, "club", hash, "180.png")).toBe(
      `${BASE}/pwa-icons/c/${hash}/180.png`
    );
  });
});

describe("resolvePwaIconUrls cascade", () => {
  it("prefers Team when Team.logoUrl is set", () => {
    const resolved = resolvePwaIconUrls({
      team: { id: "team_xyz", logoUrl: "/api/blob?pathname=teams%2Fx%2Flogo.png" },
      club: { id: "club_abc", logoUrl: "/api/blob?pathname=clubs%2Fa%2Flogo.png" },
      secret: SECRET,
      publicBaseUrl: BASE,
    });

    expect(resolved.source).toBe("team");
    expect(resolved.urls.icon192).toContain("/pwa-icons/t/");
    expect(resolved.urls.icon192).toContain(
      pwaIconOpaqueHash("team", "team_xyz", SECRET)
    );
  });

  it("uses Club when Team has no logo", () => {
    const resolved = resolvePwaIconUrls({
      team: { id: "team_xyz", logoUrl: null },
      club: { id: "club_abc", logoUrl: "/api/blob?pathname=clubs%2Fa%2Flogo.png" },
      secret: SECRET,
      publicBaseUrl: BASE,
    });

    expect(resolved.source).toBe("club");
    expect(resolved.urls.appleTouch).toContain("/pwa-icons/c/");
    expect(resolved.urls.icon512Maskable).toMatch(/512-maskable\.png$/);
  });

  it("falls back to LoadZone static paths when no org logo is set", () => {
    const resolved = resolvePwaIconUrls({
      team: { id: "team_xyz", logoUrl: null },
      club: { id: "club_abc", logoUrl: null },
      secret: SECRET,
      publicBaseUrl: BASE,
    });

    expect(resolved).toEqual({
      source: "loadzone",
      urls: LOADZONE_PWA_ICON_URLS,
    });
  });

  it("falls back to LoadZone when HMAC env is missing", () => {
    const resolved = resolvePwaIconUrls({
      team: null,
      club: { id: "club_abc", logoUrl: "logo" },
      secret: undefined,
      publicBaseUrl: BASE,
    });

    expect(resolved.source).toBe("loadzone");
  });
});
