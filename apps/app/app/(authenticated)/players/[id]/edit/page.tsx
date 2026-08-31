import { database } from "@repo/database";
import { playerHasActiveInjury } from "@repo/database/injury-status";
import { toCivilDateString } from "@repo/database/recoverable-streak";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "@/components/layouts/header";
import { EditPlayerForm } from "@/features/players";

export const metadata: Metadata = {
  title: "Editar jugador | LoadZone",
};

type EditPlayerPageProperties = {
  params: Promise<{ id: string }>;
};

const EditPlayerPage = async ({ params }: EditPlayerPageProperties) => {
  const { id } = await params;
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.activeTeam) notFound();

  const player = await database.player.findUnique({
    where: { id, teamId: staffContext.activeTeam.id },
    select: {
      id: true,
      name: true,
      status: true,
      dateOfBirth: true,
      playingPosition: true,
      shirtNumber: true,
      reminderConsentState: true,
      team: {
        select: {
          timezone: true,
        },
      },
    },
  });

  if (!player) notFound();

  const dateOfBirth =
    player.dateOfBirth === null
      ? null
      : player.dateOfBirth.toISOString().slice(0, 10);

  // Lock status only while ≥1 Injury is civil-day active in Team.timezone today
  // (future-dated open episodes do not force Lesionado).
  const teamTimezone = player.team.timezone;
  const todayCivil = toCivilDateString(new Date(), teamTimezone);
  const hasActiveInjury = await playerHasActiveInjury(
    database,
    player.id,
    todayCivil,
    teamTimezone
  );

  return (
    <>
      <Header page={`Editar: ${player.name}`} pages={["LoadZone", "Jugadores"]} />
      <div className="mx-auto max-w-md p-4 pt-0">
        <EditPlayerForm
          player={{
            id: player.id,
            name: player.name,
            status: player.status,
            dateOfBirth,
            playingPosition: player.playingPosition,
            shirtNumber: player.shirtNumber,
            reminderConsentState: player.reminderConsentState,
          }}
          hasActiveInjury={hasActiveInjury}
        />
      </div>
    </>
  );
};

export default EditPlayerPage;
