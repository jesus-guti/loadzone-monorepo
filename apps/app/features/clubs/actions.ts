"use server";

import { database } from "@repo/database";
import {
  attachOperatorMembership,
  cancelStaffInvitation,
  changeMembershipRole,
  changeUserEmail,
  createClubWithFirstCoordinator,
  deleteStaffUser,
  issueStaffInvitation,
  resendStaffInvitation,
  revokeMembership,
  type StaffIdentityClient,
  StaffIdentityError,
  type StaffInviteRole,
  transferMembership,
} from "@repo/database/staff-identity";
import { revalidatePath } from "next/cache";
import { env } from "@/env";
import { getCurrentStaffContext } from "@/lib/auth-context";

export type ClubsActionResult = {
  success: boolean;
  error?: string;
  acceptUrl?: string;
  clubId?: string;
};

const clock = { now: () => new Date() };
const trailingSlash = /\/$/;
const staffIdentityDb = database as unknown as StaffIdentityClient;

function acceptUrlForToken(rawToken: string): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(trailingSlash, "");
  return `${base}/invite/${rawToken}`;
}

function asActionError(error: unknown): ClubsActionResult {
  if (error instanceof StaffIdentityError) {
    return { success: false, error: error.message };
  }
  console.error("[clubs]", error);
  return { success: false, error: "No se pudo completar la acción." };
}

async function requirePlatformUser(): Promise<
  { userId: string } | ClubsActionResult
> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext || staffContext.platformRole !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Solo un operador de plataforma puede hacer esto.",
    };
  }
  return { userId: staffContext.user.id };
}

function revalidateClub(clubId: string): void {
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${clubId}`);
}

export async function createClubWithCoordinator(
  name: string,
  email: string
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    const result = await createClubWithFirstCoordinator(
      staffIdentityDb,
      clock,
      {
        actor: { kind: "platform" },
        actorUserId: gate.userId,
        name,
        email,
        acceptUrlForToken,
      }
    );
    revalidatePath("/clubs");
    revalidatePath(`/clubs/${result.club.id}`);
    return {
      success: true,
      clubId: result.club.id,
      acceptUrl: result.invitation?.emailIntent.acceptUrl,
    };
  } catch (error) {
    return asActionError(error);
  }
}

export async function inviteClubMember(
  clubId: string,
  email: string,
  role: StaffInviteRole
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    const result = await issueStaffInvitation(staffIdentityDb, clock, {
      actor: { kind: "platform" },
      actorUserId: gate.userId,
      clubId,
      email,
      role,
      acceptUrlForToken,
    });
    revalidateClub(clubId);
    return { success: true, acceptUrl: result.emailIntent.acceptUrl };
  } catch (error) {
    return asActionError(error);
  }
}

export async function resendClubInvitation(
  clubId: string,
  invitationId: string
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    const result = await resendStaffInvitation(staffIdentityDb, clock, {
      actor: { kind: "platform" },
      actorUserId: gate.userId,
      invitationId,
      acceptUrlForToken,
    });
    revalidateClub(clubId);
    return { success: true, acceptUrl: result.emailIntent.acceptUrl };
  } catch (error) {
    return asActionError(error);
  }
}

export async function cancelClubInvitation(
  clubId: string,
  invitationId: string
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    await cancelStaffInvitation(staffIdentityDb, clock, {
      actor: { kind: "platform" },
      actorUserId: gate.userId,
      invitationId,
    });
    revalidateClub(clubId);
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function changeClubMemberRole(
  clubId: string,
  membershipId: string,
  role: StaffInviteRole
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    await changeMembershipRole(staffIdentityDb, {
      actor: { kind: "platform" },
      clubId,
      membershipId,
      role,
    });
    revalidateClub(clubId);
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function changeClubMemberEmail(
  clubId: string,
  userId: string,
  email: string
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    await changeUserEmail(staffIdentityDb, {
      actor: { kind: "platform" },
      userId,
      email,
    });
    revalidateClub(clubId);
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function revokeClubMember(
  clubId: string,
  membershipId: string
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    await revokeMembership(staffIdentityDb, {
      actor: { kind: "platform" },
      clubId,
      membershipId,
    });
    revalidateClub(clubId);
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function transferClubMember(
  originClubId: string,
  membershipId: string,
  destinationClubId: string,
  role: StaffInviteRole
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    await transferMembership(staffIdentityDb, {
      actor: { kind: "platform" },
      membershipId,
      destinationClubId,
      role,
    });
    revalidateClub(originClubId);
    revalidatePath(`/clubs/${destinationClubId}`);
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function addClubToMember(
  originClubId: string,
  userId: string,
  destinationClubId: string,
  role: StaffInviteRole
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    await attachOperatorMembership(staffIdentityDb, {
      actor: { kind: "platform" },
      userId,
      clubId: destinationClubId,
      role,
    });
    revalidateClub(originClubId);
    revalidatePath(`/clubs/${destinationClubId}`);
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function deleteClubUser(
  clubId: string,
  userId: string
): Promise<ClubsActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    await deleteStaffUser(staffIdentityDb, {
      actor: { kind: "platform" },
      userId,
    });
    revalidatePath("/clubs");
    revalidatePath(`/clubs/${clubId}`);
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}
