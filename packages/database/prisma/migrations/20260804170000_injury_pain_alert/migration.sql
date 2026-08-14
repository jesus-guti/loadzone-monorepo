-- JES-50: Injury / BodyRegion / PainAlert replace InjuryReport

-- CreateEnum
CREATE TYPE "BodyRegionId" AS ENUM (
  'HEAD',
  'NECK',
  'SHOULDER_R',
  'SHOULDER_L',
  'UPPER_ARM_R',
  'UPPER_ARM_L',
  'ELBOW_R',
  'ELBOW_L',
  'WRIST_HAND_R',
  'WRIST_HAND_L',
  'CHEST',
  'ABDOMEN',
  'UPPER_BACK',
  'LOWER_BACK',
  'HIP_GROIN_R',
  'HIP_GROIN_L',
  'GLUTE_R',
  'GLUTE_L',
  'THIGH_FRONT_R',
  'THIGH_FRONT_L',
  'THIGH_BACK_R',
  'THIGH_BACK_L',
  'KNEE_R',
  'KNEE_L',
  'SHIN_R',
  'SHIN_L',
  'CALF_R',
  'CALF_L',
  'ANKLE_R',
  'ANKLE_L',
  'FOOT_R',
  'FOOT_L'
);

-- CreateTable
CREATE TABLE "Injury" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "cause" TEXT NOT NULL,
    "severity" "InjurySeverity" NOT NULL DEFAULT 'UNKNOWN',
    "regionDetail" TEXT,
    "staffNotes" TEXT,
    "expectedReturnDate" DATE,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Injury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjuryBodyRegion" (
    "id" TEXT NOT NULL,
    "injuryId" TEXT NOT NULL,
    "regionId" "BodyRegionId" NOT NULL,

    CONSTRAINT "InjuryBodyRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainAlert" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bodyPart" TEXT,
    "side" "InjurySide",
    "injuryType" TEXT,
    "severity" "InjurySeverity" NOT NULL DEFAULT 'UNKNOWN',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promotedInjuryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PainAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Injury_playerId_startDate_idx" ON "Injury"("playerId", "startDate");

-- CreateIndex
CREATE INDEX "Injury_teamId_startDate_idx" ON "Injury"("teamId", "startDate");

-- CreateIndex
CREATE INDEX "Injury_playerId_endDate_idx" ON "Injury"("playerId", "endDate");

-- CreateIndex
CREATE INDEX "Injury_createdByUserId_idx" ON "Injury"("createdByUserId");

-- CreateIndex
CREATE INDEX "InjuryBodyRegion_regionId_idx" ON "InjuryBodyRegion"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "InjuryBodyRegion_injuryId_regionId_key" ON "InjuryBodyRegion"("injuryId", "regionId");

-- CreateIndex
CREATE INDEX "PainAlert_playerId_reportedAt_idx" ON "PainAlert"("playerId", "reportedAt");

-- CreateIndex
CREATE INDEX "PainAlert_teamId_reportedAt_idx" ON "PainAlert"("teamId", "reportedAt");

-- CreateIndex
CREATE INDEX "PainAlert_promotedInjuryId_idx" ON "PainAlert"("promotedInjuryId");

-- AddForeignKey
ALTER TABLE "Injury" ADD CONSTRAINT "Injury_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injury" ADD CONSTRAINT "Injury_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injury" ADD CONSTRAINT "Injury_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjuryBodyRegion" ADD CONSTRAINT "InjuryBodyRegion_injuryId_fkey" FOREIGN KEY ("injuryId") REFERENCES "Injury"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAlert" ADD CONSTRAINT "PainAlert_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAlert" ADD CONSTRAINT "PainAlert_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainAlert" ADD CONSTRAINT "PainAlert_promotedInjuryId_fkey" FOREIGN KEY ("promotedInjuryId") REFERENCES "Injury"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Best-effort legacy bodyPart/side → BodyRegionId[] (HITL A accepted)
CREATE OR REPLACE FUNCTION jes50_map_legacy_body_regions(
  body_part TEXT,
  side "InjurySide"
) RETURNS "BodyRegionId"[]
LANGUAGE plpgsql
AS $$
DECLARE
  normalized TEXT;
  base TEXT;
  regions "BodyRegionId"[] := ARRAY[]::"BodyRegionId"[];
BEGIN
  IF body_part IS NULL OR btrim(body_part) = '' THEN
    RETURN regions;
  END IF;

  normalized := lower(btrim(body_part));
  normalized := translate(normalized, 'áàäâéèëêíìïîóòöôúùüûñ', 'aaaaeeeeiiiioooouuuun');

  IF normalized ~ '(cabeza|head|craneo|cranium|skull)' THEN
    base := 'HEAD';
  ELSIF normalized ~ '(cuello|neck|cervical)' THEN
    base := 'NECK';
  ELSIF normalized ~ '(hombro|shoulder)' THEN
    base := 'SHOULDER';
  ELSIF normalized ~ '(codo|elbow)' THEN
    base := 'ELBOW';
  ELSIF normalized ~ '(muneca|wrist|mano|hand)' THEN
    base := 'WRIST_HAND';
  ELSIF normalized ~ '(brazo|upper.?arm|bicep|tricep)' THEN
    base := 'UPPER_ARM';
  ELSIF normalized ~ '(pecho|chest|torax|thorax|sternum)' THEN
    base := 'CHEST';
  ELSIF normalized ~ '(abdomen|abdominal|core)' THEN
    base := 'ABDOMEN';
  ELSIF normalized ~ '(espalda baja|lower.?back|lumbar)' THEN
    base := 'LOWER_BACK';
  ELSIF normalized ~ '(espalda alta|upper.?back|dorsal)' THEN
    base := 'UPPER_BACK';
  ELSIF normalized ~ '(espalda|back)' THEN
    base := 'UPPER_BACK';
  ELSIF normalized ~ '(cadera|hip|ingle|groin|adductor)' THEN
    base := 'HIP_GROIN';
  ELSIF normalized ~ '(gluteo|glute|nalga|buttock)' THEN
    base := 'GLUTE';
  ELSIF normalized ~ '(isquio|hamstring|muslo posterior|thigh.?back|posterior.?thigh)' THEN
    base := 'THIGH_BACK';
  ELSIF normalized ~ '(cuadricep|quad|muslo anterior|thigh.?front|anterior.?thigh)' THEN
    base := 'THIGH_FRONT';
  ELSIF normalized ~ '(muslo|thigh)' THEN
    base := 'THIGH_FRONT';
  ELSIF normalized ~ '(rodilla|knee)' THEN
    base := 'KNEE';
  ELSIF normalized ~ '(gemelo|pantorrilla|calf)' THEN
    base := 'CALF';
  ELSIF normalized ~ '(tibia|shin|pierna anterior|lower.?leg)' THEN
    base := 'SHIN';
  ELSIF normalized ~ '(tobillo|ankle)' THEN
    base := 'ANKLE';
  ELSIF normalized ~ '(pie|foot|talon|heel)' THEN
    base := 'FOOT';
  ELSE
    RETURN regions;
  END IF;

  IF base IN ('HEAD', 'NECK', 'CHEST', 'ABDOMEN', 'UPPER_BACK', 'LOWER_BACK') THEN
    regions := ARRAY[base::"BodyRegionId"];
  ELSIF side = 'LEFT' THEN
    regions := ARRAY[(base || '_L')::"BodyRegionId"];
  ELSIF side = 'RIGHT' THEN
    regions := ARRAY[(base || '_R')::"BodyRegionId"];
  ELSIF side = 'BILATERAL' THEN
    regions := ARRAY[(base || '_L')::"BodyRegionId", (base || '_R')::"BodyRegionId"];
  ELSE
    -- CENTRAL / null: map both sides for paired regions
    regions := ARRAY[(base || '_L')::"BodyRegionId", (base || '_R')::"BodyRegionId"];
  END IF;

  RETURN regions;
EXCEPTION
  WHEN others THEN
    RETURN ARRAY[]::"BodyRegionId"[];
END;
$$;

-- Migrate player rows → PainAlert
INSERT INTO "PainAlert" (
  "id",
  "playerId",
  "teamId",
  "title",
  "description",
  "bodyPart",
  "side",
  "injuryType",
  "severity",
  "reportedAt",
  "promotedInjuryId",
  "createdAt",
  "updatedAt"
)
SELECT
  ir."id",
  ir."playerId",
  ir."teamId",
  ir."title",
  ir."description",
  ir."bodyPart",
  ir."side",
  ir."injuryType",
  ir."severity",
  ir."reportedAt",
  NULL,
  ir."createdAt",
  ir."updatedAt"
FROM "InjuryReport" ir
WHERE ir."reportedByPlayer" = true;

-- Migrate staff rows → Injury (+ regions / orphan regionDetail)
DO $$
DECLARE
  rec RECORD;
  tz TEXT;
  start_civil DATE;
  end_civil DATE;
  mapped "BodyRegionId"[];
  detail TEXT;
  notes TEXT;
  region_id "BodyRegionId";
  orphan_count INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT ir.*, t."timezone" AS team_timezone
    FROM "InjuryReport" ir
    INNER JOIN "Team" t ON t."id" = ir."teamId"
    WHERE ir."reportedByPlayer" = false
  LOOP
    tz := COALESCE(NULLIF(rec.team_timezone, ''), 'Europe/Madrid');
    start_civil := (
      timezone(tz, COALESCE(rec."occurredAt", rec."reportedAt"))
    )::date;

    IF rec."status" = 'RESOLVED' THEN
      end_civil := (
        timezone(tz, COALESCE(rec."resolvedAt", rec."reportedAt"))
      )::date;
    ELSE
      end_civil := NULL;
    END IF;

    notes := NULLIF(
      btrim(
        concat_ws(
          E'\n\n',
          NULLIF(btrim(COALESCE(rec."staffNotes", '')), ''),
          NULLIF(btrim(COALESCE(rec."description", '')), '')
        )
      ),
      ''
    );

    mapped := jes50_map_legacy_body_regions(rec."bodyPart", rec."side");
    detail := NULL;

    IF coalesce(array_length(mapped, 1), 0) = 0 THEN
      detail := NULLIF(
        btrim(
          concat_ws(
            ' · ',
            NULLIF(btrim(COALESCE(rec."bodyPart", '')), ''),
            CASE WHEN rec."side" IS NULL THEN NULL ELSE rec."side"::text END,
            NULLIF(btrim(COALESCE(rec."injuryType", '')), '')
          )
        ),
        ''
      );
      orphan_count := orphan_count + 1;
      RAISE NOTICE 'JES-50 orphan Injury regions: id=% bodyPart=% side=%',
        rec."id", rec."bodyPart", rec."side";
    END IF;

    INSERT INTO "Injury" (
      "id",
      "playerId",
      "teamId",
      "startDate",
      "endDate",
      "cause",
      "severity",
      "regionDetail",
      "staffNotes",
      "expectedReturnDate",
      "createdByUserId",
      "createdAt",
      "updatedAt"
    ) VALUES (
      rec."id",
      rec."playerId",
      rec."teamId",
      start_civil,
      end_civil,
      rec."title",
      rec."severity",
      detail,
      notes,
      NULL,
      rec."reportedByUserId",
      rec."createdAt",
      rec."updatedAt"
    );

    IF mapped IS NOT NULL THEN
      FOREACH region_id IN ARRAY mapped
      LOOP
        INSERT INTO "InjuryBodyRegion" ("id", "injuryId", "regionId")
        VALUES (
          md5(rec."id" || region_id::text || 'jes50'),
          rec."id",
          region_id
        )
        ON CONFLICT ("injuryId", "regionId") DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;

  RAISE NOTICE 'JES-50 migration orphan Injury count: %', orphan_count;
END $$;

-- Backfill Player.status from active Injuries (team-local today)
DO $$
DECLARE
  player_rec RECORD;
  tz TEXT;
  today_civil DATE;
  active_count INTEGER;
BEGIN
  FOR player_rec IN
    SELECT p."id", p."status", t."timezone"
    FROM "Player" p
    INNER JOIN "Team" t ON t."id" = p."teamId"
  LOOP
    tz := COALESCE(NULLIF(player_rec."timezone", ''), 'Europe/Madrid');
    today_civil := (timezone(tz, now()))::date;

    SELECT COUNT(*)::integer INTO active_count
    FROM "Injury" i
    WHERE i."playerId" = player_rec."id"
      AND i."startDate" <= today_civil
      AND (i."endDate" IS NULL OR i."endDate" >= today_civil);

    IF active_count > 0 THEN
      UPDATE "Player" SET "status" = 'INJURED' WHERE "id" = player_rec."id";
    ELSIF player_rec."status" = 'INJURED' THEN
      UPDATE "Player" SET "status" = 'AVAILABLE' WHERE "id" = player_rec."id";
    END IF;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS jes50_map_legacy_body_regions(TEXT, "InjurySide");

-- DropTable
DROP TABLE "InjuryReport";

-- DropEnum
DROP TYPE "InjuryStatus";
