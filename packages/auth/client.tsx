"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

type UserButtonProperties = {
  readonly showName?: boolean;
  readonly appearance?: {
    elements?: Record<string, string>;
  };
};

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

export function UserButton({
  showName = false,
}: UserButtonProperties) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex w-full items-center justify-between gap-3  px-2 py-1.5">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted/50" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="w-full rounded-lg px-2 py-1.5 text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
      >
        Iniciar sesión
      </Link>
    );
  }

  const displayName = session.user.name ?? session.user.email ?? "Usuario";

  return (
    <div className="flex w-full items-center justify-between gap-3  px-2 py-1.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-tertiary text-xs font-semibold text-text-primary">
          {getInitials(session.user.name, session.user.email ?? null)}
        </div>
        {showName ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {displayName}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {session.user.email}
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className="rounded-lg px-2 py-1 text-xs font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
      >
        Salir
      </button>
    </div>
  );
}

export { signIn, signOut, useSession } from "next-auth/react";
