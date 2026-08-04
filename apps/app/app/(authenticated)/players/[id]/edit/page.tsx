import { database } from "@repo/database";
import {
  resolveAgeBandPolicy,
  resolveEffectiveAgeBandPolicy,
} from "@repo/database/age-band-policy";
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
      ageBandOverride: true,
      reminderConsentState: true,
      team: {
        select: {
          timezone: true,
          ageBandPolicy: true,
          club: { select: { ageBandPolicy: true } },
        },
      },
    },
  });

  if (!player) notFound();

  const dateOfBirth =
    player.dateOfBirth === null
      ? null
      : player.dateOfBirth.toISOString().slice(0, 10);

  const effectiveAge = resolveEffectiveAgeBandPolicy({
    teamPolicy: player.team.ageBandPolicy,
    clubPolicy: player.team.club.ageBandPolicy,
  });
  const resolvedAge = resolveAgeBandPolicy({
    policy: effectiveAge.policy,
    policySource: effectiveAge.source,
    dateOfBirth: player.dateOfBirth,
    ageBandOverride: player.ageBandOverride,
    teamTimezone: player.team.timezone,
  });

  // Lock status while ≥1 open Injury episode (endDate null), including future starts.
  const openEpisodeCount = await database.injury.count({
    where: {
      playerId: player.id,
      teamId: staffContext.activeTeam.id,
      endDate: null,
    },
  });

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
            ageBandOverride: player.ageBandOverride,
            reminderConsentState: player.reminderConsentState,
            resolvedAgeBand: resolvedAge.ageBand,
          }}
          hasOpenInjury={openEpisodeCount > 0}
        />
      </div>
    </>
  );
};

export default EditPlayerPage;
