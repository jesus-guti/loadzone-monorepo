"use server";

import { database } from "@repo/database";
import { z } from "zod";

const injurySchema = z.object({
  token: z.string(),
  title: z.string().min(2).max(100),
  bodyPart: z.string().max(100).optional(),
  severity: z.enum(["UNKNOWN", "MINOR", "MODERATE", "MAJOR"]),
  description: z.string().max(1000).optional(),
});

type InjuryActionResult = {
  success: boolean;
  error?: string;
};

export async function saveInjuryReport(
  _prev: InjuryActionResult,
  formData: FormData
): Promise<InjuryActionResult> {
  try {
    const parsed = injurySchema.safeParse({
      token: formData.get("token"),
      title: formData.get("title"),
      bodyPart: formData.get("bodyPart") || undefined,
      severity: formData.get("severity"),
      description: formData.get("description") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: "Datos no válidos." };
    }

    const player = await database.player.findUnique({
      where: { token: parsed.data.token, isArchived: false },
      select: {
        id: true,
        teamId: true,
      },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado." };
    }

    await database.injuryReport.create({
      data: {
        playerId: player.id,
        teamId: player.teamId,
        title: parsed.data.title,
        bodyPart:
          parsed.data.bodyPart && parsed.data.bodyPart.length > 0
            ? parsed.data.bodyPart
            : null,
        severity: parsed.data.severity,
        description:
          parsed.data.description && parsed.data.description.length > 0
            ? parsed.data.description
            : null,
        reportedByPlayer: true,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "No se pudo guardar la lesión." };
  }
}
