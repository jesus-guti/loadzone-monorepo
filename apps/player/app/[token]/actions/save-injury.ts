"use server";

import { database } from "@repo/database";
import {
  evaluateAndEmitCareAlert,
  PLAYER_CARE_CONFIRM_MESSAGE,
} from "@repo/database/care-alerts";
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
  careConfirm?: boolean;
  careConfirmMessage?: string;
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
        name: true,
        teamId: true,
        dateOfBirth: true,
        ageBandOverride: true,
        team: {
          select: {
            timezone: true,
            ageBandPolicy: true,
            reminderConsentPolicy: true,
            club: {
              select: {
                ageBandPolicy: true,
              },
            },
          },
        },
      },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado." };
    }

    const bodyPart =
      parsed.data.bodyPart && parsed.data.bodyPart.length > 0
        ? parsed.data.bodyPart
        : null;

    const injury = await database.injuryReport.create({
      data: {
        playerId: player.id,
        teamId: player.teamId,
        title: parsed.data.title,
        bodyPart,
        severity: parsed.data.severity,
        description:
          parsed.data.description && parsed.data.description.length > 0
            ? parsed.data.description
            : null,
        reportedByPlayer: true,
      },
    });

    // Staff-authored Injury is intentionally not hooked (JES-47 HITL C).
    // Guardian slice: structured location only (JES-49) — never title/description/severity.
    const careResult = await evaluateAndEmitCareAlert({
      playerId: player.id,
      playerDisplayName: player.name,
      teamTimezone: player.team.timezone,
      teamAgeBandPolicy: player.team.ageBandPolicy,
      clubAgeBandPolicy: player.team.club.ageBandPolicy,
      reminderConsentPolicy: player.team.reminderConsentPolicy,
      dateOfBirth: player.dateOfBirth,
      ageBandOverride: player.ageBandOverride,
      signals: {
        painAlert: {
          bodyPart,
          side: injury.side,
          injuryType: injury.injuryType,
          reportedAt: injury.reportedAt,
        },
      },
      checkInCompleted: false,
    });

    return {
      success: true,
      careConfirm: careResult.careFlagPresent,
      careConfirmMessage: careResult.careFlagPresent
        ? PLAYER_CARE_CONFIRM_MESSAGE
        : undefined,
    };
  } catch {
    return { success: false, error: "No se pudo guardar la lesión." };
  }
}
