import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react/ssr";
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
  listPendingPlayers,
  type TeamWellnessWorkspaceSummary,
  toneAlertDensity,
  toneForHigherIsWorse,
  toneForLowerIsBetter,
  tonePendingWorkload,
  type WellnessTrafficTone,
  wellnessLabelClass,
  wellnessValueClass,
} from "./team-wellness-workspace.utils";
import {
  EnergyScale,
  RecoveryScale,
  RiskScale,
  SorenessScale,
} from "./wellness-scales";

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
      <TableCell className="hidden py-2 md:table-cell">
        <RecoveryScale
          alertAtOrBelow={wellnessLimits?.recovery ?? null}
          size="sm"
          value={entry?.recovery ?? null}
        />
      </TableCell>
      <TableCell className="hidden py-2 md:table-cell">
        <EnergyScale
          alertAtOrBelow={wellnessLimits?.energy ?? null}
          size="sm"
          value={entry?.energy ?? null}
        />
      </TableCell>
      <TableCell className="hidden py-2 md:table-cell">
        <SorenessScale
          alertAtOrAbove={wellnessLimits?.soreness ?? null}
          size="sm"
          value={entry?.soreness ?? null}
        />
      </TableCell>
      <TableCell className="py-2 pr-0">
        <RiskScale
          label={riskLevel ? getRiskLabel(riskLevel) : undefined}
          riskLevel={riskLevel}
          size="sm"
        />
      </TableCell>
    </TableRow>
  );
}

type AverageMeterProperties = {
  readonly label: string;
  readonly value: number | null;
  readonly percent: number | null;
  readonly tone: WellnessTrafficTone;
  /** Spectrum direction for the morphism fill (summary only). */
  readonly polarity?: "higherIsBetter" | "higherIsWorse";
};

function averageMorphFillClass(
  polarity: "higherIsBetter" | "higherIsWorse"
): string {
  return polarity === "higherIsWorse"
    ? "bg-gradient-to-r from-success via-premium to-danger"
    : "bg-gradient-to-r from-danger via-premium to-success";
}

function AverageMeter({
  label,
  value,
  percent,
  tone,
  polarity = "higherIsBetter",
}: AverageMeterProperties) {
  return (
    <div className="min-w-0 flex-1 space-y-1">
      <p className={cn("font-medium text-xs", wellnessLabelClass(tone))}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        <div
          aria-hidden={percent === null}
          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-bg-tertiary"
          role="presentation"
        >
          {percent === null ? null : (
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-200",
                averageMorphFillClass(polarity)
              )}
              style={{ width: `${percent}%` }}
            />
          )}
        </div>
        <p
          className={cn(
            "shrink-0 font-semibold text-sm tabular-nums",
            wellnessValueClass(tone)
          )}
        >
          {formatAverage(value)}
        </p>
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

        <div className="flex gap-4">
          <AverageMeter
            label="Recuperación media"
            percent={averageProgressPercent(
              summary.recoveryAverage,
              "recovery"
            )}
            polarity="higherIsBetter"
            tone={recoveryTone}
            value={summary.recoveryAverage}
          />
          <AverageMeter
            label="Energía media"
            percent={averageProgressPercent(summary.energyAverage, "energy")}
            polarity="higherIsBetter"
            tone={energyTone}
            value={summary.energyAverage}
          />
          <AverageMeter
            label="Dolor muscular"
            percent={averageProgressPercent(
              summary.sorenessAverage,
              "soreness"
            )}
            polarity="higherIsWorse"
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
              <TableHead className="pl-0">Jugador</TableHead>
              <TableHead className="">Pre</TableHead>
              <TableHead className="">Post</TableHead>
              <TableHead className="">Recuperación</TableHead>
              <TableHead className="">Energía</TableHead>
              <TableHead className="">Agujetas</TableHead>
              <TableHead className="">Riesgo</TableHead>
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
