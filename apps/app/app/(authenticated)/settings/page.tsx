import type { Metadata } from "next";
import { ensureBaseFormTemplates, database } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../components/header";
import { createTeamFromSettings, updateTeamSettings } from "./actions/team-settings";
import { ClubBrandingCard } from "./components/club-branding-card";

export const metadata: Metadata = {
  title: "Configuración | LoadZone",
};

type SettingsPageProperties = {
  searchParams?: Promise<{
    createTeam?: string;
  }>;
};

const SettingsPage = async ({ searchParams }: SettingsPageProperties) => {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
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
      <div className="mx-auto grid max-w-5xl gap-6 p-4 pt-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <form action={updateTeamSettings} className="space-y-6 rounded-xl border p-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Equipo activo
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Configura la operación base de {staffContext.activeTeam.name} dentro
              de {staffContext.club.name}.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                name="category"
                defaultValue={staffContext.activeTeam.category ?? ""}
                placeholder="Ej: Juvenil, Senior, Cadete"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={staffContext.activeTeam.timezone}
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
                  staffContext.activeTeam.preSessionReminderMinutes ?? 120
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
                  staffContext.activeTeam.postSessionReminderMinutes ?? 30
                )}
                required
              />
            </div>
          </div>

          <div id="wellness-forms" className="grid gap-4 scroll-mt-28 md:grid-cols-2">
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

          <div className="pt-6 border-t border-border-secondary">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Límites de alertas (Wellness)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wellness_recovery">Recuperación (alerta si es menor o igual a)</Label>
                <Input
                  id="wellness_recovery"
                  name="wellness_recovery"
                  type="number"
                  min="0"
                  max="10"
                  defaultValue={staffContext.activeTeam.wellnessLimits?.recovery ?? ""}
                  placeholder="Ej: 4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellness_sleepHours">Horas de sueño (alerta si es menor a)</Label>
                <Input
                  id="wellness_sleepHours"
                  name="wellness_sleepHours"
                  type="number"
                  min="0"
                  max="24"
                  defaultValue={staffContext.activeTeam.wellnessLimits?.sleepHours ?? ""}
                  placeholder="Ej: 6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellness_soreness">Agujetas (alerta si es mayor o igual a)</Label>
                <Input
                  id="wellness_soreness"
                  name="wellness_soreness"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={staffContext.activeTeam.wellnessLimits?.soreness ?? ""}
                  placeholder="Ej: 4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellness_energy">Energía (alerta si es menor o igual a)</Label>
                <Input
                  id="wellness_energy"
                  name="wellness_energy"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={staffContext.activeTeam.wellnessLimits?.energy ?? ""}
                  placeholder="Ej: 2"
                />
              </div>
            </div>
          </div>

          <Button type="submit">Guardar configuración</Button>
        </form>

        <div className="space-y-4">
          <ClubBrandingCard
            canEdit={staffContext.canCreateTeam}
            clubLogoUrl={staffContext.club.logoUrl}
            clubName={staffContext.club.name}
          />
          <Card className="rounded-xl border-border-secondary">
            <CardHeader>
              <CardTitle className="text-base text-text-primary">
                Superficie secundaria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary">
              <p>
                El roster, las temporadas, las lesiones y el análisis quedan fuera
                de la navegación principal, pero siguen accesibles desde el menú de
                acciones del header.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/players">Jugadores</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/seasons">Temporadas</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/injuries">Lesiones</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {staffContext.canCreateTeam || resolvedSearchParams?.createTeam ? (
            <Card className="rounded-xl border-border-secondary">
              <CardHeader>
                <CardTitle className="text-base text-text-primary">
                  Crear equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createTeamFromSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-team-name">Nombre</Label>
                    <Input
                      id="new-team-name"
                      name="name"
                      placeholder="Ej: Juvenil A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-team-category">Categoría</Label>
                    <Input
                      id="new-team-category"
                      name="category"
                      placeholder="Ej: Juvenil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-team-timezone">Zona horaria</Label>
                    <Input
                      id="new-team-timezone"
                      name="timezone"
                      defaultValue={staffContext.activeTeam.timezone}
                      required
                    />
                  </div>
                  <Button type="submit">Crear y activar equipo</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
