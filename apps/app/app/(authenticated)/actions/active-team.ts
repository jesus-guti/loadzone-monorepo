"use server";

import { cookies } from "next/headers";
import { ACTIVE_TEAM_COOKIE_NAME, getCurrentStaffContext } from "@/lib/auth-context";

export async function setActiveTeam(teamId: string): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext) {
    throw new Error("No autorizado.");
  }

  const allowedTeam = staffContext.teams.find((team) => team.id === teamId);
  if (!allowedTeam) {
    throw new Error("No tienes acceso a ese equipo.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TEAM_COOKIE_NAME, teamId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
