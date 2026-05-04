import { Badge } from "@repo/design-system/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import {
  CheckCircleIcon,
  WarningIcon,
  FireIcon,
  ShieldWarningIcon,
  UsersIcon,
  ClockIcon,
} from "@phosphor-icons/react/ssr";
import type { PlayerStatus, RiskLevel } from "@repo/database";
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

type TeamSummary = {
  readonly recoveryAverage: number | null;
  readonly energyAverage: number | null;
  readonly sorenessAverage: number | null;
  readonly preCompletedCount: number;
  readonly postCompletedCount: number;
  readonly alertCount: number;
  readonly pendingCount: number;
};

type TeamOverviewProperties = {
  readonly teamName: string;
  readonly seasonName: string | undefined;
  readonly players: PlayerSummary[];
  readonly todayLabel: string;
  readonly summary: TeamSummary;
};

type DailyPlayerState = "ALERT" | "COMPLETED" | "NOT_COMPLETED";

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

function getDailyPlayerState(
  player: PlayerSummary
): DailyPlayerState {
  const entry = player.entries[0];
  const riskLevel = player.stats[0]?.riskLevel;

  if (
    entry?.physioAlert ||
    riskLevel === "HIGH" ||
    riskLevel === "CRITICAL"
  ) {
    return "ALERT";
  }

  if (entry?.preFilledAt && entry?.postFilledAt) {
    return "COMPLETED";
  }

  return "NOT_COMPLETED";
}

function getDailyStateLabel(state: DailyPlayerState): string {
  switch (state) {
    case "ALERT":
      return "Alerta";
    case "COMPLETED":
      return "Completado";
    default:
      return "Pendiente";
  }
}

function getDailyStateVariant(
  state: DailyPlayerState
): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case "ALERT":
      return "destructive";
    case "COMPLETED":
      return "default";
    default:
      return "secondary";
  }
}

function getCompletionCopy(player: PlayerSummary): string {
  const entry = player.entries[0];

  if (!entry?.preFilledAt) {
    return "Falta completar la pre-sesión";
  }

  if (!entry?.postFilledAt) {
    return "Pre completada, falta la post-sesión";
  }

  return "Pre y post-sesión registradas";
}

function formatAverage(value: number | null): string {
  if (value == null) {
    return "—";
  }

  return value.toFixed(1);
}

export function TeamOverview({
  teamName,
  seasonName,
  players,
  todayLabel,
  summary,
}: TeamOverviewProperties) {
  const availableCount = players.filter(
    (p) => p.status === "AVAILABLE"
  ).length;
  const priorityPlayers = players
    .filter((player) => getDailyPlayerState(player) !== "COMPLETED")
    .sort((leftPlayer, rightPlayer) => {
      const leftState = getDailyPlayerState(leftPlayer);
      const rightState = getDailyPlayerState(rightPlayer);

      if (leftState === rightState) {
        return leftPlayer.name.localeCompare(rightPlayer.name, "es");
      }

      if (leftState === "ALERT") {
        return -1;
      }

      if (rightState === "ALERT") {
        return 1;
      }

      return leftPlayer.name.localeCompare(rightPlayer.name, "es");
    });
  const completedPlayers = players.filter(
    (player) => getDailyPlayerState(player) === "COMPLETED"
  );

  const summaryCards: Array<{
    title: string;
    value: ReactNode;
    detail: string;
    icon: ReactNode;
  }> = [
    {
      title: "Pendientes hoy",
      value: summary.pendingCount,
      detail: "sin completar wellness",
      icon: <ClockIcon className="size-4 text-brand" />,
    },
    {
      title: "Jugadores en alerta",
      value: summary.alertCount,
      detail: "seguimiento inmediato",
      icon: <WarningIcon className="size-4 text-danger" />,
    },
    {
      title: "Plantilla activa",
      value: players.length,
      detail: `${availableCount} disponibles`,
      icon: <UsersIcon className="size-4 text-text-tertiary" />,
    },
    {
      title: "Pre hoy",
      value: `${summary.preCompletedCount}/${players.length}`,
      detail: "jugadores con pre-sesión",
      icon: <CheckCircleIcon className="size-4 text-text-secondary" />,
    },
  ];

  const renderPlayerRow = (player: PlayerSummary): ReactNode => {
    const latestEntry = player.entries[0];
    const latestStats = player.stats[0];
    const riskLevel = latestStats?.riskLevel;
    const dailyState = getDailyPlayerState(player);

    return (
      <Link
        key={player.id}
        href={`/players/${player.id}`}
        className="grid gap-4 px-4 py-4 transition-colors hover:bg-bg-secondary md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_auto] md:items-center"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${getRiskColor(riskLevel)}`}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">
              {player.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={getDailyStateVariant(dailyState)}
                className="rounded-sm"
              >
                {getDailyStateLabel(dailyState)}
              </Badge>
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
                  <ShieldWarningIcon className="size-3" />
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
          <p className="text-text-secondary">{getCompletionCopy(player)}</p>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 text-sm text-text-secondary md:justify-end">
          <Badge
            variant={latestEntry?.preFilledAt ? "default" : "outline"}
            className="rounded-sm"
          >
            Pre {latestEntry?.preFilledAt ? "ok" : "pendiente"}
          </Badge>
          <Badge
            variant={latestEntry?.postFilledAt ? "default" : "outline"}
            className="rounded-sm"
          >
            Post {latestEntry?.postFilledAt ? "ok" : "pendiente"}
          </Badge>
          {player.currentStreak > 0 && (
            <span className="flex items-center gap-1 font-medium text-text-primary">
              <FireIcon className="size-3 text-premium" />
              {player.currentStreak}
            </span>
          )}
        </div>
      </Link>
    );
  };

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
            {priorityPlayers.length} jugadores requieren acción hoy
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Corte diario: {todayLabel}
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
        <CardHeader className="border-b border-border-secondary px-4 py-4">
          <CardTitle className="text-base font-semibold text-text-primary">
            Resumen wellness del equipo
          </CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            Promedios del día sobre los registros recibidos hoy.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-3">
          <div className="rounded-md border border-border-secondary bg-bg-secondary px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
              Recuperación media
            </p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {formatAverage(summary.recoveryAverage)}
            </p>
          </div>
          <div className="rounded-md border border-border-secondary bg-bg-secondary px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
              Energía media
            </p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {formatAverage(summary.energyAverage)}
            </p>
          </div>
          <div className="rounded-md border border-border-secondary bg-bg-secondary px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
              Dolor muscular medio
            </p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {formatAverage(summary.sorenessAverage)}
            </p>
          </div>
        </CardContent>
      </Card>

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
              {priorityPlayers.length > 0 && (
                <div>
                  <div className="border-b border-border-secondary bg-bg-secondary px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                    Pendientes de hoy
                  </div>
                  <div className="divide-y divide-border-secondary">
                    {priorityPlayers.map(renderPlayerRow)}
                  </div>
                </div>
              )}

              {completedPlayers.length > 0 && (
                <div>
                  <div className="border-b border-border-secondary bg-bg-secondary px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                    Equipo al día
                  </div>
                  <div className="divide-y divide-border-secondary">
                    {completedPlayers.map(renderPlayerRow)}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
