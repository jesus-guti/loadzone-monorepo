"use server";

import { ensureBaseFormTemplates, database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ACTIVE_TEAM_COOKIE_NAME, getCurrentStaffContext } from "@/lib/auth-context";

const settingsSchema = z.object({
  category: z.string().max(100).optional(),
  timezone: z.string().min(2).max(100),
  preSessionReminderMinutes: z.coerce.number().int().min(0).max(1440),
  postSessionReminderMinutes: z.coerce.number().int().min(0).max(1440),
  preFormTemplateId: z.string().optional(),
  postFormTemplateId: z.string().optional(),
});
const createTeamSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  category: z.string().max(100).optional(),
  timezone: z.string().min(2).max(100),
});

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
