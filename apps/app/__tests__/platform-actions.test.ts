import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffIdentityError } from "@repo/database/staff-identity";

const stubs = vi.hoisted(() => ({
  getCurrentStaffContext: vi.fn(),
  revalidatePath: vi.fn(),
  cookiesSet: vi.fn(),
  createClub: vi.fn(),
  changeUserEmail: vi.fn(),
  grantSuperAdmin: vi.fn(),
  listOperableClubs: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: stubs.revalidatePath,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: stubs.cookiesSet,
    })
  ),
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentStaffContext: stubs.getCurrentStaffContext,
  ACTIVE_CLUB_COOKIE_NAME: "loadzone_active_club",
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
    createClub: stubs.createClub,
    changeUserEmail: stubs.changeUserEmail,
    grantSuperAdmin: stubs.grantSuperAdmin,
    listOperableClubs: stubs.listOperableClubs,
  };
});

import {
  changeStaffUserEmail,
  createOperatingClub,
  grantUserSuperAdmin,
} from "@/features/settings/actions/platform-actions";

describe("createOperatingClub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses Coordinators", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      platformRole: "USER",
      role: "COORDINATOR",
    });
    const result = await createOperatingClub("Norte", "norte");
    expect(result.success).toBe(false);
    expect(stubs.createClub).not.toHaveBeenCalled();
  });

  it("creates a Club for Super Admin and sets the operating cookie", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "op" },
      platformRole: "SUPER_ADMIN",
    });
    stubs.createClub.mockResolvedValue({
      id: "club_new",
      name: "Norte",
      slug: "norte",
    });
    const result = await createOperatingClub("Norte", "norte");
    expect(result).toEqual({ success: true, clubId: "club_new" });
    expect(stubs.createClub).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actor: { kind: "platform" },
        name: "Norte",
        slug: "norte",
      })
    );
    expect(stubs.cookiesSet).toHaveBeenCalledWith(
      "loadzone_active_club",
      "club_new",
      expect.objectContaining({ httpOnly: true, path: "/" })
    );
  });
});

describe("changeStaffUserEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses Coordinators", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      platformRole: "USER",
      role: "COORDINATOR",
    });
    const result = await changeStaffUserEmail("u2", "a@b.test");
    expect(result.success).toBe(false);
    expect(stubs.changeUserEmail).not.toHaveBeenCalled();
  });

  it("surfaces uniqueness errors in Spanish", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "op" },
      platformRole: "SUPER_ADMIN",
    });
    stubs.changeUserEmail.mockRejectedValue(
      new StaffIdentityError(
        "EMAIL_TAKEN",
        "Ese email ya pertenece a otra cuenta."
      )
    );
    const result = await changeStaffUserEmail("u2", "taken@a.test");
    expect(result).toEqual({
      success: false,
      error: "Ese email ya pertenece a otra cuenta.",
    });
  });
});

describe("grantUserSuperAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses Coordinators", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      platformRole: "USER",
      role: "COORDINATOR",
    });
    const result = await grantUserSuperAdmin("u2");
    expect(result.success).toBe(false);
    expect(stubs.grantSuperAdmin).not.toHaveBeenCalled();
  });
});
