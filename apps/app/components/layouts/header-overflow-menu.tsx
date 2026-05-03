"use client";

import {
  BellIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveSeason } from "@/actions/active-season";
import { useAppShell } from "./app-shell-context";

export function HeaderOverflowMenu() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { activeSeason, activeTeamSeasons } = useAppShell();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Abrir más opciones"
          className="md:hidden"
          size="icon"
          variant="ghost"
        >
          <EllipsisHorizontalIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 md:hidden">
        <DropdownMenuLabel>Más opciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.16em] text-text-secondary">
          Temporada
        </DropdownMenuLabel>
        {activeTeamSeasons.length === 0 ? (
          <DropdownMenuItem disabled>Sin temporadas</DropdownMenuItem>
        ) : (
          activeTeamSeasons.map((season) => (
            <DropdownMenuItem
              key={season.id}
              disabled={isPending}
              onClick={() => {
                if (season.id === activeSeason?.id) {
                  return;
                }

                startTransition(async () => {
                  await setActiveSeason(season.id);
                  router.refresh();
                });
              }}
            >
              {season.id === activeSeason?.id ? (
                <CheckIcon className="size-4 text-brand" />
              ) : (
                <span className="size-4" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-text-primary">
                  {season.label}
                </span>
                <span className="block truncate text-xs text-text-secondary">
                  {season.name}
                </span>
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.16em] text-text-secondary">
          Notificaciones
        </DropdownMenuLabel>
        <DropdownMenuItem disabled>
          <BellIcon className="size-4" />
          Sin avisos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
