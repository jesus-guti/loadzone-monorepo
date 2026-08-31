-- DropIndex
DROP INDEX "Membership_userId_clubId_role_key";

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_clubId_key" ON "Membership"("userId", "clubId");
