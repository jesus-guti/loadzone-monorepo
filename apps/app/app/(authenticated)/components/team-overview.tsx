import { Badge } from "@repo/design-system/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import type { PlayerStatus, RiskLevel } from "@repo/database";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  FlameIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

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
    riskLevel: RiskLevel | null;
    acwr: number | null;
  }[];
};

type TeamOverviewProperties = {
  readonly teamName: string;
  readonly seasonName: string | undefined;
  readonly players: PlayerSummary[];
};

function getRiskColor(riskLevel: RiskLevel | null | undefined): string {
  switch (riskLevel) {
    case "CRITICAL":
      return "bg-danger";
    case "HIGH":
      return "bg-premium";
    case "MODERATE":
      return "bg-bg-quaternary";
    case "LOW":
      return "bg-brand";
    default:
      return "bg-border-tertiary";
  }
}

function getRiskLabel(riskLevel: RiskLevel | null | undefined): string {
  switch (riskLevel) {
    case "CRITICAL":
      return "Crítico";
    case "HIGH":
      return "Alto";
    case "MODERATE":
      return "Moderado";
    case "LOW":
      return "Bajo";
    default:
      return "Sin datos";
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
      p.stats[0]?.riskLevel === "HIGH" ||
      p.stats[0]?.riskLevel === "CRITICAL" ||
      p.entries[0]?.physioAlert
  ).length;
  const registeredToday = players.filter(
    (p) => p.entries[0]?.preFilledAt
  ).length;

  const summaryCards: Array<{
    title: string;
    value: ReactNode;
    detail: string;
    icon: ReactNode;
  }> = [
    {
      title: "Plantilla activa",
      value: players.length,
      detail: `${availableCount} disponibles`,
      icon: <UsersIcon className="h-4 w-4 text-text-tertiary" />,
    },
    {
      title: "Check-ins hoy",
      value: `${registeredToday}/${players.length}`,
      detail: "pre-sesión",
      icon: <CheckCircleIcon className="h-4 w-4 text-text-brand" />,
    },
    {
      title: "Jugadores en alerta",
      value: alertCount,
      detail: "seguimiento inmediato",
      icon: <AlertTriangleIcon className="h-4 w-4 text-danger" />,
    },
    {
      title: "Mejor racha",
      value: `${Math.max(0, ...players.map((p) => p.currentStreak))} d`,
      detail: "consistencia actual",
      icon: <FlameIcon className="h-4 w-4 text-premium" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
            Dashboard del equipo
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            {teamName}
          </h2>
          {seasonName ? (
            <p className="text-sm text-text-secondary">
              Temporada activa: <span className="text-text-primary">{seasonName}</span>
            </p>
          ) : (
            <p className="text-sm text-text-secondary">
              Sin temporada activa configurada.
            </p>
          )}
        </div>

        <div className="rounded-md border border-border-secondary bg-bg-secondary px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
            Resumen
          </p>
          <p className="mt-1 text-sm font-medium text-text-primary">
            {players.length} jugadores monitorizados
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className="gap-3 rounded-md border-border-secondary bg-bg-primary py-4"
          >
            <CardHeader className="flex flex-row items-start justify-between px-4 pb-0">
              <CardTitle className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-2xl font-semibold tracking-tight text-text-primary">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-text-secondary">{card.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 rounded-md border-border-secondary bg-bg-primary py-0">
        <CardHeader className="flex flex-row items-end justify-between gap-4 border-b border-border-secondary px-4 py-4">
          <div>
            <CardTitle className="text-base font-semibold text-text-primary">
              Estado del equipo
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Vista operativa de disponibilidad, alertas y adherencia diaria.
            </p>
          </div>
          <div className="hidden text-xs uppercase tracking-[0.16em] text-text-secondary md:block">
            {players.length} registros
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {players.length === 0 ? (
            <div className="px-4 py-6 text-sm text-text-secondary">
              <p>
              No hay jugadores registrados.{" "}
                <Link
                  href="/players/new"
                  className="font-medium text-text-brand underline underline-offset-4"
                >
                Añadir jugador
              </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-secondary">
              {players.map((player) => {
                const latestEntry = player.entries[0];
                const latestStats = player.stats[0];
                const riskLevel = latestStats?.riskLevel;

                return (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="grid gap-4 px-4 py-4 transition-colors hover:bg-bg-secondary md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_auto] md:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${getRiskColor(riskLevel)}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{player.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant={getStatusVariant(player.status)}
                            className="rounded-sm"
                          >
                            {getStatusLabel(player.status)}
                          </Badge>
                          {latestEntry?.physioAlert && (
                            <Badge
                              variant="destructive"
                              className="gap-1 rounded-sm"
                            >
                              <ShieldAlertIcon className="h-3 w-3" />
                              Fisio
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-text-primary">
                        Riesgo {getRiskLabel(riskLevel).toLowerCase()}
                      </p>
                      <p className="text-text-secondary">
                        {latestEntry?.preFilledAt
                          ? "Check-in recibido hoy"
                          : "Pendiente de check-in"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      {player.currentStreak > 0 && (
                        <span className="flex items-center gap-1 font-medium text-text-primary">
                          <FlameIcon className="h-3 w-3 text-premium" />
                          {player.currentStreak}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            latestEntry?.preFilledAt
                              ? "bg-brand"
                              : "bg-border-tertiary"
                          }`}
                          title="Pre-sesión"
                        />
                        <span
                          className={`h-2 w-2 rounded-full ${
                            latestEntry?.postFilledAt
                              ? "bg-brand"
                              : "bg-border-tertiary"
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
