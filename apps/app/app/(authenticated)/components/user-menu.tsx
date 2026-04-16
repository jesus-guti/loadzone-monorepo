"use client";

import { ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { signOut, useSession } from "@repo/auth/client";

function getInitials(name: string | null | undefined, email: string | null): string {
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

export function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Abrir menú de usuario"
          className="size-9 rounded-xl"
          size="icon"
          variant="ghost"
        >
          <Avatar className="size-9 border border-border-secondary">
            {user?.image ? <AvatarImage alt={user.name ?? "Usuario"} src={user.image} /> : null}
            <AvatarFallback className="bg-bg-secondary text-xs font-semibold text-text-primary">
              {getInitials(user?.name, user?.email ?? null)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
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
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
        >
          <ArrowRightOnRectangleIcon className="size-4" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
