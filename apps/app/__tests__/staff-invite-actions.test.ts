import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffIdentityError } from "@repo/database/staff-identity";

const stubs = vi.hoisted(() => ({
  getCurrentStaffContext: vi.fn(),
  revalidatePath: vi.fn(),
  issueStaffInvitation: vi.fn(),
  resendStaffInvitation: vi.fn(),
  cancelStaffInvitation: vi.fn(),
  revokeMembership: vi.fn(),
  changeMembershipRole: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: stubs.revalidatePath,
}));

vi.mock("@/lib/auth-context", () => ({
  getCurrentStaffContext: stubs.getCurrentStaffContext,
}));

vi.mock("@/env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://app.test" },
}));

vi.mock("@repo/auth/server", () => ({
  hashPassword: stubs.hashPassword,
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
    issueStaffInvitation: stubs.issueStaffInvitation,
    resendStaffInvitation: stubs.resendStaffInvitation,
    cancelStaffInvitation: stubs.cancelStaffInvitation,
    revokeMembership: stubs.revokeMembership,
    changeMembershipRole: stubs.changeMembershipRole,
  };
});

import {
  changeClubMembershipRole,
  issueClubStaffInvitation,
  resendClubStaffInvitation,
  revokeClubMembership,
} from "@/features/settings/actions/staff-invite-actions";

describe("issueClubStaffInvitation", () => {
  beforeEach(() => {
    stubs.getCurrentStaffContext.mockReset();
    stubs.issueStaffInvitation.mockReset();
    stubs.revalidatePath.mockReset();
  });

  it("refuses Staff Membership", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "STAFF",
    });
    const result = await issueClubStaffInvitation(
      "club_a",
      "a@b.test",
      "STAFF"
    );
    expect(result.success).toBe(false);
    expect(stubs.issueStaffInvitation).not.toHaveBeenCalled();
  });

  it("issues when the actor is Coordinator of that Club", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "COORDINATOR",
    });
    stubs.issueStaffInvitation.mockResolvedValue({
      invitationId: "inv_1",
      rawToken: "secret",
      emailIntent: {
        kind: "staff_invitation",
        to: "a@b.test",
        clubName: "Norte",
        acceptUrl: "https://app.test/invite/secret",
      },
    });
    const result = await issueClubStaffInvitation(
      "club_a",
      "a@b.test",
      "STAFF"
    );
    expect(result).toEqual({
      success: true,
      acceptUrl: "https://app.test/invite/secret",
    });
    expect(stubs.issueStaffInvitation).toHaveBeenCalledTimes(1);
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/settings/club");
  });

  it("logs delivery without the accept URL or token", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "COORDINATOR",
    });
    stubs.issueStaffInvitation.mockResolvedValue({
      invitationId: "inv_1",
      rawToken: "secret",
      emailIntent: {
        kind: "staff_invitation",
        to: "a@b.test",
        clubName: "Norte",
        acceptUrl: "https://app.test/invite/secret",
      },
    });
    await issueClubStaffInvitation("club_a", "a@b.test", "STAFF");
    const logged = info.mock.calls.flat().map(String).join(" ");
    expect(logged).toContain("staff_invitation");
    expect(logged).toContain("a@b.test");
    expect(logged).not.toContain("secret");
    expect(logged).not.toContain("/invite/");
    info.mockRestore();
  });

  it("surfaces StaffIdentityError messages in Spanish", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "COORDINATOR",
    });
    stubs.issueStaffInvitation.mockRejectedValue(
      new StaffIdentityError(
        "PENDING_EXISTS",
        "Ya hay una invitación pendiente para este email en este club."
      )
    );
    const result = await issueClubStaffInvitation(
      "club_a",
      "a@b.test",
      "STAFF"
    );
    expect(result).toEqual({
      success: false,
      error: "Ya hay una invitación pendiente para este email en este club.",
    });
  });

  it("issues as a platform actor when the caller is Super Admin", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "op_1" },
      club: { id: "club_b" },
      role: "STAFF",
      platformRole: "SUPER_ADMIN",
    });
    stubs.issueStaffInvitation.mockResolvedValue({
      invitationId: "inv_1",
      rawToken: "secret",
      emailIntent: {
        kind: "staff_invitation",
        to: "first@b.test",
        clubName: "Sur",
        acceptUrl: "https://app.test/invite/secret",
      },
    });
    const result = await issueClubStaffInvitation(
      "club_b",
      "first@b.test",
      "COORDINATOR"
    );
    expect(result).toEqual({ success: true });
    expect(stubs.issueStaffInvitation).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        actorUserId: "op_1",
        actor: { kind: "platform" },
        clubId: "club_b",
      })
    );
  });
});

describe("resendClubStaffInvitation", () => {
  beforeEach(() => {
    stubs.getCurrentStaffContext.mockReset();
    stubs.resendStaffInvitation.mockReset();
    stubs.revalidatePath.mockReset();
  });

  it("returns the rotated accept URL to the Coordinator", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "COORDINATOR",
    });
    stubs.resendStaffInvitation.mockResolvedValue({
      invitationId: "inv_1",
      rawToken: "new-secret",
      emailIntent: {
        kind: "staff_invitation",
        to: "a@b.test",
        clubName: "Norte",
        acceptUrl: "https://app.test/invite/new-secret",
      },
    });
    const result = await resendClubStaffInvitation("club_a", "inv_1");
    expect(result).toEqual({
      success: true,
      acceptUrl: "https://app.test/invite/new-secret",
    });
  });
});

describe("revokeClubMembership", () => {
  beforeEach(() => {
    stubs.getCurrentStaffContext.mockReset();
    stubs.revokeMembership.mockReset();
    stubs.revalidatePath.mockReset();
  });

  it("refuses Staff Membership", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "STAFF",
    });
    const result = await revokeClubMembership("club_a", "m_staff");
    expect(result.success).toBe(false);
    expect(stubs.revokeMembership).not.toHaveBeenCalled();
  });

  it("revokes when the actor is Coordinator of that Club", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "COORDINATOR",
    });
    stubs.revokeMembership.mockResolvedValue({ membershipId: "m_staff" });
    const result = await revokeClubMembership("club_a", "m_staff");
    expect(result).toEqual({ success: true });
    expect(stubs.revokeMembership).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actor: { kind: "coordinator", userId: "u1" },
        clubId: "club_a",
        membershipId: "m_staff",
      })
    );
    expect(stubs.revalidatePath).toHaveBeenCalledWith("/settings/club");
  });

  it("surfaces Last Coordinator errors in Spanish", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "COORDINATOR",
    });
    stubs.revokeMembership.mockRejectedValue(
      new StaffIdentityError(
        "LAST_COORDINATOR",
        "El club debe conservar al menos un coordinador."
      )
    );
    const result = await revokeClubMembership("club_a", "m_coord");
    expect(result).toEqual({
      success: false,
      error: "El club debe conservar al menos un coordinador.",
    });
  });
});

describe("changeClubMembershipRole", () => {
  beforeEach(() => {
    stubs.getCurrentStaffContext.mockReset();
    stubs.changeMembershipRole.mockReset();
  });

  it("refuses Staff Membership", async () => {
    stubs.getCurrentStaffContext.mockResolvedValue({
      user: { id: "u1" },
      club: { id: "club_a" },
      role: "STAFF",
    });
    const result = await changeClubMembershipRole(
      "club_a",
      "m_staff",
      "COORDINATOR"
    );
    expect(result.success).toBe(false);
    expect(stubs.changeMembershipRole).not.toHaveBeenCalled();
  });
});
