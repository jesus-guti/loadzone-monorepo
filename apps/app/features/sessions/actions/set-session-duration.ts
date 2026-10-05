"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";
import {
  SESSION_DURATION_MAX,
  SESSION_DURATION_MIN,
} from "../session-duration";

const setSessionDurationSchema = z.object({
  sessionId: z.string().min(1),
  durationMinutes: z
    .number()
    .int()
    .min(SESSION_DURATION_MIN)
    .max(SESSION_DURATION_MAX),
});

export async function setSessionDuration(input: {
  sessionId: string;
  durationMinutes: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = setSessionDurationSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Los minutos no son válidos." };
    }

    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "No hay un equipo activo." };
    }

    const session = await database.teamSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        teamId: staffContext.activeTeam.id,
      },
      select: { id: true },
    });

    if (!session) {
      return { success: false, error: "Sesión no encontrada." };
    }

    await database.teamSession.update({
      where: { id: session.id },
      data: { durationMinutes: parsed.data.durationMinutes },
    });

    revalidatePath(`/sessions/${session.id}`);
    return { success: true };
  } catch {
    return { success: false, error: "No se pudieron guardar los minutos." };
  }
}
