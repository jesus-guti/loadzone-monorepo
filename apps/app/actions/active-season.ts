"use server";

import { cookies } from "next/headers";
import {
  ACTIVE_SEASON_COOKIE_NAME,
  getCurrentStaffContext,
} from "@/lib/auth-context";

export async function setActiveSeason(seasonId: string): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext) {
    throw new Error("No autorizado.");
  }

  const allowedSeason = staffContext.activeTeamSeasons.find(
    (season) => season.id === seasonId
  );
  if (!allowedSeason) {
    throw new Error("No tienes acceso a esa temporada.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_SEASON_COOKIE_NAME, seasonId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
