"use client";

import { CalendarBlankIcon, PlusIcon } from "@phosphor-icons/react/ssr";
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

type ActiveSeasonSwitcherProps = {
  readonly variant?: "toolbar" | "fab";
};

export function ActiveSeasonSwitcher({
  variant = "toolbar",
}: ActiveSeasonSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const { activeSeason, activeTeamSeasons } = useAppShell();

  const activeValue =
    activeSeason &&
    activeTeamSeasons.some((season) => season.id === activeSeason.id)
      ? activeSeason.id
      : "";
  const triggerLabel =
    activeSeason?.label ?? activeSeason?.name ?? "Sin temporada";
  const isFab = variant === "fab";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Select
        disabled={isPending}
        value={activeValue}
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
          aria-label={
            isFab ? `Temporada activa: ${triggerLabel}` : "Temporada activa"
          }
          className={
            isFab
              ? "size-11 justify-center gap-0 rounded-full border border-border-primary bg-bg-primary/95 px-0 shadow-md backdrop-blur hover:bg-bg-secondary focus-visible:ring-0 [&>svg:last-child]:hidden"
              : "h-9 w-auto min-w-0 gap-2 border-transparent bg-transparent px-2 text-sm shadow-none hover:bg-bg-secondary focus-visible:ring-0"
          }
        >
          {isFab ? (
            <CalendarBlankIcon className="size-5 text-text-secondary" />
          ) : (
            <span className="truncate font-medium text-text-primary">
              {triggerLabel}
            </span>
          )}
        </SelectTrigger>
        <SelectContent
          align="end"
          alignItemWithTrigger={!isFab}
          className={isFab ? "w-auto min-w-64" : undefined}
          side={isFab ? "top" : "bottom"}
        >
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
