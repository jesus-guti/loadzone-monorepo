import { database } from "@repo/database";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import { EditSessionForm } from "@/features/sessions";
import type { EditableSession } from "@/features/sessions/components/edit-session-form";

export const metadata: Metadata = {
  title: "Editar sesión | LoadZone",
};

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

function buildLocalDateTimeValue(date: Date): string {
  const pad = (value: number): string => `${value}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const EditSessionPage = async ({
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
      type: true,
      visibility: true,
      location: true,
      notes: true,
      startsAt: true,
      endsAt: true,
      preReminderMinutes: true,
      postReminderMinutes: true,
      seriesId: true,
    },
  });

  if (!session) {
    notFound();
  }

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

  const editableSession: EditableSession = {
    id: session.id,
    title: session.title,
    type: session.type,
    visibility: session.visibility,
    location: session.location ?? "",
    notes: session.notes ?? "",
    startsAt: buildLocalDateTimeValue(session.startsAt),
    endsAt: buildLocalDateTimeValue(session.endsAt),
    preReminderMinutes: session.preReminderMinutes,
    postReminderMinutes: session.postReminderMinutes,
    isRecurring: Boolean(session.seriesId),
  };

  return (
    <>
      <Header page="Editar sesión" pages={["LoadZone", "Sesiones", session.title]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl mx-auto w-full">
        <EditSessionForm locations={locations} session={editableSession} />
      </div>
    </>
  );
};

export default EditSessionPage;
