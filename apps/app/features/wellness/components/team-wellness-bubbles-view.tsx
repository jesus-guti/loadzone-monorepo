import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { cn } from "@repo/design-system/lib/utils";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import {
  getDailyPlayerState,
  getInitials,
  isPlayerActiveToday,
} from "./team-wellness-workspace.utils";

type TeamWellnessBubblesViewProperties = {
  readonly players: TeamWellnessPlayer[];
  readonly selectedPlayerIds: string[];
  readonly onToggle: (playerId: string) => void;
  readonly wellnessLimits?: WellnessLimits | null;
};

export function TeamWellnessBubblesView({
  players,
  selectedPlayerIds,
  onToggle,
  wellnessLimits,
}: TeamWellnessBubblesViewProperties) {
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
              wellnessLimits={wellnessLimits}
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
                wellnessLimits={wellnessLimits}
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
  readonly wellnessLimits?: WellnessLimits | null;
};

function PlayerBubble({
  player,
  isSelected,
  muted = false,
  onToggle,
  wellnessLimits,
}: PlayerBubbleProperties) {
  const state = getDailyPlayerState(player, wellnessLimits);

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
