import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  generateOrgPwaIcons,
  PWA_ANY_LOGO_FRACTION,
  PWA_MASKABLE_LOGO_FRACTION,
} from "../pwa-icon-generate";

describe("generateOrgPwaIcons", () => {
  it("emits four opaque PNGs at the locked sizes", async () => {
    const logoBytes = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: { r: 200, g: 40, b: 40, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const icons = await generateOrgPwaIcons(logoBytes);
    const byName = Object.fromEntries(
      icons.map((icon) => [icon.filename, icon.body])
    );

    expect(Object.keys(byName).sort()).toEqual([
      "180.png",
      "192.png",
      "512-maskable.png",
      "512.png",
    ]);
    expect(PWA_ANY_LOGO_FRACTION).toBe(0.82);
    expect(PWA_MASKABLE_LOGO_FRACTION).toBe(0.56);

    for (const filename of ["180.png", "192.png", "512.png", "512-maskable.png"] as const) {
      const meta = await sharp(byName[filename]).metadata();
      expect(meta.format).toBe("png");
      expect(meta.hasAlpha).toBe(false);
      if (filename === "180.png") {
        expect(meta.width).toBe(180);
      }
      if (filename === "192.png") {
        expect(meta.width).toBe(192);
      }
      if (filename.startsWith("512")) {
        expect(meta.width).toBe(512);
      }
    }
  });
});
