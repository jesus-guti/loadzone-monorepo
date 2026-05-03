import { database } from "@repo/database";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import { SessionForm, type ExerciseLibraryItem } from "@/features/sessions";

export const metadata: Metadata = {
  title: "Nueva sesión | LoadZone",
};

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

function buildLocalDateTimeValue(date: Date): string {
  const pad = (value: number): string => `${value}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const NewSessionPage = async ({
  searchParams,
}: PageProps): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const params = await searchParams;
  const baseDate = params.date ? new Date(`${params.date}T18:00:00`) : null;
  const start = baseDate && !Number.isNaN(baseDate.getTime())
    ? baseDate
    : (() => {
        const future = new Date();
        future.setHours(18, 0, 0, 0);
        if (future.getTime() < Date.now()) {
          future.setDate(future.getDate() + 1);
        }
        return future;
      })();
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 90);

  const exercises = await database.exercise.findMany({
    where: {
      OR: [
        { clubId: staffContext.club.id, isArchived: false },
        { isSystem: true, isArchived: false },
      ],
    },
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      complexity: true,
    },
    orderBy: { name: "asc" },
  });

  const exerciseItems: ExerciseLibraryItem[] = exercises.map((entry) => ({
    id: entry.id,
    name: entry.name,
    durationMinutes: entry.durationMinutes,
    complexity: entry.complexity,
  }));

  const locationRecords = await database.teamSession.findMany({
    where: {
      teamId: staffContext.activeTeam.id,
      location: { not: null },
    },
    select: { location: true },
    distinct: ["location"],
  });
  const locations = locationRecords
    .map((r) => r.location)
    .filter((loc): loc is string => Boolean(loc));

  return (
    <>
      <Header page="Nueva sesión" pages={["LoadZone", "Sesiones"]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <SessionForm
          defaultEndsAt={buildLocalDateTimeValue(end)}
          defaultStartsAt={buildLocalDateTimeValue(start)}
          exercises={exerciseItems}
          locations={locations}
          postReminderMinutes={
            staffContext.activeTeam.postSessionReminderMinutes ?? 30
          }
          preReminderMinutes={
            staffContext.activeTeam.preSessionReminderMinutes ?? 120
          }
        />
      </div>
    </>
  );
};

export default NewSessionPage;
