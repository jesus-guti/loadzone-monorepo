-- CreateTable
CREATE TABLE "MembershipExerciseFavorite" (
    "membershipId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipExerciseFavorite_pkey" PRIMARY KEY ("membershipId","exerciseId")
);

-- CreateIndex
CREATE INDEX "MembershipExerciseFavorite_exerciseId_idx" ON "MembershipExerciseFavorite"("exerciseId");

-- CreateIndex
CREATE INDEX "MembershipExerciseFavorite_membershipId_idx" ON "MembershipExerciseFavorite"("membershipId");

-- AddForeignKey
ALTER TABLE "MembershipExerciseFavorite" ADD CONSTRAINT "MembershipExerciseFavorite_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipExerciseFavorite" ADD CONSTRAINT "MembershipExerciseFavorite_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
