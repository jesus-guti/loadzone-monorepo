"use client";

import { PlusIcon } from "@phosphor-icons/react/ssr";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@repo/design-system/components/select";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setActiveSeason } from "@/actions/active-season";
import { CreateSeasonDialog } from "@/features/seasons/components/create-season-dialog";
import { useAppShell } from "./app-shell-context";

const CREATE_SEASON_VALUE = "__create_season__";

export function ActiveSeasonSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const { activeSeason, activeTeamSeasons } = useAppShell();

  const activeValue = activeSeason?.id ?? "";
  const triggerLabel =
    activeSeason?.label ?? activeSeason?.name ?? "Sin temporada";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Select
        disabled={isPending}
        value={activeValue || undefined}
        onValueChange={(seasonId: string | null) => {
          if (!seasonId) {
            return;
          }
          if (seasonId === CREATE_SEASON_VALUE) {
            setCreateOpen(true);
            return;
          }

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
            <SelectLabel>Temporadas</SelectLabel>
            {activeTeamSeasons.length === 0 ? (
              <div className="px-1.5 py-2 text-xs text-text-secondary">
                No hay temporadas todavía
              </div>
            ) : (
              activeTeamSeasons.map((season) => (
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
              ))
            )}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectItem value={CREATE_SEASON_VALUE}>
              <span className="flex items-center gap-2">
                <PlusIcon className="size-4" />
                Crear temporada
              </span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <CreateSeasonDialog onOpenChange={setCreateOpen} open={createOpen} />
    </div>
  );
}
