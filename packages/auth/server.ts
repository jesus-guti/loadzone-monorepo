import "server-only";

import { compare, hash } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { database, type MembershipRole, type PlatformRole } from "@repo/database";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { keys } from "./keys";

type MembershipSummary = {
  id: string;
  clubId: string;
  clubName: string;
  role: MembershipRole;
  hasAllTeams: boolean;
  teamIds: string[];
};

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  platformRole: PlatformRole;
  memberships: MembershipSummary[];
};

type RegisterUserInput = {
  email: string;
  name: string;
  password: string;
};

type RegisterUserResult = {
  success: boolean;
  error?: string;
  userId?: string;
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
});

async function getMemberships(userId: string): Promise<MembershipSummary[]> {
  const memberships = await database.membership.findMany({
    where: { userId },
    select: {
      id: true,
      role: true,
      hasAllTeams: true,
      clubId: true,
      club: { select: { name: true, teams: { select: { id: true } } } },
      teamLinks: { select: { teamId: true } },
    },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
  });

  return memberships.map((membership) => ({
    id: membership.id,
    clubId: membership.clubId,
    clubName: membership.club.name,
    role: membership.role,
    hasAllTeams: membership.hasAllTeams,
    teamIds: membership.hasAllTeams
      ? membership.club.teams.map((team) => team.id)
      : membership.teamLinks.map((teamLink) => teamLink.teamId),
  }));
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(database),
  secret: keys().AUTH_SECRET,
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await database.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(parsed.data.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      const sessionUser = session.user as typeof session.user & {
        id: string;
        platformRole: PlatformRole;
        memberships: MembershipSummary[];
      };

      const databaseUser = await database.user.findUnique({
        where: { id: user.id },
        select: {
          platformRole: true,
        },
      });

      sessionUser.id = user.id;
      sessionUser.platformRole = databaseUser?.platformRole ?? "USER";
      sessionUser.memberships = await getMemberships(user.id);

      return session;
    },
  },
};

export const authHandler = NextAuth(authOptions);

export async function auth() {
  return getServerSession(authOptions);
}

export async function currentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const rawUser = session?.user;
  const sessionUser = rawUser as
    | ({
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id: string;
        platformRole: PlatformRole;
        memberships: MembershipSummary[];
      })
    | undefined;

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name ?? null,
    image: sessionUser.image ?? null,
    platformRole: sessionUser.platformRole,
    memberships: sessionUser.memberships,
  };
}

export async function registerUser(
  input: RegisterUserInput
): Promise<RegisterUserResult> {
  const parsed = registerSchema.safeParse({
    email: input.email,
    name: input.name,
    password: input.password,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  const existingUser = await database.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Ya existe un usuario con ese email.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await database.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      passwordHash,
    },
    select: { id: true },
  });

  return {
    success: true,
    userId: user.id,
  };
}
