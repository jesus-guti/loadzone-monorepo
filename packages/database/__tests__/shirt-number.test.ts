import { describe, expect, it } from "vitest";

import {
  optionalShirtNumberSchema,
  SHIRT_NUMBER_MAX,
  SHIRT_NUMBER_MIN,
} from "../shirt-number";

describe("optionalShirtNumberSchema", () => {
  it("maps missing and empty form values to null so existing roster rows stay unset", () => {
    expect(optionalShirtNumberSchema.parse(undefined)).toBeNull();
    expect(optionalShirtNumberSchema.parse("")).toBeNull();
    expect(optionalShirtNumberSchema.parse("   ")).toBeNull();
  });

  it("accepts integer shirt numbers in the amateur dorsal range", () => {
    expect(optionalShirtNumberSchema.parse("1")).toBe(SHIRT_NUMBER_MIN);
    expect(optionalShirtNumberSchema.parse("10")).toBe(10);
    expect(optionalShirtNumberSchema.parse("99")).toBe(SHIRT_NUMBER_MAX);
  });

  it("rejects non-integers and numbers outside 1–99", () => {
    expect(optionalShirtNumberSchema.safeParse("0").success).toBe(false);
    expect(optionalShirtNumberSchema.safeParse("100").success).toBe(false);
    expect(optionalShirtNumberSchema.safeParse("10.5").success).toBe(false);
    expect(optionalShirtNumberSchema.safeParse("abc").success).toBe(false);
  });
});
