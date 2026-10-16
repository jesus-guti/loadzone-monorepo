-- Staff soft-delete for Injury (history retained; excluded from product reads).
ALTER TABLE "Injury" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Injury_teamId_deletedAt_idx" ON "Injury"("teamId", "deletedAt");
CREATE INDEX "Injury_playerId_deletedAt_idx" ON "Injury"("playerId", "deletedAt");
