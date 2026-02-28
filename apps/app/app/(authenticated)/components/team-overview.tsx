import { Badge } from "@repo/design-system/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import type { PlayerStatus } from "@repo/database";
import type { Decimal } from "@repo/database";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  FlameIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

type PlayerSummary = {
  id: string;
  name: string;
  status: PlayerStatus;
  currentStreak: number;
  entries: {
    date: Date;
    recovery: number | null;
    energy: number | null;
    soreness: number | null;
    rpe: number | null;
    preFilledAt: Date | null;
    postFilledAt: Date | null;
    physioAlert: boolean;
  }[];
  stats: {
    riskLevel: string | null;
    acwr: Decimal | null;
  }[];
};

type TeamOverviewProperties = {
  readonly teamName: string;
  readonly seasonName: string | undefined;
  readonly players: PlayerSummary[];
};

function getRiskColor(riskLevel: string | null | undefined): string {
  switch (riskLevel) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "moderate":
      return "bg-yellow-500";
    case "low":
    default:
      return "bg-green-500";
  }
}

function getStatusLabel(status: PlayerStatus): string {
  const labels: Record<PlayerStatus, string> = {
    AVAILABLE: "Disponible",
    MODIFIED_TRAINING: "Entrenamiento modificado",
    INJURED: "Lesionado",
    ILL: "Enfermo",
    UNAVAILABLE: "No disponible",
  };
  return labels[status];
}

function getStatusVariant(
  status: PlayerStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "AVAILABLE":
      return "default";
    case "INJURED":
    case "ILL":
      return "destructive";
    default:
      return "secondary";
  }
}

export function TeamOverview({
  teamName,
  seasonName,
  players,
}: TeamOverviewProperties) {
  const availableCount = players.filter(
    (p) => p.status === "AVAILABLE"
  ).length;
  const alertCount = players.filter(
    (p) =>
      p.stats[0]?.riskLevel === "high" ||
      p.stats[0]?.riskLevel === "critical" ||
      p.entries[0]?.physioAlert
  ).length;
  const registeredToday = players.filter(
    (p) => p.entries[0]?.preFilledAt
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{teamName}</h2>
        {seasonName && (
          <p className="text-sm text-muted-foreground">
            Temporada: {seasonName}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jugadores</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground">
              {availableCount} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Registros hoy
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {registeredToday}/{players.length}
            </div>
            <p className="text-xs text-muted-foreground">pre-sesión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCount}</div>
            <p className="text-xs text-muted-foreground">
              jugadores en riesgo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Mejor racha
            </CardTitle>
            <FlameIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(0, ...players.map((p) => p.currentStreak))} días
            </div>
            <p className="text-xs text-muted-foreground">racha activa</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado del equipo</CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay jugadores registrados.{" "}
              <Link href="/players/new" className="text-primary underline">
                Añadir jugador
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {players.map((player) => {
                const latestEntry = player.entries[0];
                const latestStats = player.stats[0];
                const riskLevel = latestStats?.riskLevel;

                return (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${getRiskColor(riskLevel)}`}
                      />
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusVariant(player.status)}>
                            {getStatusLabel(player.status)}
                          </Badge>
                          {latestEntry?.physioAlert && (
                            <Badge variant="destructive" className="gap-1">
                              <ShieldAlertIcon className="h-3 w-3" />
                              Fisio
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {player.currentStreak > 0 && (
                        <span className="flex items-center gap-1">
                          <FlameIcon className="h-3 w-3 text-orange-500" />
                          {player.currentStreak}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            latestEntry?.preFilledAt
                              ? "bg-green-500"
                              : "bg-muted-foreground/30"
                          }`}
                          title="Pre-sesión"
                        />
                        <span
                          className={`h-2 w-2 rounded-full ${
                            latestEntry?.postFilledAt
                              ? "bg-green-500"
                              : "bg-muted-foreground/30"
                          }`}
                          title="Post-sesión"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
