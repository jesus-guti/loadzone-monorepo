"use server";

import { database } from "@repo/database";
import {
  BODY_REGION_IDS,
  type BodyRegionCatalogId,
} from "@repo/database/body-region-catalog";
import { syncPlayerStatusFromInjuries } from "@repo/database/injury-status";
import {
  civilDateToUtcMidnight,
  compareCivilDates,
} from "@repo/database/recoverable-streak";
import {
  findActiveSeasonIdForTeam,
  recomputeAndPersistPlayerStreak,
} from "@repo/database/recompute-player-streak";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

export type InjuryActionResult = {
  success: boolean;
  error?: string;
  injuryId?: string;
};

const CIVIL_DATE = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida");

const bodyRegionIdSchema = z.enum(
  BODY_REGION_IDS as unknown as [
    BodyRegionCatalogId,
    ...BodyRegionCatalogId[],
  ]
);

const regionIdsSchema = z
  .array(bodyRegionIdSchema)
  .min(1, "Selecciona al menos una zona");

const createInjurySchema = z.object({
  playerId: z.string().min(1),
  startDate: CIVIL_DATE,
  cause: z.string().trim().min(1, "La causa es obligatoria").max(500),
  regionDetail: z.string().trim().max(1000).optional(),
  regionIds: regionIdsSchema,
});

const updateInjurySchema = z.object({
  injuryId: z.string().min(1),
  startDate: CIVIL_DATE,
  cause: z.string().trim().min(1, "La causa es obligatoria").max(500),
  regionDetail: z.string().trim().max(1000).optional(),
  regionIds: regionIdsSchema,
});

const closeInjurySchema = z.object({
  injuryId: z.string().min(1),
  endDate: CIVIL_DATE,
});

const reopenInjurySchema = z.object({
  injuryId: z.string().min(1),
});

/** Interim team `/injuries` triage until JES-52. */
const triageInjurySchema = z.object({
  injuryId: z.string(),
  staffNotes: z.string().max(1000).optional(),
  endDate: z.string().optional(),
});

function parseRegionIds(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function optionalDetail(
  value: string | undefined
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function recomputeStreakAfterInjury(
  playerId: string,
  teamId: string,
  timeZone: string,
  seasonId: string | null | undefined
): Promise<void> {
  const resolvedSeasonId =
    seasonId ?? (await findActiveSeasonIdForTeam(teamId, new Date()));
  if (!resolvedSeasonId) {
    return;
  }
  await recomputeAndPersistPlayerStreak({
    playerId,
    seasonId: resolvedSeasonId,
  });
  void timeZone;
}

function revalidateInjuryPaths(playerId: string): void {
  revalidatePath(`/players/${playerId}`);
  revalidatePath(`/players/${playerId}/edit`);
  revalidatePath("/injuries");
  revalidatePath("/players");
}

/**
 * Create a staff Injury with ≥1 BodyRegion. Derives Lesionado via JES-50 helpers.
 */
export async function createInjury(
  _prev: InjuryActionResult,
  formData: FormData
): Promise<InjuryActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado." };
    }

    const parsed = createInjurySchema.safeParse({
      playerId: formData.get("playerId"),
      startDate: formData.get("startDate"),
      cause: formData.get("cause"),
      regionDetail: formData.get("regionDetail") || undefined,
      regionIds: parseRegionIds(formData.get("regionIds")),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
      };
    }

    const teamId = staffContext.activeTeam.id;
    const timeZone = staffContext.activeTeam.timezone || "Europe/Madrid";

    const player = await database.player.findFirst({
      where: {
        id: parsed.data.playerId,
        teamId,
        isArchived: false,
      },
      select: { id: true },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado." };
    }

    const injury = await database.injury.create({
      data: {
        playerId: player.id,
        teamId,
        startDate: civilDateToUtcMidnight(parsed.data.startDate),
        cause: parsed.data.cause,
        regionDetail: optionalDetail(parsed.data.regionDetail) ?? null,
        createdByUserId: staffContext.user.id,
        regions: {
          create: parsed.data.regionIds.map((regionId) => ({ regionId })),
        },
      },
      select: { id: true },
    });

    await syncPlayerStatusFromInjuries(database, player.id, { timeZone });
    await recomputeStreakAfterInjury(
      player.id,
      teamId,
      timeZone,
      staffContext.activeSeason?.id
    );
    revalidateInjuryPaths(player.id);

    return { success: true, injuryId: injury.id };
  } catch {
    return { success: false, error: "No se pudo guardar la lesión." };
  }
}

/**
 * Update Injury fields/regions. Closed episodes keep endDate (use reopenInjury).
 */
export async function updateInjury(
  _prev: InjuryActionResult,
  formData: FormData
): Promise<InjuryActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado." };
    }

    const parsed = updateInjurySchema.safeParse({
      injuryId: formData.get("injuryId"),
      startDate: formData.get("startDate"),
      cause: formData.get("cause"),
      regionDetail: formData.get("regionDetail") || undefined,
      regionIds: parseRegionIds(formData.get("regionIds")),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
      };
    }

    const teamId = staffContext.activeTeam.id;
    const timeZone = staffContext.activeTeam.timezone || "Europe/Madrid";

    const existing = await database.injury.findFirst({
      where: { id: parsed.data.injuryId, teamId },
      select: { id: true, playerId: true, endDate: true },
    });

    if (!existing) {
      return { success: false, error: "No tienes acceso a esta lesión." };
    }

    if (existing.endDate) {
      const endYmd = existing.endDate.toISOString().slice(0, 10);
      if (compareCivilDates(parsed.data.startDate, endYmd) > 0) {
        return {
          success: false,
          error: "La fecha de inicio no puede ser posterior a la fecha de fin.",
        };
      }
    }

    await database.$transaction([
      database.injuryBodyRegion.deleteMany({
        where: { injuryId: existing.id },
      }),
      database.injuryBodyRegion.createMany({
        data: parsed.data.regionIds.map((regionId) => ({
          injuryId: existing.id,
          regionId,
        })),
      }),
      database.injury.update({
        where: { id: existing.id },
        data: {
          startDate: civilDateToUtcMidnight(parsed.data.startDate),
          cause: parsed.data.cause,
          regionDetail: optionalDetail(parsed.data.regionDetail) ?? null,
        },
      }),
    ]);

    await syncPlayerStatusFromInjuries(database, existing.playerId, {
      timeZone,
    });
    await recomputeStreakAfterInjury(
      existing.playerId,
      teamId,
      timeZone,
      staffContext.activeSeason?.id
    );
    revalidateInjuryPaths(existing.playerId);

    return { success: true, injuryId: existing.id };
  } catch {
    return { success: false, error: "No se pudo actualizar la lesión." };
  }
}

/**
 * Dar de alta — sets inclusive endDate; last close may clear Lesionado.
 */
export async function closeInjury(
  _prev: InjuryActionResult,
  formData: FormData
): Promise<InjuryActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado." };
    }

    const parsed = closeInjurySchema.safeParse({
      injuryId: formData.get("injuryId"),
      endDate: formData.get("endDate"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
      };
    }

    const teamId = staffContext.activeTeam.id;
    const timeZone = staffContext.activeTeam.timezone || "Europe/Madrid";

    const existing = await database.injury.findFirst({
      where: { id: parsed.data.injuryId, teamId },
      select: { id: true, playerId: true, startDate: true },
    });

    if (!existing) {
      return { success: false, error: "No tienes acceso a esta lesión." };
    }

    const startYmd = existing.startDate.toISOString().slice(0, 10);
    if (compareCivilDates(parsed.data.endDate, startYmd) < 0) {
      return {
        success: false,
        error: "La fecha de fin no puede ser anterior a la de inicio.",
      };
    }

    await database.injury.update({
      where: { id: existing.id },
      data: { endDate: civilDateToUtcMidnight(parsed.data.endDate) },
    });

    await syncPlayerStatusFromInjuries(database, existing.playerId, {
      timeZone,
    });
    await recomputeStreakAfterInjury(
      existing.playerId,
      teamId,
      timeZone,
      staffContext.activeSeason?.id
    );
    revalidateInjuryPaths(existing.playerId);

    return { success: true, injuryId: existing.id };
  } catch {
    return { success: false, error: "No se pudo dar de alta la lesión." };
  }
}

/**
 * Reabrir — clears endDate; recalculates status.
 */
export async function reopenInjury(
  _prev: InjuryActionResult,
  formData: FormData
): Promise<InjuryActionResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext?.activeTeam) {
      return { success: false, error: "Equipo no encontrado." };
    }

    const parsed = reopenInjurySchema.safeParse({
      injuryId: formData.get("injuryId"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
      };
    }

    const teamId = staffContext.activeTeam.id;
    const timeZone = staffContext.activeTeam.timezone || "Europe/Madrid";

    const existing = await database.injury.findFirst({
      where: { id: parsed.data.injuryId, teamId },
      select: { id: true, playerId: true },
    });

    if (!existing) {
      return { success: false, error: "No tienes acceso a esta lesión." };
    }

    await database.injury.update({
      where: { id: existing.id },
      data: { endDate: null },
    });

    await syncPlayerStatusFromInjuries(database, existing.playerId, {
      timeZone,
    });
    await recomputeStreakAfterInjury(
      existing.playerId,
      teamId,
      timeZone,
      staffContext.activeSeason?.id
    );
    revalidateInjuryPaths(existing.playerId);

    return { success: true, injuryId: existing.id };
  } catch {
    return { success: false, error: "No se pudo reabrir la lesión." };
  }
}

/**
 * Interim staff triage on `/injuries` until JES-52 (notes + optional endDate).
 */
export async function updateInjuryTriage(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }

  const parsed = triageInjurySchema.safeParse({
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
      : civilDateToUtcMidnight(endDateRaw);

  await database.injury.update({
    where: { id: injury.id },
    data: {
      staffNotes:
        parsed.data.staffNotes && parsed.data.staffNotes.length > 0
          ? parsed.data.staffNotes
          : null,
      endDate,
    },
  });

  await syncPlayerStatusFromInjuries(database, injury.playerId, {
    timeZone: staffContext.activeTeam.timezone || "Europe/Madrid",
  });

  await recomputeStreakAfterInjury(
    injury.playerId,
    staffContext.activeTeam.id,
    staffContext.activeTeam.timezone || "Europe/Madrid",
    staffContext.activeSeason?.id
  );

  revalidateInjuryPaths(injury.playerId);
}
