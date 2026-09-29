import { database } from "@repo/database";
import { Button } from "@repo/design-system/components/button";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import { SessionCalendar } from "@/features/sessions";

export const metadata: Metadata = {
  title: "Sesiones | LoadZone",
};

const CALENDAR_RANGE_DAYS = 90;

const SessionsPage = async (): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam || !staffContext.club) {
    notFound();
  }

  const teamId = staffContext.activeTeam.id;

  const now = new Date();
  const calendarStart = new Date(now);
  calendarStart.setDate(calendarStart.getDate() - CALENDAR_RANGE_DAYS);
  const calendarEnd = new Date(now);
  calendarEnd.setDate(calendarEnd.getDate() + CALENDAR_RANGE_DAYS);

  const calendarSessions = await database.teamSession.findMany({
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
  });

  return (
    <>
      <Header page="Sesiones" pages={["LoadZone"]}>
        <Button size="sm" render={<Link aria-label="Añadir sesión" href="/sessions/new"><PlusIcon className="size-4 md:mr-1" /><span className="hidden md:inline">Añadir sesión</span></Link>} />
      </Header>
      <div className="flex-1 p-4 md:p-6">
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
      </div>
    </>
  );
};

export default SessionsPage;
