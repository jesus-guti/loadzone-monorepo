import { database } from "@repo/database";
import {
  listClubAccess,
  listOperableClubs,
  type StaffIdentityClient,
} from "@repo/database/staff-identity";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubsList } from "@/features/clubs/clubs-list";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { clubsConsoleIsHidden } from "@/lib/clubs-console-access";

export const metadata: Metadata = {
  title: "Clubes | LoadZone",
};

const staffIdentityDb = database as unknown as StaffIdentityClient;

export default async function ClubsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext || clubsConsoleIsHidden(staffContext.platformRole)) {
    notFound();
  }

  const clubs = await listOperableClubs(staffIdentityDb, {
    actor: { kind: "platform" },
  });
  const rows = await Promise.all(
    clubs.map(async (club) => {
      const access = await listClubAccess(staffIdentityDb, {
        actor: { kind: "platform" },
        clubId: club.id,
      });
      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        memberCount: access.members.length,
        pendingCount: access.pendingInvites.length,
      };
    })
  );

  return <ClubsList clubs={rows} />;
}
