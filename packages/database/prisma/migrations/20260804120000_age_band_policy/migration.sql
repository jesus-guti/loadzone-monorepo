-- CreateEnum
CREATE TYPE "AgeBand" AS ENUM ('ASSISTED', 'GUIDED', 'INDEPENDENT');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN "ageBandPolicy" JSONB;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN "ageBandPolicy" JSONB;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "dateOfBirth" DATE,
ADD COLUMN "ageBandOverride" "AgeBand";
