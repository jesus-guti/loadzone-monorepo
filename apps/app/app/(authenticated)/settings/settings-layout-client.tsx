"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ProductMark } from "@/components/brand/product-mark";
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
          <div className="flex min-w-0 flex-col gap-1">
            <ProductMark compact />
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
