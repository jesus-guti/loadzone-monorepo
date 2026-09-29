"use client";

import type { ReactNode } from "react";
import { ProductMark } from "@/components/brand/product-mark";
import { ActiveSeasonSwitcher } from "./active-season-switcher";
import { ActiveTeamSwitcher } from "./active-team-switcher";
import { useAppShell } from "./app-shell-context";
import { TeamBranding } from "./team-branding";

type HeaderProps = {
  pages: string[];
  page: string;
  children?: ReactNode;
};

export const Header = ({ page, children }: HeaderProps) => {
  const { activeTeam, club } = useAppShell();

  return (
    <header className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur">
      <div className="hidden items-center justify-between gap-4 px-6 py-6 md:flex">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <ProductMark compact />
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

      <div className="flex min-h-10 items-center gap-2 px-4 py-3 md:hidden">
        <div className="shrink-0">
          <TeamBranding
            clubLogoUrl={club?.logoUrl ?? null}
            clubName={club?.name ?? "LoadZone"}
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
      </div>
    </header>
  );
};
