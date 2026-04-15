"use client";

import { UserButton } from "@repo/auth/client";
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
import {
  LayoutDashboardIcon,
  UsersIcon,
  CalendarIcon,
  CalendarRangeIcon,
  BrainCircuitIcon,
  SettingsIcon,
  ShieldIcon,
  HeartPulseIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type GlobalSidebarProperties = {
  readonly children: ReactNode;
  readonly clubName?: string;
  readonly teamName?: string;
};

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboardIcon },
  { title: "Jugadores", url: "/players", icon: UsersIcon },
  { title: "Temporadas", url: "/seasons", icon: CalendarIcon },
  { title: "Sesiones", url: "/sessions", icon: CalendarRangeIcon },
  { title: "Lesiones", url: "/injuries", icon: HeartPulseIcon },
  { title: "Análisis IA", url: "/analysis", icon: BrainCircuitIcon },
  { title: "Configuración", url: "/settings", icon: SettingsIcon },
];

export const GlobalSidebar = ({
  children,
  clubName,
  teamName,
}: GlobalSidebarProperties) => {
  const pathname = usePathname();

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="cursor-default" asChild>
                <div>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
                    <ShieldIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {teamName ?? clubName ?? "LoadZone"}
                    </span>
                    <span className="truncate text-xs uppercase tracking-[0.14em] text-text-secondary">
                      {clubName ?? "Panel de control"}
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>LoadZone</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2 border-t border-border-secondary pt-2">
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "flex overflow-hidden w-full",
                    userButtonBox: "flex-row-reverse",
                    userButtonOuterIdentifier: "truncate pl-0",
                  },
                }}
                showName
              />
              <div className="flex shrink-0 items-center gap-px">
                <ModeToggle />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
