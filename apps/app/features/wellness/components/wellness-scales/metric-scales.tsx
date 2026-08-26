import { cn } from "@repo/design-system/lib/utils";
import type { RiskLevel } from "@repo/database";
import {
  ScaleBattery,
  ScaleIntensity,
  ScaleSlider,
  ScaleStars,
  ScaleThermometer,
  type ScaleSize,
} from "./scale-primitives";
import type { WellnessTrafficTone } from "../team-wellness-workspace.utils";
import {
  toneForHigherIsWorse,
  toneForLowerIsBetter,
  wellnessValueClass,
} from "../team-wellness-workspace.utils";

type MetricScaleProps = {
  readonly size?: ScaleSize;
  readonly className?: string;
};

function trafficThumbClass(tone: WellnessTrafficTone): string {
  switch (tone) {
    case "good":
      return "bg-success";
    case "watch":
      return "bg-premium";
    case "bad":
      return "bg-danger";
    case "neutral":
      return "bg-text-secondary";
    default:
      return "bg-text-secondary";
  }
}

export function EmptyScale({
  className,
  label = "Sin datos",
}: {
  readonly className?: string;
  readonly label?: string;
}) {
  return (
    <span
      aria-label={label}
      className={cn("text-text-tertiary tabular-nums", className)}
    >
      —
    </span>
  );
}

export function clampScaleLevel(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Map staff risk enum to thermometer 1–5. */
export function riskLevelToThermometerLevel(
  riskLevel: RiskLevel | null | undefined
): number | null {
  switch (riskLevel) {
    case "CRITICAL":
      return 5;
    case "HIGH":
      return 4;
    case "MODERATE":
      return 3;
    case "LOW":
      return 2;
    default:
      return null;
  }
}

export function rpeLabel(value: number): string {
  if (value <= 2) {
    return "Muy suave";
  }
  if (value <= 4) {
    return "Ligero";
  }
  if (value <= 6) {
    return "Moderado";
  }
  if (value <= 8) {
    return "Exigente";
  }
  return "Máximo";
}

/** Same gravity bands as the RPE slider fill (0–10, higher is worse). */
export function rpeTrafficTone(value: number): WellnessTrafficTone {
  const ratio = value / 10;
  if (ratio <= 0.4) {
    return "good";
  }
  if (ratio <= 0.7) {
    return "watch";
  }
  return "bad";
}

export function RecoveryScale({
  value,
  size = "md",
  className,
  showLabel = false,
  alertAtOrBelow,
}: MetricScaleProps & {
  readonly value: number | null | undefined;
  readonly showLabel?: boolean;
  readonly alertAtOrBelow?: number | null;
}) {
  if (value === null || value === undefined) {
    return <EmptyScale label="Recuperación sin datos" />;
  }

  const level = clampScaleLevel(value, 0, 10);
  const tone =
    alertAtOrBelow === undefined
      ? null
      : toneForLowerIsBetter(level, alertAtOrBelow);
  return (
    <div aria-label={`Recuperación ${level} de 10`} className={className}>
      <ScaleSlider
        label={showLabel ? "TQR" : undefined}
        max={10}
        polarity="higherIsBetter"
        size={size}
        thumbClassName={tone ? trafficThumbClass(tone) : undefined}
        value={level}
      />
    </div>
  );
}

export function EnergyScale({
  value,
  size = "md",
  className,
  alertAtOrBelow,
}: MetricScaleProps & {
  readonly value: number | null | undefined;
  readonly alertAtOrBelow?: number | null;
}) {
  if (value === null || value === undefined) {
    return <EmptyScale label="Energía sin datos" />;
  }

  const level = clampScaleLevel(value, 1, 5);
  const tone =
    alertAtOrBelow === undefined
      ? null
      : toneForLowerIsBetter(level, alertAtOrBelow);
  return (
    <div
      aria-label={`Energía ${level} de 5`}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <ScaleBattery level={level} size={size} />
      {size === "md" ? (
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            tone ? wellnessValueClass(tone) : "text-text-primary"
          )}
        >
          {level}
        </span>
      ) : null}
    </div>
  );
}

export function SorenessScale({
  value,
  size = "md",
  className,
  alertAtOrAbove,
}: MetricScaleProps & {
  readonly value: number | null | undefined;
  readonly alertAtOrAbove?: number | null;
}) {
  if (value === null || value === undefined) {
    return <EmptyScale label="Agujetas sin datos" />;
  }

  const level = clampScaleLevel(value, 1, 5);
  const tone =
    alertAtOrAbove === undefined
      ? null
      : toneForHigherIsWorse(level, alertAtOrAbove);
  return (
    <div
      aria-label={`Agujetas ${level} de 5`}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <ScaleIntensity level={level} size={size} />
      {size === "md" ? (
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            tone ? wellnessValueClass(tone) : "text-text-primary"
          )}
        >
          {level}
        </span>
      ) : null}
    </div>
  );
}

export function SleepQualityScale({
  value,
  size = "md",
  className,
}: MetricScaleProps & {
  readonly value: number | null | undefined;
}) {
  if (value === null || value === undefined) {
    return <EmptyScale label="Sueño sin datos" />;
  }

  const level = clampScaleLevel(value, 1, 5);
  return (
    <div
      aria-label={`Calidad del sueño ${level} de 5`}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <ScaleStars level={level} size={size} />
      {size === "md" ? (
        <span className="text-sm font-semibold tabular-nums text-text-primary">
          {level}
        </span>
      ) : null}
    </div>
  );
}

export function RpeScale({
  value,
  size = "md",
  className,
  showLabel = false,
}: MetricScaleProps & {
  readonly value: number | null | undefined;
  readonly showLabel?: boolean;
}) {
  if (value === null || value === undefined) {
    return <EmptyScale label="RPE sin datos" />;
  }

  const level = clampScaleLevel(value, 0, 10);
  return (
    <div aria-label={`RPE ${level} de 10`} className={className}>
      <ScaleSlider
        label={showLabel ? rpeLabel(level) : undefined}
        max={10}
        polarity="higherIsWorse"
        size={size}
        value={level}
      />
    </div>
  );
}

export function RiskScale({
  riskLevel,
  size = "md",
  className,
  label,
}: MetricScaleProps & {
  readonly riskLevel: RiskLevel | null | undefined;
  readonly label?: string;
}) {
  const level = riskLevelToThermometerLevel(riskLevel);
  if (level === null) {
    return <EmptyScale label="Riesgo sin datos" />;
  }

  return (
    <div
      aria-label={label ? `Riesgo ${label}` : `Riesgo nivel ${level}`}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <ScaleThermometer level={level} size={size} />
      {label ? (
        <span className="text-sm font-semibold text-text-primary">{label}</span>
      ) : null}
    </div>
  );
}
