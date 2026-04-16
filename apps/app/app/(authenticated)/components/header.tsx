"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { SidebarTrigger } from "@repo/design-system/components/ui/sidebar";
import { BellIcon } from "@heroicons/react/20/solid";
import type { ReactNode } from "react";
import { ActiveSeasonSwitcher } from "./active-season-switcher";
import { useAppShell } from "./app-shell-context";
import { ActiveTeamSwitcher } from "./active-team-switcher";
import { AskLoadzoneButton } from "./ask-loadzone-button";
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
    <header className="sticky top-0 z-20 border-b border-border-secondary bg-bg-primary/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1" />
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
            <AskLoadzoneButton />
            <Button aria-label="Notificaciones" size="icon" variant="ghost">
              <BellIcon className="size-5" />
            </Button>
          </div>
          <HeaderOverflowMenu />
          <UserMenu />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-secondary px-4 py-3 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
            {pathLabel}
          </p>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-text-primary">
            {page}
          </h1>
        </div>
        {children ? <div className="flex items-center gap-2">{children}</div> : null}
      </div>
    </header>
  );
};
