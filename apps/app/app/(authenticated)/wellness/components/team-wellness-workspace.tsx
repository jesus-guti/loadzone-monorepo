"use client";

import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  FireIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import {
  Avatar,
  AvatarFallback,
} from "@repo/design-system/components/ui/avatar";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { cn } from "@repo/design-system/lib/utils";
import type { PlayerStatus, RiskLevel } from "@repo/database";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PendingReminderDialog } from "./pending-reminder-dialog";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";

type TeamWellnessWorkspaceProperties = {
  readonly evaluatedDate: string;
  readonly players: TeamWellnessPlayer[];
};

type DailyPlayerState = "ALERT" | "COMPLETED" | "NOT_COMPLETED";
type WellnessViewMode = "cards" | "bubbles";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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

function getInjuryLabel(status: PlayerStatus): string | null {
  switch (status) {
    case "INJURED":
      return "Lesionado";
    case "ILL":
      return "Enfermo";
    default:
      return null;
  }
}

function isPlayerActiveToday(player: TeamWellnessPlayer): boolean {
  const entry = player.entries[0];
  return Boolean(entry?.preFilledAt || entry?.postFilledAt);
}

function getDailyPlayerState(player: TeamWellnessPlayer): DailyPlayerState {
  const entry = player.entries[0];
  const riskLevel = player.stats[0]?.riskLevel;

  if (entry?.physioAlert || riskLevel === "HIGH" || riskLevel === "CRITICAL") {
    return "ALERT";
  }

  if (entry?.preFilledAt && entry?.postFilledAt) {
    return "COMPLETED";
  }

  return "NOT_COMPLETED";
}

function formatAverage(value: number | null): string {
  if (value == null) {
    return "—";
  }

  return value.toFixed(1);
}

function buildSummary(players: TeamWellnessPlayer[]) {
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

  const average = (values: number[]): number | null => {
    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum: number, value: number) => sum + value, 0) / values.length;
  };

  return {
    alertCount: players.filter((player) => {
      const entry = player.entries[0];
      const riskLevel = player.stats[0]?.riskLevel;

      return (
        Boolean(entry?.physioAlert) ||
        riskLevel === "HIGH" ||
        riskLevel === "CRITICAL"
      );
    }).length,
    energyAverage: average(energyValues),
    pendingCount: players.filter((player) => {
      const entry = player.entries[0];
      return !entry?.preFilledAt || !entry?.postFilledAt;
    }).length,
    postCompletedCount: players.filter((player) => Boolean(player.entries[0]?.postFilledAt))
      .length,
    preCompletedCount: players.filter((player) => Boolean(player.entries[0]?.preFilledAt))
      .length,
    recoveryAverage: average(recoveryValues),
    sorenessAverage: average(sorenessValues),
  };
}

export function TeamWellnessWorkspace({
  evaluatedDate,
  players,
}: TeamWellnessWorkspaceProperties) {
  const [viewMode, setViewMode] = useState<WellnessViewMode>("cards");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const filteredPlayers = useMemo(() => {
    if (selectedPlayerIds.length === 0) {
      return players;
    }

    return players.filter((player) => selectedPlayerIds.includes(player.id));
  }, [players, selectedPlayerIds]);

  const summary = useMemo(() => buildSummary(filteredPlayers), [filteredPlayers]);
  const summaryCards = [
    {
      detail: "requieren acción",
      icon: <ExclamationTriangleIcon className="size-4 text-danger" />,
      title: "Prioridad hoy",
      value: summary.pendingCount,
    },
    {
      detail: "pre-sesión enviada",
      icon: <CheckCircleIcon className="size-4 text-brand" />,
      title: "Pre completada",
      value: `${summary.preCompletedCount}/${filteredPlayers.length || 0}`,
    },
    {
      detail: "post-sesión enviada",
      icon: <CheckCircleIcon className="size-4 text-brand" />,
      title: "Post completada",
      value: `${summary.postCompletedCount}/${filteredPlayers.length || 0}`,
    },
    {
      detail: "seguimiento inmediato",
      icon: <ShieldExclamationIcon className="size-4 text-danger" />,
      title: "Alertas",
      value: summary.alertCount,
    },
  ];

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((currentIds) => {
      if (currentIds.includes(playerId)) {
        return currentIds.filter((id) => id !== playerId);
      }

      return [...currentIds, playerId];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="rounded-md"
            onClick={() => setViewMode("cards")}
            size="sm"
            variant={viewMode === "cards" ? "secondary" : "ghost"}
          >
            <Squares2X2Icon className="size-4" />
            Tarjetas
          </Button>
          <Button
            className="rounded-md"
            onClick={() => setViewMode("bubbles")}
            size="sm"
            variant={viewMode === "bubbles" ? "secondary" : "ghost"}
          >
            <SparklesIcon className="size-4" />
            Burbujas
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="rounded-md"
            onClick={() => setSelectedPlayerIds([])}
            size="sm"
            variant="ghost"
          >
            Todos
          </Button>
          <p className="text-sm text-text-secondary">
            {selectedPlayerIds.length > 0
              ? `${selectedPlayerIds.length} jugadores filtrados`
              : `${players.length} jugadores`}
          </p>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredPlayers.map((player) => {
            const entry = player.entries[0];
            const state = getDailyPlayerState(player);
            const injuryLabel = getInjuryLabel(player.status);
            const alertLabel = entry?.physioAlert ? "Fisio" : "Riesgo alto";
            const isCardMuted = state === "COMPLETED" && !injuryLabel;

            return (
              <Link key={player.id} href={`/players/${player.id}`}>
                <Card
                  className={cn(
                    "h-full gap-3 rounded-none border-border-secondary py-4 transition-colors hover:bg-bg-secondary",
                    isCardMuted ? "bg-bg-primary/60" : "bg-bg-primary"
                  )}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-11 rounded-2xl border border-border-secondary">
                        <AvatarFallback className="rounded-2xl bg-bg-secondary text-sm font-semibold text-text-primary">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base text-text-primary">
                          {player.name}
                        </CardTitle>
                        {state === "COMPLETED" && !injuryLabel ? (
                          <p className="flex items-center gap-1 text-xs text-text-secondary">
                            <CheckCircleIcon className="size-3.5 text-text-tertiary" />
                            Completado
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {player.currentStreak > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-text-secondary">
                        <FireIcon className="size-3 text-premium" />
                        {player.currentStreak}
                      </span>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3 px-4">
                    {state === "ALERT" || state === "NOT_COMPLETED" || injuryLabel ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {state === "ALERT" ? (
                          <Badge className="rounded-sm" variant="destructive">
                            {alertLabel}
                          </Badge>
                        ) : null}
                        {state === "NOT_COMPLETED" ? (
                          <Badge
                            className="rounded-sm bg-premium/15 text-premium hover:bg-premium/20"
                            variant="secondary"
                          >
                            Pendiente
                          </Badge>
                        ) : null}
                        {injuryLabel ? (
                          <Badge
                            className="rounded-sm border-premium/40 text-premium"
                            variant="outline"
                          >
                            {injuryLabel}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-md border border-border-secondary bg-bg-secondary px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                          Riesgo
                        </p>
                        <p className="mt-1 font-medium text-text-primary">
                          {getRiskLabel(player.stats[0]?.riskLevel)}
                        </p>
                      </div>
                      <div className="rounded-md border border-border-secondary bg-bg-secondary px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                          RPE
                        </p>
                        <p className="mt-1 font-medium text-text-primary">
                          {entry?.rpe ?? "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <BubblesView
          players={players}
          selectedPlayerIds={selectedPlayerIds}
          onToggle={togglePlayerSelection}
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <Card className="gap-0 rounded-xl border-none bg-bg-primary py-0">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-base font-semibold text-text-primary">
              Resumen del equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2">
            <div className="rounded-lg bg-bg-secondary px-4 py-4 sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                    Formularios pendientes
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-text-primary">
                    {summary.preCompletedCount}/{filteredPlayers.length || 0}
                  </p>
                  <Badge className="mt-4" variant="destructive">
                    Faltan {summary.pendingCount}
                  </Badge>
                  
                </div>
                <PendingReminderDialog
                  evaluatedDate={evaluatedDate}
                  pendingCount={summary.pendingCount}
                />
              </div>
            </div>
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-lg bg-bg-secondary px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                    {card.title}
                  </p>
                  {card.icon}
                </div>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-text-secondary">{card.detail}</p>
              </div>
            ))}
            <div className="rounded-lg bg-bg-secondary px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                Recuperación media
              </p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {formatAverage(summary.recoveryAverage)}
              </p>
            </div>
            <div className="rounded-lg bg-bg-secondary px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                Energía media
              </p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {formatAverage(summary.energyAverage)}
              </p>
            </div>
            <div className="rounded-lg bg-bg-secondary px-4 py-3 sm:col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                Dolor muscular medio
              </p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {formatAverage(summary.sorenessAverage)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-xl border-none bg-bg-primary py-0">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-base font-semibold text-text-primary">
              Comparativa rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="border-b-0 border-t">
                  <TableHead className="pl-0 text-[11px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
                    Jugador
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
                    Pre
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
                    Post
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
                    Rec
                  </TableHead>
                  <TableHead className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
                    Ene
                  </TableHead>
                  <TableHead className="pr-0 text-[11px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
                    Riesgo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => {
                  const entry = player.entries[0];

                  return (
                    <TableRow key={player.id} className="">
                      <TableCell className="pl-0">
                        <Link className="font-medium hover:underline" href={`/players/${player.id}`}>
                          {player.name}
                        </Link>
                      </TableCell>
                      <TableCell>{entry?.preFilledAt ? "Ok" : "—"}</TableCell>
                      <TableCell>{entry?.postFilledAt ? "Ok" : "—"}</TableCell>
                      <TableCell>{entry?.recovery ?? "—"}</TableCell>
                      <TableCell>{entry?.energy ?? "—"}</TableCell>
                      <TableCell className="pr-0">
                        {getRiskLabel(player.stats[0]?.riskLevel)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type BubblesViewProperties = {
  readonly players: TeamWellnessPlayer[];
  readonly selectedPlayerIds: string[];
  readonly onToggle: (playerId: string) => void;
};

function BubblesView({
  players,
  selectedPlayerIds,
  onToggle,
}: BubblesViewProperties) {
  const activePlayers = players.filter(isPlayerActiveToday);
  const inactivePlayers = players.filter((player) => !isPlayerActiveToday(player));

  return (
    <div className="space-y-4">
      {activePlayers.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {activePlayers.map((player) => (
            <PlayerBubble
              key={player.id}
              isSelected={
                selectedPlayerIds.length === 0 ||
                selectedPlayerIds.includes(player.id)
              }
              onToggle={onToggle}
              player={player}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border-secondary bg-bg-secondary px-4 py-6 text-center text-sm text-text-secondary">
          Aún no hay actividad registrada hoy.
        </p>
      )}

      {inactivePlayers.length > 0 ? (
        <details className="group rounded-lg border border-border-secondary bg-bg-secondary/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm text-text-secondary">
            <span>Sin actividad hoy ({inactivePlayers.length})</span>
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-wrap gap-3 px-4 pb-4">
            {inactivePlayers.map((player) => (
              <PlayerBubble
                key={player.id}
                isSelected={
                  selectedPlayerIds.length === 0 ||
                  selectedPlayerIds.includes(player.id)
                }
                muted
                onToggle={onToggle}
                player={player}
              />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

type PlayerBubbleProperties = {
  readonly player: TeamWellnessPlayer;
  readonly isSelected: boolean;
  readonly muted?: boolean;
  readonly onToggle: (playerId: string) => void;
};

function PlayerBubble({
  player,
  isSelected,
  muted = false,
  onToggle,
}: PlayerBubbleProperties) {
  const state = getDailyPlayerState(player);

  return (
    <button
      className="group flex flex-col items-center gap-2"
      onClick={() => onToggle(player.id)}
      type="button"
    >
      <div className="relative">
        <Avatar
          className={cn(
            "size-16 rounded-full border-2 transition-all",
            isSelected
              ? "border-brand ring-4 ring-brand/10"
              : "border-border-secondary opacity-60",
            muted && "opacity-50"
          )}
        >
          <AvatarFallback className="bg-bg-secondary text-sm font-semibold text-text-primary">
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>
        {state === "ALERT" ? (
          <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-bg-primary bg-danger" />
        ) : null}
      </div>
      <p className="max-w-20 truncate text-xs font-medium text-text-primary">
        {player.name}
      </p>
    </button>
  );
}
