import { database } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../../../components/header";
import { EditPlayerForm } from "./form";

export const metadata: Metadata = {
  title: "Editar jugador | LoadZone",
};

type EditPlayerPageProperties = {
  params: Promise<{ id: string }>;
};

const EditPlayerPage = async ({ params }: EditPlayerPageProperties) => {
  const { id } = await params;
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.primaryTeam) notFound();

  const player = await database.player.findUnique({
    where: { id, teamId: staffContext.primaryTeam.id },
    select: { id: true, name: true, status: true },
  });

  if (!player) notFound();

  return (
    <>
      <Header page={`Editar: ${player.name}`} pages={["LoadZone", "Jugadores"]} />
      <div className="mx-auto max-w-md p-4 pt-0">
        <EditPlayerForm player={player} />
      </div>
    </>
  );
};

export default EditPlayerPage;
