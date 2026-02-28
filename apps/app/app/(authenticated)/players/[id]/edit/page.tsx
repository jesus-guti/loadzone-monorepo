import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const { userId } = await auth();
  if (!userId) notFound();

  const admin = await database.admin.findFirst({
    where: { clerkId: userId },
    select: { teamId: true },
  });
  if (!admin) notFound();

  const player = await database.player.findUnique({
    where: { id, teamId: admin.teamId },
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
