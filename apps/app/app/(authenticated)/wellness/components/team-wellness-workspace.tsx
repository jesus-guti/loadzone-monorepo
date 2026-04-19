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
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Badge } from "@repo/design-system/components/ui/badge";
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
  const totalPlayers = filteredPlayers.length || 0;
  const hasPending = summary.pendingCount > 0;

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
        <div className="inline-flex items-center gap-1 self-start rounded-md border border-border-tertiary bg-bg-primary p-0.5">
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
              viewMode === "cards"
                ? "bg-bg-secondary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
            onClick={() => setViewMode("cards")}
            type="button"
          >
            <Squares2X2Icon className="size-4" />
            Tarjetas
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
              viewMode === "bubbles"
                ? "bg-bg-secondary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
            onClick={() => setViewMode("bubbles")}
            type="button"
          >
            <SparklesIcon className="size-4" />
            Burbujas
          </button>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <p className="text-sm text-text-tertiary">
            {selectedPlayerIds.length > 0
              ? `${selectedPlayerIds.length} jugadores filtrados`
              : `${players.length} jugadores`}
          </p>
          {selectedPlayerIds.length > 0 ? (
            <button
              className="text-sm text-text-secondary hover:text-text-primary"
              onClick={() => setSelectedPlayerIds([])}
              type="button"
            >
              Quitar filtros
            </button>
          ) : null}
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredPlayers.map((player) => {
            const entry = player.entries[0];
            const state = getDailyPlayerState(player);
            const injuryLabel = getInjuryLabel(player.status);
            const alertLabel = entry?.physioAlert ? "Fisio" : "Riesgo alto";
            const showAvatarBadge = state === "ALERT" || Boolean(injuryLabel);
            const avatarBadgeIcon = injuryLabel ? (
              <ShieldExclamationIcon className="size-3 text-premium" />
            ) : (
              <ExclamationTriangleIcon className="size-3 text-danger" />
            );

            return (
              <Link key={player.id} href={`/players/${player.id}`}>
                <Card className="bevel-card h-full gap-4 rounded-lg border-border-tertiary bg-bg-primary p-4 transition-colors hover:border-border-secondary">
                  <CardHeader className="flex flex-row items-start justify-between gap-3 px-0 pb-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative shrink-0">
                        <Avatar className="size-11 rounded-2xl border border-border-tertiary">
                          {player.imageUrl ? (
                            <AvatarImage
                              alt={player.name}
                              className="object-cover"
                              src={player.imageUrl}
                            />
                          ) : null}
                          <AvatarFallback className="rounded-2xl bg-bg-secondary text-sm font-semibold text-text-primary">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        {showAvatarBadge ? (
                          <span className="glass-surface absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full">
                            {avatarBadgeIcon}
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-1.5 truncate text-base text-text-primary">
                          <span className="truncate">{player.name}</span>
                          {state === "COMPLETED" && !injuryLabel ? (
                            <CheckCircleIcon className="size-4 shrink-0 text-brand" />
                          ) : null}
                        </CardTitle>
                      </div>
                    </div>
                    {player.currentStreak > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-text-secondary">
                        <FireIcon className="size-3 text-premium" />
                        {player.currentStreak}
                      </span>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-4 px-0 pb-0">
                    {state === "ALERT" || state === "NOT_COMPLETED" || injuryLabel ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {state === "ALERT" ? (
                          <Badge className="rounded-md" variant="destructive">
                            {alertLabel}
                          </Badge>
                        ) : null}
                        {state === "NOT_COMPLETED" ? (
                          <Badge
                            className="rounded-md bg-bg-secondary text-text-secondary"
                            variant="secondary"
                          >
                            Pendiente
                          </Badge>
                        ) : null}
                        {injuryLabel ? (
                          <Badge
                            className="rounded-md border-premium/40 text-premium"
                            variant="outline"
                          >
                            {injuryLabel}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-tertiary">Riesgo</p>
                        <p className="mt-1 text-base font-semibold text-text-primary">
                          {getRiskLabel(player.stats[0]?.riskLevel)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">RPE</p>
                        <p className="mt-1 text-base font-semibold text-text-primary tabular-nums">
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
        <Card className="bevel-card gap-0 rounded-lg border-border-tertiary bg-bg-primary p-5">
          <CardHeader className="px-0 pb-0">
            <CardTitle className="text-base font-semibold text-text-primary">
              Resumen del equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div
              className={cn(
                "mt-4 flex items-center justify-between gap-4",
                hasPending ? "border-l-2 border-brand pl-4" : null
              )}
            >
              <div className="min-w-0">
                <p className="text-base font-medium text-text-primary">
                  Formularios pendientes
                </p>
                <p className="mt-1 text-3xl font-semibold text-text-primary tabular-nums">
                  {summary.preCompletedCount}/{totalPlayers}
                </p>
                {hasPending ? (
                  <p className="mt-1 text-sm text-danger">
                    Faltan {summary.pendingCount}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-text-tertiary">Todo al día</p>
                )}
              </div>
              <PendingReminderDialog
                evaluatedDate={evaluatedDate}
                pendingCount={summary.pendingCount}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-xs text-text-tertiary">Prioridad hoy</p>
                <p className="mt-1 text-2xl font-semibold text-text-primary tabular-nums">
                  {summary.pendingCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Pre completada</p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-semibold tabular-nums",
                    summary.preCompletedCount === totalPlayers && totalPlayers > 0
                      ? "text-brand"
                      : "text-text-primary"
                  )}
                >
                  {summary.preCompletedCount}/{totalPlayers}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Post completada</p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-semibold tabular-nums",
                    summary.postCompletedCount === totalPlayers && totalPlayers > 0
                      ? "text-brand"
                      : "text-text-primary"
                  )}
                >
                  {summary.postCompletedCount}/{totalPlayers}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Alertas</p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-semibold tabular-nums",
                    summary.alertCount > 0 ? "text-danger" : "text-text-primary"
                  )}
                >
                  {summary.alertCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Recuperación media</p>
                <p className="mt-1 text-2xl font-semibold text-text-primary tabular-nums">
                  {formatAverage(summary.recoveryAverage)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Energía media</p>
                <p className="mt-1 text-2xl font-semibold text-text-primary tabular-nums">
                  {formatAverage(summary.energyAverage)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-text-tertiary">Dolor muscular</p>
                <p className="mt-1 text-2xl font-semibold text-text-primary tabular-nums">
                  {formatAverage(summary.sorenessAverage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bevel-card gap-0 rounded-lg border-border-tertiary bg-bg-primary p-5">
          <CardHeader className="px-0 pb-0">
            <CardTitle className="text-base font-semibold text-text-primary">
              Comparativa rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table className="mt-4">
              <TableHeader>
                <TableRow className="border-b-0 border-t-0 hover:bg-transparent">
                  <TableHead className="pl-0 text-xs font-medium text-text-tertiary">
                    Jugador
                  </TableHead>
                  <TableHead className="hidden text-xs font-medium text-text-tertiary md:table-cell">
                    Pre
                  </TableHead>
                  <TableHead className="hidden text-xs font-medium text-text-tertiary md:table-cell">
                    Post
                  </TableHead>
                  <TableHead className="hidden text-xs font-medium text-text-tertiary md:table-cell">
                    Recuperación
                  </TableHead>
                  <TableHead className="hidden text-xs font-medium text-text-tertiary md:table-cell">
                    Energía
                  </TableHead>
                  <TableHead className="pr-0 text-xs font-medium text-text-tertiary">
                    Riesgo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => {
                  const entry = player.entries[0];

                  return (
                    <TableRow
                      key={player.id}
                      className="border-t border-border-tertiary"
                    >
                      <TableCell className="py-3 pl-0">
                        <Link
                          className="font-medium text-text-primary hover:text-brand"
                          href={`/players/${player.id}`}
                        >
                          {player.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden py-3 tabular-nums text-text-secondary md:table-cell">
                        {entry?.preFilledAt ? "Ok" : "—"}
                      </TableCell>
                      <TableCell className="hidden py-3 tabular-nums text-text-secondary md:table-cell">
                        {entry?.postFilledAt ? "Ok" : "—"}
                      </TableCell>
                      <TableCell className="hidden py-3 tabular-nums text-text-secondary md:table-cell">
                        {entry?.recovery ?? "—"}
                      </TableCell>
                      <TableCell className="hidden py-3 tabular-nums text-text-secondary md:table-cell">
                        {entry?.energy ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 pr-0 text-text-secondary">
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
    <div>
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
        <p className="py-10 text-center text-sm text-text-secondary">
          Aún no hay actividad registrada hoy.
        </p>
      )}

      {inactivePlayers.length > 0 ? (
        <details className="group mt-6 border-t border-border-tertiary">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-sm text-text-secondary">
            <span>Sin actividad hoy ({inactivePlayers.length})</span>
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-wrap gap-3 pb-4 pt-2">
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
            "size-16 rounded-full transition-colors",
            isSelected
              ? "ring-2 ring-brand/40"
              : "border border-border-tertiary opacity-80",
            muted && "opacity-50"
          )}
        >
          {player.imageUrl ? (
            <AvatarImage
              alt={player.name}
              className="object-cover"
              src={player.imageUrl}
            />
          ) : null}
          <AvatarFallback className="bg-bg-secondary text-sm font-semibold text-text-primary">
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>
        {state === "ALERT" ? (
          <span className="glass-surface absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-bg-primary bg-danger/90" />
        ) : null}
      </div>
      <p
        className={cn(
          "max-w-20 truncate text-xs",
          isSelected ? "font-medium text-text-primary" : "text-text-secondary"
        )}
      >
        {player.name}
      </p>
    </button>
  );
}
