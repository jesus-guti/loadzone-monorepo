import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "../../components/header";
import { PlayerCharts } from "./components/player-charts";
import { CopyTokenButton } from "../components/copy-token-button";
import { FlameIcon } from "lucide-react";

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

const PlayerDetailPage = async ({ params }: PlayerDetailPageProperties) => {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const admin = await database.admin.findFirst({
    where: { clerkId: userId },
    select: { teamId: true },
  });
  if (!admin) notFound();

  const player = await database.player.findUnique({
    where: { id, teamId: admin.teamId },
    select: {
      id: true,
      name: true,
      token: true,
      status: true,
      currentStreak: true,
      longestStreak: true,
    },
  });

  if (!player) notFound();

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

  const chartEntries = entries.map((e) => ({
    date: new Date(e.date).toISOString().split("T")[0],
    recovery: e.recovery,
    energy: e.energy,
    soreness: e.soreness,
    sleepHours: e.sleepHours ? Number(e.sleepHours) : null,
    sleepQuality: e.sleepQuality,
    rpe: e.rpe,
    duration: e.duration,
    srpe: e.rpe && e.duration ? e.rpe * e.duration : null,
  }));

  const chartStats = stats.map((s) => ({
    date: new Date(s.date).toISOString().split("T")[0],
    acwr: s.acwr ? Number(s.acwr) : null,
    acuteLoad: s.acuteLoad ? Number(s.acuteLoad) : null,
    chronicLoad: s.chronicLoad ? Number(s.chronicLoad) : null,
    riskLevel: s.riskLevel,
    tqrAvg7d: s.tqrAvg7d ? Number(s.tqrAvg7d) : null,
    rpeAvg7d: s.rpeAvg7d ? Number(s.rpeAvg7d) : null,
  }));

  return (
    <>
      <Header page={player.name} pages={["LoadZone", "Jugadores"]}>
        <div className="flex items-center gap-2 px-4">
          <CopyTokenButton token={player.token} />
        </div>
      </Header>

      <div className="space-y-6 p-4 pt-0">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{STATUS_LABELS[player.status]}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <FlameIcon className="h-3 w-3 text-orange-500" />
            Racha: {player.currentStreak} días (máx: {player.longestStreak})
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Registros totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Último RPE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {entries.at(-1)?.rpe ?? "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Último ACWR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chartStats.at(-1)?.acwr?.toFixed(2) ?? "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        <PlayerCharts entries={chartEntries} stats={chartStats} />
      </div>
    </>
  );
};

export default PlayerDetailPage;
