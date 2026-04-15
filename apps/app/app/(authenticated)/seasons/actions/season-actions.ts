"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

async function getTeamId(): Promise<string> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.primaryTeam) throw new Error("Equipo no encontrado");
  return staffContext.primaryTeam.id;
}

const createSeasonSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    startDate: z.string().min(1, "Fecha de inicio obligatoria"),
    endDate: z.string().min(1, "Fecha de fin obligatoria"),
    preSeasonEnd: z.string().optional(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "La fecha de inicio debe ser anterior a la de fin",
  });

export async function createSeason(
  _prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = createSeasonSchema.safeParse({
      name: formData.get("name"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      preSeasonEnd: formData.get("preSeasonEnd") || undefined,
    });

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "Datos no válidos.";
      return { success: false, error: firstError };
    }

    const teamId = await getTeamId();

    await database.season.create({
      data: {
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        preSeasonEnd: parsed.data.preSeasonEnd
          ? new Date(parsed.data.preSeasonEnd)
          : null,
        teamId,
      },
    });

    revalidatePath("/seasons");
    revalidatePath("/");
  } catch {
    return { success: false, error: "Error al crear temporada." };
  }

  redirect("/seasons");
}

export async function deleteSeason(seasonId: string): Promise<void> {
  const teamId = await getTeamId();

  await database.season.delete({
    where: { id: seasonId, teamId },
  });

  revalidatePath("/seasons");
  revalidatePath("/");
}
