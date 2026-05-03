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
import Link from "next/link";
import { PendingReminderDialog } from "./pending-reminder-dialog";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import {
  formatAverage,
  getLatestEntry,
  getRiskLabel,
  type TeamWellnessWorkspaceSummary,
} from "./team-wellness-workspace.utils";

type TeamWellnessOverviewProperties = {
  readonly evaluatedDate: string;
  readonly players: TeamWellnessPlayer[];
  readonly summary: TeamWellnessWorkspaceSummary;
};

export function TeamWellnessOverview({
  evaluatedDate,
  players,
  summary,
}: TeamWellnessOverviewProperties) {
  const totalPlayers = players.length;
  const hasPending = summary.pendingCount > 0;

  return (
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
              {players.map((player) => {
                const entry = getLatestEntry(player);

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
  );
}
