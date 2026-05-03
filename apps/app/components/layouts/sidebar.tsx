"use client";

import { ModeToggle } from "@repo/design-system/components/mode-toggle";
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
} from "@repo/design-system/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { StaffContext } from "@/lib/auth-context";
import {
  primaryNavigation,
  secondaryNavigation,
} from "@/lib/admin-navigation";
import { AppShellProvider } from "./app-shell-context";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { TeamBranding } from "./team-branding";

const sidebarPrefetchHrefs = Array.from(
  new Set(
    [...primaryNavigation, ...secondaryNavigation].map((item) => item.href)
  )
);

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
      <>
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="cursor-default"
                  size="lg"
                  tooltip={staffContext.activeTeam?.name ?? staffContext.club.name}
                  asChild
                >
                  <div>
                    <TeamBranding
                      clubLogoUrl={staffContext.club.logoUrl}
                      clubName={staffContext.club.name}
                      showClubOnly
                      teamLogoUrl={staffContext.activeTeam?.logoUrl ?? null}
                      teamName={staffContext.activeTeam?.name ?? null}
                    />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

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

          <SidebarFooter>
            <div className="flex items-center justify-between border-t border-border-secondary px-2 pt-3">
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-xs uppercase tracking-[0.14em] text-text-secondary">
                  Equipo activo
                </p>
                <p className="truncate text-sm font-medium text-text-primary">
                  {staffContext.activeTeam?.name ?? "Sin equipo"}
                </p>
              </div>
              <ModeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-h-svh pb-20 md:pb-0">
          {children}
          <MobileBottomNav />
        </SidebarInset>
      </>
    </AppShellProvider>
  );
};
