import { database } from "@repo/database";
import { resolveStorageUrl } from "@repo/storage/shared";
import { FireIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layouts/header";
import {
  CopyTokenButton,
  PlayerCharts,
  PlayerHistoryTable,
} from "@/features/players";
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

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const PlayerDetailPage = async ({ params }: PlayerDetailPageProperties) => {
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
    },
  });

  if (!player) notFound();
  const playerImageUrl = resolveStorageUrl(player.imageUrl);

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntry =
    entries.find((entry) => entry.date.getTime() === today.getTime()) ?? null;
  const statsByDate = new Map(
    stats.map((stat) => [new Date(stat.date).toISOString().split("T")[0], stat])
  );
  const historyRows = [...entries]
    .reverse()
    .map((entry) => {
      const dateKey = new Date(entry.date).toISOString().split("T")[0];
      const stat = statsByDate.get(dateKey);

      return {
        date: dateKey,
        preFilledAt: entry.preFilledAt,
        postFilledAt: entry.postFilledAt,
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

      <div className="space-y-6 p-4 pt-0">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar className="size-12 rounded-2xl border border-border-secondary">
            {playerImageUrl ? (
              <AvatarImage
                alt={player.name}
                className="object-cover"
                src={playerImageUrl}
              />
            ) : null}
            <AvatarFallback className="rounded-2xl bg-bg-secondary text-sm font-semibold text-text-primary">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          <Badge>{STATUS_LABELS[player.status]}</Badge>
          <Badge variant={todayEntry?.preFilledAt ? "default" : "outline"}>
            Pre hoy {todayEntry?.preFilledAt ? "ok" : "pendiente"}
          </Badge>
          <Badge variant={todayEntry?.postFilledAt ? "default" : "outline"}>
            Post hoy {todayEntry?.postFilledAt ? "ok" : "pendiente"}
          </Badge>
          {todayEntry?.physioAlert && (
            <Badge variant="destructive">Alerta</Badge>
          )}
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <FireIcon className="size-3 text-premium" />
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
        <PlayerHistoryTable rows={historyRows} />
      </div>
    </>
  );
};

export default PlayerDetailPage;
