import type { Metadata } from "next";
import { ensureBaseFormTemplates, database } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../components/header";
import { updateTeamSettings } from "./actions/team-settings";

export const metadata: Metadata = {
  title: "Configuración | LoadZone",
};

const SettingsPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.primaryTeam) {
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
        teamId: staffContext.primaryTeam.id,
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
    assignments.find((assignment) => assignment.fillMoment === "PRE_SESSION")
      ?.templateId ?? "";
  const selectedPostForm =
    assignments.find((assignment) => assignment.fillMoment === "POST_SESSION")
      ?.templateId ?? "";

  const preTemplates = templates.filter(
    (template) => template.fillMoment === "PRE_SESSION"
  );
  const postTemplates = templates.filter(
    (template) => template.fillMoment === "POST_SESSION"
  );

  return (
    <>
      <Header page="Configuración" pages={["LoadZone"]} />
      <div className="mx-auto max-w-3xl p-4 pt-0">
        <form action={updateTeamSettings} className="space-y-6 rounded-xl border p-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Equipo activo
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Configura la operación base de {staffContext.primaryTeam.name} dentro
              de {staffContext.club.name}.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                name="category"
                defaultValue={staffContext.primaryTeam.category ?? ""}
                placeholder="Ej: Juvenil, Senior, Cadete"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={staffContext.primaryTeam.timezone}
                placeholder="Europe/Madrid"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preSessionReminderMinutes">
                Recordatorio pre-sesión (min)
              </Label>
              <Input
                id="preSessionReminderMinutes"
                name="preSessionReminderMinutes"
                type="number"
                min="0"
                max="1440"
                defaultValue={String(
                  staffContext.primaryTeam.preSessionReminderMinutes ?? 120
                )}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postSessionReminderMinutes">
                Recordatorio post-sesión (min)
              </Label>
              <Input
                id="postSessionReminderMinutes"
                name="postSessionReminderMinutes"
                type="number"
                min="0"
                max="1440"
                defaultValue={String(
                  staffContext.primaryTeam.postSessionReminderMinutes ?? 30
                )}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preFormTemplateId">Formulario pre-sesión</Label>
              <select
                id="preFormTemplateId"
                name="preFormTemplateId"
                defaultValue={selectedPreForm}
                className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary"
              >
                <option value="">Sin asignar</option>
                {preTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postFormTemplateId">Formulario post-sesión</Label>
              <select
                id="postFormTemplateId"
                name="postFormTemplateId"
                defaultValue={selectedPostForm}
                className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary"
              >
                <option value="">Sin asignar</option>
                {postTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit">Guardar configuración</Button>
        </form>
      </div>
    </>
  );
};

export default SettingsPage;
