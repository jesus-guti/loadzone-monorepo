"use server";

import { database, Prisma } from "@repo/database";
import { ensureBaseFormTemplates } from "@repo/database/bootstrap";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { parseWellnessLimits } from "@/lib/wellness-limits";
import { parseAgeBandPolicyFromFormData } from "../lib/age-band-policy-form";
import { parseReminderConsentPolicyFromFormData } from "../lib/reminder-consent-policy-form";

export type SettingsFieldResult = {
  success: boolean;
  error?: string;
};

function ok(): SettingsFieldResult {
  return { success: true };
}

function fail(error: string): SettingsFieldResult {
  return { success: false, error };
}

async function requireActiveTeam() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    return null;
  }
  return {
    ...staffContext,
    activeTeam: staffContext.activeTeam,
  };
}

function revalidateEquipo(): void {
  revalidatePath("/settings/equipo");
  revalidatePath("/settings");
  revalidatePath("/");
}

function revalidateWellness(): void {
  revalidatePath("/settings/wellness");
  revalidatePath("/settings");
  revalidatePath("/");
}

function revalidatePoliticas(): void {
  revalidatePath("/settings/politicas");
  revalidatePath("/settings");
  revalidatePath("/");
}

function revalidateClub(): void {
  revalidatePath("/settings/club");
  revalidatePath("/settings");
  revalidatePath("/");
}

const categorySchema = z.string().max(100);
const timezoneSchema = z.string().min(2).max(100);
const reminderMinutesSchema = z.coerce.number().int().min(0).max(1440);
const optionalTemplateIdSchema = z.string().optional();

export async function updateTeamCategory(
  category: string
): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }
    const parsed = categorySchema.safeParse(category);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Categoría no válida");
    }
    await database.team.update({
      where: { id: staffContext.activeTeam.id },
      data: {
        category: parsed.data.length > 0 ? parsed.data : null,
      },
    });
    revalidateEquipo();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "No se pudo guardar la categoría."
    );
  }
}

export async function updateTeamTimezone(
  timezone: string
): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }
    const parsed = timezoneSchema.safeParse(timezone);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Zona horaria no válida");
    }
    await database.team.update({
      where: { id: staffContext.activeTeam.id },
      data: { timezone: parsed.data },
    });
    revalidateEquipo();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar la zona horaria."
    );
  }
}

export async function updateTeamReminderMinutes(input: {
  field: "preSessionReminderMinutes" | "postSessionReminderMinutes";
  value: number;
}): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }
    const parsed = reminderMinutesSchema.safeParse(input.value);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Minutos no válidos");
    }
    await database.team.update({
      where: { id: staffContext.activeTeam.id },
      data: { [input.field]: parsed.data },
    });
    revalidateWellness();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar el recordatorio."
    );
  }
}

export async function updateTeamFormAssignment(input: {
  fillMoment: "PRE_SESSION" | "POST_SESSION";
  templateId: string;
}): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }
    await ensureBaseFormTemplates();
    const teamId = staffContext.activeTeam.id;
    const parsed = optionalTemplateIdSchema.safeParse(
      input.templateId || undefined
    );
    if (!parsed.success) {
      return fail("Plantilla no válida");
    }

    await database.$transaction(async (transaction) => {
      await transaction.formAssignment.deleteMany({
        where: {
          teamId,
          teamSessionId: null,
          fillMoment: input.fillMoment,
        },
      });
      if (parsed.data) {
        await transaction.formAssignment.create({
          data: {
            teamId,
            templateId: parsed.data,
            fillMoment: input.fillMoment,
          },
        });
      }
    });
    revalidateWellness();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar el formulario."
    );
  }
}

const wellnessMetricSchema = z.enum([
  "soreness",
  "recovery",
  "energy",
  "sleepHours",
  "sleepQuality",
]);

export async function updateTeamWellnessLimit(input: {
  metric: z.infer<typeof wellnessMetricSchema>;
  value: string;
}): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }
    const metricParsed = wellnessMetricSchema.safeParse(input.metric);
    if (!metricParsed.success) {
      return fail("Métrica no válida");
    }

    const current = staffContext.activeTeam.wellnessLimits ?? {
      recovery: null,
      energy: null,
      soreness: null,
      sleepHours: null,
      sleepQuality: null,
    };

    const rawNumber =
      input.value.trim() === "" ? null : Number(input.value.trim());
    if (rawNumber !== null && !Number.isFinite(rawNumber)) {
      return fail("Umbral no válido");
    }

    const nextLimits = {
      recovery: current.recovery,
      energy: current.energy,
      soreness: current.soreness,
      sleepHours: current.sleepHours,
      sleepQuality: current.sleepQuality,
      [metricParsed.data]: rawNumber,
    };

    const wellnessLimitsPayload = parseWellnessLimits(nextLimits);
    if (wellnessLimitsPayload === null) {
      return fail("Límites de wellness no válidos");
    }

    await database.team.update({
      where: { id: staffContext.activeTeam.id },
      data: {
        wellnessLimits: wellnessLimitsPayload as Prisma.InputJsonValue,
      },
    });
    revalidateWellness();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar el umbral."
    );
  }
}

export async function updateTeamAgeBandInherit(
  useClubDefaults: boolean
): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }

    if (useClubDefaults) {
      await database.team.update({
        where: { id: staffContext.activeTeam.id },
        data: { ageBandPolicy: Prisma.DbNull },
      });
    } else {
      await database.team.update({
        where: { id: staffContext.activeTeam.id },
        data: {
          ageBandPolicy: staffContext.activeTeam
            .ageBandPolicy as Prisma.InputJsonValue,
        },
      });
    }
    revalidatePoliticas();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar la herencia de política."
    );
  }
}

export async function updateTeamAgeBandPolicyFromForm(
  formData: FormData
): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }

    const useClubDefaults =
      formData.get("age_useClubDefaults") === "on" ||
      formData.get("age_useClubDefaults") === "true" ||
      formData.get("age_useClubDefaults") === "1";

    if (useClubDefaults) {
      await database.team.update({
        where: { id: staffContext.activeTeam.id },
        data: { ageBandPolicy: Prisma.DbNull },
      });
      revalidatePoliticas();
      return ok();
    }

    const ageBandParsed = parseAgeBandPolicyFromFormData(formData);
    if (!ageBandParsed.success) {
      return fail(ageBandParsed.error);
    }

    await database.team.update({
      where: { id: staffContext.activeTeam.id },
      data: {
        ageBandPolicy: ageBandParsed.policy as Prisma.InputJsonValue,
      },
    });
    revalidatePoliticas();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar la política de edad."
    );
  }
}

export async function updateTeamReminderConsentFromForm(
  formData: FormData
): Promise<SettingsFieldResult> {
  try {
    const staffContext = await requireActiveTeam();
    if (!staffContext) {
      return fail("Equipo no encontrado");
    }

    const reminderConsentParsed =
      parseReminderConsentPolicyFromFormData(formData);
    if (!reminderConsentParsed.success) {
      return fail(reminderConsentParsed.error);
    }

    await database.team.update({
      where: { id: staffContext.activeTeam.id },
      data: {
        reminderConsentPolicy:
          reminderConsentParsed.policy as Prisma.InputJsonValue,
      },
    });
    revalidatePoliticas();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar el consentimiento de recordatorios."
    );
  }
}

export async function updateClubAgeBandPolicyField(
  formData: FormData
): Promise<SettingsFieldResult> {
  try {
    const staffContext = await getCurrentStaffContext();
    if (!staffContext) {
      return fail("No tienes permisos para editar el club.");
    }
    if (!staffContext.canCreateTeam) {
      return fail("No tienes permisos para editar la política del club.");
    }

    const ageBandParsed = parseAgeBandPolicyFromFormData(formData);
    if (!ageBandParsed.success) {
      return fail(ageBandParsed.error);
    }

    await database.club.update({
      where: { id: staffContext.club.id },
      data: {
        ageBandPolicy: ageBandParsed.policy as Prisma.InputJsonValue,
      },
    });
    revalidateClub();
    return ok();
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo guardar la política del club."
    );
  }
}
