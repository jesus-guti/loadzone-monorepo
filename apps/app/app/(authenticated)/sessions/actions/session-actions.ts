"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

const createSessionSchema = z
  .object({
    title: z.string().min(2).max(100),
    type: z.enum(["TRAINING", "MATCH", "RECOVERY", "OTHER"]),
    visibility: z.enum(["TEAM_PRIVATE", "CLUB_SHARED"]),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    preReminderMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    postReminderMinutes: z.coerce.number().int().min(0).max(1440).optional(),
  })
  .refine(
    (data) => new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime(),
    {
      message: "La sesión debe terminar después de empezar.",
      path: ["endsAt"],
    }
  );

export async function createSession(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }

  const parsed = createSessionSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    visibility: formData.get("visibility"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    preReminderMinutes: formData.get("preReminderMinutes") || undefined,
    postReminderMinutes: formData.get("postReminderMinutes") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos");
  }

  await database.teamSession.create({
    data: {
      clubId: staffContext.club.id,
      teamId: staffContext.activeTeam.id,
      title: parsed.data.title,
      type: parsed.data.type,
      visibility: parsed.data.visibility,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      timezone: staffContext.activeTeam.timezone,
      preReminderMinutes:
        parsed.data.preReminderMinutes ??
        staffContext.activeTeam.preSessionReminderMinutes,
      postReminderMinutes:
        parsed.data.postReminderMinutes ??
        staffContext.activeTeam.postSessionReminderMinutes,
    },
  });

  revalidatePath("/sessions");
}

export async function cancelSession(sessionId: string): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }

  const teamSession = await database.teamSession.findFirst({
    where: {
      id: sessionId,
      teamId: staffContext.activeTeam.id,
    },
    select: { id: true },
  });

  if (!teamSession) {
    throw new Error("No tienes acceso a esta sesión.");
  }

  await database.teamSession.update({
    where: {
      id: teamSession.id,
    },
    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/sessions");
}
