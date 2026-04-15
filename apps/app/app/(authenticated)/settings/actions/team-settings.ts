"use server";

import { ensureBaseFormTemplates, database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

const settingsSchema = z.object({
  category: z.string().max(100).optional(),
  timezone: z.string().min(2).max(100),
  preSessionReminderMinutes: z.coerce.number().int().min(0).max(1440),
  postSessionReminderMinutes: z.coerce.number().int().min(0).max(1440),
  preFormTemplateId: z.string().optional(),
  postFormTemplateId: z.string().optional(),
});

export async function updateTeamSettings(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.primaryTeam) {
    throw new Error("Equipo no encontrado");
  }

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
      where: { id: staffContext.primaryTeam!.id },
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
        teamId: staffContext.primaryTeam!.id,
        teamSessionId: null,
      },
    });

    const assignments = [
      parsed.data.preFormTemplateId
        ? {
            teamId: staffContext.primaryTeam!.id,
            templateId: parsed.data.preFormTemplateId,
            fillMoment: "PRE_SESSION" as const,
          }
        : null,
      parsed.data.postFormTemplateId
        ? {
            teamId: staffContext.primaryTeam!.id,
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
