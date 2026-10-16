import { SidebarProvider } from "@repo/design-system/components/sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { GlobalSidebar } from "@/components/layouts/sidebar";
import { StaffShellInitialLoader } from "@/components/layouts/staff-shell-initial-loader";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { loadMinutesPromptState } from "@/features/minutes/load-minutes-prompt";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { shouldRedirectOperatorToPlatform } from "@/lib/operator-platform-redirect";
import { EMPTY_RECOMMENDED_SETUP_FACTS } from "@/lib/recommended-setup";
import { loadClubRecommendedSetupFacts } from "@/lib/recommended-setup-facts";

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

  const headerStore = await headers();
  const pathname = headerStore.get("x-loadzone-pathname") ?? "/";
  if (
    staffContext.platformRole === "SUPER_ADMIN" &&
    shouldRedirectOperatorToPlatform(pathname, staffContext.club !== null)
  ) {
    redirect("/settings/platform");
  }

  const recommendedSetupFacts =
    staffContext.club === null
      ? EMPTY_RECOMMENDED_SETUP_FACTS
      : await loadClubRecommendedSetupFacts(staffContext.club.id);

  const minutesPrompt = await loadMinutesPromptState();

  return (
    <GlobalSidebar
      minutesPrompt={minutesPrompt}
      recommendedSetupFacts={recommendedSetupFacts}
      staffContext={staffContext}
      userId={staffContext.user.id}
    >
      <QueryClientProviderWrapper>
        {/* Keep shell mounted on soft nav; do not remount the empty initial loader. */}
        <Suspense
          fallback={
            <p className="px-10 pt-8 text-sm text-text-secondary">Cargando…</p>
          }
        >
          {children}
        </Suspense>
      </QueryClientProviderWrapper>
    </GlobalSidebar>
  );
}

const AppLayout = ({ children }: AppLayoutProperties): ReactNode => (
  <SidebarProvider className="h-svh min-h-0 overflow-hidden" open>
    <Suspense fallback={<StaffShellInitialLoader />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  </SidebarProvider>
);

export default AppLayout;
