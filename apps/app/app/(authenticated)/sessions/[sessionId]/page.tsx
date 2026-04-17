import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../../components/header";
import { PrintButton } from "../components/print-button";
import { AttendanceForm } from "./components/attendance-form";
import { CancelSessionButton } from "./components/cancel-session-button";

export const metadata: Metadata = {
  title: "Sesión | LoadZone",
};

const TYPE_LABEL = {
  TRAINING: "Entrenamiento",
  MATCH: "Partido",
  RECOVERY: "Recuperación",
  OTHER: "Otro",
} as const;

const STATUS_LABEL = {
  SCHEDULED: "Programada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
} as const;

const STATUS_VARIANT: Record<
  keyof typeof STATUS_LABEL,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SCHEDULED: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

function formatDateRange(startsAt: Date, endsAt: Date): string {
  const dateFormatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateFormatter.format(startsAt)} · ${timeFormatter.format(
    startsAt
  )} - ${timeFormatter.format(endsAt)}`;
}

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

const SessionDetailPage = async ({
  params,
}: PageProps): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const { sessionId } = await params;

  const session = await database.teamSession.findFirst({
    where: {
      id: sessionId,
      teamId: staffContext.activeTeam.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      notes: true,
      type: true,
      visibility: true,
      status: true,
      startsAt: true,
      endsAt: true,
      seriesId: true,
      preReminderMinutes: true,
      postReminderMinutes: true,
      exercises: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          durationMinutesOverride: true,
          notes: true,
          exercise: {
            select: {
              id: true,
              name: true,
              durationMinutes: true,
              objectivesText: true,
              complexity: true,
            },
          },
        },
      },
      attendance: {
        select: {
          playerId: true,
          status: true,
          minutesPlayed: true,
          startedMinute: true,
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const players = await database.player.findMany({
    where: { teamId: staffContext.activeTeam.id, isArchived: false },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const attendanceMap = new Map(
    session.attendance.map((entry) => [entry.playerId, entry])
  );
  const attendanceRows = players.map((player) => {
    const existing = attendanceMap.get(player.id);
    return {
      playerId: player.id,
      playerName: player.name,
      status: existing?.status ?? "PENDING",
      minutesPlayed: existing?.minutesPlayed ?? null,
      startedMinute: existing?.startedMinute ?? null,
    } as const;
  });

  const isMatch = session.type === "MATCH";

  return (
    <>
      <Header
        page={session.title}
        pages={["LoadZone", "Sesiones"]}
      >
        <div className="flex items-center gap-2">
          <PrintButton />
          {session.status !== "CANCELLED" ? (
            <CancelSessionButton sessionId={session.id} />
          ) : null}
        </div>
      </Header>

      <div className="grid flex-1 gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{TYPE_LABEL[session.type]}</Badge>
                <Badge variant={STATUS_VARIANT[session.status]}>
                  {STATUS_LABEL[session.status]}
                </Badge>
                {session.seriesId ? (
                  <Badge variant="outline">Sesión recurrente</Badge>
                ) : null}
              </div>
              <p className="text-sm text-text-secondary">
                {formatDateRange(session.startsAt, session.endsAt)}
              </p>
              {session.location ? (
                <p className="text-sm text-text-secondary">
                  Ubicación: {session.location}
                </p>
              ) : null}
              {session.notes ? (
                <p className="text-sm text-text-primary">{session.notes}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ejercicios</CardTitle>
            </CardHeader>
            <CardContent>
              {session.exercises.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  Esta sesión aún no tiene ejercicios asignados.
                </p>
              ) : (
                <ol className="space-y-3">
                  {session.exercises.map((entry, index) => (
                    <li
                      className="rounded-md border border-border-secondary bg-bg-secondary/30 p-3"
                      key={entry.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-text-primary">
                          {index + 1}. {entry.exercise.name}
                        </p>
                        <span className="text-xs text-text-secondary">
                          {entry.durationMinutesOverride ??
                            entry.exercise.durationMinutes}{" "}
                          min
                        </span>
                      </div>
                      {entry.notes ? (
                        <p className="mt-1 text-xs text-text-secondary">
                          {entry.notes}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Asistencia{isMatch ? " y minutos" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceForm
                initialRows={attendanceRows}
                isMatch={isMatch}
                sessionId={session.id}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recordatorios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-text-secondary">
              <p>Pre: {session.preReminderMinutes ?? 0} min</p>
              <p>Post: {session.postReminderMinutes ?? 0} min</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
};

export default SessionDetailPage;
