-- CreateEnum
CREATE TYPE "CareAlertTriggerClass" AS ENUM ('INJURY_PAIN', 'CARE_RELEVANT_WELLNESS');

-- CreateTable
CREATE TABLE "CareAlertDispatch" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "triggerClass" "CareAlertTriggerClass" NOT NULL,
    "civilDate" DATE NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareAlertDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareAlertDispatch_playerId_civilDate_idx" ON "CareAlertDispatch"("playerId", "civilDate");

-- CreateIndex
CREATE UNIQUE INDEX "CareAlertDispatch_playerId_triggerClass_civilDate_key" ON "CareAlertDispatch"("playerId", "triggerClass", "civilDate");

-- AddForeignKey
ALTER TABLE "CareAlertDispatch" ADD CONSTRAINT "CareAlertDispatch_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
