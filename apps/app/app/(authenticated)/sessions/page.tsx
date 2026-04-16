import { database } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../components/header";
import { cancelSession, createSession } from "./actions/session-actions";

export const metadata: Metadata = {
  title: "Sesiones | LoadZone",
};

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const SessionsPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const sessions = await database.teamSession.findMany({
    where: {
      teamId: staffContext.activeTeam.id,
    },
    orderBy: {
      startsAt: "asc",
    },
    take: 30,
    select: {
      id: true,
      title: true,
      type: true,
      visibility: true,
      status: true,
      startsAt: true,
      endsAt: true,
      preReminderMinutes: true,
      postReminderMinutes: true,
      team: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <>
      <Header page="Sesiones" pages={["LoadZone"]} />
      <div className="mx-auto grid max-w-6xl gap-6 p-4 pt-0 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nueva sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createSession} className="space-y-4">
              <div className="rounded-md border border-border-secondary bg-bg-secondary px-3 py-3 text-sm text-text-secondary">
                Esta sesión se creará para <span className="font-medium text-text-primary">{staffContext.activeTeam.name}</span>.
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                  placeholder="Entrenamiento MD-1"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Tipo
                  </label>
                  <select
                    id="type"
                    name="type"
                    defaultValue="TRAINING"
                    className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                  >
                    <option value="TRAINING">Entrenamiento</option>
                    <option value="MATCH">Partido</option>
                    <option value="RECOVERY">Recuperación</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="visibility" className="text-sm font-medium">
                    Visibilidad
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    defaultValue="TEAM_PRIVATE"
                    className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                  >
                    <option value="TEAM_PRIVATE">Privada del equipo</option>
                    <option value="CLUB_SHARED">Compartida del club</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="startsAt" className="text-sm font-medium">
                  Empieza
                </label>
                <input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  required
                  className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endsAt" className="text-sm font-medium">
                  Termina
                </label>
                <input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  required
                  className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="preReminderMinutes"
                    className="text-sm font-medium"
                  >
                    Reminder pre (min)
                  </label>
                  <input
                    id="preReminderMinutes"
                    name="preReminderMinutes"
                    type="number"
                    min="0"
                    max="1440"
                    defaultValue={String(
                      staffContext.activeTeam.preSessionReminderMinutes ?? 120
                    )}
                    className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="postReminderMinutes"
                    className="text-sm font-medium"
                  >
                    Reminder post (min)
                  </label>
                  <input
                    id="postReminderMinutes"
                    name="postReminderMinutes"
                    type="number"
                    min="0"
                    max="1440"
                    defaultValue={String(
                      staffContext.activeTeam.postSessionReminderMinutes ?? 30
                    )}
                    className="h-10 w-full rounded-md border border-border-secondary bg-bg-primary px-3 text-sm"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Crear sesión
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-text-secondary">
                Aún no hay sesiones programadas para este equipo.
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{session.title}</CardTitle>
                    <p className="mt-1 text-sm text-text-secondary">
                      {formatDateTime(session.startsAt)} -{" "}
                      {formatDateTime(session.endsAt)}
                    </p>
                  </div>
                  <div className="text-right text-xs uppercase tracking-wide text-text-secondary">
                    <p>{session.type}</p>
                    <p>{session.visibility === "CLUB_SHARED" ? "Club" : "Equipo"}</p>
                    <p>{session.status}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4 text-sm text-text-secondary">
                  <div>
                    <p>Pre: {session.preReminderMinutes ?? 0} min</p>
                    <p>Post: {session.postReminderMinutes ?? 0} min</p>
                  </div>

                  {session.status !== "CANCELLED" ? (
                    <form action={cancelSession.bind(null, session.id)}>
                      <Button type="submit" variant="outline">
                        Cancelar
                      </Button>
                    </form>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SessionsPage;
