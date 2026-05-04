"use client";

import {
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react/ssr";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/design-system/components/ui/sidebar";
import { signOut, useSession } from "@repo/auth/client";
import { useState } from "react";
import { useAppShell } from "./app-shell-context";
import { EditProfileDialog } from "./edit-profile-dialog";

function getInitials(
  name: string | null | undefined,
  email: string | null
): string {
  if (name && name.trim().length > 0) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return email?.slice(0, 2).toUpperCase() ?? "U";
}

function membershipRoleLabel(
  role: "COORDINATOR" | "STAFF" | "PLAYER"
): string {
  switch (role) {
    case "COORDINATOR":
      return "Coordinación";
    case "STAFF":
      return "Staff";
    case "PLAYER":
      return "Jugador/a";
  }
}

export function SidebarUserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const { role } = useAppShell();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState<boolean>(false);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="h-auto min-h-12 py-2 data-[state=open]:bg-bg-tertiary"
                size="lg"
              >
                <Avatar className="size-9 border border-border-secondary">
                  {user?.image ? (
                    <AvatarImage alt={user.name ?? "Usuario"} src={user.image} />
                  ) : null}
                  <AvatarFallback className="bg-bg-secondary text-xs font-semibold text-text-primary">
                    {getInitials(user?.name, user?.email ?? null)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-text-primary">
                    {user?.name ?? "Usuario"}
                  </span>
                  <span className="truncate text-xs text-text-secondary">
                    {membershipRoleLabel(role)}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64" side="top">
              <DropdownMenuLabel>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm text-text-primary">
                    {user?.name ?? "Usuario"}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    {user?.email ?? ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  event.preventDefault();
                  setIsProfileDialogOpen(true);
                }}
              >
                <UserCircleIcon className="size-4" />
                Editar perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
              >
                <SignOutIcon className="size-4" />
                Salir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <EditProfileDialog
        email={user?.email ?? ""}
        imageUrl={user?.image ?? null}
        name={user?.name ?? null}
        onOpenChange={setIsProfileDialogOpen}
        open={isProfileDialogOpen}
      />
    </>
  );
}
