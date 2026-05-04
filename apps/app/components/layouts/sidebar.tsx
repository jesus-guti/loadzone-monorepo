"use client";

import { BellIcon, ListIcon } from "@phosphor-icons/react/ssr";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
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
  useSidebar,
} from "@repo/design-system/components/ui/sidebar";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { primaryNavigation, secondaryNavigation } from "@/lib/admin-navigation";
import type { StaffContext } from "@/lib/auth-context";
import { AppShellProvider } from "./app-shell-context";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileSidebarFab } from "./mobile-sidebar-fab";
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
    [...primaryNavigation, ...secondaryNavigation].map((item) => item.href)
  )
);

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
            className="w-fit"
            onClick={() => {
              toggleSidebar();
            }}
            tooltip={tooltip}
            type="button"
          >
            <ListIcon className="size-4 shrink-0 text-text-secondary" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}

function SidebarBrandingHeader({
  staffContext,
}: {
  readonly staffContext: GlobalSidebarProperties["staffContext"];
}) {
  return (
    <SidebarHeader className="gap-2 p-2">
      <div
        className={cn(
          "flex flex-row items-center justify-between gap-2",
          "group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:gap-1"
        )}
      >
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center">
          <TeamBranding
            clubLogoUrl={staffContext.club.logoUrl}
            clubName={staffContext.club.name}
            detailsClassName="group-data-[collapsible=icon]:hidden"
            logoTreatment="ambient"
            showClubOnly
            teamLogoUrl={staffContext.activeTeam?.logoUrl ?? null}
            teamName={staffContext.activeTeam?.name ?? null}
          />
        </div>
        <DesktopSidebarOpener />
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

  useEffect(() => {
    for (const href of sidebarPrefetchHrefs) {
      router.prefetch(href);
    }
  }, [router]);

  return (
    <AppShellProvider value={staffContext}>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarBrandingHeader staffContext={staffContext} />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Operación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryNavigation.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.match(pathname)}
                      tooltip={item.label}
                    >
                      <Link href={item.href} prefetch>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
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
                      asChild
                      isActive={item.match(pathname)}
                      tooltip={item.label}
                    >
                      <Link href={item.href} prefetch>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-2">
          <div className="flex items-center justify-between gap-2 border-border-secondary border-t px-2 pt-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center">
            <Button aria-label="Notificaciones" size="icon" variant="ghost">
              <BellIcon className="size-5" weight="fill" />
            </Button>
            <ModeToggle />
          </div>
          <SidebarUserMenu />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-h-0 flex-1 overflow-hidden pb-0 md:pb-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {children}
        </div>
        <MobileBottomNav />
        <MobileSidebarFab />
      </SidebarInset>
    </AppShellProvider>
  );
};
