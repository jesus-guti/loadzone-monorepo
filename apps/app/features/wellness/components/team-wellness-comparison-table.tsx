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
import type { ReactElement } from "react";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import {
  getLatestEntry,
  getRiskLabel,
  toneForLowerIsBetter,
  wellnessValueClass,
} from "./team-wellness-workspace.utils";
import {
  clampScaleLevel,
  EmptyScale,
  EnergyScale,
  RecoveryScale,
  RiskScale,
  SleepQualityScale,
  SorenessScale,
  rpeTrafficTone,
} from "./wellness-scales";

function formatSleepHours(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function SleepHoursNumber({
  value,
  alertAtOrBelow,
}: {
  readonly value: number | null;
  readonly alertAtOrBelow: number | null;
}): ReactElement {
  if (value === null) {
    return <EmptyScale label="Sueño sin datos" />;
  }

  const tone = toneForLowerIsBetter(value, alertAtOrBelow);

  return (
    <div
      aria-label={`Sueño ${formatSleepHours(value)} horas`}
      className={cn(
        "font-semibold text-sm tabular-nums",
        wellnessValueClass(tone)
      )}
    >
      {formatSleepHours(value)}
    </div>
  );
}

function RpeNumber({ value }: { readonly value: number | null }): ReactElement {
  if (value === null) {
    return <EmptyScale label="RPE sin datos" />;
  }

  const level = clampScaleLevel(value, 0, 10);
  const tone = rpeTrafficTone(level);

  return (
    <div
      aria-label={`RPE ${level} de 10`}
      className={cn(
        "font-semibold text-sm tabular-nums",
        wellnessValueClass(tone)
      )}
    >
      {level}
    </div>
  );
}

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
  const riskLabel = riskLevel ? getRiskLabel(riskLevel) : undefined;

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
      <TableCell className="hidden py-2 tabular-nums md:table-cell">
        <SleepHoursNumber
          alertAtOrBelow={wellnessLimits?.sleepHours ?? null}
          value={entry?.sleepHours ?? null}
        />
      </TableCell>
      <TableCell className="hidden py-2 md:table-cell">
        <SleepQualityScale size="sm" value={entry?.sleepQuality ?? null} />
      </TableCell>
      <TableCell className="hidden py-2 tabular-nums md:table-cell">
        <RpeNumber value={entry?.rpe ?? null} />
      </TableCell>
      <TableCell className="py-2 pr-0">
        <RiskScale
          label={riskLabel}
          riskLevel={riskLevel}
          size="sm"
        />
      </TableCell>
    </TableRow>
  );
}

type TeamWellnessComparisonTableProperties = {
  readonly players: TeamWellnessPlayer[];
  readonly wellnessLimits?: WellnessLimits | null;
};

export function TeamWellnessComparisonTable({
  players,
  wellnessLimits,
}: TeamWellnessComparisonTableProperties) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-0 hover:bg-transparent">
          <TableHead className="pl-0" rowSpan={2}>
            Jugador
          </TableHead>
          <TableHead className="text-center" colSpan={5}>
            Pre sesión
          </TableHead>
          <TableHead className="text-center">Post sesión</TableHead>
          <TableHead rowSpan={2}>Riesgo</TableHead>
        </TableRow>
        <TableRow className="border-0 hover:bg-transparent">
          <TableHead>Recuperación</TableHead>
          <TableHead>Energía</TableHead>
          <TableHead>Agujetas</TableHead>
          <TableHead>Sueño</TableHead>
          <TableHead>Calidad</TableHead>
          <TableHead>RPE</TableHead>
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
  );
}
