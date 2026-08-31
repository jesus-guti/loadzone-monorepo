"use server";

import { hashPassword, verifyPassword } from "@repo/auth/server";
import { database } from "@repo/database";
import {
  StaffIdentityError,
  changePassword,
  completePasswordReset,
  peekPasswordReset,
  requestPasswordReset,
  type StaffIdentityClient,
} from "@repo/database/staff-identity";
import { env } from "@/env";
import { getCurrentUserState } from "@/lib/auth-context";

export type StaffPasswordActionResult = {
  success: boolean;
  error?: string;
};

const clock = { now: () => new Date() };
const staffIdentityDb = database as unknown as StaffIdentityClient;

function resetUrlForToken(rawToken: string): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${base}/reset-password/${rawToken}`;
}

function deliverPasswordResetIntent(intent: {
  kind: string;
  to: string;
}): void {
  console.info("[password-reset]", intent.kind, intent.to);
}

function asActionError(error: unknown): StaffPasswordActionResult {
  if (error instanceof StaffIdentityError) {
    return { success: false, error: error.message };
  }
  console.error("[password-reset]", error);
  return { success: false, error: "No se pudo completar la acción." };
}

export async function requestStaffPasswordReset(
  email: string
): Promise<StaffPasswordActionResult> {
  try {
    const result = await requestPasswordReset(staffIdentityDb, clock, {
      email,
      resetUrlForToken,
    });
    if (result.emailIntent) {
      deliverPasswordResetIntent(result.emailIntent);
    }
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function loadPasswordResetPreview(rawToken: string) {
  return peekPasswordReset(staffIdentityDb, clock, rawToken);
}

export async function completeStaffPasswordReset(input: {
  rawToken: string;
  password: string;
}): Promise<StaffPasswordActionResult> {
  try {
    await completePasswordReset(staffIdentityDb, clock, {
      rawToken: input.rawToken,
      password: input.password,
      hashPassword,
    });
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function changeStaffPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<StaffPasswordActionResult> {
  const user = await getCurrentUserState();
  if (!user) {
    return { success: false, error: "Debes iniciar sesión." };
  }
  try {
    await changePassword(staffIdentityDb, {
      userId: user.id,
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      verifyPassword,
      hashPassword,
    });
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}
