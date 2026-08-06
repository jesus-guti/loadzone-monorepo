import { SidebarProvider } from "@repo/design-system/components/sidebar";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { GlobalSidebar } from "@/components/layouts/sidebar";
import { StaffShellInitialLoader } from "@/components/layouts/staff-shell-initial-loader";

type AppLayoutProperties = {
  readonly children: ReactNode;
};

async function AuthenticatedShell({
  children,
}: {
  readonly children: ReactNode;
}): Promise<ReactNode> {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext) {
    redirect("/sign-in");
  }

  if (
    staffContext.teams.length === 0 &&
    staffContext.platformRole !== "SUPER_ADMIN"
  ) {
    redirect("/onboarding");
  }

  return (
    <GlobalSidebar staffContext={staffContext}>
      <QueryClientProviderWrapper>
        {/* Keep shell mounted on soft nav; do not remount the empty initial loader. */}
        <Suspense fallback={null}>{children}</Suspense>
      </QueryClientProviderWrapper>
    </GlobalSidebar>
  );
}

const AppLayout = ({ children }: AppLayoutProperties) => {
  return (
    <SidebarProvider
      className="h-svh min-h-0 overflow-hidden"
      defaultOpen={false}
    >
      <Suspense fallback={<StaffShellInitialLoader />}>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </Suspense>
    </SidebarProvider>
  );
};

export default AppLayout;
