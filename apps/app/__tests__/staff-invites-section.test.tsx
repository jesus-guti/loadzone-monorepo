import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const stubs = vi.hoisted(() => ({
  issueClubStaffInvitation: vi.fn(),
  resendClubStaffInvitation: vi.fn(),
  cancelClubStaffInvitation: vi.fn(),
}));

vi.mock("@repo/design-system/components/sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/settings/actions/staff-invite-actions", () => ({
  issueClubStaffInvitation: stubs.issueClubStaffInvitation,
  resendClubStaffInvitation: stubs.resendClubStaffInvitation,
  cancelClubStaffInvitation: stubs.cancelClubStaffInvitation,
}));

import { StaffInvitesSection } from "@/features/settings/components/staff-invites-section";

afterEach(() => {
  cleanup();
  stubs.issueClubStaffInvitation.mockReset();
  stubs.resendClubStaffInvitation.mockReset();
});

describe("StaffInvitesSection accept URL", () => {
  it("shows a copyable accept URL after issue", async () => {
    stubs.issueClubStaffInvitation.mockResolvedValue({
      success: true,
      acceptUrl: "https://app.test/invite/secret-token",
    });
    render(
      <StaffInvitesSection
        canInvite
        clubId="club_a"
        pendingInvites={[]}
      />
    );
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "coach@club.es" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar invitación" }));
    const field = await screen.findByLabelText("Enlace de aceptación");
    expect(field).toHaveProperty("value", "https://app.test/invite/secret-token");
    expect(screen.getByRole("button", { name: /Copiar enlace/ })).toBeTruthy();
  });

  it("replaces the accept URL after resend", async () => {
    stubs.resendClubStaffInvitation.mockResolvedValue({
      success: true,
      acceptUrl: "https://app.test/invite/rotated",
    });
    render(
      <StaffInvitesSection
        canInvite
        clubId="club_a"
        pendingInvites={[
          {
            id: "inv_1",
            email: "coach@club.es",
            role: "STAFF",
            expiresAt: "2026-09-07T00:00:00.000Z",
          },
        ]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Reenviar" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Enlace de aceptación")).toHaveProperty(
        "value",
        "https://app.test/invite/rotated"
      );
    });
  });
});
