"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { settingsPageTitle } from "@/lib/settings-navigation";
import { ActiveTeamSwitcher } from "@/components/layouts/active-team-switcher";
import { SettingsContent } from "@/features/settings/components/settings-content";

type SettingsLayoutClientProps = {
  readonly children: ReactNode;
};

export function SettingsLayoutClient({ children }: SettingsLayoutClientProps) {
  const pathname = usePathname();
  const pageTitle = settingsPageTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur">
        <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
          <div className="relative min-w-0">
            <p className="absolute -top-2 truncate font-medium text-[11px] text-text-secondary uppercase tracking-[0.16em]">
              LoadZone
            </p>
            <h1 className="truncate font-semibold text-2xl text-text-primary tracking-tight">
              {pageTitle}
            </h1>
          </div>
          <div className="min-w-0 shrink">
            <ActiveTeamSwitcher />
          </div>
        </div>
      </header>
      <SettingsContent>{children}</SettingsContent>
    </>
  );
}
