import { SidebarProvider } from "@repo/design-system/components/sidebar";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentStaffContext } from "@/lib/auth-context";
import type { MockTeam } from "./_components/nav-config";
import { SettingsShell } from "./_components/settings-shell";

type PrototypeSettingsLayoutProps = {
  readonly children: ReactNode;
};

const FALLBACK_TEAMS: MockTeam[] = [
  { id: "mock-juvenil-a", name: "Juvenil A", category: "Juvenil" },
  { id: "mock-cadete-b", name: "Cadete B", category: "Cadete" },
  { id: "mock-senior", name: "Senior", category: "Senior" },
];

function resolveMockTeams(
  staffTeams: ReadonlyArray<{ id: string; name: string; category: string | null }>
): { teams: MockTeam[]; activeTeamId: string } {
  if (staffTeams.length >= 2) {
    const teams = staffTeams.slice(0, 3).map((team) => ({
      id: team.id,
      name: team.name,
      category: team.category,
    }));
    return { teams, activeTeamId: teams[0]?.id ?? FALLBACK_TEAMS[0].id };
  }

  return {
    teams: FALLBACK_TEAMS,
    activeTeamId: FALLBACK_TEAMS[0].id,
  };
}

const PrototypeSettingsLayout = async ({
  children,
}: PrototypeSettingsLayoutProps) => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext) {
    redirect("/sign-in");
  }

  const { teams, activeTeamId } = resolveMockTeams(staffContext.teams);

  return (
    <SidebarProvider
      className="h-svh min-h-0 overflow-hidden"
      defaultOpen
    >
      <SettingsShell activeTeamId={activeTeamId} teams={teams}>
        {children}
      </SettingsShell>
    </SidebarProvider>
  );
};

export default PrototypeSettingsLayout;
