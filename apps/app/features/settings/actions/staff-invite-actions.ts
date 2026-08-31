"use server";

import { hashPassword } from "@repo/auth/server";
import { database } from "@repo/database";
import {
  StaffIdentityError,
  acceptStaffInvitation,
  cancelStaffInvitation,
  changeMembershipRole,
  issueStaffInvitation,
  listClubAccess,
  peekStaffInvitation,
  resendStaffInvitation,
  revokeMembership,
  staffCanInvite,
  type ClubAccess,
  type StaffIdentityClient,
  type StaffInvitationEmailIntent,
  type StaffInviteRole,
} from "@repo/database/staff-identity";
import { revalidatePath } from "next/cache";
import { env } from "@/env";
import { getCurrentStaffContext } from "@/lib/auth-context";

export type StaffInviteActionResult = {
  success: boolean;
  error?: string;
  /** One-time accept URL. Present after issue/resend; never persist or log. */
  acceptUrl?: string;
};

const clock = { now: () => new Date() };
const staffIdentityDb = database as unknown as StaffIdentityClient;

function acceptUrlForToken(rawToken: string): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${base}/invite/${rawToken}`;
}

function deliverStaffInvitationIntent(
  intent: StaffInvitationEmailIntent
): void {
  console.info("[staff-invitation]", intent.kind, intent.to);
}

function asActionError(error: unknown): StaffInviteActionResult {
  if (error instanceof StaffIdentityError) {
    return { success: false, error: error.message };
  }
  console.error("[staff-invitation]", error);
  return { success: false, error: "No se pudo completar la acción." };
}

async function requireCoordinatorClub(
  clubId: string
): Promise<{ userId: string } | StaffInviteActionResult> {
  const staffContext = await getCurrentStaffContext();
  if (
    !staffContext ||
    staffContext.club.id !== clubId ||
    !staffCanInvite(staffContext.role)
  ) {
    return {
      success: false,
      error: "No tienes permiso para invitar a este club.",
    };
  }
  return { userId: staffContext.user.id };
}

export async function issueClubStaffInvitation(
  clubId: string,
  email: string,
  role: StaffInviteRole
): Promise<StaffInviteActionResult> {
  const gate = await requireCoordinatorClub(clubId);
  if ("success" in gate) {
    return gate;
  }
  try {
    const result = await issueStaffInvitation(staffIdentityDb, clock, {
      actorUserId: gate.userId,
      clubId,
      email,
      role,
      acceptUrlForToken,
    });
    deliverStaffInvitationIntent(result.emailIntent);
    revalidatePath("/settings/club");
    return { success: true, acceptUrl: result.emailIntent.acceptUrl };
  } catch (error) {
    return asActionError(error);
  }
}

export async function resendClubStaffInvitation(
  clubId: string,
  invitationId: string
): Promise<StaffInviteActionResult> {
  const gate = await requireCoordinatorClub(clubId);
  if ("success" in gate) {
    return gate;
  }
  try {
    const result = await resendStaffInvitation(staffIdentityDb, clock, {
      actorUserId: gate.userId,
      invitationId,
      acceptUrlForToken,
    });
    deliverStaffInvitationIntent(result.emailIntent);
    revalidatePath("/settings/club");
    return { success: true, acceptUrl: result.emailIntent.acceptUrl };
  } catch (error) {
    return asActionError(error);
  }
}

export async function cancelClubStaffInvitation(
  clubId: string,
  invitationId: string
): Promise<StaffInviteActionResult> {
  const gate = await requireCoordinatorClub(clubId);
  if ("success" in gate) {
    return gate;
  }
  try {
    await cancelStaffInvitation(staffIdentityDb, clock, {
      actorUserId: gate.userId,
      invitationId,
    });
    revalidatePath("/settings/club");
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function loadStaffInvitationPreview(rawToken: string) {
  return peekStaffInvitation(staffIdentityDb, clock, rawToken);
}

export async function acceptClubStaffInvitation(input: {
  rawToken: string;
  password?: string;
  name?: string;
}): Promise<StaffInviteActionResult> {
  try {
    await acceptStaffInvitation(staffIdentityDb, clock, {
      rawToken: input.rawToken,
      password: input.password,
      name: input.name,
      hashPassword,
    });
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function loadClubAccess(
  clubId: string
): Promise<ClubAccess | StaffInviteActionResult> {
  const gate = await requireCoordinatorClub(clubId);
  if ("success" in gate) {
    return gate;
  }
  try {
    return await listClubAccess(staffIdentityDb, {
      actor: { kind: "coordinator", userId: gate.userId },
      clubId,
    });
  } catch (error) {
    return asActionError(error);
  }
}

export async function revokeClubMembership(
  clubId: string,
  membershipId: string
): Promise<StaffInviteActionResult> {
  const gate = await requireCoordinatorClub(clubId);
  if ("success" in gate) {
    return gate;
  }
  try {
    await revokeMembership(staffIdentityDb, {
      actor: { kind: "coordinator", userId: gate.userId },
      clubId,
      membershipId,
    });
    revalidatePath("/settings/club");
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function changeClubMembershipRole(
  clubId: string,
  membershipId: string,
  role: StaffInviteRole
): Promise<StaffInviteActionResult> {
  const gate = await requireCoordinatorClub(clubId);
  if ("success" in gate) {
    return gate;
  }
  try {
    await changeMembershipRole(staffIdentityDb, {
      actor: { kind: "coordinator", userId: gate.userId },
      clubId,
      membershipId,
      role,
    });
    revalidatePath("/settings/club");
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}
