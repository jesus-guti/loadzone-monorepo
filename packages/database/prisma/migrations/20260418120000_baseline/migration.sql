-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('PLAYER', 'STAFF', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('AVAILABLE', 'MODIFIED_TRAINING', 'INJURED', 'ILL', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "TeamSessionType" AS ENUM ('TRAINING', 'MATCH', 'RECOVERY', 'OTHER');

-- CreateEnum
CREATE TYPE "TeamSessionVisibility" AS ENUM ('TEAM_PRIVATE', 'CLUB_SHARED');

-- CreateEnum
CREATE TYPE "TeamSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FormTemplateKind" AS ENUM ('WELLNESS', 'TQR', 'RPE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FormQuestionType" AS ENUM ('SCALE', 'NUMBER', 'BOOLEAN', 'TEXT', 'SINGLE_SELECT');

-- CreateEnum
CREATE TYPE "FormFillMoment" AS ENUM ('PRE_SESSION', 'POST_SESSION', 'INJURY_REPORT');

-- CreateEnum
CREATE TYPE "InjurySeverity" AS ENUM ('UNKNOWN', 'MINOR', 'MODERATE', 'MAJOR');

-- CreateEnum
CREATE TYPE "InjuryStatus" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AiSuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PushDispatchKind" AS ENUM ('PRE_SESSION', 'POST_SESSION');

-- CreateEnum
CREATE TYPE "ExerciseLoadFormulaType" AS ENUM ('NONE', 'DURATION_X_RPE', 'FIXED_POINTS', 'CUSTOM_JSON');

-- CreateEnum
CREATE TYPE "ExerciseComplexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "ExerciseStrategy" AS ENUM ('SET_PIECES', 'COMBINED_ACTIONS', 'CIRCUITS', 'CONSERVATION', 'FOOTBALL_ADAPTED_GAME', 'POSITIONAL_PLAY', 'SPECIFIC_POSITIONAL_PLAY', 'WAVES', 'MATCHES', 'POSSESSION', 'PASSING_WHEEL', 'SMALL_SIDED_SITUATIONS', 'LINE_WORK');

-- CreateEnum
CREATE TYPE "CoordinativeSkill" AS ENUM ('STARTING', 'BRAKING', 'CHANGE_OF_DIRECTION', 'DRIBBLING_CARRY', 'BALL_CONTROL', 'CLEARANCES', 'MOVEMENT_PATTERNS', 'SHOOTING', 'TACKLING', 'BALANCING', 'TURNING', 'INTERCEPTION', 'PASSING', 'PROTECTION', 'DRIBBLING_1V1', 'JUMPING');

-- CreateEnum
CREATE TYPE "TacticalIntention" AS ENUM ('ONE_VS_ONE', 'TWO_VS_ONE', 'TWO_VS_TWO', 'THREE_VS_THREE', 'FOUR_VS_FOUR', 'DEFENSIVE_SET_PIECES', 'OFFENSIVE_SET_PIECES', 'WIDTH', 'SUPPORTS', 'ORGANIZED_ATTACK', 'COVER', 'KEEP_POSSESSION', 'COUNTERATTACK', 'BUILD_UP_DEFENSE', 'DIRECT_PLAY_DEFENSE', 'ORGANIZED_DEFENSE', 'RUNS_OFF_THE_BALL', 'SPLIT_LINES', 'PREVENT_PROGRESSION');

-- CreateEnum
CREATE TYPE "ExerciseDynamicType" AS ENUM ('EXTENSIVE', 'STRENGTH', 'INTENSIVE_ACTION', 'INTENSIVE_INTERACTION', 'RECOVERY', 'ENDURANCE', 'SPEED');

-- CreateEnum
CREATE TYPE "GameSituationType" AS ENUM ('FULL_STRUCTURE', 'INTERSECTORAL', 'SECTORAL');

-- CreateEnum
CREATE TYPE "CoordinationType" AS ENUM ('TEAM_COORDINATION', 'SINGLE_PLAYER_COORDINATION', 'MULTI_PLAYER_COORDINATION');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "InjurySide" AS ENUM ('LEFT', 'RIGHT', 'BILATERAL', 'CENTRAL');

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "hasAllTeams" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipTeam" (
    "membershipId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "MembershipTeam_pkey" PRIMARY KEY ("membershipId","teamId")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "preSessionReminderMinutes" INTEGER DEFAULT 120,
    "postSessionReminderMinutes" INTEGER DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "preSeasonEnd" TIMESTAMP(3),
    "teamId" TEXT NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "token" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "PlayerStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushDispatch" (
    "id" TEXT NOT NULL,
    "teamSessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "kind" "PushDispatchKind" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamSessionId" TEXT,
    "formSubmissionId" TEXT,
    "recovery" INTEGER,
    "energy" INTEGER,
    "soreness" INTEGER,
    "sleepHours" DECIMAL(65,30),
    "sleepQuality" INTEGER,
    "preFilledAt" TIMESTAMP(3),
    "rpe" INTEGER,
    "duration" INTEGER,
    "postFilledAt" TIMESTAMP(3),
    "physioAlert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerDailyStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "srpe" DECIMAL(65,30),
    "acuteLoad" DECIMAL(65,30),
    "chronicLoad" DECIMAL(65,30),
    "acwr" DECIMAL(65,30),
    "tqrAvg7d" DECIMAL(65,30),
    "rpeAvg7d" DECIMAL(65,30),
    "riskLevel" "RiskLevel",
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerDailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSession" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "type" "TeamSessionType" NOT NULL,
    "visibility" "TeamSessionVisibility" NOT NULL DEFAULT 'TEAM_PRIVATE',
    "status" "TeamSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "appliesToAllPlayers" BOOLEAN NOT NULL DEFAULT true,
    "preReminderMinutes" INTEGER,
    "postReminderMinutes" INTEGER,
    "seriesId" TEXT,
    "recurrenceRule" TEXT,
    "recurrenceUntil" TIMESTAMP(3),
    "createdByMembershipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSessionPlayer" (
    "teamSessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "TeamSessionPlayer_pkey" PRIMARY KEY ("teamSessionId","playerId")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "clubId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "objectivesText" TEXT NOT NULL,
    "explanationText" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "spaceWidthMeters" DECIMAL(65,30) NOT NULL,
    "spaceLengthMeters" DECIMAL(65,30) NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "complexity" "ExerciseComplexity" NOT NULL,
    "strategy" "ExerciseStrategy" NOT NULL,
    "coordinativeSkill" "CoordinativeSkill" NOT NULL,
    "tacticalIntention" "TacticalIntention" NOT NULL,
    "dynamicType" "ExerciseDynamicType" NOT NULL,
    "gameSituation" "GameSituationType" NOT NULL,
    "coordinationType" "CoordinationType" NOT NULL,
    "diagramData" JSONB,
    "diagramVersion" INTEGER NOT NULL DEFAULT 0,
    "diagramThumbnailUrl" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL,
    "teamSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "durationMinutesOverride" INTEGER,
    "notes" TEXT,
    "loadFormulaType" "ExerciseLoadFormulaType",
    "loadFormulaConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAttendance" (
    "id" TEXT NOT NULL,
    "teamSessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "minutesPlayed" INTEGER,
    "startedMinute" INTEGER,
    "markedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" TEXT NOT NULL,
    "clubId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "FormTemplateKind" NOT NULL,
    "fillMoment" "FormFillMoment" NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormQuestion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FormQuestionType" NOT NULL,
    "helpText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "minValue" DECIMAL(65,30),
    "maxValue" DECIMAL(65,30),
    "step" DECIMAL(65,30),
    "options" JSONB,
    "mappingKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAssignment" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "teamId" TEXT,
    "teamSessionId" TEXT,
    "fillMoment" "FormFillMoment" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamSessionId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjuryReport" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bodyPart" TEXT,
    "injuryType" TEXT,
    "side" "InjurySide",
    "severity" "InjurySeverity" NOT NULL DEFAULT 'UNKNOWN',
    "status" "InjuryStatus" NOT NULL DEFAULT 'REPORTED',
    "reportedByPlayer" BOOLEAN NOT NULL DEFAULT false,
    "reportedByUserId" TEXT,
    "reviewedByMembershipId" TEXT,
    "occurredAt" TIMESTAMP(3),
    "staffNotes" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InjuryReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSuggestion" (
    "id" TEXT NOT NULL,
    "playerId" TEXT,
    "dailyEntryId" TEXT,
    "teamSessionId" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "sourceContext" JSONB,
    "confidence" DECIMAL(65,30),
    "status" "AiSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "acceptedByUserId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_clubId_idx" ON "Membership"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_clubId_role_key" ON "Membership"("userId", "clubId", "role");

-- CreateIndex
CREATE INDEX "MembershipTeam_teamId_idx" ON "MembershipTeam"("teamId");

-- CreateIndex
CREATE INDEX "Team_clubId_idx" ON "Team"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_clubId_name_key" ON "Team"("clubId", "name");

-- CreateIndex
CREATE INDEX "Season_teamId_idx" ON "Season"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_teamId_name_key" ON "Season"("teamId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_token_key" ON "Player"("token");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_token_idx" ON "Player"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_playerId_idx" ON "PushSubscription"("playerId");

-- CreateIndex
CREATE INDEX "PushDispatch_playerId_kind_idx" ON "PushDispatch"("playerId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "PushDispatch_teamSessionId_playerId_kind_key" ON "PushDispatch"("teamSessionId", "playerId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_formSubmissionId_key" ON "DailyEntry"("formSubmissionId");

-- CreateIndex
CREATE INDEX "DailyEntry_seasonId_date_idx" ON "DailyEntry"("seasonId", "date");

-- CreateIndex
CREATE INDEX "DailyEntry_playerId_date_idx" ON "DailyEntry"("playerId", "date");

-- CreateIndex
CREATE INDEX "DailyEntry_teamSessionId_idx" ON "DailyEntry"("teamSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_playerId_date_key" ON "DailyEntry"("playerId", "date");

-- CreateIndex
CREATE INDEX "PlayerDailyStats_seasonId_date_idx" ON "PlayerDailyStats"("seasonId", "date");

-- CreateIndex
CREATE INDEX "PlayerDailyStats_playerId_date_idx" ON "PlayerDailyStats"("playerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerDailyStats_playerId_date_key" ON "PlayerDailyStats"("playerId", "date");

-- CreateIndex
CREATE INDEX "TeamSession_createdByMembershipId_idx" ON "TeamSession"("createdByMembershipId");

-- CreateIndex
CREATE INDEX "TeamSession_clubId_startsAt_idx" ON "TeamSession"("clubId", "startsAt");

-- CreateIndex
CREATE INDEX "TeamSession_teamId_startsAt_idx" ON "TeamSession"("teamId", "startsAt");

-- CreateIndex
CREATE INDEX "TeamSession_seriesId_idx" ON "TeamSession"("seriesId");

-- CreateIndex
CREATE INDEX "TeamSessionPlayer_playerId_idx" ON "TeamSessionPlayer"("playerId");

-- CreateIndex
CREATE INDEX "Exercise_clubId_strategy_idx" ON "Exercise"("clubId", "strategy");

-- CreateIndex
CREATE INDEX "Exercise_clubId_tacticalIntention_idx" ON "Exercise"("clubId", "tacticalIntention");

-- CreateIndex
CREATE INDEX "Exercise_clubId_dynamicType_idx" ON "Exercise"("clubId", "dynamicType");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_clubId_slug_key" ON "Exercise"("clubId", "slug");

-- CreateIndex
CREATE INDEX "SessionExercise_exerciseId_idx" ON "SessionExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionExercise_teamSessionId_order_key" ON "SessionExercise"("teamSessionId", "order");

-- CreateIndex
CREATE INDEX "SessionAttendance_playerId_status_idx" ON "SessionAttendance"("playerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAttendance_teamSessionId_playerId_key" ON "SessionAttendance"("teamSessionId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_code_key" ON "FormTemplate"("code");

-- CreateIndex
CREATE INDEX "FormTemplate_clubId_idx" ON "FormTemplate"("clubId");

-- CreateIndex
CREATE INDEX "FormQuestion_templateId_order_idx" ON "FormQuestion"("templateId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "FormQuestion_templateId_key_key" ON "FormQuestion"("templateId", "key");

-- CreateIndex
CREATE INDEX "FormAssignment_templateId_idx" ON "FormAssignment"("templateId");

-- CreateIndex
CREATE INDEX "FormAssignment_teamId_fillMoment_idx" ON "FormAssignment"("teamId", "fillMoment");

-- CreateIndex
CREATE INDEX "FormAssignment_teamSessionId_fillMoment_idx" ON "FormAssignment"("teamSessionId", "fillMoment");

-- CreateIndex
CREATE INDEX "FormSubmission_templateId_idx" ON "FormSubmission"("templateId");

-- CreateIndex
CREATE INDEX "FormSubmission_playerId_date_idx" ON "FormSubmission"("playerId", "date");

-- CreateIndex
CREATE INDEX "FormSubmission_teamSessionId_idx" ON "FormSubmission"("teamSessionId");

-- CreateIndex
CREATE INDEX "FormAnswer_questionId_idx" ON "FormAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormAnswer_submissionId_questionId_key" ON "FormAnswer"("submissionId", "questionId");

-- CreateIndex
CREATE INDEX "InjuryReport_occurredAt_idx" ON "InjuryReport"("occurredAt");

-- CreateIndex
CREATE INDEX "InjuryReport_reportedByUserId_idx" ON "InjuryReport"("reportedByUserId");

-- CreateIndex
CREATE INDEX "InjuryReport_reviewedByMembershipId_idx" ON "InjuryReport"("reviewedByMembershipId");

-- CreateIndex
CREATE INDEX "InjuryReport_playerId_status_idx" ON "InjuryReport"("playerId", "status");

-- CreateIndex
CREATE INDEX "InjuryReport_teamId_status_idx" ON "InjuryReport"("teamId", "status");

-- CreateIndex
CREATE INDEX "AiSuggestion_playerId_status_idx" ON "AiSuggestion"("playerId", "status");

-- CreateIndex
CREATE INDEX "AiSuggestion_dailyEntryId_idx" ON "AiSuggestion"("dailyEntryId");

-- CreateIndex
CREATE INDEX "AiSuggestion_teamSessionId_idx" ON "AiSuggestion"("teamSessionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTeam" ADD CONSTRAINT "MembershipTeam_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTeam" ADD CONSTRAINT "MembershipTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushDispatch" ADD CONSTRAINT "PushDispatch_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushDispatch" ADD CONSTRAINT "PushDispatch_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "FormSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDailyStats" ADD CONSTRAINT "PlayerDailyStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDailyStats" ADD CONSTRAINT "PlayerDailyStats_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSession" ADD CONSTRAINT "TeamSession_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSession" ADD CONSTRAINT "TeamSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSession" ADD CONSTRAINT "TeamSession_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSessionPlayer" ADD CONSTRAINT "TeamSessionPlayer_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSessionPlayer" ADD CONSTRAINT "TeamSessionPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendance" ADD CONSTRAINT "SessionAttendance_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendance" ADD CONSTRAINT "SessionAttendance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestion" ADD CONSTRAINT "FormQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAssignment" ADD CONSTRAINT "FormAssignment_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjuryReport" ADD CONSTRAINT "InjuryReport_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjuryReport" ADD CONSTRAINT "InjuryReport_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjuryReport" ADD CONSTRAINT "InjuryReport_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjuryReport" ADD CONSTRAINT "InjuryReport_reviewedByMembershipId_fkey" FOREIGN KEY ("reviewedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_teamSessionId_fkey" FOREIGN KEY ("teamSessionId") REFERENCES "TeamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
