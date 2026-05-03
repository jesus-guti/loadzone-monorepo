"use client";

import { PlusIcon } from "@heroicons/react/20/solid";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@repo/design-system/components/ui/select";
import { cn } from "@repo/design-system/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveTeam } from "@/actions/active-team";
import { useAppShell } from "./app-shell-context";

const CREATE_TEAM_VALUE = "__create_team__";

export function ActiveTeamSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { activeTeam, canCreateTeam, teams } = useAppShell();

  const activeValue = activeTeam?.id ?? "";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Select
        disabled={isPending || teams.length === 0}
        value={activeValue}
        onValueChange={(teamId: string) => {
          if (teamId === CREATE_TEAM_VALUE) {
            router.push("/settings?createTeam=1");
            return;
          }

          startTransition(async () => {
            await setActiveTeam(teamId);
            router.refresh();
          });
        }}
      >
        <SelectTrigger
          aria-label="Equipo activo"
          className="w-auto min-w-0 max-w-[min(65vw,20rem)] bg-bg-secondary md:max-w-[24rem]"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium text-text-primary">
              {activeTeam?.name ?? "Selecciona equipo"}
            </span>
            {activeTeam?.category ? (
              <Badge
                className="min-w-0 max-w-20 truncate rounded-sm px-1.5 py-0 text-[10px] uppercase tracking-[0.12em]"
                variant="secondary"
              >
                {activeTeam.category}
              </Badge>
            ) : null}
          </span>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            <SelectLabel>Equipos</SelectLabel>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <span className="flex min-w-0 items-center gap-2 pr-4">
                  <span className="truncate">{team.name}</span>
                  {team.category ? (
                    <span
                      className={cn(
                        "rounded-sm border border-border-secondary px-1.5 py-0 text-[10px] uppercase tracking-[0.12em] text-text-secondary"
                      )}
                    >
                      {team.category}
                    </span>
                  ) : null}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
          {canCreateTeam ? (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectItem value={CREATE_TEAM_VALUE}>
                  <span className="flex items-center gap-2">
                    <PlusIcon className="size-4" />
                    Crear equipo
                  </span>
                </SelectItem>
              </SelectGroup>
            </>
          ) : null}
        </SelectContent>
      </Select>
    </div>
  );
}
