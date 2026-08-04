-- AlterTable
ALTER TABLE "Player" ADD COLUMN "streakSeasonId" TEXT;

-- CreateTable
CREATE TABLE "ExcusedAbsence" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdByMembershipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExcusedAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Player_streakSeasonId_idx" ON "Player"("streakSeasonId");

-- CreateIndex
CREATE INDEX "ExcusedAbsence_seasonId_date_idx" ON "ExcusedAbsence"("seasonId", "date");

-- CreateIndex
CREATE INDEX "ExcusedAbsence_playerId_date_idx" ON "ExcusedAbsence"("playerId", "date");

-- CreateIndex
CREATE INDEX "ExcusedAbsence_createdByMembershipId_idx" ON "ExcusedAbsence"("createdByMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "ExcusedAbsence_playerId_date_key" ON "ExcusedAbsence"("playerId", "date");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_streakSeasonId_fkey" FOREIGN KEY ("streakSeasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcusedAbsence" ADD CONSTRAINT "ExcusedAbsence_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcusedAbsence" ADD CONSTRAINT "ExcusedAbsence_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcusedAbsence" ADD CONSTRAINT "ExcusedAbsence_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
