"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACTIVE_SEASON_COOKIE_NAME,
  getCurrentStaffContext,
} from "@/lib/auth-context";
import { createSeasonSchema } from "../lib/create-season-schema";
import { parseCivilDate } from "../lib/season-cycle";

async function getTeamId(): Promise<string> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }
  return staffContext.activeTeam.id;
}

async function persistSeason(formData: FormData): Promise<string> {
  const parsed = createSeasonSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    preSeasonEnd: formData.get("preSeasonEnd"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos.");
  }

  const teamId = await getTeamId();
  const startDate = parseCivilDate(parsed.data.startDate);
  const endDate = parseCivilDate(parsed.data.endDate);
  const preSeasonEnd = parseCivilDate(parsed.data.preSeasonEnd);
  if (!startDate) {
    throw new Error("Fechas no válidas.");
  }
  if (!endDate) {
    throw new Error("Fechas no válidas.");
  }
  if (!preSeasonEnd) {
    throw new Error("Fechas no válidas.");
  }

  const season = await database.season.create({
    data: {
      name: parsed.data.name,
      startDate,
      endDate,
      preSeasonEnd,
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
