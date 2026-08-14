-- CreateEnum
CREATE TYPE "PlayerReminderConsentState" AS ENUM ('ELIGIBLE', 'OPTED_IN', 'OPTED_OUT', 'GUARDIAN_BLOCKED', 'ASSISTED_GUARDIAN_GRANTED');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "reminderConsentPolicy" JSONB;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "reminderConsentState" "PlayerReminderConsentState" NOT NULL DEFAULT 'ELIGIBLE';
