import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  listClubAccess,
  listOperableClubs,
} from "@repo/database/staff-identity";
import type { StaffIdentityClient } from "@repo/database/staff-identity";
import { database } from "@repo/database";
import { PlatformSettingsForm } from "@/features/settings/components/platform-settings-form";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Plataforma | Configuración | LoadZone",
};

export default async function PlatformSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext || staffContext.platformRole !== "SUPER_ADMIN") {
    notFound();
  }

  const clubs = await listOperableClubs(
    database as unknown as StaffIdentityClient,
    { actor: { kind: "platform" } }
  );

  const operatingClubId = staffContext.club?.id ?? "";
  const access =
    operatingClubId.length === 0
      ? { members: [] }
      : await listClubAccess(database as unknown as StaffIdentityClient, {
          actor: { kind: "platform" },
          clubId: operatingClubId,
        });

  return (
    <PlatformSettingsForm
      activeClubId={operatingClubId}
      clubs={clubs}
      members={access.members.map((member) => ({
        userId: member.userId,
        email: member.email,
        name: member.name,
      }))}
    />
  );
}
