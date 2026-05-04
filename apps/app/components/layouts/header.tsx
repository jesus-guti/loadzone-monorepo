"use client";

import type { ReactNode } from "react";
import { ActiveSeasonSwitcher } from "./active-season-switcher";
import { ActiveTeamSwitcher } from "./active-team-switcher";

type HeaderProps = {
  pages: string[];
  page: string;
  children?: ReactNode;
};

export const Header = ({ pages, page, children }: HeaderProps) => {
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
        <div className="flex items-center justify-between gap-2 pl-3">
          <div className="min-w-0 flex-1">
            <ActiveTeamSwitcher />
          </div>
          <div className="shrink-0">
            <ActiveSeasonSwitcher />
          </div>
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
