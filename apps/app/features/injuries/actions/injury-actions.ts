"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStaffContext } from "@/lib/auth-context";

const updateInjurySchema = z.object({
  injuryId: z.string(),
  status: z.enum(["REPORTED", "UNDER_REVIEW", "RESOLVED"]),
  staffNotes: z.string().max(1000).optional(),
});

export async function updateInjury(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    throw new Error("Equipo no encontrado");
  }

  const parsed = updateInjurySchema.safeParse({
    injuryId: formData.get("injuryId"),
    status: formData.get("status"),
    staffNotes: formData.get("staffNotes") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos no válidos");
  }

  const injury = await database.injuryReport.findFirst({
    where: {
      id: parsed.data.injuryId,
      teamId: staffContext.activeTeam.id,
    },
    select: { id: true },
  });

  if (!injury) {
    throw new Error("No tienes acceso a esta lesión.");
  }

  await database.injuryReport.update({
    where: {
      id: injury.id,
    },
    data: {
      status: parsed.data.status,
      staffNotes:
        parsed.data.staffNotes && parsed.data.staffNotes.length > 0
          ? parsed.data.staffNotes
          : null,
      reviewedAt:
        parsed.data.status !== "REPORTED" ? new Date() : null,
      resolvedAt:
        parsed.data.status === "RESOLVED" ? new Date() : null,
    },
  });

  revalidatePath("/injuries");
}
