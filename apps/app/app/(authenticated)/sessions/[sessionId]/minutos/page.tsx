import { database } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { Header } from "@/components/layouts/header";
import { FORMATIONS, type Formation } from "@/features/minutes/derive";
import { MinutesEditor } from "@/features/minutes/minutes-editor";
import { getCurrentStaffContext } from "@/lib/auth-context";

export const metadata: Metadata = { title: "Minutos | LoadZone" };

type PageProps = { params: Promise<{ sessionId: string }> };

function idsByRole(
  players: readonly { playerId: string; role: string; sortOrder: number }[],
  role: "STARTER" | "BENCH"
): string[] {
  return players
    .filter((player) => player.role === role)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((player) => player.playerId);
}
async function previousLineup(
  teamId: string,
  startsAt: Date
): Promise<{
  formation: string;
  players: { playerId: string; role: string; sortOrder: number }[];
} | null> {
  return database.matchLineup.findFirst({
    where: {
      teamSession: {
        teamId,
        type: "MATCH",
        startsAt: { lt: startsAt },
      },
    },
    orderBy: { teamSession: { startsAt: "desc" } },
    select: {
      formation: true,
      players: { select: { playerId: true, role: true, sortOrder: true } },
    },
  });
}

function isFormation(value: string): value is Formation {
  return FORMATIONS.some((item) => item === value);
}

function formationOf(value: string | undefined): Formation {
  if (value && isFormation(value)) {
    return value;
  }
  return "F_4_3_3";
}

const MinutesPage = async ({ params }: PageProps): Promise<ReactElement> => {
  const { sessionId } = await params;
  const staff = await getCurrentStaffContext();
  if (!staff?.activeTeam) {
    notFound();
  }
  const session = await database.teamSession.findFirst({
    where: {
      id: sessionId,
      teamId: staff.activeTeam.id,
    },
    select: {
      id: true,
      title: true,
      type: true,
      startsAt: true,
      sharedMinutes: true,
      teamId: true,
      lineup: {
        select: {
          formation: true,
          extraTime: true,
          stoppageFirst: true,
          stoppageSecond: true,
          stoppageExtraFirst: true,
          stoppageExtraSecond: true,
          players: { select: { playerId: true, role: true, sortOrder: true } },
          substitutions: {
            select: { minute: true, playerOutId: true, playerInId: true },
          },
        },
      },
    },
  });
  if (!session) {
    notFound();
  }
  const players = await database.player.findMany({
    where: { teamId: session.teamId, isArchived: false },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const previous =
    session.type === "MATCH" && !session.lineup
      ? await previousLineup(session.teamId, session.startsAt)
      : null;
  const source = session.lineup ?? previous;
  const starters = idsByRole(source?.players ?? [], "STARTER");
  const bench = idsByRole(source?.players ?? [], "BENCH");
  const formation = formationOf(source?.formation);
  return (
    <>
      <Header page="Minutos" pages={["Sesiones", session.title]} />
      <div className="px-4 py-6">
        <MinutesEditor
          initialBench={bench}
          initialExtraTime={session.lineup?.extraTime ?? false}
          initialFormation={formation}
          initialStarters={starters}
          initialStoppage={[
            session.lineup?.stoppageFirst ?? 0,
            session.lineup?.stoppageSecond ?? 0,
            session.lineup?.stoppageExtraFirst ?? 0,
            session.lineup?.stoppageExtraSecond ?? 0,
          ]}
          initialSubs={(session.lineup?.substitutions ?? []).map((change) => ({
            minute: change.minute,
            playerOutId: change.playerOutId,
            playerInId: change.playerInId,
          }))}
          isMatch={session.type === "MATCH"}
          players={players}
          promptHour={staff.activeTeam.minutesPromptHour ?? 20}
          sessionId={session.id}
          sharedMinutes={session.sharedMinutes}
        />
      </div>
    </>
  );
};

export default MinutesPage;
