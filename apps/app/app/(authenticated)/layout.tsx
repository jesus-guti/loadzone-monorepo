import { SidebarProvider } from "@repo/design-system/components/ui/sidebar";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { GlobalSidebar } from "./components/sidebar";

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext) {
    redirect("/sign-in");
  }

  if (staffContext.teams.length === 0 && staffContext.platformRole !== "SUPER_ADMIN") {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <GlobalSidebar
        clubName={staffContext.club.name}
        teamName={staffContext.primaryTeam?.name}
      >
        {children}
      </GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;
