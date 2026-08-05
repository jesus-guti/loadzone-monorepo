"use client";

import { ListIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/design-system/components/sidebar";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { MockTeam } from "./nav-config";
import { settingsNavigation } from "./nav-config";
import { TeamPills } from "./team-pills";
import { VolverLink } from "./volver-link";

type SettingsShellProps = {
  readonly children: ReactNode;
  readonly teams: ReadonlyArray<MockTeam>;
  readonly activeTeamId: string;
};

function DesktopSidebarOpener() {
  const { toggleSidebar, state } = useSidebar();
  const tooltip =
    state === "collapsed" ? "Expandir barra lateral" : "Contraer barra lateral";

  return (
    <div className="shrink-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            aria-label={tooltip}
            className="w-fit [&_svg]:size-5"
            onClick={() => {
              toggleSidebar();
            }}
            tooltip={tooltip}
            type="button"
          >
            <ListIcon className="size-5 shrink-0 text-text-secondary" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}

function MobileSidebarFab() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      aria-label="Abrir menú de configuración"
      className={cn(
        "fixed z-40 touch-manipulation md:hidden",
        "bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-4",
        "size-11 rounded-full border border-border-primary bg-bg-primary/95 shadow-md backdrop-blur"
      )}
      onClick={() => {
        toggleSidebar();
      }}
      size="icon"
      type="button"
      variant="ghost"
    >
      <ListIcon className="size-5 text-text-secondary" />
    </Button>
  );
}

export function SettingsShell({
  children,
  teams,
  activeTeamId,
}: SettingsShellProps) {
  const pathname = usePathname();
  const activeItem = settingsNavigation.find((item) => item.match(pathname));
  const pageTitle = activeItem?.label ?? "Configuración";

  return (
    <>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="gap-2 p-2">
          <div
            className={cn(
              "flex flex-row items-center justify-between gap-2",
              "group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:gap-1"
            )}
          >
            <p className="min-w-0 flex-1 truncate px-2 font-semibold text-sm text-text-primary group-data-[collapsible=icon]:hidden">
              Configuración
            </p>
            <DesktopSidebarOpener />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Volver
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <VolverLink />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="pt-2">
            <SidebarGroupLabel>Ajustes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNavigation.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      className="[&_svg]:size-5"
                      isActive={item.match(pathname)}
                      render={
                        <Link href={item.href} prefetch>
                          <item.icon weight="fill" />
                          <span>{item.label}</span>
                        </Link>
                      }
                      tooltip={item.label}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain">
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
              <TeamPills
                initialActiveId={activeTeamId}
                teams={teams}
              />
            </div>
          </header>
          {children}
        </div>
        <MobileSidebarFab />
      </SidebarInset>
    </>
  );
}
