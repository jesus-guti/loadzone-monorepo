"use server";

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import type { PlayerStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function getTeamId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  const admin = await database.admin.findFirst({
    where: { clerkId: userId },
    select: { teamId: true },
  });

  if (!admin) throw new Error("Equipo no encontrado");
  return admin.teamId;
}

const createPlayerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
});

export async function createPlayer(
  _prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = createPlayerSchema.safeParse({
      name: formData.get("name"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const teamId = await getTeamId();

    await database.player.create({
      data: {
        name: parsed.data.name,
        teamId,
      },
    });

    revalidatePath("/players");
  } catch {
    return { success: false, error: "Error al crear jugador." };
  }

  redirect("/players");
}

const updatePlayerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  status: z.enum([
    "AVAILABLE",
    "MODIFIED_TRAINING",
    "INJURED",
    "ILL",
    "UNAVAILABLE",
  ]),
});

export async function updatePlayer(
  _prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = updatePlayerSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const teamId = await getTeamId();

    await database.player.update({
      where: { id: parsed.data.id, teamId },
      data: {
        name: parsed.data.name,
        status: parsed.data.status as PlayerStatus,
      },
    });

    revalidatePath("/players");
    revalidatePath(`/players/${parsed.data.id}`);
  } catch {
    return { success: false, error: "Error al actualizar jugador." };
  }

  redirect("/players");
}

export async function archivePlayer(playerId: string): Promise<void> {
  const teamId = await getTeamId();

  await database.player.update({
    where: { id: playerId, teamId },
    data: { isArchived: true },
  });

  revalidatePath("/players");
  revalidatePath("/");
}
