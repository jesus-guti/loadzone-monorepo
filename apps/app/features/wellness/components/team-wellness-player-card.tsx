import {
  CheckCircleIcon,
  WarningIcon,
  FireIcon,
  ShieldWarningIcon,
} from "@phosphor-icons/react/ssr";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import Link from "next/link";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
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
  const avatarBadgeIcon = injuryLabel ? (
    <ShieldWarningIcon className="size-3 text-premium" />
  ) : (
    <WarningIcon className="size-3 text-danger" />
  );

  return (
    <Link href={`/players/${player.id}`}>
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
                  key={alert}
                  className="rounded-md border-danger/40 text-danger"
                  variant="outline"
                >
                  {alert}
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
                {getRiskLabel(riskLevel)}
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
}
