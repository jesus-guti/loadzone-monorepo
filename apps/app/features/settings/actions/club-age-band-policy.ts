"use server";

import { database, Prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { parseAgeBandPolicyFromFormData } from "../lib/age-band-policy-form";

export async function updateClubAgeBandPolicy(formData: FormData): Promise<void> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext) {
    throw new Error("No tienes permisos para editar el club.");
  }
  if (!staffContext.canCreateTeam) {
    throw new Error("No tienes permisos para editar la política del club.");
  }

  const ageBandParsed = parseAgeBandPolicyFromFormData(formData);
  if (!ageBandParsed.success) {
    throw new Error(ageBandParsed.error);
  }

  await database.club.update({
    where: { id: staffContext.club.id },
    data: {
      ageBandPolicy: ageBandParsed.policy as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  redirect("/settings");
}
