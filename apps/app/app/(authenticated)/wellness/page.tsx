import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
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

  let data: Awaited<ReturnType<typeof getTeamWellnessWorkspaceData>>;
  try {
    data = await getTeamWellnessWorkspaceData(
      staffContext.activeTeam.id,
      staffContext.activeSeason?.id,
      evaluatedDate
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    return (
      <pre className="whitespace-pre-wrap p-4 text-xs">
        {`[DEBUG-a4f2] wellness-query\n${message}\n${stack}`}
      </pre>
    );
  }
  if (!data) {
    notFound();
  }

  return (
    <div className="p-4 text-sm">wellness-ok {data.players.length}</div>
  );
};

export default WellnessPage;
