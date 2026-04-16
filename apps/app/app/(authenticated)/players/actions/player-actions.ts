"use server";

import { database } from "@repo/database";
import type { PlayerStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

async function getTeamId(): Promise<string> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) throw new Error("Equipo no encontrado");
  return staffContext.activeTeam.id;
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
      return { success: false, error: parsed.error.issues[0]?.message };
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
      return { success: false, error: parsed.error.issues[0]?.message };
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
