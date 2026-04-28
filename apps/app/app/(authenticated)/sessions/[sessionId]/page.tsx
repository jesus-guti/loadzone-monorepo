import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { PencilIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
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
  SCHEDULED: "outline",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

const STATUS_CLASS: Record<keyof typeof STATUS_LABEL, string> = {
  SCHEDULED: "text-text-secondary",
  COMPLETED: "border-success/30 text-success",
  CANCELLED: "",
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

function formatExerciseIndex(index: number): string {
  return `${index + 1}`.padStart(2, "0");
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
            <>
              <Button asChild size="icon" variant="outline">
                <Link href={`/sessions/${session.id}/edit`}>
                  <PencilIcon className="size-4" />
                  <span className="sr-only">Editar sesión</span>
                </Link>
              </Button>
              <CancelSessionButton sessionId={session.id} />
            </>
          ) : null}
        </div>
      </Header>

      <div className="grid flex-1 gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="bevel-card rounded-lg border-border-tertiary bg-bg-primary p-5">
            <CardHeader className="px-0 pb-0">
              <CardTitle className="text-xl font-semibold tracking-tight text-text-primary">
                {session.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-0 pb-0">
              <p className="mt-2 text-sm text-text-secondary">
                {formatDateRange(session.startsAt, session.endsAt)}
                {session.location ? ` · ${session.location}` : null}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-text-secondary" variant="outline">
                  {TYPE_LABEL[session.type]}
                </Badge>
                <Badge
                  className={STATUS_CLASS[session.status]}
                  variant={STATUS_VARIANT[session.status]}
                >
                  {STATUS_LABEL[session.status]}
                </Badge>
                {session.seriesId ? (
                  <Badge
                    className="border-brand/30 text-brand"
                    variant="outline"
                  >
                    Sesión recurrente
                  </Badge>
                ) : null}
              </div>
              {session.notes ? (
                <blockquote className="mt-3 border-l-2 border-brand/40 pl-4 text-sm text-text-secondary">
                  {session.notes}
                </blockquote>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bevel-card rounded-lg border-border-tertiary bg-bg-primary p-5">
            <CardHeader className="px-0 pb-0">
              <CardTitle className="text-base font-semibold text-text-primary">
                Ejercicios
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {session.exercises.length === 0 ? (
                <p className="mt-4 text-sm text-text-secondary">
                  Esta sesión aún no tiene ejercicios asignados.
                </p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {session.exercises.map((entry, index) => (
                    <li
                      className="flex items-start justify-between gap-4"
                      key={entry.id}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="text-text-tertiary tabular-nums">
                            {formatExerciseIndex(index)}.{" "}
                          </span>
                          <span className="font-medium text-text-primary">
                            {entry.exercise.name}
                          </span>
                        </p>
                        {entry.notes ? (
                          <p className="mt-1 text-sm text-text-secondary">
                            {entry.notes}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm text-text-secondary tabular-nums">
                        {entry.durationMinutesOverride ??
                          entry.exercise.durationMinutes}{" "}
                        min
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card className="bevel-card rounded-lg border-border-tertiary bg-bg-primary p-5">
            <CardHeader className="px-0 pb-0">
              <CardTitle className="text-base font-semibold text-text-primary">
                Asistencia{isMatch ? " y minutos" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="mt-4">
                <AttendanceForm
                  initialRows={attendanceRows}
                  isMatch={isMatch}
                  sessionId={session.id}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="bevel-card rounded-lg border-border-tertiary bg-bg-primary p-5">
            <CardHeader className="px-0 pb-0">
              <CardTitle className="text-base font-semibold text-text-primary">
                Recordatorios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-0 pb-0 text-sm">
              <div className="mt-4 flex items-center justify-between">
                <span className="text-text-secondary">Pre-sesión</span>
                <span className="text-text-tertiary tabular-nums">
                  {session.preReminderMinutes ?? 0} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Post-sesión</span>
                <span className="text-text-tertiary tabular-nums">
                  {session.postReminderMinutes ?? 0} min
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
};

export default SessionDetailPage;
