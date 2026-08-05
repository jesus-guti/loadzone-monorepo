import type { Metadata } from "next";
import { database } from "@repo/database";
import { ensureBaseFormTemplates } from "@repo/database/bootstrap";
import { notFound } from "next/navigation";
import { WellnessSettingsForm } from "@/features/settings/components/wellness-settings-form";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Wellness | Configuración | LoadZone",
};

export default async function WellnessSettingsPage() {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  await ensureBaseFormTemplates();

  const [templates, assignments] = await Promise.all([
    database.formTemplate.findMany({
      where: {
        isActive: true,
        isSystem: true,
      },
      orderBy: [{ fillMoment: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        fillMoment: true,
      },
    }),
    database.formAssignment.findMany({
      where: {
        teamId: staffContext.activeTeam.id,
        teamSessionId: null,
        isActive: true,
      },
      select: {
        fillMoment: true,
        templateId: true,
      },
    }),
  ]);

  const selectedPreForm =
    assignments.find(
      (assignment: { fillMoment: string; templateId: string }) =>
        assignment.fillMoment === "PRE_SESSION"
    )?.templateId ?? "";
  const selectedPostForm =
    assignments.find(
      (assignment: { fillMoment: string; templateId: string }) =>
        assignment.fillMoment === "POST_SESSION"
    )?.templateId ?? "";

  const preTemplates = templates.filter(
    (template: { fillMoment: string }) => template.fillMoment === "PRE_SESSION"
  );
  const postTemplates = templates.filter(
    (template: { fillMoment: string }) => template.fillMoment === "POST_SESSION"
  );

  const limits = staffContext.activeTeam.wellnessLimits;

  return (
    <WellnessSettingsForm
      key={staffContext.activeTeam.id}
      teamId={staffContext.activeTeam.id}
      preTemplates={preTemplates}
      postTemplates={postTemplates}
      selectedPreForm={selectedPreForm}
      selectedPostForm={selectedPostForm}
      preSessionReminderMinutes={
        staffContext.activeTeam.preSessionReminderMinutes ?? 120
      }
      postSessionReminderMinutes={
        staffContext.activeTeam.postSessionReminderMinutes ?? 30
      }
      wellnessLimits={{
        soreness: limits?.soreness ?? null,
        recovery: limits?.recovery ?? null,
        energy: limits?.energy ?? null,
        sleepHours: limits?.sleepHours ?? null,
        sleepQuality: limits?.sleepQuality ?? null,
      }}
    />
  );
}
