import { auth, currentUser } from "@repo/auth/server";
import { database } from "@repo/database";
import { SidebarProvider } from "@repo/design-system/components/ui/sidebar";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { GlobalSidebar } from "./components/sidebar";

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  const user = await currentUser();
  const { redirectToSignIn, userId } = await auth();
  if (!user || !userId) {
    return redirectToSignIn();
  }

  const admin = await database.admin.findUnique({
    where: { clerkId: userId },
    select: { team: { select: { name: true } } },
  });

  if (!admin) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <GlobalSidebar teamName={admin.team.name}>{children}</GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;
