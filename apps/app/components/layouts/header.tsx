"use client";

import { BellIcon } from "@heroicons/react/20/solid";
import { Button } from "@repo/design-system/components/ui/button";
import { SidebarTrigger } from "@repo/design-system/components/ui/sidebar";
import type { ReactNode } from "react";
import { ActiveSeasonSwitcher } from "./active-season-switcher";
import { ActiveTeamSwitcher } from "./active-team-switcher";
import { useAppShell } from "./app-shell-context";
import { HeaderOverflowMenu } from "./header-overflow-menu";
import { TeamBranding } from "./team-branding";
import { UserMenu } from "./user-menu";

type HeaderProps = {
  pages: string[];
  page: string;
  children?: ReactNode;
};

export const Header = ({ pages, page, children }: HeaderProps) => {
  const { activeTeam, club } = useAppShell();
  const pathLabel = pages.length > 0 ? pages.join(" / ") : "LoadZone";

  return (
    <header className="sticky top-0 z-20 border-border-secondary border-b bg-bg-primary/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1 hidden md:flex" />
          <div className="md:hidden">
            <TeamBranding
              clubLogoUrl={club.logoUrl}
              clubName={club.name}
              compact
              teamLogoUrl={activeTeam?.logoUrl ?? null}
              teamName={activeTeam?.name ?? null}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 md:flex-none">
          <ActiveTeamSwitcher />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            <ActiveSeasonSwitcher />
            <Button aria-label="Notificaciones" size="icon" variant="ghost">
              <BellIcon className="size-5" />
            </Button>
          </div>
          <HeaderOverflowMenu />
          <UserMenu />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-border-secondary border-t px-4 py-3 sm:px-6">
        <p className="min-w-0 truncate font-medium text-[11px] text-text-secondary uppercase tracking-[0.16em]">
          {pathLabel}
        </p>
        <div className="flex min-w-0 flex-row items-center justify-between gap-3">
          <h1 className="min-w-0 flex-1 truncate font-semibold text-2xl text-text-primary tracking-tight">
            {page}
          </h1>
          {children ? (
            <div className="flex shrink-0 items-center gap-2">{children}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
