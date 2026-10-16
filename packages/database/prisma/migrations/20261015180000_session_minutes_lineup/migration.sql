-- Staff shared session minutes, match lineup, and the hour the minutes banner may appear.

ALTER TABLE "Team" ADD COLUMN "minutesPromptHour" INTEGER NOT NULL DEFAULT 20;

ALTER TABLE "TeamSession" ADD COLUMN "sharedMinutes" INTEGER;

CREATE TYPE "Formation" AS ENUM ('F_4_3_3', 'F_4_4_2', 'F_4_2_3_1', 'F_3_5_2', 'F_5_3_2');
CREATE TYPE "LineupRole" AS ENUM ('STARTER', 'BENCH');

CREATE TABLE "MatchLineup" (
  "id" TEXT NOT NULL,
  "teamSessionId" TEXT NOT NULL,
  "formation" "Formation" NOT NULL,
  "extraTime" BOOLEAN NOT NULL DEFAULT false,
  "stoppageFirst" INTEGER NOT NULL DEFAULT 0,
  "stoppageSecond" INTEGER NOT NULL DEFAULT 0,
  "stoppageExtraFirst" INTEGER NOT NULL DEFAULT 0,
  "stoppageExtraSecond" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MatchLineup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MatchLineup_teamSessionId_key" ON "MatchLineup"("teamSessionId");

CREATE TABLE "MatchLineupPlayer" (
  "id" TEXT NOT NULL,
  "lineupId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "role" "LineupRole" NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  CONSTRAINT "MatchLineupPlayer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MatchLineupPlayer_lineupId_playerId_key" ON "MatchLineupPlayer"("lineupId", "playerId");
CREATE INDEX "MatchLineupPlayer_playerId_idx" ON "MatchLineupPlayer"("playerId");

CREATE TABLE "MatchSubstitution" (
  "id" TEXT NOT NULL,
  "lineupId" TEXT NOT NULL,
  "minute" INTEGER NOT NULL,
  "playerOutId" TEXT NOT NULL,
  "playerInId" TEXT,
  CONSTRAINT "MatchSubstitution_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MatchSubstitution_lineupId_idx" ON "MatchSubstitution"("lineupId");

ALTER TABLE "MatchLineup" ADD CONSTRAINT "MatchLineup_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchLineupPlayer" ADD CONSTRAINT "MatchLineupPlayer_lineupId_fkey" FOREIGN KEY ("lineupId") REFERENCES "MatchLineup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchLineupPlayer" ADD CONSTRAINT "MatchLineupPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchSubstitution" ADD CONSTRAINT "MatchSubstitution_lineupId_fkey" FOREIGN KEY ("lineupId") REFERENCES "MatchLineup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchSubstitution" ADD CONSTRAINT "MatchSubstitution_playerOutId_fkey" FOREIGN KEY ("playerOutId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchSubstitution" ADD CONSTRAINT "MatchSubstitution_playerInId_fkey" FOREIGN KEY ("playerInId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
