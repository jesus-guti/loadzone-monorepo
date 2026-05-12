import { describe, expect, it } from "vitest";

describe("@repo/database package entries", () => {
  it("default entry does not expose bootstrap helpers", async () => {
    const mod = await import("../index");
    expect(mod).not.toHaveProperty("ensureBaseFormTemplates");
    expect(mod).not.toHaveProperty("ensureBaseFormTemplatesWithDb");
    expect(mod).toHaveProperty("database");
  });

  it("bootstrap entry exposes template ensure helpers", async () => {
    const mod = await import("../bootstrap");
    expect(typeof mod.ensureBaseFormTemplates).toBe("function");
    expect(typeof mod.ensureBaseFormTemplatesWithDb).toBe("function");
  });
});
