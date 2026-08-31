-- Staff can archive a Pain Alert without creating an Injury (undo via null).

ALTER TABLE "PainAlert" ADD COLUMN "dismissedAt" TIMESTAMP(3);

CREATE INDEX "PainAlert_teamId_dismissedAt_idx" ON "PainAlert"("teamId", "dismissedAt");
