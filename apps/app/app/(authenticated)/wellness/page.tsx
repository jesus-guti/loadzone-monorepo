import { Button } from "@repo/design-system/components/ui/button";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../components/header";
import { TeamWellnessWorkspace } from "./components/team-wellness-workspace";
import { WellnessDateFilter } from "./components/wellness-date-filter";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { ACTIVE_WELLNESS_DATE_COOKIE_NAME } from "@/lib/auth-context";
import { getTeamWellnessWorkspaceData } from "@/lib/team-wellness";

export const metadata: Metadata = {
  title: "Wellness | LoadZone",
  description: "Workspace diario del equipo activo",
};

function parseWellnessDateValue(dateValue: string | null): Date | null {
  if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

const WellnessPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const cookieStore = await cookies();
  const evaluatedDate = parseWellnessDateValue(
    cookieStore.get(ACTIVE_WELLNESS_DATE_COOKIE_NAME)?.value ?? null
  );

  const data = await getTeamWellnessWorkspaceData(
    staffContext.activeTeam.id,
    staffContext.activeSeason?.id,
    evaluatedDate
  );
  if (!data) {
    notFound();
  }

  return (
    <>
      <Header page="Wellness" pages={["LoadZone"]}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <WellnessDateFilter initialDate={data.evaluatedDate} />
          <Button asChild size="sm" variant="outline">
            <Link href="/settings#wellness-forms">Editar wellness</Link>
          </Button>
        </div>
      </Header>
      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-2 md:gap-8 md:px-6">
        <TeamWellnessWorkspace
          evaluatedDate={data.evaluatedDate}
          players={data.players}
          wellnessLimits={staffContext.activeTeam.wellnessLimits}
        />
      </div>
    </>
  );
};

export default WellnessPage;
