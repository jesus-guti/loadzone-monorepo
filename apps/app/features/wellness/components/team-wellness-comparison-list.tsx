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
    <p
      className={cn(
        "font-semibold text-sm tabular-nums",
        wellnessValueClass(tone)
      )}
    >
      {formatSleepHours(value)}
    </p>
  );
}

function RpeNumber({ value }: { readonly value: number | null }): ReactElement {
  if (value === null) {
    return <EmptyScale label="RPE sin datos" />;
  }

  const level = clampScaleLevel(value, 0, 10);
  const tone = rpeTrafficTone(level);

  return (
    <p
      className={cn(
        "font-semibold text-sm tabular-nums",
        wellnessValueClass(tone)
      )}
    >
      {level}
    </p>
  );
}

type MetricCellProperties = {
  readonly label: string;
  readonly children: ReactElement;
};

function MetricCell({ label, children }: MetricCellProperties): ReactElement {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs text-text-tertiary">{label}</p>
      {children}
    </div>
  );
}

type TeamWellnessComparisonListProperties = {
  readonly players: TeamWellnessPlayer[];
  readonly wellnessLimits?: WellnessLimits | null;
};

export function TeamWellnessComparisonList({
  players,
  wellnessLimits,
}: TeamWellnessComparisonListProperties) {
  return (
    <ul aria-label="Comparativa de bienestar" className="border-t border-border-tertiary">
      {players.map((player) => {
        const entry = getLatestEntry(player);
        const riskLevel = player.stats[0]?.riskLevel;
        const riskLabel =
          riskLevel === undefined ? undefined : getRiskLabel(riskLevel);

        return (
          <li
            className="border-b border-border-tertiary py-3"
            key={player.id}
          >
            <Link
              className="font-medium text-text-primary hover:text-brand"
              href={`/players/${player.id}`}
            >
              {player.name}
            </Link>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MetricCell label="Recuperación">
                <RecoveryScale
                  alertAtOrBelow={wellnessLimits?.recovery ?? null}
                  size="sm"
                  value={entry?.recovery ?? null}
                />
              </MetricCell>
              <MetricCell label="Energía">
                <EnergyScale
                  alertAtOrBelow={wellnessLimits?.energy ?? null}
                  size="sm"
                  value={entry?.energy ?? null}
                />
              </MetricCell>
              <MetricCell label="Agujetas">
                <SorenessScale
                  alertAtOrAbove={wellnessLimits?.soreness ?? null}
                  size="sm"
                  value={entry?.soreness ?? null}
                />
              </MetricCell>
              <MetricCell label="Sueño">
                <SleepHoursNumber
                  alertAtOrBelow={wellnessLimits?.sleepHours ?? null}
                  value={entry?.sleepHours ?? null}
                />
              </MetricCell>
              <MetricCell label="Calidad">
                <SleepQualityScale
                  size="sm"
                  value={entry?.sleepQuality ?? null}
                />
              </MetricCell>
              <MetricCell label="RPE">
                <RpeNumber value={entry?.rpe ?? null} />
              </MetricCell>
              <MetricCell label="Riesgo">
                <RiskScale
                  label={riskLabel}
                  riskLevel={riskLevel}
                  size="sm"
                />
              </MetricCell>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
