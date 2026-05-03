"use client";

import { SparklesIcon, Squares2X2Icon } from "@heroicons/react/20/solid";
import { cn } from "@repo/design-system/lib/utils";
import { useMemo, useState } from "react";
import { TeamWellnessBubblesView } from "./team-wellness-bubbles-view";
import { TeamWellnessOverview } from "./team-wellness-overview";
import { TeamWellnessPlayerCard } from "./team-wellness-player-card";
import { buildWellnessSummary } from "./team-wellness-workspace.utils";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";

type TeamWellnessWorkspaceProperties = {
  readonly evaluatedDate: string;
  readonly players: TeamWellnessPlayer[];
  readonly wellnessLimits?: WellnessLimits | null;
};

type WellnessViewMode = "cards" | "bubbles";

export function TeamWellnessWorkspace({
  evaluatedDate,
  players,
  wellnessLimits,
}: TeamWellnessWorkspaceProperties) {
  const [viewMode, setViewMode] = useState<WellnessViewMode>("cards");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const filteredPlayers = useMemo(() => {
    if (selectedPlayerIds.length === 0) {
      return players;
    }

    return players.filter((player) => selectedPlayerIds.includes(player.id));
  }, [players, selectedPlayerIds]);

  const summary = useMemo(
    () => buildWellnessSummary(filteredPlayers, wellnessLimits),
    [filteredPlayers, wellnessLimits]
  );

  const togglePlayerSelection = (playerId: string): void => {
    setSelectedPlayerIds((currentIds) => {
      if (currentIds.includes(playerId)) {
        return currentIds.filter((id) => id !== playerId);
      }

      return [...currentIds, playerId];
    });
  };

  return (
    <div className="space-y-6">
      <TeamWellnessOverview
        evaluatedDate={evaluatedDate}
        players={filteredPlayers}
        summary={summary}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-1 self-start rounded-md border border-border-tertiary bg-bg-primary p-0.5">
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
              viewMode === "cards"
                ? "bg-bg-secondary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
            onClick={() => setViewMode("cards")}
            type="button"
          >
            <Squares2X2Icon className="size-4" />
            Tarjetas
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
              viewMode === "bubbles"
                ? "bg-bg-secondary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
            onClick={() => setViewMode("bubbles")}
            type="button"
          >
            <SparklesIcon className="size-4" />
            Burbujas
          </button>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <p className="text-sm text-text-tertiary">
            {selectedPlayerIds.length > 0
              ? `${selectedPlayerIds.length} jugadores filtrados`
              : `${players.length} jugadores`}
          </p>
          {selectedPlayerIds.length > 0 ? (
            <button
              className="text-sm text-text-secondary hover:text-text-primary"
              onClick={() => setSelectedPlayerIds([])}
              type="button"
            >
              Quitar filtros
            </button>
          ) : null}
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredPlayers.map((player) => (
            <TeamWellnessPlayerCard
              key={player.id}
              player={player}
              wellnessLimits={wellnessLimits}
            />
          ))}
        </div>
      ) : (
        <TeamWellnessBubblesView
          players={players}
          selectedPlayerIds={selectedPlayerIds}
          onToggle={togglePlayerSelection}
          wellnessLimits={wellnessLimits}
        />
      )}
    </div>
  );
}
