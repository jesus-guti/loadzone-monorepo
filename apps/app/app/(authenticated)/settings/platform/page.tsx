import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listOperableClubs } from "@repo/database/staff-identity";
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

  return (
    <PlatformSettingsForm
      activeClubId={staffContext.club.id}
      clubs={clubs}
    />
  );
}
