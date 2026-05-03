import { database } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import { PlusIcon } from "@heroicons/react/20/solid";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import {
  LastSessionCard,
  QuickNewSessionCard,
  RecentExercisesCard,
  SessionCalendar,
  type LastSessionData,
  type RecentExerciseEntry,
} from "@/features/sessions";

export const metadata: Metadata = {
  title: "Sesiones | LoadZone",
};

const CALENDAR_RANGE_DAYS = 90;

const SessionsPage = async (): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const teamId = staffContext.activeTeam.id;
  const clubId = staffContext.club.id;

  const now = new Date();
  const calendarStart = new Date(now);
  calendarStart.setDate(calendarStart.getDate() - CALENDAR_RANGE_DAYS);
  const calendarEnd = new Date(now);
  calendarEnd.setDate(calendarEnd.getDate() + CALENDAR_RANGE_DAYS);

  const [calendarSessions, lastSession, recentExercisesAggregate] =
    await Promise.all([
      database.teamSession.findMany({
        where: {
          teamId,
          startsAt: { gte: calendarStart, lte: calendarEnd },
        },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          startsAt: true,
          endsAt: true,
        },
        orderBy: { startsAt: "asc" },
      }),
      database.teamSession.findFirst({
        where: {
          teamId,
          startsAt: { lte: now },
        },
        select: {
          id: true,
          title: true,
          type: true,
          startsAt: true,
          endsAt: true,
          exercises: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              durationMinutesOverride: true,
              exercise: {
                select: { id: true, name: true, durationMinutes: true },
              },
            },
          },
        },
        orderBy: { startsAt: "desc" },
      }),
      database.sessionExercise.groupBy({
        by: ["exerciseId"],
        where: {
          teamSession: { teamId },
        },
        _count: { exerciseId: true },
        orderBy: { _count: { exerciseId: "desc" } },
        take: 5,
      }),
    ]);

  const recentExerciseIds = recentExercisesAggregate.map(
    (entry) => entry.exerciseId
  );
  const recentExercisesData =
    recentExerciseIds.length > 0
      ? await database.exercise.findMany({
          where: { id: { in: recentExerciseIds } },
          select: { id: true, name: true },
        })
      : [];
  const recentExerciseMap = new Map(
    recentExercisesData.map((entry) => [entry.id, entry.name])
  );
  const recentExercises: RecentExerciseEntry[] = recentExercisesAggregate.map(
    (entry) => ({
      id: entry.exerciseId,
      name: recentExerciseMap.get(entry.exerciseId) ?? "Ejercicio",
      usageCount: entry._count.exerciseId,
    })
  );

  if (recentExercises.length < 5) {
    const fallback = await database.exercise.findMany({
      where: {
        clubId,
        isArchived: false,
        id: { notIn: recentExerciseIds },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
      take: 5 - recentExercises.length,
    });
    for (const entry of fallback) {
      recentExercises.push({
        id: entry.id,
        name: entry.name,
        usageCount: 0,
      });
    }
  }

  const lastSessionData: LastSessionData | null = lastSession
    ? {
        id: lastSession.id,
        title: lastSession.title,
        type: lastSession.type,
        startsAt: lastSession.startsAt,
        endsAt: lastSession.endsAt,
        exercises: lastSession.exercises.map((entry) => ({
          id: entry.id,
          name: entry.exercise.name,
          durationMinutes:
            entry.durationMinutesOverride ?? entry.exercise.durationMinutes,
        })),
      }
    : null;

  return (
    <>
      <Header page="Sesiones" pages={["LoadZone"]}>
        <Button asChild size="sm">
          <Link aria-label="Añadir sesión" href="/sessions/new">
            <PlusIcon className="size-4 md:mr-1" />
            <span className="hidden md:inline">Añadir sesión</span>
          </Link>
        </Button>
      </Header>
      <div className="grid flex-1 gap-6 p-4 md:p-6 lg:grid-cols-[1fr_360px]">
        <SessionCalendar
          sessions={calendarSessions.map((session) => ({
            id: session.id,
            title: session.title,
            type: session.type,
            status: session.status,
            startsAt: session.startsAt.toISOString(),
            endsAt: session.endsAt.toISOString(),
          }))}
        />
        <div className="flex flex-col gap-4 md:gap-5">
          <QuickNewSessionCard />
          <LastSessionCard session={lastSessionData} />
          <RecentExercisesCard exercises={recentExercises} />
        </div>
      </div>
    </>
  );
};

export default SessionsPage;
