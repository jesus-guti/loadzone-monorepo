import { beforeEach, describe, expect, it, vi } from "vitest";

const putMock = vi.fn();
const delMock = vi.fn();
const getMock = vi.fn();

vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => putMock(...args),
  del: (...args: unknown[]) => delMock(...args),
  get: (...args: unknown[]) => getMock(...args),
}));

vi.mock("../keys", () => ({
  keys: () => ({
    BLOB_READ_WRITE_TOKEN: "test-blob-token",
  }),
}));

vi.mock("../image-validation", () => ({
  validateImageFile: vi.fn(async () => undefined),
}));

describe("uploadImage blob access", () => {
  beforeEach(() => {
    putMock.mockReset();
    delMock.mockReset();
    getMock.mockReset();
  });

  it("uploads with private access to match a private Blob store", async () => {
    putMock.mockResolvedValue({
      pathname: "clubs/club-1/logo/1-logo.png",
      url: "https://example.private.blob.vercel-storage.com/clubs/club-1/logo/1-logo.png",
    });

    const { uploadImage } = await import("../index");

    const file = new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47])], "logo.png", {
      type: "image/png",
    });

    const result = await uploadImage({
      file,
      objectKey: "clubs/club-1/logo/1-logo.png",
    });

    expect(putMock).toHaveBeenCalledTimes(1);
    const putOptions = putMock.mock.calls[0]?.[2] as { access?: string };
    expect(putOptions.access).toBe("private");
    expect(result.url).toBe(
      "/api/blob?pathname=clubs%2Fclub-1%2Flogo%2F1-logo.png"
    );
  });

  it("reads private blobs with private access", async () => {
    getMock.mockResolvedValue({
      statusCode: 200,
      stream: null,
      blob: { etag: "etag", contentType: "image/png" },
    });

    const { getPrivateBlob } = await import("../index");
    await getPrivateBlob("clubs/club-1/logo/1-logo.png");

    expect(getMock).toHaveBeenCalledTimes(1);
    const getOptions = getMock.mock.calls[0]?.[1] as { access?: string };
    expect(getOptions.access).toBe("private");
  });
});

describe("toBlobDeleteTarget", () => {
  it("unwraps proxy and private absolute URLs to pathname", async () => {
    const { toBlobDeleteTarget } = await import("../shared");

    expect(toBlobDeleteTarget("/api/blob?pathname=clubs%2Fa%2Flogo.png")).toBe(
      "clubs/a/logo.png"
    );
    expect(
      toBlobDeleteTarget(
        "https://example.private.blob.vercel-storage.com/clubs/a/logo.png"
      )
    ).toBe("clubs/a/logo.png");
    expect(toBlobDeleteTarget("clubs/a/logo.png")).toBe("clubs/a/logo.png");
  });
});
