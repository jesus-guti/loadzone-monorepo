import {
  CheckCircleIcon,
  WarningIcon,
  ShieldWarningIcon,
} from "@phosphor-icons/react/ssr";
import { StreakFireIcon } from "@repo/design-system/components/streak-fire-icon";
import { STREAK_FIRE_TONE } from "@repo/design-system/lib/streak-fire-tones";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/avatar";
import { Badge } from "@repo/design-system/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/card";
import Link from "next/link";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import {
  EnergyScale,
  RecoveryScale,
  RiskScale,
  RpeScale,
  SorenessScale,
} from "./wellness-scales";
import {
  getDailyPlayerState,
  getInitials,
  getInjuryLabel,
  getLatestEntry,
  getRiskLabel,
  getWellnessAlerts,
  hasCriticalRisk,
} from "./team-wellness-workspace.utils";

type TeamWellnessPlayerCardProperties = {
  readonly player: TeamWellnessPlayer;
  readonly wellnessLimits?: WellnessLimits | null;
};

export function TeamWellnessPlayerCard({
  player,
  wellnessLimits,
}: TeamWellnessPlayerCardProperties) {
  const entry = getLatestEntry(player);
  const state = getDailyPlayerState(player, wellnessLimits);
  const injuryLabel = getInjuryLabel(player.status);
  const riskLevel = player.stats[0]?.riskLevel;
  const hasPhysio = Boolean(entry?.physioAlert);
  const showAvatarBadge = state === "ALERT" || Boolean(injuryLabel);
  const wellnessAlerts = getWellnessAlerts(entry, wellnessLimits);
  const hasEntryMetrics = Boolean(
    entry &&
      (entry.recovery !== null ||
        entry.energy !== null ||
        entry.soreness !== null ||
        entry.rpe !== null)
  );
  const avatarBadgeIcon = injuryLabel ? (
    <ShieldWarningIcon className="size-3 text-premium" />
  ) : (
    <WarningIcon className="size-3 text-danger" />
  );

  return (
    <Link
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
      href={`/players/${player.id}`}
    >
      <Card className="flex h-full flex-col gap-3 rounded-none border-0 bg-bg-tertiary p-4 ring-0 shadow-none">
        <CardHeader className="flex flex-col items-start gap-2 rounded-none px-0 pb-0">
          <div className="relative shrink-0">
            <Avatar className="size-16 border border-border-tertiary">
              {player.imageUrl ? (
                <AvatarImage
                  alt={player.name}
                  className="object-cover"
                  src={player.imageUrl}
                />
              ) : null}
              <AvatarFallback className="bg-bg-secondary text-base font-semibold text-text-primary">
                {getInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            {showAvatarBadge ? (
              <span className="glass-surface absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full">
                {avatarBadgeIcon}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 w-full space-y-1">
            <CardTitle className="flex items-center gap-1.5 truncate text-base text-text-primary">
              <span className="truncate">{player.name}</span>
              {state === "COMPLETED" && !injuryLabel ? (
                <CheckCircleIcon className="size-4 shrink-0 text-brand" />
              ) : null}
            </CardTitle>
            {player.currentStreak > 0 ? (
              <span className="flex items-center gap-1 text-xs font-medium text-text-secondary">
                <StreakFireIcon
                  className="size-3"
                  backColor={STREAK_FIRE_TONE.back}
                  frontColor={STREAK_FIRE_TONE.front}
                />
                {player.currentStreak}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-0 pb-0">
          {state === "ALERT" ||
          state === "NOT_COMPLETED" ||
          state === "EXEMPTED" ||
          injuryLabel ? (
            <div className="flex flex-wrap items-center gap-2">
              {hasPhysio ? (
                <Badge className="rounded-md" variant="destructive">
                  Fisio
                </Badge>
              ) : null}
              {hasCriticalRisk(riskLevel) ? (
                <Badge className="rounded-md" variant="destructive">
                  Riesgo alto
                </Badge>
              ) : null}
              {wellnessAlerts.map((alert) => (
                <Badge
                  key={alert.metric}
                  className={
                    alert.careRelevant
                      ? "rounded-md"
                      : "rounded-md border-border-secondary text-text-secondary"
                  }
                  variant={alert.careRelevant ? "destructive" : "outline"}
                >
                  {alert.label}
                </Badge>
              ))}
              {state === "NOT_COMPLETED" ? (
                <Badge
                  className="rounded-md bg-bg-secondary text-text-secondary"
                  variant="secondary"
                >
                  Pendiente
                </Badge>
              ) : null}
              {state === "EXEMPTED" ? (
                <Badge
                  className="rounded-md border-border-secondary text-text-secondary"
                  variant="outline"
                >
                  Exento
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

          {hasEntryMetrics ? (
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-xs text-text-tertiary">Recuperación</p>
                <RecoveryScale
                  alertAtOrBelow={wellnessLimits?.recovery ?? null}
                  size="md"
                  value={entry?.recovery ?? null}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-text-tertiary">Energía</p>
                  <EnergyScale
                    alertAtOrBelow={wellnessLimits?.energy ?? null}
                    size="md"
                    value={entry?.energy ?? null}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-tertiary">Agujetas</p>
                  <SorenessScale
                    alertAtOrAbove={wellnessLimits?.soreness ?? null}
                    size="md"
                    value={entry?.soreness ?? null}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-text-tertiary">RPE</p>
                  <RpeScale size="md" value={entry?.rpe ?? null} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-tertiary">Riesgo</p>
                  <RiskScale
                    label={riskLevel ? getRiskLabel(riskLevel) : undefined}
                    riskLevel={riskLevel}
                    size="md"
                  />
                </div>
              </div>
            </div>
          ) : riskLevel ? (
            <div className="space-y-1">
              <p className="text-xs text-text-tertiary">Riesgo</p>
              <RiskScale
                label={getRiskLabel(riskLevel)}
                riskLevel={riskLevel}
                size="md"
              />
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">
              Sin registro de wellness hoy.
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
