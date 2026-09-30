"use client";

import { DotsThreeIcon } from "@phosphor-icons/react/ssr";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/sheet";
import { useSidebar } from "@repo/design-system/components/sidebar";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  configurationNavItem,
  mobilePrimaryNavigation,
  operationalNavigation,
  type AdminNavItem,
} from "@/lib/admin-navigation";
import { isSettingsPath, settingsNavigation } from "@/lib/settings-navigation";
import { ActiveSeasonSwitcher } from "./active-season-switcher";
import { useAppShell } from "./app-shell-context";

const overflowNavigation: AdminNavItem[] = [
  ...operationalNavigation.filter(
    (item) => !mobilePrimaryNavigation.some((primary) => primary.href === item.href)
  ),
  configurationNavItem,
];

function NavGlyph({
  item,
  isActive,
}: {
  readonly item: AdminNavItem;
  readonly isActive: boolean;
}) {
  return (
    <item.icon
      className={cn("size-4", isActive ? "text-brand" : "text-text-tertiary")}
      weight="fill"
    />
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { platformRole } = useAppShell();
  const [moreOpen, setMoreOpen] = useState(false);
  const inSettings = isSettingsPath(pathname);
  const moreActive =
    inSettings || overflowNavigation.some((item) => item.match(pathname));

  const settingsItems = settingsNavigation.filter(
    (item) => !item.superAdminOnly || platformRole === "SUPER_ADMIN"
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 bg-bg-tertiary/50 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {mobilePrimaryNavigation.map((item) => {
          const isActive = Boolean(item.match(pathname));

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-1 py-3 font-medium text-[11px] text-text-secondary transition-colors",
                  isActive ? "text-text-primary" : false
                )}
                href={item.href}
                prefetch
              >
                <NavGlyph isActive={isActive} item={item} />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            className={cn(
              "flex w-full flex-col items-center justify-center gap-1 px-1 py-3 font-medium text-[11px] text-text-secondary",
              moreActive ? "text-text-primary" : false
            )}
            onClick={() => {
              setMoreOpen(true);
            }}
            type="button"
          >
            <DotsThreeIcon
              className={cn(
                "size-4",
                moreActive ? "text-brand" : "text-text-tertiary"
              )}
              weight="bold"
            />
            Más
          </button>
        </li>
      </ul>

      <Sheet onOpenChange={setMoreOpen} open={moreOpen}>
        <SheetContent className="pb-[calc(env(safe-area-inset-bottom)+1rem)]" side="bottom">
          <SheetHeader>
            <SheetTitle>{inSettings ? "Ajustes" : "Más"}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 pb-2">
            {inSettings
              ? settingsItems.map((item) => (
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2 py-3 font-medium text-sm text-text-secondary",
                      item.match(pathname) ? "text-text-primary" : false
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => {
                      setMoreOpen(false);
                    }}
                    prefetch
                  >
                    <item.icon className="size-4" weight="fill" />
                    {item.label}
                  </Link>
                ))
              : overflowNavigation.map((item) => (
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2 py-3 font-medium text-sm text-text-secondary",
                      item.match(pathname) ? "text-text-primary" : false
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => {
                      setMoreOpen(false);
                    }}
                    prefetch
                  >
                    <item.icon className="size-4" weight="fill" />
                    {item.label}
                  </Link>
                ))}
          </div>
          {inSettings ? null : (
            <div className="flex items-center justify-between gap-3 border-t border-border-secondary px-4 py-3">
              <p className="font-medium text-[11px] text-text-secondary uppercase tracking-wide">
                Temporada
              </p>
              <ActiveSeasonSwitcher />
            </div>
          )}
          <div className="px-4 pt-1">
            <button
              className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left font-medium text-sm text-text-secondary"
              onClick={() => {
                setMoreOpen(false);
                toggleSidebar();
              }}
              type="button"
            >
              Cuenta y primeros pasos
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
