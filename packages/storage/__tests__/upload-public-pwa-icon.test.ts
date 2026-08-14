import { beforeEach, describe, expect, it, vi } from "vitest";

const putMock = vi.fn();
const delMock = vi.fn();

vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => putMock(...args),
  del: (...args: unknown[]) => delMock(...args),
}));

vi.mock("../keys", () => ({
  keys: () => ({
    BLOB_READ_WRITE_TOKEN: "private-token",
    PWA_BLOB_READ_WRITE_TOKEN: "pwa-public-token",
    PWA_BLOB_PUBLIC_BASE_URL: "https://example.public.blob.vercel-storage.com",
    PWA_ICON_PATH_SECRET: "test-pwa-secret",
  }),
}));

describe("uploadPublicPwaIcon", () => {
  beforeEach(() => {
    putMock.mockReset();
    delMock.mockReset();
  });

  it("puts PNG bytes on the public store with the PWA token", async () => {
    putMock.mockResolvedValue({
      pathname: "pwa-icons/c/hash/192.png",
      url: "https://example.public.blob.vercel-storage.com/pwa-icons/c/hash/192.png",
    });

    const { uploadPublicPwaIcon, PWA_ICON_CACHE_MAX_AGE } = await import(
      "../pwa-public"
    );
    const body = Buffer.from([1, 2, 3]);
    const result = await uploadPublicPwaIcon({
      pathname: "pwa-icons/c/hash/192.png",
      body,
    });

    expect(putMock).toHaveBeenCalledWith("pwa-icons/c/hash/192.png", body, {
      access: "public",
      token: "pwa-public-token",
      addRandomSuffix: false,
      contentType: "image/png",
      cacheControlMaxAge: PWA_ICON_CACHE_MAX_AGE,
    });
    expect(result.url).toContain(".public.blob.");
  });
});
