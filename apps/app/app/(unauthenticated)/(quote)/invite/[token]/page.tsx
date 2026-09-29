import type { Metadata } from "next";
import { StaffInviteAcceptForm } from "@/features/settings/components/staff-invite-accept-form";
import { loadStaffInvitationPreview } from "@/features/settings/actions/staff-invite-actions";

type InvitePageProperties = {
  readonly params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Invitación | LoadZone",
};

export default async function StaffInvitePage({ params }: InvitePageProperties) {
  const { token } = await params;
  const preview = await loadStaffInvitationPreview(token);

  if (!preview.ok) {
    return (
      <div className="space-y-3">
        <h1 className="font-semibold text-2xl text-text-primary">
          Invitación no válida
        </h1>
        <p className="text-sm text-text-secondary">{preview.message}</p>
      </div>
    );
  }

  return (
    <StaffInviteAcceptForm
      clubName={preview.clubName}
      email={preview.email}
      existingUser={preview.existingUser}
      rawToken={token}
    />
  );
}
