"use server";

import { database } from "@repo/database";
import {
  findActiveSeasonIdForTeam,
  recomputeAndPersistPlayerStreak,
} from "@repo/database/recompute-player-streak";
import { syncPlayerStatusFromInjuries } from "@repo/database/injury-status";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

const updateInjurySchema = z.object({
  injuryId: z.string(),
  staffNotes: z.string().max(1000).optional(),
  /** Civil YYYY-MM-DD; empty clears (reopen). Full close/reopen UX = JES-51. */
  endDate: z.string().optional(),
});

/**
 * Interim staff triage until JES-51/52: notes + optional endDate close/reopen.
 * Drops REPORTED/UNDER_REVIEW/RESOLVED status machine.
 */
export async function updateInjury(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }

  const parsed = updateInjurySchema.safeParse({
    injuryId: formData.get("injuryId"),
    staffNotes: formData.get("staffNotes") || undefined,
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos");
  }

  const injury = await database.injury.findFirst({
    where: {
      id: parsed.data.injuryId,
      teamId: staffContext.activeTeam.id,
    },
    select: { id: true, playerId: true },
  });

  if (!injury) {
    throw new Error("No tienes acceso a esta lesión.");
  }

  const endDateRaw = parsed.data.endDate?.trim() ?? "";
  const endDate =
    endDateRaw.length === 0
      ? null
      : new Date(`${endDateRaw}T00:00:00.000Z`);

  await database.injury.update({
    where: {
      id: injury.id,
    },
    data: {
      staffNotes:
        parsed.data.staffNotes && parsed.data.staffNotes.length > 0
          ? parsed.data.staffNotes
          : null,
      endDate,
    },
  });

  await syncPlayerStatusFromInjuries(database, injury.playerId, {
    timeZone: staffContext.activeTeam.timezone,
  });

  const seasonId =
    staffContext.activeSeason?.id ??
    (await findActiveSeasonIdForTeam(
      staffContext.activeTeam.id,
      new Date()
    ));

  if (seasonId) {
    await recomputeAndPersistPlayerStreak({
      playerId: injury.playerId,
      seasonId,
    });
  }

  revalidatePath("/injuries");
  revalidatePath(`/players/${injury.playerId}`);
}
