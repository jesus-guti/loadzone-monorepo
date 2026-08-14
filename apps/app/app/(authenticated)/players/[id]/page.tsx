import { database } from "@repo/database";
import {
  BODY_REGION_IDS,
  bodyRegionById,
  type BodyRegionCatalogId,
} from "@repo/database/body-region-catalog";
import {
  effectiveCurrentStreak,
  toCivilDateString,
} from "@repo/database/recoverable-streak";
import { resolveStorageUrl } from "@repo/storage/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/layouts/header";
import type { InjuryListItem } from "@/features/injuries/types";
import { CopyTokenButton } from "@/features/players/components/copy-token-button";
import { PlayerDetailShell } from "@/features/players/components/player-detail-shell";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Detalle jugador | LoadZone",
};

type PlayerDetailPageProperties = {
  params: Promise<{ id: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  MODIFIED_TRAINING: "Entrenamiento modificado",
  INJURED: "Lesionado",
  ILL: "Enfermo",
  UNAVAILABLE: "No disponible",
};

function isBodyRegionCatalogId(value: string): value is BodyRegionCatalogId {
  return (BODY_REGION_IDS as readonly string[]).includes(value);
}

function mapInjuryToListItem(injury: {
  id: string;
  startDate: Date;
  endDate: Date | null;
  cause: string;
  regionDetail: string | null;
  regions: Array<{ regionId: string }>;
}): InjuryListItem {
  const regionIds = injury.regions
    .map((region) => region.regionId)
    .filter(isBodyRegionCatalogId);

  return {
    id: injury.id,
    startDate: injury.startDate.toISOString().slice(0, 10),
    endDate: injury.endDate ? injury.endDate.toISOString().slice(0, 10) : null,
    cause: injury.cause,
    regionDetail: injury.regionDetail,
    regionIds,
    regionLabels: regionIds.map((id) => bodyRegionById.get(id)?.labelEs ?? id),
  };
}

const PlayerDetailPage = async ({
  params,
}: PlayerDetailPageProperties): Promise<React.JSX.Element> => {
  const { id } = await params;
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) notFound();

  const player = await database.player.findUnique({
    where: { id, teamId: staffContext.activeTeam.id },
    select: {
      id: true,
      imageUrl: true,
      name: true,
      token: true,
      status: true,
      currentStreak: true,
      longestStreak: true,
      streakSeasonId: true,
    },
  });

  if (!player) notFound();
  const playerImageUrl = resolveStorageUrl(player.imageUrl);

  const displayStreak = effectiveCurrentStreak({
    currentStreak: player.currentStreak,
    streakSeasonId: player.streakSeasonId,
    activeSeasonId: staffContext.activeSeason?.id ?? null,
  });

  const teamTimezone = staffContext.activeTeam.timezone || "Europe/Madrid";
  const todayCivil = toCivilDateString(new Date(), teamTimezone);

  const injuryRows = await database.injury.findMany({
    where: { playerId: player.id, teamId: staffContext.activeTeam.id },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      cause: true,
      regionDetail: true,
      regions: { select: { regionId: true } },
    },
  });

  const allInjuries = injuryRows.map(mapInjuryToListItem);
  const openInjuries = allInjuries.filter((injury) => injury.endDate === null);
  const closedInjuries = allInjuries.filter(
    (injury) => injury.endDate !== null
  );

  const excusedAbsences = await database.excusedAbsence.findMany({
    where: { playerId: player.id },
    orderBy: { date: "desc" },
    take: 30,
    select: { date: true },
  });
  const excusedDates = excusedAbsences.map(
    (excuse) => new Date(excuse.date).toISOString().split("T")[0] ?? ""
  );

  const entries = await database.dailyEntry.findMany({
    where: { playerId: player.id },
    orderBy: { date: "asc" },
    select: {
      date: true,
      recovery: true,
      energy: true,
      soreness: true,
      sleepHours: true,
      sleepQuality: true,
      rpe: true,
      duration: true,
      preFilledAt: true,
      postFilledAt: true,
      physioAlert: true,
    },
  });

  const stats = await database.playerDailyStats.findMany({
    where: { playerId: player.id },
    orderBy: { date: "asc" },
    select: {
      date: true,
      srpe: true,
      acwr: true,
      acuteLoad: true,
      chronicLoad: true,
      riskLevel: true,
      tqrAvg7d: true,
      rpeAvg7d: true,
    },
  });

  const chartEntries = entries.map((entry) => ({
    date: new Date(entry.date).toISOString().split("T")[0],
    recovery: entry.recovery,
    energy: entry.energy,
    soreness: entry.soreness,
    sleepHours: entry.sleepHours ? Number(entry.sleepHours) : null,
    sleepQuality: entry.sleepQuality,
    rpe: entry.rpe,
    duration: entry.duration,
    srpe: entry.rpe && entry.duration ? entry.rpe * entry.duration : null,
  }));

  const chartStats = stats.map((stat) => ({
    date: new Date(stat.date).toISOString().split("T")[0],
    acwr: stat.acwr ? Number(stat.acwr) : null,
    acuteLoad: stat.acuteLoad ? Number(stat.acuteLoad) : null,
    chronicLoad: stat.chronicLoad ? Number(stat.chronicLoad) : null,
    riskLevel: stat.riskLevel,
    tqrAvg7d: stat.tqrAvg7d ? Number(stat.tqrAvg7d) : null,
    rpeAvg7d: stat.rpeAvg7d ? Number(stat.rpeAvg7d) : null,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntry =
    entries.find((entry) => entry.date.getTime() === today.getTime()) ?? null;
  const statsByDate = new Map(
    stats.map((stat) => [new Date(stat.date).toISOString().split("T")[0], stat])
  );
  const historyRows = [...entries].reverse().map((entry) => {
    const dateKey = new Date(entry.date).toISOString().split("T")[0];
    const stat = statsByDate.get(dateKey);

    return {
      date: dateKey,
      preFilledAt: entry.preFilledAt ? entry.preFilledAt.toISOString() : null,
      postFilledAt: entry.postFilledAt ? entry.postFilledAt.toISOString() : null,
      recovery: entry.recovery,
      energy: entry.energy,
      soreness: entry.soreness,
      sleepHours: entry.sleepHours ? Number(entry.sleepHours) : null,
      sleepQuality: entry.sleepQuality,
      rpe: entry.rpe,
      duration: entry.duration,
      physioAlert: entry.physioAlert,
      riskLevel: stat?.riskLevel ?? null,
    };
  });

  return (
    <>
      <Header page={player.name} pages={["LoadZone", "Jugadores"]}>
        <div className="flex items-center gap-2 px-4">
          <CopyTokenButton token={player.token} />
        </div>
      </Header>

      <Suspense
        fallback={
          <div className="space-y-6 p-4 pt-0">
            <div className="h-12 animate-pulse rounded-md bg-bg-secondary" />
            <div className="h-8 w-48 animate-pulse rounded-md bg-bg-secondary" />
          </div>
        }
      >
        <PlayerDetailShell
          allInjuries={allInjuries}
          chartEntries={chartEntries}
          chartStats={chartStats}
          closedInjuries={closedInjuries}
          displayStreak={displayStreak}
          entryCount={entries.length}
          excusedDates={excusedDates}
          historyRows={historyRows}
          lastAcwr={chartStats.at(-1)?.acwr ?? null}
          lastRpe={entries.at(-1)?.rpe ?? null}
          longestStreak={player.longestStreak}
          openInjuries={openInjuries}
          physioAlertToday={Boolean(todayEntry?.physioAlert)}
          playerId={player.id}
          playerImageUrl={playerImageUrl}
          playerName={player.name}
          postDoneToday={Boolean(todayEntry?.postFilledAt)}
          preDoneToday={Boolean(todayEntry?.preFilledAt)}
          statusLabel={STATUS_LABELS[player.status] ?? player.status}
          todayCivil={todayCivil}
        />
      </Suspense>
    </>
  );
};

export default PlayerDetailPage;
