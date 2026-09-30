import { database } from "@repo/database";
import {
  listClubAccess,
  listOperableClubs,
  type StaffIdentityClient,
} from "@repo/database/staff-identity";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAccessScreen } from "@/features/clubs/club-access-screen";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { clubsConsoleIsHidden } from "@/lib/clubs-console-access";

export const metadata: Metadata = {
  title: "Club | Clubes | LoadZone",
};

const staffIdentityDb = database as unknown as StaffIdentityClient;

type ClubPageProperties = {
  readonly params: Promise<{ clubId: string }>;
};

export default async function ClubPage({ params }: ClubPageProperties) {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext || clubsConsoleIsHidden(staffContext.platformRole)) {
    notFound();
  }

  const { clubId } = await params;
  const clubs = await listOperableClubs(staffIdentityDb, {
    actor: { kind: "platform" },
  });
  const club = clubs.find((row) => row.id === clubId);
  if (!club) {
    notFound();
  }

  const access = await listClubAccess(staffIdentityDb, {
    actor: { kind: "platform" },
    clubId,
  });

  return (
    <ClubAccessScreen
      clubId={club.id}
      clubName={club.name}
      clubs={clubs.map((row) => ({ id: row.id, name: row.name }))}
      members={access.members.map((member) => ({
        membershipId: member.membershipId,
        userId: member.userId,
        email: member.email,
        name: member.name,
        role: member.role,
        platformRole: member.platformRole,
      }))}
      pending={access.pendingInvites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresLabel: invite.expiresAt.toLocaleDateString("es-ES"),
      }))}
    />
  );
}
