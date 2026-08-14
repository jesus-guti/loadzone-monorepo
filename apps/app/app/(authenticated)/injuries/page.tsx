import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamInjuriesList } from "@/features/injuries/queries/get-team-injuries-list";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Lesiones | LoadZone",
};

const InjuriesPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  let data: Awaited<ReturnType<typeof getTeamInjuriesList>>;
  try {
    data = await getTeamInjuriesList(staffContext.activeTeam.id);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    return (
      <pre className="whitespace-pre-wrap p-4 text-xs">
        {`[DEBUG-a4f2] injuries-query\n${message}\n${stack}`}
      </pre>
    );
  }

  return (
    <div className="p-4 text-sm">
      injuries-ok {data.activeInjuries.length}
    </div>
  );
};

export default InjuriesPage;
