import type { DefaultSession } from "next-auth";
import type { MembershipRole, PlatformRole } from "@repo/database";

type MembershipSummary = {
  id: string;
  clubId: string;
  clubName: string;
  role: MembershipRole;
  hasAllTeams: boolean;
  teamIds: string[];
};

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      platformRole: PlatformRole;
      memberships: MembershipSummary[];
    };
  }
}
