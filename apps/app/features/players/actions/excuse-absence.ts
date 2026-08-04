"use server";

import { database } from "@repo/database";
import { civilDateToUtcMidnight } from "@repo/database/recoverable-streak";
import {
  findActiveSeasonIdForTeam,
  recomputeAndPersistPlayerStreak,
} from "@repo/database/recompute-player-streak";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

type ActionResult = {
  success: boolean;
  error?: string;
};

const excuseSchema = z.object({
  playerId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).optional(),
});

export async function markExcusedAbsence(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado." };
    }

    const parsed = excuseSchema.safeParse({
      playerId: formData.get("playerId"),
      date: formData.get("date"),
      reason: formData.get("reason") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
      };
    }

    const player = await database.player.findFirst({
      where: {
        id: parsed.data.playerId,
        teamId: staffContext.activeTeam.id,
        isArchived: false,
      },
      select: { id: true, teamId: true },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado." };
    }

    const entryDate = civilDateToUtcMidnight(parsed.data.date);
    const seasonId =
      staffContext.activeSeason?.id ??
      (await findActiveSeasonIdForTeam(player.teamId, entryDate));

    if (!seasonId) {
      return { success: false, error: "Temporada no encontrada." };
    }

    await database.excusedAbsence.upsert({
      where: {
        playerId_date: {
          playerId: player.id,
          date: entryDate,
        },
      },
      create: {
        playerId: player.id,
        seasonId,
        date: entryDate,
        reason: parsed.data.reason,
        createdByMembershipId: staffContext.membershipId,
      },
      update: {
        seasonId,
        reason: parsed.data.reason,
        createdByMembershipId: staffContext.membershipId,
      },
    });

    await recomputeAndPersistPlayerStreak({
      playerId: player.id,
      seasonId,
      asOfCivilDate: parsed.data.date,
    });

    revalidatePath(`/players/${player.id}`);
    revalidatePath("/players");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "No se pudo marcar la ausencia justificada.",
    };
  }
}

export async function unmarkExcusedAbsence(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado." };
    }

    const parsed = excuseSchema.pick({ playerId: true, date: true }).safeParse({
      playerId: formData.get("playerId"),
      date: formData.get("date"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
      };
    }

    const player = await database.player.findFirst({
      where: {
        id: parsed.data.playerId,
        teamId: staffContext.activeTeam.id,
      },
      select: { id: true, teamId: true },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado." };
    }

    const entryDate = civilDateToUtcMidnight(parsed.data.date);

    await database.excusedAbsence.deleteMany({
      where: {
        playerId: player.id,
        date: entryDate,
      },
    });

    const seasonId =
      staffContext.activeSeason?.id ??
      (await findActiveSeasonIdForTeam(player.teamId, entryDate));

    if (seasonId) {
      await recomputeAndPersistPlayerStreak({
        playerId: player.id,
        seasonId,
        asOfCivilDate: parsed.data.date,
      });
    }

    revalidatePath(`/players/${player.id}`);
    revalidatePath("/players");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "No se pudo quitar la ausencia justificada.",
    };
  }
}
