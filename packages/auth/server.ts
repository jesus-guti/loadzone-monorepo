import "server-only";

import { compare, hash } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { database, type MembershipRole, type PlatformRole } from "@repo/database";
import { resolveStorageUrl } from "@repo/storage/shared";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import {
  getServerSession,
  type NextAuthOptions,
  type Session,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { keys } from "./keys";
import {
  getSessionMaxAgeSeconds,
  parseRememberMeValue,
  REMEMBER_ME_COOKIE_NAME,
} from "./session-persistence";

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

type AuthorizedUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  rememberMe: boolean;
};

type SessionToken = JWT & {
  platformRole?: PlatformRole;
  memberships?: MembershipSummary[];
  rememberMe?: boolean;
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.enum(["true", "false"]).optional(),
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

async function getSessionClaims(
  userId: string
): Promise<{
  email: string | null;
  image: string | null;
  name: string | null;
  platformRole: PlatformRole;
  memberships: MembershipSummary[];
}> {
  const databaseUser = await database.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      image: true,
      name: true,
      platformRole: true,
    },
  });

  return {
    email: databaseUser?.email ?? null,
    image: resolveStorageUrl(databaseUser?.image ?? null),
    name: databaseUser?.name ?? null,
    platformRole: databaseUser?.platformRole ?? "USER",
    memberships: await getMemberships(userId),
  };
}

export function createAuthOptions(sessionMaxAge: number): NextAuthOptions {
  return {
    adapter: PrismaAdapter(database),
    secret: keys().AUTH_SECRET,
    session: {
      strategy: "jwt",
      maxAge: sessionMaxAge,
      updateAge: 60 * 60,
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
          rememberMe: { label: "Remember me", type: "text" },
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
            rememberMe: parsed.data.rememberMe === "true",
          } satisfies AuthorizedUser;
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        const authorizedUser = user as AuthorizedUser | undefined;
        const userId = authorizedUser?.id ?? token.sub;
        if (!userId) {
          return token;
        }

        const claims = await getSessionClaims(userId);

        return {
          ...token,
          email: claims.email ?? token.email,
          platformRole: claims.platformRole,
          memberships: claims.memberships,
          name: claims.name ?? token.name,
          picture: claims.image ?? token.picture,
          rememberMe: authorizedUser?.rememberMe ?? (token as SessionToken).rememberMe,
        };
      },
      async session({ session, token }) {
        if (!session.user) {
          return session;
        }

        const sessionUser = session.user as typeof session.user & {
          id: string;
          platformRole: PlatformRole;
          memberships: MembershipSummary[];
        };

        const sessionToken = token as SessionToken;

        sessionUser.id = token.sub ?? "";
        sessionUser.platformRole = sessionToken.platformRole ?? "USER";
        sessionUser.memberships = sessionToken.memberships ?? [];

        return session;
      },
    },
  };
}

export const authOptions: NextAuthOptions = createAuthOptions(
  getSessionMaxAgeSeconds(false)
);

export async function getRequestAuthOptions(): Promise<NextAuthOptions> {
  const cookieStore = await cookies();
  const rememberMe = parseRememberMeValue(
    cookieStore.get(REMEMBER_ME_COOKIE_NAME)?.value
  );

  return createAuthOptions(getSessionMaxAgeSeconds(rememberMe));
}

type AuthRouteContext = {
  params: Promise<{
    nextauth: string[];
  }>;
};

export async function authHandler(
  request: NextRequest,
  context: AuthRouteContext
): Promise<Response> {
  const handler = NextAuth(await getRequestAuthOptions());
  const resolvedParams = await context.params;

  return handler(request, { params: resolvedParams });
}

export async function auth(): Promise<Session | null> {
  return getServerSession(await getRequestAuthOptions());
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
    image: resolveStorageUrl(sessionUser.image ?? null),
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
