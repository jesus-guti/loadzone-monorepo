-- Deleting a User must not be blocked by invitations they issued.
ALTER TABLE "StaffInvitation" ALTER COLUMN "invitedById" DROP NOT NULL;

ALTER TABLE "StaffInvitation" DROP CONSTRAINT "StaffInvitation_invitedById_fkey";

ALTER TABLE "StaffInvitation"
  ADD CONSTRAINT "StaffInvitation_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
