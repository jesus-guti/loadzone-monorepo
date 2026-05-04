"use client";

import { PlusIcon } from "@phosphor-icons/react/ssr";
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
    <div className="flex min-w-0 items-center gap-2 ">
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
          className={cn(
            // biome-ignore lint/nursery/useSortedClasses: composición ghost + motion del trigger de equipo
            "group h-auto min-h-9 data-[size=default]:h-auto data-[size=default]:min-h-9 w-auto min-w-0 max-w-[min(65vw,20rem)] md:max-w-[24rem] border-0 bg-transparent px-3 py-1.5 shadow-none transition-transform duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:bg-transparent data-[state=open]:bg-transparent focus-visible:bg-transparent focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-ring/45 motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 [&_svg]:shrink-0 [&_svg]:duration-200 [&_svg]:ease-out [&_svg]:transition-transform [&_svg]:group-hover:translate-y-px motion-reduce:[&_svg]:transition-none motion-reduce:[&_svg]:group-hover:translate-y-0"
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-sm text-text-primary font-mono">
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
                      // biome-ignore lint/nursery/useSortedClasses: chip categoría en SelectItem
                      className="border border-border-secondary px-1.5 py-0 rounded-sm text-[10px] text-text-secondary uppercase tracking-[0.12em]"
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
