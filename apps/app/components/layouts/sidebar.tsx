"use client";

import { BellIcon } from "@phosphor-icons/react/ssr";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/design-system/components/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { primaryNavigation, secondaryNavigation } from "@/lib/admin-navigation";
import type { StaffContext } from "@/lib/auth-context";
import {
  isSettingsPath,
  settingsNavigation,
} from "@/lib/settings-navigation";
import { AppShellProvider } from "./app-shell-context";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileSidebarFab } from "./mobile-sidebar-fab";
import { OperationalRouteMemory } from "./operational-route-memory";
import { SettingsVolverLink } from "./settings-volver-link";
import { SidebarUserMenu } from "./sidebar-user-menu";
import { TeamBranding } from "./team-branding";

type GlobalSidebarProperties = {
  readonly children: ReactNode;
  readonly staffContext: Pick<
    StaffContext,
    | "activeSeason"
    | "activeTeam"
    | "activeTeamSeasons"
    | "canCreateTeam"
    | "club"
    | "role"
    | "teams"
  >;
};

const sidebarPrefetchHrefs = Array.from(
  new Set(
    [
      ...primaryNavigation,
      ...secondaryNavigation,
      ...settingsNavigation,
    ].map((item) => item.href)
  )
);

function SidebarBrandingHeader({
  staffContext,
}: {
  readonly staffContext: GlobalSidebarProperties["staffContext"];
}) {
  return (
    <SidebarHeader className="gap-2 p-2">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <TeamBranding
            clubLogoUrl={staffContext.club.logoUrl}
            clubName={staffContext.club.name}
            logoTreatment="ambient"
            showClubOnly
            teamLogoUrl={staffContext.activeTeam?.logoUrl ?? null}
            teamName={staffContext.activeTeam?.name ?? null}
          />
        </div>
      </div>
    </SidebarHeader>
  );
}

function SettingsSidebarHeader() {
  return (
    <SidebarHeader className="gap-2 p-2">
      <div className="flex flex-row items-center justify-between gap-2">
        <p className="min-w-0 flex-1 truncate px-2 font-semibold text-sm text-text-primary">
          Configuración
        </p>
      </div>
    </SidebarHeader>
  );
}

export const GlobalSidebar = ({
  children,
  staffContext,
}: GlobalSidebarProperties) => {
  const pathname = usePathname();
  const router = useRouter();
  const inSettings = isSettingsPath(pathname);

  useEffect(() => {
    for (const href of sidebarPrefetchHrefs) {
      router.prefetch(href);
    }
  }, [router]);

  return (
    <AppShellProvider value={staffContext}>
      <OperationalRouteMemory />
      <Sidebar collapsible="offcanvas" variant="inset">
        {inSettings ? (
          <SettingsSidebarHeader />
        ) : (
          <SidebarBrandingHeader staffContext={staffContext} />
        )}

        <SidebarContent>
          {inSettings ? (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Volver</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SettingsVolverLink />
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="pt-2">
                <SidebarGroupLabel>Ajustes</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsNavigation.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={item.match(pathname)}
                          tooltip={item.label}
                          render={
                            <Link href={item.href} prefetch>
                              <item.icon weight="fill" />
                              <span>{item.label}</span>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          ) : (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Operación</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {primaryNavigation.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={item.match(pathname)}
                          tooltip={item.label}
                          render={
                            <Link href={item.href} prefetch>
                              <item.icon weight="fill" />
                              <span>{item.label}</span>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="pt-2">
                <SidebarGroupLabel>Accesos</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {secondaryNavigation.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={item.match(pathname)}
                          tooltip={item.label}
                          render={
                            <Link href={item.href} prefetch>
                              <item.icon weight="fill" />
                              <span>{item.label}</span>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        {inSettings ? null : (
          <SidebarFooter className="gap-2">
            <div className="flex items-center justify-between gap-2 border-border-secondary border-t px-2 pt-3">
              <Button aria-label="Notificaciones" size="icon" variant="ghost">
                <BellIcon className="size-4" weight="fill" />
              </Button>
              <ModeToggle />
            </div>
            <SidebarUserMenu />
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset className="min-h-0 flex-1 overflow-hidden pb-0 md:pb-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {children}
        </div>
        {inSettings ? null : <MobileBottomNav />}
        <MobileSidebarFab />
      </SidebarInset>
    </AppShellProvider>
  );
};
