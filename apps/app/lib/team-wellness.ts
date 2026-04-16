import { database, type PlayerStatus, type RiskLevel } from "@repo/database";

export type TeamWellnessPlayer = {
  id: string;
  name: string;
  status: PlayerStatus;
  currentStreak: number;
  entries: Array<{
    date: Date;
    recovery: number | null;
    energy: number | null;
    soreness: number | null;
    rpe: number | null;
    duration: number | null;
    preFilledAt: Date | null;
    postFilledAt: Date | null;
    physioAlert: boolean;
  }>;
  stats: Array<{
    riskLevel: RiskLevel | null;
    acwr: number | null;
  }>;
};

export type TeamWellnessSummary = {
  recoveryAverage: number | null;
  energyAverage: number | null;
  sorenessAverage: number | null;
  preCompletedCount: number;
  postCompletedCount: number;
  alertCount: number;
  pendingCount: number;
};

export type TeamWellnessWorkspaceData = {
  team: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  activeSeason: {
    id: string;
    name: string;
  } | null;
  players: TeamWellnessPlayer[];
  summary: TeamWellnessSummary;
  todayLabel: string;
  evaluatedDate: string;
};

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum: number, value: number) => sum + value, 0);
  return total / values.length;
}

function getStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function formatDateForCookie(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getTeamWellnessWorkspaceData(
  teamId: string,
  seasonId?: string | null,
  evaluatedDateInput?: Date | null
): Promise<TeamWellnessWorkspaceData | null> {
  const today = evaluatedDateInput ? getStartOfDay(evaluatedDateInput) : new Date();
  today.setHours(0, 0, 0, 0);

  const team = await database.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      seasons: {
        where: seasonId
          ? { id: seasonId }
          : {
              startDate: { lte: today },
              endDate: { gte: today },
            },
        orderBy: {
          startDate: "desc",
        },
        take: 1,
        select: { id: true, name: true },
      },
    },
  });

  if (!team) {
    return null;
  }

  const activeSeason =
    team.seasons[0] ??
    (seasonId
      ? null
      : (
          await database.season.findFirst({
            where: {
              teamId: team.id,
              startDate: { lte: today },
              endDate: { gte: today },
            },
            orderBy: {
              startDate: "desc",
            },
            select: { id: true, name: true },
          })
        )) ??
    null;
  const rawPlayers = await database.player.findMany({
    where: { teamId: team.id, isArchived: false },
    select: {
      id: true,
      name: true,
      status: true,
      currentStreak: true,
      entries: {
        where: activeSeason
          ? { seasonId: activeSeason.id, date: today }
          : { date: today },
        orderBy: { date: "desc" },
        take: 1,
        select: {
          date: true,
          recovery: true,
          energy: true,
          soreness: true,
          rpe: true,
          duration: true,
          preFilledAt: true,
          postFilledAt: true,
          physioAlert: true,
        },
      },
      stats: {
        where: activeSeason ? { seasonId: activeSeason.id } : undefined,
        orderBy: { date: "desc" },
        take: 1,
        select: {
          riskLevel: true,
          acwr: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const players: TeamWellnessPlayer[] = rawPlayers.map((player) => ({
    ...player,
    stats: player.stats.map((stat) => ({
      riskLevel: stat.riskLevel,
      acwr: stat.acwr == null ? null : Number(stat.acwr),
    })),
  }));

  const todayEntries = players.flatMap((player) => player.entries);
  const recoveryValues = todayEntries
    .map((entry) => entry.recovery)
    .filter((value): value is number => value != null);
  const energyValues = todayEntries
    .map((entry) => entry.energy)
    .filter((value): value is number => value != null);
  const sorenessValues = todayEntries
    .map((entry) => entry.soreness)
    .filter((value): value is number => value != null);

  return {
    team: {
      id: team.id,
      name: team.name,
      logoUrl: team.logoUrl,
    },
    activeSeason,
    players,
    summary: {
      recoveryAverage: average(recoveryValues),
      energyAverage: average(energyValues),
      sorenessAverage: average(sorenessValues),
      preCompletedCount: players.filter((player) => Boolean(player.entries[0]?.preFilledAt))
        .length,
      postCompletedCount: players.filter((player) => Boolean(player.entries[0]?.postFilledAt))
        .length,
      alertCount: players.filter((player) => {
        const entry = player.entries[0];
        const riskLevel = player.stats[0]?.riskLevel;

        return (
          Boolean(entry?.physioAlert) ||
          riskLevel === "HIGH" ||
          riskLevel === "CRITICAL"
        );
      }).length,
      pendingCount: players.filter((player) => {
        const entry = player.entries[0];
        return !entry?.preFilledAt || !entry?.postFilledAt;
      }).length,
    },
    todayLabel: today.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
    }),
    evaluatedDate: formatDateForCookie(today),
  };
}
