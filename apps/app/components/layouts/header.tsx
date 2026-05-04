"use client";

import type { ReactNode } from "react";
import { ActiveSeasonSwitcher } from "./active-season-switcher";
import { ActiveTeamSwitcher } from "./active-team-switcher";
import { useAppShell } from "./app-shell-context";
import { TeamBranding } from "./team-branding";

type HeaderProps = {
  pages: string[];
  page: string;
  children?: ReactNode;
};

export const Header = ({ pages, page, children }: HeaderProps) => {
  const { activeTeam, club } = useAppShell();
  const pathLabel = pages.length > 0 ? pages.join(" / ") : "LoadZone";

  return (
    <header className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur">
      <div className="hidden items-center justify-between gap-4 px-6 py-6 md:flex">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative flex min-w-0 flex-col gap-0.5">
            <p className="absolute -top-2 truncate font-medium text-[11px] text-text-secondary uppercase tracking-[0.16em]">
              {pathLabel}
            </p>
            <h1 className="truncate font-semibold text-2xl text-text-primary tracking-tight">
              {page}
            </h1>
          </div>
          <div className="min-w-0 shrink pl-3">
            <ActiveTeamSwitcher />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ActiveSeasonSwitcher />
          {children ? (
            <div className="flex shrink-0 items-center gap-2">{children}</div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 py-3 md:hidden">
        <div className="flex min-h-10 items-center gap-2">
          <div className="shrink-0">
            <TeamBranding
              clubLogoUrl={club.logoUrl}
              clubName={club.name}
              compact
              logoTreatment="ambient"
              teamLogoUrl={activeTeam?.logoUrl ?? null}
              teamName={activeTeam?.name ?? null}
            />
          </div>
          <div className="min-w-0 flex-1 -ml-3">
            <ActiveTeamSwitcher />
          </div>
            {children ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {children}
              </div>
            ) : null}
          <div className="hidden shrink-0 items-center gap-2 md:block ">
            <ActiveSeasonSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
