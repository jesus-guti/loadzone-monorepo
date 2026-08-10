"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ACTIVE_SEASON_COOKIE_NAME,
  getCurrentStaffContext,
} from "@/lib/auth-context";

async function getTeamId(): Promise<string> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) throw new Error("Equipo no encontrado");
  return staffContext.activeTeam.id;
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

async function persistSeason(formData: FormData): Promise<string> {
  const parsed = createSeasonSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    preSeasonEnd: formData.get("preSeasonEnd") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos.");
  }

  const teamId = await getTeamId();

  const season = await database.season.create({
    data: {
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      preSeasonEnd: parsed.data.preSeasonEnd
        ? new Date(parsed.data.preSeasonEnd)
        : null,
      teamId,
    },
    select: { id: true },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_SEASON_COOKIE_NAME, season.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/wellness");
  revalidatePath("/");

  return season.id;
}

export async function createSeason(
  _prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await persistSeason(formData);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear temporada.";
    return { success: false, error: message };
  }

  redirect("/wellness");
}

export async function createSeasonFromShell(formData: FormData): Promise<void> {
  await persistSeason(formData);
  redirect("/wellness");
}

export async function deleteSeason(seasonId: string): Promise<void> {
  const teamId = await getTeamId();

  await database.season.delete({
    where: { id: seasonId, teamId },
  });

  revalidatePath("/seasons");
  revalidatePath("/");
}
