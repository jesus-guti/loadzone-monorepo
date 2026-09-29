-- Coarse lines become the closest specific role. New values are the rest of the roster.
ALTER TYPE "PlayingPosition" RENAME VALUE 'DEF' TO 'DFC';
ALTER TYPE "PlayingPosition" RENAME VALUE 'MED' TO 'MC';
ALTER TYPE "PlayingPosition" RENAME VALUE 'DEL' TO 'DC';

ALTER TYPE "PlayingPosition" ADD VALUE 'LD';
ALTER TYPE "PlayingPosition" ADD VALUE 'LI';
ALTER TYPE "PlayingPosition" ADD VALUE 'MCD';
ALTER TYPE "PlayingPosition" ADD VALUE 'MCO';
ALTER TYPE "PlayingPosition" ADD VALUE 'ED';
ALTER TYPE "PlayingPosition" ADD VALUE 'EI';
