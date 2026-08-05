"use client";

import { cn } from "@repo/design-system/lib/utils";
import { useState } from "react";
import type { MockTeam } from "./nav-config";

type TeamPillsProps = {
  readonly teams: ReadonlyArray<MockTeam>;
  readonly initialActiveId: string;
};

export function TeamPills({ teams, initialActiveId }: TeamPillsProps) {
  const [activeId, setActiveId] = useState(initialActiveId);

  if (teams.length === 0) {
    return (
      <p className="text-sm text-text-secondary">Sin equipos de demostración</p>
    );
  }

  return (
    <div
      aria-label="Equipo activo"
      className="flex min-w-0 flex-wrap items-center gap-1.5"
      role="group"
    >
      {teams.map((team) => {
        const isActive = team.id === activeId;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "h-8 max-w-[12rem] truncate rounded-sm border px-3 font-mono text-sm transition-[color,background-color,border-color] duration-200 ease-out",
              "motion-reduce:transition-none",
              isActive
                ? "border-border-primary bg-bg-secondary font-semibold text-text-primary"
                : "border-transparent bg-transparent font-medium text-text-secondary hover:border-border-secondary hover:text-text-primary"
            )}
            key={team.id}
            onClick={() => {
              setActiveId(team.id);
            }}
            type="button"
          >
            {team.name}
          </button>
        );
      })}
    </div>
  );
}
