import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import { PendingReminderDialog } from "./pending-reminder-dialog";
import {
  formatAverage,
  getLatestEntry,
  getRiskLabel,
  getRiskValueClassName,
  type TeamWellnessWorkspaceSummary,
  toneAlertDensity,
  toneCompletionRatio,
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
  const hasPending = summary.pendingCount > 0;
  const pendingTone = tonePendingWorkload(summary.pendingCount, totalPlayers);
  const preTone = toneCompletionRatio(summary.preCompletedCount, totalPlayers);
  const postTone = toneCompletionRatio(
    summary.postCompletedCount,
    totalPlayers
  );
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
            "flex items-center justify-between gap-4 rounded-md",
            hasPending ? "bg-bg-secondary/80 px-3 py-2.5" : null
          )}
        >
          <div className="min-w-0">
            <p
              className={cn(
                "flex items-center gap-1.5 font-medium text-xs",
                wellnessLabelClass(pendingTone)
              )}
            >
              {hasPending ? (
                <ExclamationTriangleIcon className="size-3.5 shrink-0" />
              ) : (
                <CheckCircleIcon className="size-3.5 shrink-0" />
              )}
              Formularios pendientes
            </p>
            <p
              className={cn(
                "mt-1 font-semibold text-3xl tabular-nums",
                wellnessValueClass(pendingTone)
              )}
            >
              {summary.preCompletedCount}/{totalPlayers}
            </p>
            {hasPending ? (
              <p className="mt-1 text-danger text-sm">
                Faltan {summary.pendingCount}
              </p>
            ) : (
              <p className="mt-1 text-sm text-success">Todo al día</p>
            )}
          </div>
          <PendingReminderDialog
            evaluatedDate={evaluatedDate}
            pendingCount={summary.pendingCount}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <p
              className={cn(
                "font-medium text-xs",
                wellnessLabelClass(pendingTone)
              )}
            >
              Prioridad hoy
            </p>
            <p
              className={cn(
                "mt-1 font-semibold text-2xl tabular-nums",
                wellnessValueClass(pendingTone)
              )}
            >
              {summary.pendingCount}
            </p>
          </div>
          <div>
            <p
              className={cn("font-medium text-xs", wellnessLabelClass(preTone))}
            >
              Pre completada
            </p>
            <p
              className={cn(
                "mt-1 font-semibold text-2xl tabular-nums",
                wellnessValueClass(preTone)
              )}
            >
              {summary.preCompletedCount}/{totalPlayers}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "font-medium text-xs",
                wellnessLabelClass(postTone)
              )}
            >
              Post completada
            </p>
            <p
              className={cn(
                "mt-1 font-semibold text-2xl tabular-nums",
                wellnessValueClass(postTone)
              )}
            >
              {summary.postCompletedCount}/{totalPlayers}
            </p>
          </div>
          <div>
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
                "mt-1 font-semibold text-2xl tabular-nums",
                wellnessValueClass(alertTone)
              )}
            >
              {summary.alertCount}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "font-medium text-xs",
                wellnessLabelClass(recoveryTone)
              )}
            >
              Recuperación media
            </p>
            <p
              className={cn(
                "mt-1 font-semibold text-2xl tabular-nums",
                wellnessValueClass(recoveryTone)
              )}
            >
              {formatAverage(summary.recoveryAverage)}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "font-medium text-xs",
                wellnessLabelClass(energyTone)
              )}
            >
              Energía media
            </p>
            <p
              className={cn(
                "mt-1 font-semibold text-2xl tabular-nums",
                wellnessValueClass(energyTone)
              )}
            >
              {formatAverage(summary.energyAverage)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p
              className={cn(
                "font-medium text-xs",
                wellnessLabelClass(sorenessTone)
              )}
            >
              Dolor muscular
            </p>
            <p
              className={cn(
                "mt-1 font-semibold text-2xl tabular-nums",
                wellnessValueClass(sorenessTone)
              )}
            >
              {formatAverage(summary.sorenessAverage)}
            </p>
          </div>
        </div>
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
