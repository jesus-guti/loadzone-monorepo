import { beforeEach, describe, expect, it, vi } from "vitest";

const putMock = vi.fn();
const delMock = vi.fn();

vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => putMock(...args),
  del: (...args: unknown[]) => delMock(...args),
}));

vi.mock("../keys", () => ({
  keys: () => ({
    PWA_BLOB_READ_WRITE_TOKEN: "pwa-public-token",
    PWA_ICON_PATH_SECRET: "test-pwa-secret",
  }),
}));

vi.mock("../pwa-icon-generate", () => ({
  generateOrgPwaIcons: vi.fn(async () => [
    { filename: "180.png", body: Buffer.from("180") },
    { filename: "192.png", body: Buffer.from("192") },
    { filename: "512.png", body: Buffer.from("512") },
    { filename: "512-maskable.png", body: Buffer.from("mask") },
  ]),
}));

describe("publishOrgPwaIcons / deleteOrgPwaIcons", () => {
  beforeEach(() => {
    putMock.mockReset();
    delMock.mockReset();
    putMock.mockResolvedValue({
      pathname: "pwa-icons/c/hash/192.png",
      url: "https://example.public.blob.vercel-storage.com/pwa-icons/c/hash/192.png",
    });
    delMock.mockResolvedValue(undefined);
  });

  it("publishes Club variants under pwa-icons/c/{hash}/", async () => {
    const { publishOrgPwaIcons } = await import("../pwa-icon-publish");
    const { pwaIconOpaqueHash } = await import("../pwa-icon-paths");

    await publishOrgPwaIcons({
      kind: "club",
      entityId: "club_abc",
      logoBytes: Buffer.from("logo"),
    });

    const hash = pwaIconOpaqueHash("club", "club_abc", "test-pwa-secret");
    const pathnames = putMock.mock.calls.map((call) => call[0]);
    expect(pathnames).toEqual([
      `pwa-icons/c/${hash}/180.png`,
      `pwa-icons/c/${hash}/192.png`,
      `pwa-icons/c/${hash}/512.png`,
      `pwa-icons/c/${hash}/512-maskable.png`,
    ]);
  });

  it("publishes Team variants under pwa-icons/t/{hash}/", async () => {
    const { publishOrgPwaIcons } = await import("../pwa-icon-publish");
    const { pwaIconOpaqueHash } = await import("../pwa-icon-paths");

    await publishOrgPwaIcons({
      kind: "team",
      entityId: "team_xyz",
      logoBytes: Buffer.from("logo"),
    });

    const hash = pwaIconOpaqueHash("team", "team_xyz", "test-pwa-secret");
    const pathnames = putMock.mock.calls.map((call) => call[0]);
    expect(pathnames.every((pathname: string) => pathname.startsWith(`pwa-icons/t/${hash}/`))).toBe(
      true
    );
  });

  it("deletes Team public objects under the HMAC path", async () => {
    const { deleteOrgPwaIcons } = await import("../pwa-icon-publish");
    const { pwaIconOpaqueHash } = await import("../pwa-icon-paths");

    await deleteOrgPwaIcons("team", "team_xyz");

    const hash = pwaIconOpaqueHash("team", "team_xyz", "test-pwa-secret");
    expect(delMock).toHaveBeenCalledTimes(4);
    expect(delMock.mock.calls[0]?.[0]).toBe(`pwa-icons/t/${hash}/180.png`);
  });
});
