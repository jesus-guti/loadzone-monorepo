import { database } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../components/header";
import { TeamWellnessWorkspace } from "./components/team-wellness-workspace";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { getTeamWellnessWorkspaceData } from "@/lib/team-wellness";

export const metadata: Metadata = {
  title: "Wellness | LoadZone",
  description: "Workspace diario del equipo activo",
};

function getWellnessSummaryCopy(values: {
  postFormName: string | null;
  preFormName: string | null;
}): string {
  const parts = [
    values.preFormName ? `Pre: ${values.preFormName}` : "Pre: sin asignar",
    values.postFormName ? `Post: ${values.postFormName}` : "Post: sin asignar",
  ];

  return parts.join(" · ");
}

const WellnessPage = async () => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) {
    notFound();
  }

  const data = await getTeamWellnessWorkspaceData(
    staffContext.activeTeam.id,
    staffContext.activeSeason?.id
  );
  if (!data) {
    notFound();
  }

  const assignments = await database.formAssignment.findMany({
    where: {
      teamId: staffContext.activeTeam.id,
      teamSessionId: null,
      isActive: true,
    },
    select: {
      fillMoment: true,
      template: {
        select: {
          name: true,
        },
      },
    },
  });
  const preFormName =
    assignments.find((assignment) => assignment.fillMoment === "PRE_SESSION")
      ?.template.name ?? null;
  const postFormName =
    assignments.find((assignment) => assignment.fillMoment === "POST_SESSION")
      ?.template.name ?? null;

  return (
    <>
      <Header page="Wellness" pages={["LoadZone"]}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="hidden rounded-md border border-border-secondary bg-bg-secondary px-3 py-2 text-right md:block">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
              Formularios activos
            </p>
            <p className="mt-1 max-w-xs truncate text-sm text-text-primary">
              {getWellnessSummaryCopy({ postFormName, preFormName })}
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/settings#wellness-forms">Editar wellness</Link>
          </Button>
        </div>
      </Header>
      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-2 md:px-6">
        <TeamWellnessWorkspace players={data.players} />
      </div>
    </>
  );
};

export default WellnessPage;
