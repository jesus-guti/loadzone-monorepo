"use server";

import { database } from "@repo/database";
import {
  StaffIdentityError,
  changeUserEmail,
  createClub,
  grantSuperAdmin,
  listOperableClubs,
  type StaffIdentityClient,
} from "@repo/database/staff-identity";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ACTIVE_CLUB_COOKIE_NAME,
  getCurrentStaffContext,
} from "@/lib/auth-context";

export type PlatformActionResult = {
  success: boolean;
  error?: string;
  clubId?: string;
};

const staffIdentityDb = database as unknown as StaffIdentityClient;

function asActionError(error: unknown): PlatformActionResult {
  if (error instanceof StaffIdentityError) {
    return { success: false, error: error.message };
  }
  console.error("[platform]", error);
  return { success: false, error: "No se pudo completar la acción." };
}

async function requirePlatformUser(): Promise<
  | { userId: string }
  | PlatformActionResult
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

export async function loadOperableClubs() {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return [];
  }
  try {
    return await listOperableClubs(staffIdentityDb, {
      actor: { kind: "platform" },
    });
  } catch {
    return [];
  }
}

export async function setActiveOperatingClub(
  clubId: string
): Promise<PlatformActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  const clubs = await listOperableClubs(staffIdentityDb, {
    actor: { kind: "platform" },
  });
  if (!clubs.some((club) => club.id === clubId)) {
    return { success: false, error: "Club no encontrado." };
  }
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_CLUB_COOKIE_NAME, clubId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/", "layout");
  return { success: true, clubId };
}

export async function createOperatingClub(
  name: string,
  slug: string
): Promise<PlatformActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  try {
    const club = await createClub(staffIdentityDb, {
      actor: { kind: "platform" },
      name,
      slug,
    });
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_CLUB_COOKIE_NAME, club.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    revalidatePath("/", "layout");
    revalidatePath("/settings/platform");
    return { success: true, clubId: club.id };
  } catch (error) {
    return asActionError(error);
  }
}

async function resolveUserIdByEmail(
  email: string
): Promise<{ userId: string } | PlatformActionResult> {
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0) {
    return { success: false, error: "El email no es válido." };
  }
  const user = await database.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });
  if (!user) {
    return { success: false, error: "Usuario no encontrado." };
  }
  return { userId: user.id };
}

export async function changeStaffUserEmail(
  currentEmail: string,
  email: string
): Promise<PlatformActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  const lookup = await resolveUserIdByEmail(currentEmail);
  if ("success" in lookup) {
    return lookup;
  }
  try {
    await changeUserEmail(staffIdentityDb, {
      actor: { kind: "platform" },
      userId: lookup.userId,
      email,
    });
    revalidatePath("/settings/platform");
    revalidatePath("/settings/usuarios");
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}

export async function grantUserSuperAdmin(
  email: string
): Promise<PlatformActionResult> {
  const gate = await requirePlatformUser();
  if ("success" in gate) {
    return gate;
  }
  const lookup = await resolveUserIdByEmail(email);
  if ("success" in lookup) {
    return lookup;
  }
  try {
    await grantSuperAdmin(staffIdentityDb, {
      actor: { kind: "platform" },
      userId: lookup.userId,
    });
    revalidatePath("/settings/platform");
    return { success: true };
  } catch (error) {
    return asActionError(error);
  }
}
