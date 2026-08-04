"use server";

import { database } from "@repo/database";
import {
  findActiveSeasonIdForTeam,
  recomputeAndPersistPlayerStreak,
} from "@repo/database/recompute-player-streak";
import { syncPlayerStatusFromInjuries } from "@repo/database/injury-status";
import {
  createStaffInjury,
  parseBodyRegionIds,
} from "@repo/database/create-injury";
import { promotePainAlertToInjury } from "@repo/database/promote-pain-alert";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

const updateInjurySchema = z.object({
  injuryId: z.string(),
  staffNotes: z.string().max(1000).optional(),
  /** Civil YYYY-MM-DD; empty clears (reopen). Full close/reopen UX = JES-51. */
  endDate: z.string().optional(),
});

const createInjurySchema = z.object({
  playerId: z.string().min(1),
  cause: z.string().min(2).max(200),
  severity: z.enum(["UNKNOWN", "MINOR", "MODERATE", "MAJOR"]),
  startDate: z.string().optional(),
  staffNotes: z.string().max(1000).optional(),
  regionDetail: z.string().max(200).optional(),
});

const promotePainAlertSchema = z.object({
  painAlertId: z.string().min(1),
  startDate: z.string().optional(),
});

export type InjuryActionResult = {
  success: boolean;
  error?: string;
  injuryId?: string;
};

function collectRegionIds(formData: FormData): string[] {
  return formData
    .getAll("regionIds")
    .filter((value): value is string => typeof value === "string");
}

async function revalidateInjurySurfaces(playerId: string): Promise<void> {
  revalidatePath("/injuries");
  revalidatePath(`/players/${playerId}`);
}

async function recomputeStreakForPlayer(
  playerId: string,
  teamId: string,
  activeSeasonId: string | undefined
): Promise<void> {
  const seasonId =
    activeSeasonId ??
    (await findActiveSeasonIdForTeam(teamId, new Date()));

  if (seasonId) {
    await recomputeAndPersistPlayerStreak({
      playerId,
      seasonId,
    });
  }
}

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

  await recomputeStreakForPlayer(
    injury.playerId,
    staffContext.activeTeam.id,
    staffContext.activeSeason?.id
  );

  await revalidateInjurySurfaces(injury.playerId);
}

/**
 * Shared staff Injury create path (JES-54 / soft-dep for JES-51 Registrar lesión).
 * Does not emit Care Alerts (JES-47 HITL C).
 */
export async function createInjury(
  _prev: InjuryActionResult,
  formData: FormData
): Promise<InjuryActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado" };
    }

    const parsed = createInjurySchema.safeParse({
      playerId: formData.get("playerId"),
      cause: formData.get("cause"),
      severity: formData.get("severity") ?? "UNKNOWN",
      startDate: formData.get("startDate") || undefined,
      staffNotes: formData.get("staffNotes") || undefined,
      regionDetail: formData.get("regionDetail") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: "Datos no válidos." };
    }

    const regionIds = parseBodyRegionIds(collectRegionIds(formData));
    if (regionIds.length === 0) {
      return {
        success: false,
        error: "Selecciona al menos una zona corporal.",
      };
    }

    const player = await database.player.findFirst({
      where: {
        id: parsed.data.playerId,
        teamId: staffContext.activeTeam.id,
        isArchived: false,
      },
      select: { id: true },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado." };
    }

    // Care Alert: never on staff Injury create (JES-47 HITL C).
    const injury = await createStaffInjury(database, {
      playerId: player.id,
      teamId: staffContext.activeTeam.id,
      cause: parsed.data.cause,
      severity: parsed.data.severity,
      startDate: parsed.data.startDate,
      regionIds,
      regionDetail: parsed.data.regionDetail ?? null,
      staffNotes: parsed.data.staffNotes ?? null,
      createdByUserId: staffContext.user.id,
      timeZone: staffContext.activeTeam.timezone,
    });

    await recomputeStreakForPlayer(
      player.id,
      staffContext.activeTeam.id,
      staffContext.activeSeason?.id
    );

    await revalidateInjurySurfaces(player.id);

    return { success: true, injuryId: injury.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo registrar la lesión.";
    return { success: false, error: message };
  }
}

/**
 * Promote open Pain Alert → Injury via shared create path with prefill.
 * Staff must select ≥1 BodyRegion. Does not emit Care Alerts (JES-47 HITL C).
 */
export async function promotePainAlert(
  _prev: InjuryActionResult,
  formData: FormData
): Promise<InjuryActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado" };
    }

    const parsed = promotePainAlertSchema.safeParse({
      painAlertId: formData.get("painAlertId"),
      startDate: formData.get("startDate") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: "Datos no válidos." };
    }

    const regionIds = parseBodyRegionIds(collectRegionIds(formData));
    if (regionIds.length === 0) {
      return {
        success: false,
        error: "Selecciona al menos una zona corporal.",
      };
    }

    // Care Alert: never on promote / staff Injury (JES-47 HITL C).
    const result = await promotePainAlertToInjury(database, {
      painAlertId: parsed.data.painAlertId,
      teamId: staffContext.activeTeam.id,
      regionIds,
      startDate: parsed.data.startDate,
      createdByUserId: staffContext.user.id,
      timeZone: staffContext.activeTeam.timezone,
    });

    const alert = await database.painAlert.findUnique({
      where: { id: result.painAlertId },
      select: { playerId: true },
    });

    if (alert) {
      await recomputeStreakForPlayer(
        alert.playerId,
        staffContext.activeTeam.id,
        staffContext.activeSeason?.id
      );
      await revalidateInjurySurfaces(alert.playerId);
    } else {
      revalidatePath("/injuries");
    }

    return { success: true, injuryId: result.injuryId };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo promover el aviso a lesión.";
    return { success: false, error: message };
  }
}
