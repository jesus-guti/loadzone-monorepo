import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layouts/header";
import { TeamInjuriesList } from "@/features/injuries/components/team-injuries-list";
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

  const data = await getTeamInjuriesList(staffContext.activeTeam.id);

  return (
    <>
      <Header page="Lesiones" pages={["LoadZone"]} />
      <div className="mx-auto max-w-4xl p-4 pt-0">
        <TeamInjuriesList data={data} />
      </div>
    </>
  );
};

export default InjuriesPage;
