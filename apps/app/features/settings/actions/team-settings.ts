"use server";

import { ensureBaseFormTemplates, database } from "@repo/database";
import { buildObjectKey, uploadImage } from "@repo/storage";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ACTIVE_TEAM_COOKIE_NAME, getCurrentStaffContext } from "@/lib/auth-context";
import { parseWellnessLimits } from "@/lib/wellness-limits";

const settingsSchema = z.object({
  category: z.string().max(100).optional(),
  timezone: z.string().min(2).max(100),
  preSessionReminderMinutes: z.coerce.number().int().min(0).max(1440),
  postSessionReminderMinutes: z.coerce.number().int().min(0).max(1440),
  preFormTemplateId: z.string().optional(),
  postFormTemplateId: z.string().optional(),
  wellness_recovery: z.coerce.number().min(0).max(10).optional(),
  wellness_energy: z.coerce.number().min(1).max(5).optional(),
  wellness_soreness: z.coerce.number().min(1).max(5).optional(),
  wellness_sleepHours: z.coerce.number().min(0).max(24).optional(),
  wellness_sleepQuality: z.coerce.number().min(1).max(5).optional(),
});
const createTeamSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  category: z.string().max(100).optional(),
  timezone: z.string().min(2).max(100),
});

type ClubBrandingResult = {
  success: boolean;
  error?: string;
  logoUrl?: string | null;
};

export async function updateTeamSettings(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }
  const activeTeamId = staffContext.activeTeam.id;

  await ensureBaseFormTemplates();

  const parsed = settingsSchema.safeParse({
    category: formData.get("category") || undefined,
    timezone: formData.get("timezone"),
    preSessionReminderMinutes: formData.get("preSessionReminderMinutes"),
    postSessionReminderMinutes: formData.get("postSessionReminderMinutes"),
    preFormTemplateId: formData.get("preFormTemplateId") || undefined,
    postFormTemplateId: formData.get("postFormTemplateId") || undefined,
    wellness_recovery: formData.get("wellness_recovery") || undefined,
    wellness_energy: formData.get("wellness_energy") || undefined,
    wellness_soreness: formData.get("wellness_soreness") || undefined,
    wellness_sleepHours: formData.get("wellness_sleepHours") || undefined,
    wellness_sleepQuality: formData.get("wellness_sleepQuality") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos");
  }

  await database.$transaction(async (transaction) => {
    await transaction.team.update({
      where: { id: activeTeamId },
      data: {
        category:
          parsed.data.category && parsed.data.category.length > 0
            ? parsed.data.category
            : null,
        timezone: parsed.data.timezone,
        preSessionReminderMinutes: parsed.data.preSessionReminderMinutes,
        postSessionReminderMinutes: parsed.data.postSessionReminderMinutes,
        wellnessLimits: parseWellnessLimits({
          recovery: parsed.data.wellness_recovery ?? null,
          energy: parsed.data.wellness_energy ?? null,
          soreness: parsed.data.wellness_soreness ?? null,
          sleepHours: parsed.data.wellness_sleepHours ?? null,
          sleepQuality: parsed.data.wellness_sleepQuality ?? null,
        }),
      },
    });

    await transaction.formAssignment.deleteMany({
      where: {
        teamId: activeTeamId,
        teamSessionId: null,
      },
    });

    const assignments = [
      parsed.data.preFormTemplateId
        ? {
            teamId: activeTeamId,
            templateId: parsed.data.preFormTemplateId,
            fillMoment: "PRE_SESSION" as const,
          }
        : null,
      parsed.data.postFormTemplateId
        ? {
            teamId: activeTeamId,
            templateId: parsed.data.postFormTemplateId,
            fillMoment: "POST_SESSION" as const,
          }
        : null,
    ].filter((assignment) => assignment !== null);

    if (assignments.length > 0) {
      await transaction.formAssignment.createMany({
        data: assignments,
      });
    }
  });

  revalidatePath("/settings");
  revalidatePath("/");
  redirect("/settings");
}

export async function createTeamFromSettings(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.canCreateTeam) {
    throw new Error("No tienes permisos para crear equipos.");
  }
  const clubId = staffContext.club.id;

  await ensureBaseFormTemplates();

  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos");
  }

  const [existingTeams, preTemplate, postTemplate] = await Promise.all([
    database.team.findMany({
      where: {
        clubId,
      },
      select: {
        name: true,
      },
    }),
    database.formTemplate.findUnique({
      where: { code: "system-wellness-pre" },
      select: { id: true },
    }),
    database.formTemplate.findUnique({
      where: { code: "system-rpe-post" },
      select: { id: true },
    }),
  ]);
  const trimmedName = parsed.data.name.trim();
  const existingNames = new Set(
    existingTeams.map((team) => team.name.trim().toLocaleLowerCase("es"))
  );
  let teamName = trimmedName;
  let suffix = 2;

  while (existingNames.has(teamName.toLocaleLowerCase("es"))) {
    teamName = `${trimmedName} ${suffix}`;
    suffix += 1;
  }

  const defaultAssignments: Array<{
    fillMoment: "PRE_SESSION" | "POST_SESSION";
    templateId: string;
  }> = [];

  if (preTemplate) {
    defaultAssignments.push({
      templateId: preTemplate.id,
      fillMoment: "PRE_SESSION",
    });
  }

  if (postTemplate) {
    defaultAssignments.push({
      templateId: postTemplate.id,
      fillMoment: "POST_SESSION",
    });
  }

  const createdTeam = await database.team.create({
    data: {
      clubId,
      name: teamName,
      category:
        parsed.data.category && parsed.data.category.length > 0
          ? parsed.data.category
          : null,
      timezone: parsed.data.timezone,
      preSessionReminderMinutes: 120,
      postSessionReminderMinutes: 30,
      forms: {
        create: defaultAssignments,
      },
    },
    select: { id: true },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TEAM_COOKIE_NAME, createdTeam.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/settings");
  revalidatePath("/");
  redirect("/settings");
}

export async function updateClubBranding(
  formData: FormData
): Promise<ClubBrandingResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext || !staffContext.canCreateTeam) {
      return { success: false, error: "No tienes permisos para editar el club." };
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Selecciona una imagen válida." };
    }

    const currentClub = await database.club.findUnique({
      where: { id: staffContext.club.id },
      select: {
        id: true,
        logoUrl: true,
      },
    });

    if (!currentClub) {
      return { success: false, error: "Club no encontrado." };
    }

    const imageUpload = await uploadImage({
      file,
      objectKey: buildObjectKey({
        target: "club",
        entityId: currentClub.id,
        fileName: file.name || `${staffContext.club.name}.webp`,
      }),
      previousUrl: currentClub.logoUrl,
    });

    await database.club.update({
      where: { id: currentClub.id },
      data: {
        logoUrl: imageUpload.pathname,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/");

    return {
      success: true,
      logoUrl: imageUpload.url,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "No se pudo actualizar el logo del club.",
    };
  }
}
