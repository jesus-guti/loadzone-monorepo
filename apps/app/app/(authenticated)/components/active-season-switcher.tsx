"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@repo/design-system/components/ui/select";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveSeason } from "../actions/active-season";
import { useAppShell } from "./app-shell-context";

export function ActiveSeasonSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { activeSeason, activeTeamSeasons } = useAppShell();

  const activeValue = activeSeason?.id ?? "";
  const triggerLabel =
    activeSeason?.label ?? activeSeason?.name ?? "Sin temporada";

  return (
    <Select
      disabled={isPending || activeTeamSeasons.length === 0}
      value={activeValue}
      onValueChange={(seasonId: string) => {
        startTransition(async () => {
          await setActiveSeason(seasonId);
          router.refresh();
        });
      }}
    >
      <SelectTrigger
        aria-label="Temporada activa"
        className="h-9 w-auto min-w-0 gap-2 border-transparent bg-transparent px-2 text-sm shadow-none hover:bg-bg-secondary focus-visible:ring-0"
      >
        <span className="truncate font-medium text-text-primary">
          {triggerLabel}
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {activeTeamSeasons.map((season) => (
            <SelectItem key={season.id} value={season.id}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="font-medium text-text-primary">
                  {season.label}
                </span>
                <span className="truncate text-xs text-text-secondary">
                  {season.name}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
