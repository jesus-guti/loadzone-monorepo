"use server";

import { cookies } from "next/headers";
import {
  ACTIVE_WELLNESS_DATE_COOKIE_NAME,
  getCurrentStaffContext,
} from "@/lib/auth-context";

function parseDateValue(dateValue: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

export async function setActiveWellnessDate(dateValue: string): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("No autorizado.");
  }

  const parsedDate = parseDateValue(dateValue);
  if (!parsedDate) {
    throw new Error("Fecha no válida.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WELLNESS_DATE_COOKIE_NAME, dateValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
