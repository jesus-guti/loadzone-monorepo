"use server";

import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100),
});

export async function createTeam(
  _prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "No autorizado" };
  }

  const existing = await database.admin.findUnique({
    where: { clerkId: userId },
  });
  if (existing) {
    redirect("/");
  }

  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await database.team.create({
      data: {
        name: parsed.data.name,
        admins: {
          create: { clerkId: userId },
        },
      },
    });
  } catch {
    return { success: false, error: "Error al crear el equipo." };
  }

  redirect("/");
}
