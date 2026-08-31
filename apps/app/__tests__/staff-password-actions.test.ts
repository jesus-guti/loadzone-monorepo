import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffIdentityError } from "@repo/database/staff-identity";

const stubs = vi.hoisted(() => ({
  getCurrentUserState: vi.fn(),
  requestPasswordReset: vi.fn(),
  completePasswordReset: vi.fn(),
  changePassword: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentUserState: stubs.getCurrentUserState,
}));

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://app.test" },
}));

vi.mock("@repo/auth/server", () => ({
  hashPassword: stubs.hashPassword,
  verifyPassword: stubs.verifyPassword,
}));

vi.mock("@repo/database", () => ({
  database: {},
}));

vi.mock("@repo/database/staff-identity", async () => {
  const actual = await vi.importActual<
    typeof import("@repo/database/staff-identity")
  >("@repo/database/staff-identity");
  return {
    ...actual,
    requestPasswordReset: stubs.requestPasswordReset,
    completePasswordReset: stubs.completePasswordReset,
    changePassword: stubs.changePassword,
  };
});

import {
  changeStaffPassword,
  completeStaffPasswordReset,
  requestStaffPasswordReset,
} from "@/features/settings/actions/staff-password-actions";

describe("requestStaffPasswordReset", () => {
  beforeEach(() => {
    stubs.requestPasswordReset.mockReset();
  });

  it("always returns success and does not call SMTP", async () => {
    stubs.requestPasswordReset.mockResolvedValue({
      emailIntent: {
        kind: "password_reset",
        to: "staff@a.test",
        resetUrl: "https://app.test/reset-password/tok",
      },
    });
    const result = await requestStaffPasswordReset("staff@a.test");
    expect(result).toEqual({ success: true });
    expect(stubs.requestPasswordReset).toHaveBeenCalledTimes(1);
  });

  it("still succeeds when no User exists", async () => {
    stubs.requestPasswordReset.mockResolvedValue({ emailIntent: null });
    const result = await requestStaffPasswordReset("nobody@a.test");
    expect(result).toEqual({ success: true });
  });
});

describe("completeStaffPasswordReset", () => {
  beforeEach(() => {
    stubs.completePasswordReset.mockReset();
    stubs.hashPassword.mockReset();
  });

  it("surfaces used-token errors in Spanish", async () => {
    stubs.completePasswordReset.mockRejectedValue(
      new StaffIdentityError(
        "RESET_USED",
        "Este enlace de restablecimiento ya se usó."
      )
    );
    const result = await completeStaffPasswordReset({
      rawToken: "used",
      password: "newpass12",
    });
    expect(result).toEqual({
      success: false,
      error: "Este enlace de restablecimiento ya se usó.",
    });
  });
});

describe("changeStaffPassword", () => {
  beforeEach(() => {
    stubs.getCurrentUserState.mockReset();
    stubs.changePassword.mockReset();
  });

  it("requires a signed-in User", async () => {
    stubs.getCurrentUserState.mockResolvedValue(null);
    const result = await changeStaffPassword({
      currentPassword: "old",
      newPassword: "newpass12",
    });
    expect(result.success).toBe(false);
    expect(stubs.changePassword).not.toHaveBeenCalled();
  });

  it("changes password for the signed-in User", async () => {
    stubs.getCurrentUserState.mockResolvedValue({ id: "staff_a" });
    stubs.changePassword.mockResolvedValue({ userId: "staff_a" });
    const result = await changeStaffPassword({
      currentPassword: "old-secret",
      newPassword: "newpass12",
    });
    expect(result).toEqual({ success: true });
    expect(stubs.changePassword).toHaveBeenCalledTimes(1);
  });
});
