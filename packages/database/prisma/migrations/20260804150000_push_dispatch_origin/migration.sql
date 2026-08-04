-- CreateEnum
CREATE TYPE "PushDispatchOrigin" AS ENUM ('AUTOMATED', 'STAFF_RE_NUDGE');

-- AlterTable: existing rows are automated cron dispatches
ALTER TABLE "PushDispatch" ADD COLUMN "origin" "PushDispatchOrigin" NOT NULL DEFAULT 'AUTOMATED';

-- DropIndex
DROP INDEX "PushDispatch_teamSessionId_playerId_kind_key";

-- CreateIndex
CREATE UNIQUE INDEX "PushDispatch_teamSessionId_playerId_kind_origin_key" ON "PushDispatch"("teamSessionId", "playerId", "kind", "origin");
