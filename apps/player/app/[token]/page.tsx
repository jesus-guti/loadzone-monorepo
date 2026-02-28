import { database } from "@repo/database";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { SessionPage } from "./components/session-page";

type PageProperties = {
  params: Promise<{ token: string }>;
};

const PlayerPage = async ({ params }: PageProperties) => {
  const { token } = await params;

  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: {
      id: true,
      name: true,
      currentStreak: true,
    },
  });

  if (!player) {
    notFound();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEntry = await database.dailyEntry.findUnique({
    where: {
      playerId_date: { playerId: player.id, date: today },
    },
    select: {
      preFilledAt: true,
      postFilledAt: true,
    },
  });

  return (
    <SessionPage
      token={token}
      playerName={player.name}
      currentStreak={player.currentStreak}
      apiUrl={env.NEXT_PUBLIC_API_URL ?? ""}
      todayEntry={todayEntry}
    />
  );
};

export default PlayerPage;
