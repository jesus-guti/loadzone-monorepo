import {
  CheckCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/table";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import { PendingReminderDialog } from "./pending-reminder-dialog";
import {
  averageProgressPercent,
  formatAverage,
  getInitials,
  getLatestEntry,
  getRiskLabel,
  getRiskValueClassName,
  listPendingPlayers,
  type TeamWellnessWorkspaceSummary,
  type WellnessTrafficTone,
  toneAlertDensity,
  toneForHigherIsWorse,
  toneForLowerIsBetter,
  tonePendingWorkload,
  wellnessLabelClass,
  wellnessValueClass,
} from "./team-wellness-workspace.utils";

type TeamWellnessComparisonRowProperties = {
  readonly player: TeamWellnessPlayer;
  readonly wellnessLimits?: WellnessLimits | null;
};

function TeamWellnessComparisonRow({
  player,
  wellnessLimits,
}: TeamWellnessComparisonRowProperties) {
  const entry = getLatestEntry(player);
  const riskLevel = player.stats[0]?.riskLevel;
  const recoveryCellTone = toneForLowerIsBetter(
    entry?.recovery ?? null,
    wellnessLimits?.recovery ?? null
  );
  const energyCellTone = toneForLowerIsBetter(
    entry?.energy ?? null,
    wellnessLimits?.energy ?? null
  );

  return (
    <TableRow className="border-0 hover:bg-bg-secondary/40">
      <TableCell className="py-2 pl-0">
        <Link
          className="font-medium text-text-primary hover:text-brand"
          href={`/players/${player.id}`}
        >
          {player.name}
        </Link>
      </TableCell>
      <TableCell
        className={cn(
          "hidden py-2 tabular-nums md:table-cell",
          entry?.preFilledAt ? "font-medium text-success" : "text-text-tertiary"
        )}
      >
        {entry?.preFilledAt ? "Sí" : "—"}
      </TableCell>
      <TableCell
        className={cn(
          "hidden py-2 tabular-nums md:table-cell",
          entry?.postFilledAt
            ? "font-medium text-success"
            : "text-text-tertiary"
        )}
      >
        {entry?.postFilledAt ? "Sí" : "—"}
      </TableCell>
      <TableCell
        className={cn(
          "hidden py-2 tabular-nums md:table-cell",
          wellnessValueClass(recoveryCellTone)
        )}
      >
        {entry?.recovery ?? "—"}
      </TableCell>
      <TableCell
        className={cn(
          "hidden py-2 tabular-nums md:table-cell",
          wellnessValueClass(energyCellTone)
        )}
      >
        {entry?.energy ?? "—"}
      </TableCell>
      <TableCell
        className={cn(
          "py-2 pr-0 tabular-nums",
          getRiskValueClassName(riskLevel)
        )}
      >
        {getRiskLabel(riskLevel)}
      </TableCell>
    </TableRow>
  );
}

type AverageMeterProperties = {
  readonly label: string;
  readonly value: number | null;
  readonly percent: number | null;
  readonly tone: WellnessTrafficTone;
};

function averageFillClass(tone: WellnessTrafficTone): string {
  switch (tone) {
    case "good":
      return "bg-success";
    case "watch":
      return "bg-premium";
    case "bad":
      return "bg-danger";
    default:
      return "bg-brand";
  }
}

function AverageMeter({
  label,
  value,
  percent,
  tone,
}: AverageMeterProperties) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className={cn("font-medium text-xs", wellnessLabelClass(tone))}>
          {label}
        </p>
        <p
          className={cn(
            "font-semibold text-sm tabular-nums",
            wellnessValueClass(tone)
          )}
        >
          {formatAverage(value)}
        </p>
      </div>
      <div
        aria-hidden={percent === null}
        className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary"
        role="presentation"
      >
        {percent === null ? null : (
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-200",
              averageFillClass(tone)
            )}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}

type PendingPlayerBubbleProperties = {
  readonly player: TeamWellnessPlayer;
};

function PendingPlayerBubble({ player }: PendingPlayerBubbleProperties) {
  return (
    <Link
      className="group shrink-0"
      href={`/players/${player.id}`}
      title={player.name}
    >
      <Avatar
        className="size-8 rounded-full border border-border-tertiary transition-colors group-hover:border-brand/50"
        size="default"
      >
        {player.imageUrl ? (
          <AvatarImage
            alt={player.name}
            className="object-cover"
            src={player.imageUrl}
          />
        ) : null}
        <AvatarFallback className="bg-bg-secondary text-[10px] font-semibold text-text-primary">
          {getInitials(player.name)}
        </AvatarFallback>
      </Avatar>
      <span className="sr-only">{player.name}</span>
    </Link>
  );
}

type TeamWellnessOverviewProperties = {
  readonly evaluatedDate: string;
  readonly players: TeamWellnessPlayer[];
  readonly summary: TeamWellnessWorkspaceSummary;
  readonly wellnessLimits?: WellnessLimits | null;
};

export function TeamWellnessOverview({
  evaluatedDate,
  players,
  summary,
  wellnessLimits,
}: TeamWellnessOverviewProperties) {
  const totalPlayers = players.length;
  const pendingPlayers = listPendingPlayers(players);
  const hasPending = pendingPlayers.length > 0;
  const pendingTone = tonePendingWorkload(summary.pendingCount, totalPlayers);
  const alertTone = toneAlertDensity(summary.alertCount, totalPlayers);
  const recoveryTone =
    typeof summary.recoveryAverage !== "number"
      ? "neutral"
      : toneForLowerIsBetter(
          summary.recoveryAverage,
          wellnessLimits?.recovery ?? null
        );
  const energyTone =
    typeof summary.energyAverage !== "number"
      ? "neutral"
      : toneForLowerIsBetter(
          summary.energyAverage,
          wellnessLimits?.energy ?? null
        );
  const sorenessTone =
    typeof summary.sorenessAverage !== "number"
      ? "neutral"
      : toneForHigherIsWorse(
          summary.sorenessAverage,
          wellnessLimits?.soreness ?? null
        );

  return (
    <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
      <div className="min-w-0 space-y-6">
        <div
          className={cn(
            "flex items-start justify-between gap-4 rounded-md",
            hasPending ? "bg-bg-secondary/80 px-3 py-2.5" : null
          )}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <p
              className={cn(
                "flex items-center gap-1.5 font-medium text-xs",
                wellnessLabelClass(pendingTone)
              )}
            >
              {hasPending ? (
                <WarningIcon className="size-3.5 shrink-0" weight="fill" />
              ) : (
                <CheckCircleIcon className="size-3.5 shrink-0" weight="fill" />
              )}
              Formularios pendientes
            </p>
            {hasPending ? (
              <div className="flex flex-wrap gap-1.5">
                {pendingPlayers.map((player) => (
                  <PendingPlayerBubble key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-success">Todo al día</p>
            )}
          </div>
          <PendingReminderDialog
            evaluatedDate={evaluatedDate}
            pendingCount={summary.pendingCount}
          />
        </div>

        <div className="space-y-4">
          <AverageMeter
            label="Recuperación media"
            percent={averageProgressPercent(
              summary.recoveryAverage,
              "recovery"
            )}
            tone={recoveryTone}
            value={summary.recoveryAverage}
          />
          <AverageMeter
            label="Energía media"
            percent={averageProgressPercent(summary.energyAverage, "energy")}
            tone={energyTone}
            value={summary.energyAverage}
          />
          <AverageMeter
            label="Dolor muscular"
            percent={averageProgressPercent(
              summary.sorenessAverage,
              "soreness"
            )}
            tone={sorenessTone}
            value={summary.sorenessAverage}
          />
        </div>

        {summary.alertCount > 0 ? (
          <div className="flex items-center gap-2">
            <WarningIcon
              className={cn("size-4 shrink-0", wellnessValueClass(alertTone))}
              weight="fill"
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "font-medium text-xs",
                  wellnessLabelClass(alertTone)
                )}
              >
                Alertas
              </p>
              <p
                className={cn(
                  "font-semibold text-xl tabular-nums",
                  wellnessValueClass(alertTone)
                )}
              >
                {summary.alertCount}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="h-8 pl-0 font-medium text-text-tertiary text-xs">
                Jugador
              </TableHead>
              <TableHead className="hidden h-8 font-medium text-text-tertiary text-xs md:table-cell">
                Pre
              </TableHead>
              <TableHead className="hidden h-8 font-medium text-text-tertiary text-xs md:table-cell">
                Post
              </TableHead>
              <TableHead className="hidden h-8 font-medium text-text-tertiary text-xs md:table-cell">
                Recuperación
              </TableHead>
              <TableHead className="hidden h-8 font-medium text-text-tertiary text-xs md:table-cell">
                Energía
              </TableHead>
              <TableHead className="h-8 pr-0 font-medium text-text-tertiary text-xs">
                Riesgo
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TeamWellnessComparisonRow
                key={player.id}
                player={player}
                wellnessLimits={wellnessLimits}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
