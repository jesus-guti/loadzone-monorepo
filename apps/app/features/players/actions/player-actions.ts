"use server";

import { database } from "@repo/database";
import type { AgeBand, PlayerStatus } from "@repo/database";
import { ageBandOverrideSchema } from "@repo/database/age-band-policy";
import { buildObjectKey, uploadImage } from "@repo/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

type ActionResult = {
  success: boolean;
  error?: string;
};

type PhotoActionResult = ActionResult & {
  imageUrl?: string | null;
};

async function getTeamId(): Promise<string> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }
  return staffContext.activeTeam.id;
}

const optionalDateOfBirth = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value || value.trim().length === 0) {
      return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de nacimiento debe tener formato AAAA-MM-DD.",
      });
      return z.NEVER;
    }
    const date = new Date(`${value}T12:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de nacimiento no es válida.",
      });
      return z.NEVER;
    }
    return date;
  });

const optionalAgeBandOverride = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value || value.trim().length === 0 || value === "NONE") {
      return null;
    }
    const parsed = ageBandOverrideSchema.safeParse(value);
    if (!parsed.success) {
      ctx.addIssue({
        code: "custom",
        message: "El tramo de edad manual no es válido.",
      });
      return z.NEVER;
    }
    return parsed.data;
  });

const createPlayerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  dateOfBirth: optionalDateOfBirth,
  ageBandOverride: optionalAgeBandOverride,
});

export async function createPlayer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const parsed = createPlayerSchema.safeParse({
      name: formData.get("name"),
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      ageBandOverride: formData.get("ageBandOverride") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const teamId = await getTeamId();

    await database.player.create({
      data: {
        name: parsed.data.name,
        teamId,
        dateOfBirth: parsed.data.dateOfBirth,
        ageBandOverride: parsed.data.ageBandOverride as AgeBand | null,
      },
    });

    revalidatePath("/players");
  } catch {
    return { success: false, error: "No se pudo crear el jugador. Inténtalo de nuevo." };
  }

  redirect("/players");
}

const updatePlayerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  status: z.enum([
    "AVAILABLE",
    "MODIFIED_TRAINING",
    "INJURED",
    "ILL",
    "UNAVAILABLE",
  ]),
  dateOfBirth: optionalDateOfBirth,
  ageBandOverride: optionalAgeBandOverride,
});

export async function updatePlayer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const parsed = updatePlayerSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      status: formData.get("status"),
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      ageBandOverride: formData.get("ageBandOverride") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const teamId = await getTeamId();

    await database.player.update({
      where: { id: parsed.data.id, teamId },
      data: {
        name: parsed.data.name,
        status: parsed.data.status as PlayerStatus,
        dateOfBirth: parsed.data.dateOfBirth,
        ageBandOverride: parsed.data.ageBandOverride as AgeBand | null,
      },
    });

    revalidatePath("/players");
    revalidatePath(`/players/${parsed.data.id}`);
  } catch {
    return { success: false, error: "No se pudo guardar el jugador. Inténtalo de nuevo." };
  }

  redirect("/players");
}

export async function archivePlayer(playerId: string): Promise<void> {
  const teamId = await getTeamId();

  await database.player.update({
    where: { id: playerId, teamId },
    data: { isArchived: true },
  });

  revalidatePath("/players");
  revalidatePath("/");
}

export async function updatePlayerPhoto(
  formData: FormData
): Promise<PhotoActionResult> {
  try {
    const playerId = formData.get("playerId");
    const file = formData.get("file");

    if (typeof playerId !== "string" || playerId.length === 0) {
      return { success: false, error: "Jugador no válido." };
    }

    if (!(file instanceof File)) {
      return { success: false, error: "Selecciona una imagen válida." };
    }

    const teamId = await getTeamId();
    const player = await database.player.findUnique({
      where: { id: playerId, teamId },
      select: {
        id: true,
        imageUrl: true,
        name: true,
      },
    });

    if (!player) {
      return { success: false, error: "Jugador no encontrado." };
    }

    const imageUpload = await uploadImage({
      file,
      objectKey: buildObjectKey({
        target: "player",
        entityId: player.id,
        fileName: file.name || `${player.name}.webp`,
        teamId,
      }),
      previousUrl: player.imageUrl,
    });

    await database.player.update({
      where: { id: player.id, teamId },
      data: {
        imageUrl: imageUpload.url,
      },
    });

    revalidatePath("/players");
    revalidatePath(`/players/${player.id}`);
    revalidatePath("/wellness");

    return {
      success: true,
      imageUrl: imageUpload.url,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "No se pudo subir la foto del jugador.",
    };
  }
}
