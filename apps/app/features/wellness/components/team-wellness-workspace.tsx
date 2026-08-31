"use client";

import { ListBulletsIcon, SquaresFourIcon } from "@phosphor-icons/react/ssr";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/tabs";
import { useMemo, useState } from "react";
import type { TeamWellnessPlayer } from "@/lib/team-wellness";
import type { WellnessLimits } from "@/lib/wellness-limits";
import { TeamWellnessComparisonList } from "./team-wellness-comparison-list";
import { TeamWellnessComparisonTable } from "./team-wellness-comparison-table";
import { TeamWellnessOverview } from "./team-wellness-overview";
import { TeamWellnessPlayerCard } from "./team-wellness-player-card";
import { buildWellnessSummary } from "./team-wellness-workspace.utils";

type TeamWellnessWorkspaceProperties = {
  readonly evaluatedDate: string;
  readonly players: TeamWellnessPlayer[];
  readonly wellnessLimits?: WellnessLimits | null;
};

type WellnessViewMode = "cards" | "list";

function isWellnessViewMode(value: string): value is WellnessViewMode {
  return value === "cards" || value === "list";
}

export function TeamWellnessWorkspace({
  evaluatedDate,
  players,
  wellnessLimits,
}: TeamWellnessWorkspaceProperties) {
  const [viewMode, setViewMode] = useState<WellnessViewMode>("cards");

  const summary = useMemo(
    () => buildWellnessSummary(players, wellnessLimits),
    [players, wellnessLimits]
  );

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
            <TabsTrigger type="button" value="list">
              <ListBulletsIcon className="size-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <p className="self-start text-sm text-text-tertiary sm:self-auto">
            {players.length} jugadores
          </p>
        </div>

        <TeamWellnessOverview
          evaluatedDate={evaluatedDate}
          players={players}
          summary={summary}
          wellnessLimits={wellnessLimits}
        />

        <TabsContent className="mt-0 outline-none" value="cards">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {players.map((player) => (
              <TeamWellnessPlayerCard
                key={player.id}
                player={player}
                wellnessLimits={wellnessLimits}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-0 outline-none" value="list">
          <div className="md:hidden">
            <TeamWellnessComparisonList
              players={players}
              wellnessLimits={wellnessLimits}
            />
          </div>
          <div className="hidden md:block">
            <TeamWellnessComparisonTable
              players={players}
              wellnessLimits={wellnessLimits}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
