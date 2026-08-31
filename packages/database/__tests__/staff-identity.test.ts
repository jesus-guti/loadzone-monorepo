import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  PASSWORD_RESET_TTL_MS,
  STAFF_INVITATION_TTL_MS,
  acceptStaffInvitation,
  cancelStaffInvitation,
  changePassword,
  completePasswordReset,
  issueStaffInvitation,
  peekStaffInvitation,
  requestPasswordReset,
  resendStaffInvitation,
  staffCanInvite,
  StaffIdentityError,
  type PasswordResetTokenRow,
  type StaffIdentityClient,
  type StaffInvitationRow,
} from "../staff-identity";

type MembershipRole = "PLAYER" | "STAFF" | "COORDINATOR";

type MemRow = {
  id: string;
  userId: string;
  clubId: string;
  role: MembershipRole;
  hasAllTeams: boolean;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
};

type InviteRow = StaffInvitationRow & { createdAt: Date };

function sha256(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function createMemoryDb(seed?: {
  clubs?: { id: string; name: string }[];
  users?: UserRow[];
  memberships?: MemRow[];
  invitations?: InviteRow[];
  passwordResetTokens?: PasswordResetTokenRow[];
}): StaffIdentityClient & {
  users: UserRow[];
  memberships: MemRow[];
  invitations: InviteRow[];
  passwordResetTokens: PasswordResetTokenRow[];
} {
  const clubs = [...(seed?.clubs ?? [])];
  const users = [...(seed?.users ?? [])];
  const memberships = [...(seed?.memberships ?? [])];
  const invitations = [...(seed?.invitations ?? [])];
  const passwordResetTokens = [...(seed?.passwordResetTokens ?? [])];
  let seq = 1;
  const nextId = (prefix: string): string => `${prefix}_${seq++}`;

  const matches = (
    row: Record<string, unknown>,
    where: Record<string, unknown> | undefined
  ): boolean => {
    if (!where) {
      return true;
    }
    return Object.entries(where).every(([key, value]) => {
      if (value === undefined) {
        return true;
      }
      return row[key] === value;
    });
  };

  const db: StaffIdentityClient & {
    users: UserRow[];
    memberships: MemRow[];
    invitations: InviteRow[];
    passwordResetTokens: PasswordResetTokenRow[];
  } = {
    users,
    memberships,
    invitations,
    passwordResetTokens,
    club: {
      findUnique: async ({ where }) =>
        clubs.find((club) => club.id === where.id) ?? null,
    },
    user: {
      findUnique: async ({ where }) => {
        if (where.id) {
          return users.find((user) => user.id === where.id) ?? null;
        }
        if (where.email) {
          return users.find((user) => user.email === where.email) ?? null;
        }
        return null;
      },
      create: async ({ data }) => {
        const user: UserRow = {
          id: nextId("user"),
          email: data.email,
          name: data.name ?? null,
          passwordHash: data.passwordHash,
        };
        users.push(user);
        return user;
      },
      update: async ({ where, data }) => {
        const user = users.find((row) => row.id === where.id);
        if (!user) {
          throw new Error("missing user");
        }
        if (data.passwordHash !== undefined) {
          user.passwordHash = data.passwordHash;
        }
        return user;
      },
    },
    membership: {
      findFirst: async ({ where }) =>
        memberships.find((row) =>
          matches(row as unknown as Record<string, unknown>, where)
        ) ?? null,
      findMany: async ({ where }) =>
        memberships.filter((row) =>
          matches(row as unknown as Record<string, unknown>, where)
        ),
      create: async ({ data }) => {
        const row: MemRow = {
          id: nextId("mem"),
          userId: data.userId,
          clubId: data.clubId,
          role: data.role,
          hasAllTeams: data.hasAllTeams,
        };
        memberships.push(row);
        return row;
      },
    },
    staffInvitation: {
      findFirst: async ({ where }) =>
        invitations.find((row) =>
          matches(row as unknown as Record<string, unknown>, where)
        ) ?? null,
      findMany: async ({ where }) =>
        invitations.filter((row) =>
          matches(row as unknown as Record<string, unknown>, where)
        ),
      create: async ({ data }) => {
        const row: InviteRow = {
          id: nextId("inv"),
          clubId: data.clubId,
          email: data.email,
          role: data.role,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          status: data.status,
          invitedById: data.invitedById,
          acceptedAt: null,
          createdAt: new Date(),
        };
        invitations.push(row);
        return row;
      },
      update: async ({ where, data }) => {
        const row = invitations.find((item) => item.id === where.id);
        if (!row) {
          throw new Error("missing invitation");
        }
        Object.assign(row, data);
        return row;
      },
    },
    passwordResetToken: {
      findFirst: async ({ where }) =>
        passwordResetTokens.find((row) =>
          matches(row as unknown as Record<string, unknown>, where)
        ) ?? null,
      findMany: async ({ where }) =>
        passwordResetTokens.filter((row) =>
          matches(row as unknown as Record<string, unknown>, where)
        ),
      create: async ({ data }) => {
        const row: PasswordResetTokenRow = {
          id: nextId("prt"),
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          usedAt: null,
        };
        passwordResetTokens.push(row);
        return row;
      },
      update: async ({ where, data }) => {
        const row = passwordResetTokens.find((item) => item.id === where.id);
        if (!row) {
          throw new Error("missing reset token");
        }
        Object.assign(row, data);
        return row;
      },
    },
  };

  return db;
}

const FROZEN = new Date("2026-08-31T12:00:00.000Z");

function clockAt(date: Date) {
  return { now: () => date };
}

function acceptUrlForToken(raw: string): string {
  return `https://app.test/invite/${raw}`;
}

function seedClub() {
  return createMemoryDb({
    clubs: [
      { id: "club_a", name: "Atlético Norte" },
      { id: "club_b", name: "Club Sur" },
    ],
    users: [
      {
        id: "coord_a",
        email: "coord@a.test",
        name: "Coord A",
        passwordHash: "hash-coord",
      },
      {
        id: "staff_a",
        email: "staff@a.test",
        name: "Staff A",
        passwordHash: "hash-staff",
      },
    ],
    memberships: [
      {
        id: "m_coord_a",
        userId: "coord_a",
        clubId: "club_a",
        role: "COORDINATOR",
        hasAllTeams: true,
      },
      {
        id: "m_staff_a",
        userId: "staff_a",
        clubId: "club_a",
        role: "STAFF",
        hasAllTeams: true,
      },
    ],
  });
}

describe("staffCanInvite", () => {
  it("is true only for COORDINATOR Membership", () => {
    expect(staffCanInvite("COORDINATOR")).toBe(true);
    expect(staffCanInvite("STAFF")).toBe(false);
    expect(staffCanInvite("PLAYER")).toBe(false);
  });
});

describe("issueStaffInvitation", () => {
  it("lets a Coordinator invite Staff and returns an email intent without creating a User", async () => {
    const db = seedClub();
    const result = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "Nuevo@Club.Test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "raw-secret-1",
    });

    expect(result.rawToken).toBe("raw-secret-1");
    expect(result.emailIntent).toEqual({
      kind: "staff_invitation",
      to: "nuevo@club.test",
      clubName: "Atlético Norte",
      acceptUrl: "https://app.test/invite/raw-secret-1",
    });
    expect(db.users.filter((user) => user.email === "nuevo@club.test")).toHaveLength(
      0
    );
    expect(db.invitations).toHaveLength(1);
    expect(db.invitations[0]?.tokenHash).not.toBe("raw-secret-1");
    expect(db.invitations[0]?.tokenHash).toBe(sha256("raw-secret-1"));
    expect(db.invitations[0]?.status).toBe("PENDING");
    expect(db.invitations[0]?.email).toBe("nuevo@club.test");
    expect(db.invitations[0]?.expiresAt).toEqual(
      new Date(FROZEN.getTime() + STAFF_INVITATION_TTL_MS)
    );
  });

  it("refuses Staff Membership on that Club", async () => {
    const db = seedClub();
    await expect(
      issueStaffInvitation(db, clockAt(FROZEN), {
        actorUserId: "staff_a",
        clubId: "club_a",
        email: "otro@club.test",
        role: "STAFF",
        acceptUrlForToken,
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(db.invitations).toHaveLength(0);
  });

  it("refuses a Coordinator of a different Club", async () => {
    const db = seedClub();
    await expect(
      issueStaffInvitation(db, clockAt(FROZEN), {
        actorUserId: "coord_a",
        clubId: "club_b",
        email: "otro@club.test",
        role: "COORDINATOR",
        acceptUrlForToken,
      })
    ).rejects.toBeInstanceOf(StaffIdentityError);
  });

  it("refuses a second pending invite for the same Club and email", async () => {
    const db = seedClub();
    await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "dup@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "t1",
    });
    await expect(
      issueStaffInvitation(db, clockAt(FROZEN), {
        actorUserId: "coord_a",
        clubId: "club_a",
        email: "dup@club.test",
        role: "COORDINATOR",
        acceptUrlForToken,
        createToken: () => "t2",
      })
    ).rejects.toMatchObject({ code: "PENDING_EXISTS" });
    expect(db.invitations).toHaveLength(1);
  });

  it("refuses inviting an email that already has a Membership on that Club", async () => {
    const db = seedClub();
    await expect(
      issueStaffInvitation(db, clockAt(FROZEN), {
        actorUserId: "coord_a",
        clubId: "club_a",
        email: "staff@a.test",
        role: "STAFF",
        acceptUrlForToken,
      })
    ).rejects.toMatchObject({ code: "MEMBERSHIP_EXISTS" });
  });
});

describe("acceptStaffInvitation", () => {
  it("creates a User with hashed password and a Membership with all Teams", async () => {
    const db = seedClub();
    const issued = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "new@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "accept-new",
    });
    const hashes: string[] = [];
    const result = await acceptStaffInvitation(db, clockAt(FROZEN), {
      rawToken: issued.rawToken,
      password: "password1",
      name: "Nueva",
      hashPassword: async (plain) => {
        hashes.push(plain);
        return `hashed:${plain}`;
      },
    });

    expect(result.createdUser).toBe(true);
    expect(hashes).toEqual(["password1"]);
    const user = db.users.find((row) => row.id === result.userId);
    expect(user?.email).toBe("new@club.test");
    expect(user?.passwordHash).toBe("hashed:password1");
    expect(user?.name).toBe("Nueva");
    const membership = db.memberships.find((row) => row.id === result.membershipId);
    expect(membership).toMatchObject({
      userId: result.userId,
      clubId: "club_a",
      role: "STAFF",
      hasAllTeams: true,
    });
    expect(db.invitations[0]?.status).toBe("ACCEPTED");
  });

  it("attaches a Membership to an existing User without a second User or password change", async () => {
    const db = seedClub();
    db.users.push({
      id: "physio",
      email: "physio@club.test",
      name: "Fisio",
      passwordHash: "keep-me",
    });
    const issued = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "physio@club.test",
      role: "COORDINATOR",
      acceptUrlForToken,
      createToken: () => "accept-existing",
    });
    let hashCalls = 0;
    const result = await acceptStaffInvitation(db, clockAt(FROZEN), {
      rawToken: issued.rawToken,
      hashPassword: async () => {
        hashCalls += 1;
        return "should-not";
      },
    });

    expect(result.createdUser).toBe(false);
    expect(hashCalls).toBe(0);
    expect(db.users.filter((user) => user.email === "physio@club.test")).toHaveLength(
      1
    );
    expect(db.users.find((user) => user.id === "physio")?.passwordHash).toBe(
      "keep-me"
    );
    expect(
      db.memberships.find(
        (row) => row.userId === "physio" && row.clubId === "club_a"
      )
    ).toMatchObject({ hasAllTeams: true, role: "COORDINATOR" });
  });

  it("lets the same User join a second Club (multi-club)", async () => {
    const db = seedClub();
    db.users.push({
      id: "coord_b",
      email: "coord@b.test",
      name: "Coord B",
      passwordHash: "hb",
    });
    db.memberships.push({
      id: "m_coord_b",
      userId: "coord_b",
      clubId: "club_b",
      role: "COORDINATOR",
      hasAllTeams: true,
    });
    db.users.push({
      id: "shared",
      email: "shared@club.test",
      name: "Shared",
      passwordHash: "hs",
    });
    const first = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "shared@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "club-a-token",
    });
    await acceptStaffInvitation(db, clockAt(FROZEN), {
      rawToken: first.rawToken,
      hashPassword: async (plain) => plain,
    });
    const second = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_b",
      clubId: "club_b",
      email: "shared@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "club-b-token",
    });
    await acceptStaffInvitation(db, clockAt(FROZEN), {
      rawToken: second.rawToken,
      hashPassword: async (plain) => plain,
    });

    expect(db.users.filter((user) => user.email === "shared@club.test")).toHaveLength(
      1
    );
    expect(
      db.memberships.filter((row) => row.userId === "shared")
    ).toHaveLength(2);
  });

  it("refuses a duplicate Membership on the same Club", async () => {
    const db = seedClub();
    const issued = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "staff@a.test",
      role: "COORDINATOR",
      acceptUrlForToken,
      createToken: () => "dup-mem",
    }).catch((error: StaffIdentityError) => error);
    expect(issued).toBeInstanceOf(StaffIdentityError);

    db.invitations.push({
      id: "forced",
      clubId: "club_a",
      email: "staff@a.test",
      role: "STAFF",
      tokenHash: sha256("dup-mem"),
      expiresAt: new Date(FROZEN.getTime() + STAFF_INVITATION_TTL_MS),
      status: "PENDING",
      invitedById: "coord_a",
      acceptedAt: null,
      createdAt: FROZEN,
    });
    await expect(
      acceptStaffInvitation(db, clockAt(FROZEN), {
        rawToken: "dup-mem",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "MEMBERSHIP_EXISTS" });
  });

  it("refuses unknown, used, cancelled, and expired tokens", async () => {
    const db = seedClub();
    const issued = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "one@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "once",
    });
    await acceptStaffInvitation(db, clockAt(FROZEN), {
      rawToken: issued.rawToken,
      password: "password1",
      hashPassword: async (plain) => `h:${plain}`,
    });
    await expect(
      acceptStaffInvitation(db, clockAt(FROZEN), {
        rawToken: issued.rawToken,
        password: "password1",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "INVITE_USED" });
    await expect(
      acceptStaffInvitation(db, clockAt(FROZEN), {
        rawToken: "unknown-token",
        password: "password1",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "INVITE_NOT_FOUND" });

    const toCancel = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "cancel@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "cancel-me",
    });
    await cancelStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      invitationId: toCancel.invitationId,
    });
    expect(db.invitations.find((row) => row.id === toCancel.invitationId)?.status).toBe(
      "CANCELLED"
    );
    await expect(
      acceptStaffInvitation(db, clockAt(FROZEN), {
        rawToken: "cancel-me",
        password: "password1",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "INVITE_CANCELLED" });

    const expiring = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "exp@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "will-expire",
    });
    const afterTtl = new Date(FROZEN.getTime() + STAFF_INVITATION_TTL_MS + 1);
    await expect(
      acceptStaffInvitation(db, clockAt(afterTtl), {
        rawToken: expiring.rawToken,
        password: "password1",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "INVITE_EXPIRED" });
    expect(
      db.invitations.find((row) => row.id === expiring.invitationId)?.status
    ).toBe("EXPIRED");
  });

  it("accepts just before TTL and rejects a password shorter than 8", async () => {
    const db = seedClub();
    const issued = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "ttl@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "ttl-token",
    });
    await expect(
      acceptStaffInvitation(db, clockAt(FROZEN), {
        rawToken: issued.rawToken,
        password: "short",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "INVALID_PASSWORD" });
    const justBefore = new Date(FROZEN.getTime() + STAFF_INVITATION_TTL_MS);
    const result = await acceptStaffInvitation(db, clockAt(justBefore), {
      rawToken: issued.rawToken,
      password: "password1",
      hashPassword: async (plain) => `h:${plain}`,
    });
    expect(result.createdUser).toBe(true);
  });
});

describe("resendStaffInvitation", () => {
  it("rotates the token so the previous raw token fails", async () => {
    const db = seedClub();
    const first = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "resend@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "old-token",
    });
    const resent = await resendStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      invitationId: first.invitationId,
      acceptUrlForToken,
      createToken: () => "new-token",
    });
    expect(resent.emailIntent).toMatchObject({
      kind: "staff_invitation",
      to: "resend@club.test",
      acceptUrl: "https://app.test/invite/new-token",
    });
    await expect(
      acceptStaffInvitation(db, clockAt(FROZEN), {
        rawToken: "old-token",
        password: "password1",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "INVITE_NOT_FOUND" });
    const accepted = await acceptStaffInvitation(db, clockAt(FROZEN), {
      rawToken: "new-token",
      password: "password1",
      hashPassword: async (plain) => `h:${plain}`,
    });
    expect(accepted.createdUser).toBe(true);
  });

  it("refuses resend of an expired invite", async () => {
    const db = seedClub();
    const issued = await issueStaffInvitation(db, clockAt(FROZEN), {
      actorUserId: "coord_a",
      clubId: "club_a",
      email: "late@club.test",
      role: "STAFF",
      acceptUrlForToken,
      createToken: () => "late",
    });
    const afterTtl = new Date(FROZEN.getTime() + STAFF_INVITATION_TTL_MS + 1);
    await expect(
      resendStaffInvitation(db, clockAt(afterTtl), {
        actorUserId: "coord_a",
        invitationId: issued.invitationId,
        acceptUrlForToken,
      })
    ).rejects.toMatchObject({ code: "INVITE_EXPIRED" });
  });
});

describe("peekStaffInvitation", () => {
  it("returns a Spanish error for invalid tokens without throwing", async () => {
    const db = seedClub();
    const peek = await peekStaffInvitation(db, clockAt(FROZEN), "nope");
    expect(peek).toEqual({
      ok: false,
      message: "Esta invitación no es válida.",
    });
  });
});

function resetUrlForToken(raw: string): string {
  return `https://app.test/reset-password/${raw}`;
}

describe("requestPasswordReset", () => {
  it("returns a reset email intent when the User exists", async () => {
    const db = seedClub();
    const result = await requestPasswordReset(db, clockAt(FROZEN), {
      email: "staff@a.test",
      resetUrlForToken,
      createToken: () => "reset-raw",
    });
    expect(result.emailIntent).toEqual({
      kind: "password_reset",
      to: "staff@a.test",
      resetUrl: "https://app.test/reset-password/reset-raw",
    });
    expect(db.passwordResetTokens).toHaveLength(1);
    expect(db.passwordResetTokens[0]?.tokenHash).toBe(sha256("reset-raw"));
    expect(db.passwordResetTokens[0]?.expiresAt).toEqual(
      new Date(FROZEN.getTime() + PASSWORD_RESET_TTL_MS)
    );
  });

  it("succeeds without an email intent when the User does not exist", async () => {
    const db = seedClub();
    const result = await requestPasswordReset(db, clockAt(FROZEN), {
      email: "nobody@a.test",
      resetUrlForToken,
    });
    expect(result).toEqual({ emailIntent: null });
    expect(db.passwordResetTokens).toHaveLength(0);
  });

  it("rotates unused tokens so only the latest link works", async () => {
    const db = seedClub();
    await requestPasswordReset(db, clockAt(FROZEN), {
      email: "staff@a.test",
      resetUrlForToken,
      createToken: () => "first",
    });
    await requestPasswordReset(db, clockAt(FROZEN), {
      email: "staff@a.test",
      resetUrlForToken,
      createToken: () => "second",
    });
    await expect(
      completePasswordReset(db, clockAt(FROZEN), {
        rawToken: "first",
        password: "newpass12",
        hashPassword: async (plain) => `h:${plain}`,
      })
    ).rejects.toMatchObject({ code: "RESET_USED" });
    const completed = await completePasswordReset(db, clockAt(FROZEN), {
      rawToken: "second",
      password: "newpass12",
      hashPassword: async (plain) => `h:${plain}`,
    });
    expect(completed.userId).toBe("staff_a");
    expect(db.users.find((user) => user.id === "staff_a")?.passwordHash).toBe(
      "h:newpass12"
    );
  });
});

describe("completePasswordReset", () => {
  it("refuses unknown, expired, and replayed tokens", async () => {
    const db = seedClub();
    const issued = await requestPasswordReset(db, clockAt(FROZEN), {
      email: "staff@a.test",
      resetUrlForToken,
      createToken: () => "live",
    });
    expect(issued.emailIntent).not.toBeNull();

    await expect(
      completePasswordReset(db, clockAt(FROZEN), {
        rawToken: "unknown",
        password: "newpass12",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "RESET_NOT_FOUND" });

    const afterTtl = new Date(FROZEN.getTime() + PASSWORD_RESET_TTL_MS + 1);
    const expiring = await requestPasswordReset(db, clockAt(FROZEN), {
      email: "coord@a.test",
      resetUrlForToken,
      createToken: () => "stale",
    });
    expect(expiring.emailIntent).not.toBeNull();
    await expect(
      completePasswordReset(db, clockAt(afterTtl), {
        rawToken: "stale",
        password: "newpass12",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "RESET_EXPIRED" });

    await completePasswordReset(db, clockAt(FROZEN), {
      rawToken: "live",
      password: "newpass12",
      hashPassword: async (plain) => `h:${plain}`,
    });
    await expect(
      completePasswordReset(db, clockAt(FROZEN), {
        rawToken: "live",
        password: "otherpass",
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "RESET_USED" });
  });
});

describe("changePassword", () => {
  it("updates the hash when the current password matches", async () => {
    const db = seedClub();
    const result = await changePassword(db, {
      userId: "staff_a",
      currentPassword: "old-secret",
      newPassword: "newpass12",
      verifyPassword: async (plain, hash) =>
        plain === "old-secret" && hash === "hash-staff",
      hashPassword: async (plain) => `h:${plain}`,
    });
    expect(result.userId).toBe("staff_a");
    expect(db.users.find((user) => user.id === "staff_a")?.passwordHash).toBe(
      "h:newpass12"
    );
  });

  it("refuses when the current password does not match", async () => {
    const db = seedClub();
    await expect(
      changePassword(db, {
        userId: "staff_a",
        currentPassword: "wrong",
        newPassword: "newpass12",
        verifyPassword: async () => false,
        hashPassword: async (plain) => plain,
      })
    ).rejects.toMatchObject({ code: "CURRENT_PASSWORD_INVALID" });
    expect(db.users.find((user) => user.id === "staff_a")?.passwordHash).toBe(
      "hash-staff"
    );
  });
});
