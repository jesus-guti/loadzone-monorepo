"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StaffContext } from "@/lib/auth-context";

type AppShellContextValue = Pick<
  StaffContext,
  | "activeSeason"
  | "activeTeam"
  | "activeTeamSeasons"
  | "canCreateTeam"
  | "club"
  | "role"
  | "teams"
>;

const AppShellContext = createContext<AppShellContextValue | null>(null);

type AppShellProviderProperties = {
  readonly children: ReactNode;
  readonly value: AppShellContextValue;
};

export function AppShellProvider({
  children,
  value,
}: AppShellProviderProperties) {
  return (
    <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
  );
}

export function useAppShell(): AppShellContextValue {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within AppShellProvider.");
  }

  return context;
}
