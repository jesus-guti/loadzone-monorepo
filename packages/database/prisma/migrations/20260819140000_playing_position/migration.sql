-- CreateEnum
CREATE TYPE "PlayingPosition" AS ENUM ('POR', 'DEF', 'MED', 'DEL');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "playingPosition" "PlayingPosition";
