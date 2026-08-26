"use client";

import { SparkleIcon, SquaresFourIcon } from "@phosphor-icons/react/ssr";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/tabs";
import { useMemo, useState } from "react";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import { TeamWellnessBubblesView } from "./team-wellness-bubbles-view";
import { TeamWellnessComparisonTable } from "./team-wellness-comparison-table";
import { TeamWellnessOverview } from "./team-wellness-overview";
import { TeamWellnessPlayerCard } from "./team-wellness-player-card";
import { buildWellnessSummary } from "./team-wellness-workspace.utils";

type TeamWellnessWorkspaceProperties = {
  readonly evaluatedDate: string;
  readonly players: TeamWellnessPlayer[];
  readonly wellnessLimits?: WellnessLimits | null;
};

type WellnessViewMode = "cards" | "bubbles";

function isWellnessViewMode(value: string): value is WellnessViewMode {
  return value === "cards" || value === "bubbles";
}

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
      <Tabs
        onValueChange={(value) => {
          if (isWellnessViewMode(value)) {
            setViewMode(value);
          }
        }}
        value={viewMode}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList aria-label="Vista de bienestar del equipo">
            <TabsTrigger type="button" value="cards">
              <SquaresFourIcon className="size-4" />
              Tarjetas
            </TabsTrigger>
            <TabsTrigger type="button" value="bubbles">
              <SparkleIcon className="size-4" />
              Burbujas
            </TabsTrigger>
          </TabsList>

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

        <TeamWellnessOverview
          evaluatedDate={evaluatedDate}
          players={filteredPlayers}
          summary={summary}
          wellnessLimits={wellnessLimits}
        />

        <TabsContent className="mt-0 outline-none" value="cards">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filteredPlayers.map((player) => (
              <TeamWellnessPlayerCard
                key={player.id}
                player={player}
                wellnessLimits={wellnessLimits}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-0 outline-none" value="bubbles">
          <div className="space-y-6">
            <TeamWellnessBubblesView
              onToggle={togglePlayerSelection}
              players={players}
              selectedPlayerIds={selectedPlayerIds}
              wellnessLimits={wellnessLimits}
            />
            <TeamWellnessComparisonTable
              players={filteredPlayers}
              wellnessLimits={wellnessLimits}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
