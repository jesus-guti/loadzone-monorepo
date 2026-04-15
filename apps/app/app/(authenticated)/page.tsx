import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "./components/header";
import { TeamOverview } from "./components/team-overview";

export const metadata: Metadata = {
  title: "Dashboard | LoadZone",
  description: "Panel de control del equipo",
};

const Dashboard = async () => {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const team = await database.team.findFirst({
    where: {
      admins: { some: { clerkId: userId } },
    },
    select: {
      id: true,
      name: true,
      seasons: {
        where: {
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        take: 1,
        select: { id: true, name: true },
      },
    },
  });

  const activeSeason = team?.seasons[0];

  const players = team
    ? await database.player.findMany({
        where: { teamId: team.id, isArchived: false },
        select: {
          id: true,
          name: true,
          status: true,
          currentStreak: true,
          entries: {
            where: activeSeason
              ? { seasonId: activeSeason.id }
              : undefined,
            orderBy: { date: "desc" },
            take: 1,
            select: {
              date: true,
              recovery: true,
              energy: true,
              soreness: true,
              rpe: true,
              preFilledAt: true,
              postFilledAt: true,
              physioAlert: true,
            },
          },
          stats: {
            orderBy: { date: "desc" },
            take: 1,
            select: {
              riskLevel: true,
              acwr: true,
            },
          },
        },
        orderBy: { name: "asc" },
      })
    : [];

  const playersForOverview = players.map((player) => ({
    ...player,
    stats: player.stats.map((stat) => ({
      riskLevel: stat.riskLevel,
      acwr: stat.acwr == null ? null : Number(stat.acwr),
    })),
  }));

  return (
    <>
      <Header page="Dashboard" pages={["LoadZone"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {!team ? (
          <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-8 text-center">
            <div>
              <h2 className="text-xl font-semibold">Equipo no encontrado</h2>
              <p className="mt-2 text-muted-foreground">
                No se pudo cargar la información del equipo.
              </p>
            </div>
          </div>
        ) : (
          <TeamOverview
            teamName={team.name}
            seasonName={activeSeason?.name}
            players={playersForOverview}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;
