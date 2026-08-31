/**
 * Staff identity seam: invitations (SI-01), Club membership access (SI-03),
 * and Super Admin platform operations (SI-05).
 * Callers inject a Prisma-shaped client, clock, token factory, and hashPassword.
 * Mail is an email intent — tests never call SMTP.
 */

import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { MembershipRole } from "./generated/client";

export const STAFF_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type StaffInviteRole = Extract<MembershipRole, "COORDINATOR" | "STAFF">;

export type StaffInvitationStatusValue =
  | "PENDING"
  | "ACCEPTED"
  | "CANCELLED"
  | "EXPIRED";

export type StaffInvitationEmailIntent = {
  readonly kind: "staff_invitation";
  readonly to: string;
  readonly clubName: string;
  readonly acceptUrl: string;
};

export type StaffIdentityClock = {
  now: () => Date;
};

export type StaffIdentityErrorCode =
  | "FORBIDDEN"
  | "INVALID_ROLE"
  | "INVALID_EMAIL"
  | "PENDING_EXISTS"
  | "MEMBERSHIP_EXISTS"
  | "MEMBERSHIP_NOT_FOUND"
  | "LAST_COORDINATOR"
  | "INVITE_NOT_FOUND"
  | "INVITE_USED"
  | "INVITE_CANCELLED"
  | "INVITE_EXPIRED"
  | "INVALID_PASSWORD"
  | "CLUB_NOT_FOUND"
  | "NOT_PENDING"
  | "INVALID_SLUG"
  | "INVALID_NAME"
  | "SLUG_TAKEN"
  | "EMAIL_TAKEN"
  | "USER_NOT_FOUND";

export type StaffIdentityActor =
  | { readonly kind: "coordinator"; readonly userId: string }
  | { readonly kind: "platform" };

export class StaffIdentityError extends Error {
  readonly code: StaffIdentityErrorCode;

  constructor(code: StaffIdentityErrorCode, message: string) {
    super(message);
    this.name = "StaffIdentityError";
    this.code = code;
  }
}

export function staffCanInvite(membershipRole: MembershipRole): boolean {
  return membershipRole === "COORDINATOR";
}

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(8).max(128);
const inviteRoleSchema = z.enum(["COORDINATOR", "STAFF"]);

export function hashStaffInvitationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

function defaultCreateToken(): string {
  return randomBytes(32).toString("hex");
}

function normalizeEmail(raw: string): string {
  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) {
    throw new StaffIdentityError("INVALID_EMAIL", "El email no es válido.");
  }
  return parsed.data.toLowerCase();
}

type MembershipRow = {
  readonly id: string;
  readonly userId: string;
  readonly clubId: string;
  readonly role: MembershipRole;
  readonly hasAllTeams: boolean;
};

export type PlatformRoleValue = "USER" | "SUPER_ADMIN";

type UserRow = {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly passwordHash: string | null;
  readonly platformRole?: PlatformRoleValue;
};

type ClubRow = {
  readonly id: string;
  readonly name: string;
  readonly slug?: string;
};

export type StaffInvitationRow = {
  readonly id: string;
  readonly clubId: string;
  readonly email: string;
  readonly role: StaffInviteRole;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly status: StaffInvitationStatusValue;
  readonly invitedById: string;
  readonly acceptedAt: Date | null;
};

export type StaffIdentityClient = {
  readonly club: {
    findUnique: (args: {
      where: { id?: string; slug?: string };
      select?: { id?: true; name: true; slug?: true };
    }) => Promise<ClubRow | null>;
    findMany: (args?: {
      orderBy?: { name: "asc" };
      select?: { id: true; name: true; slug: true };
    }) => Promise<ClubRow[]>;
    create: (args: {
      data: { name: string; slug: string };
    }) => Promise<ClubRow>;
  };
  readonly user: {
    findUnique: (args: {
      where: { id?: string; email?: string };
      select?: {
        id?: true;
        email?: true;
        name?: true;
        passwordHash?: true;
        platformRole?: true;
      };
    }) => Promise<UserRow | null>;
    create: (args: {
      data: {
        email: string;
        passwordHash: string;
        name?: string | null;
      };
      select: { id: true; email: true; name: true; passwordHash: true };
    }) => Promise<UserRow>;
    update: (args: {
      where: { id: string };
      data: { email?: string; platformRole?: PlatformRoleValue };
    }) => Promise<UserRow>;
  };
  readonly membership: {
    findFirst: (args: {
      where: {
        id?: string;
        userId?: string;
        clubId?: string;
        role?: MembershipRole;
      };
    }) => Promise<MembershipRow | null>;
    findMany: (args: {
      where: { userId?: string; clubId?: string; role?: MembershipRole };
    }) => Promise<MembershipRow[]>;
    create: (args: {
      data: {
        userId: string;
        clubId: string;
        role: StaffInviteRole;
        hasAllTeams: boolean;
      };
    }) => Promise<MembershipRow>;
    update: (args: {
      where: { id: string };
      data: { role: StaffInviteRole };
    }) => Promise<MembershipRow>;
    delete: (args: { where: { id: string } }) => Promise<MembershipRow>;
  };
  readonly staffInvitation: {
    findFirst: (args: {
      where: {
        id?: string;
        tokenHash?: string;
        clubId?: string;
        email?: string;
        status?: StaffInvitationStatusValue;
      };
    }) => Promise<StaffInvitationRow | null>;
    findMany: (args: {
      where: { clubId: string; status: StaffInvitationStatusValue };
      orderBy?: { createdAt: "desc" };
    }) => Promise<StaffInvitationRow[]>;
    create: (args: {
      data: {
        clubId: string;
        email: string;
        role: StaffInviteRole;
        tokenHash: string;
        expiresAt: Date;
        status: "PENDING";
        invitedById: string;
      };
    }) => Promise<StaffInvitationRow>;
    update: (args: {
      where: { id: string };
      data: {
        tokenHash?: string;
        expiresAt?: Date;
        status?: StaffInvitationStatusValue;
        acceptedAt?: Date | null;
      };
    }) => Promise<StaffInvitationRow>;
  };
};

export type IssueStaffInvitationInput = {
  readonly actorUserId: string;
  readonly actor?: StaffIdentityActor;
  readonly clubId: string;
  readonly email: string;
  readonly role: StaffInviteRole;
  readonly acceptUrlForToken: (rawToken: string) => string;
  readonly createToken?: () => string;
};

export type IssueStaffInvitationResult = {
  readonly invitationId: string;
  readonly rawToken: string;
  readonly emailIntent: StaffInvitationEmailIntent;
};

export type AcceptStaffInvitationInput = {
  readonly rawToken: string;
  readonly password?: string;
  readonly name?: string;
  readonly hashPassword: (plain: string) => Promise<string>;
};

export type AcceptStaffInvitationResult = {
  readonly userId: string;
  readonly membershipId: string;
  readonly createdUser: boolean;
};

export type PeekStaffInvitationResult =
  | {
      readonly ok: true;
      readonly email: string;
      readonly clubName: string;
      readonly role: StaffInviteRole;
      readonly existingUser: boolean;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

async function requireCoordinatorOnClub(
  db: StaffIdentityClient,
  actorUserId: string,
  clubId: string
): Promise<void> {
  const membership = await db.membership.findFirst({
    where: { userId: actorUserId, clubId, role: "COORDINATOR" },
  });
  if (!membership || !staffCanInvite(membership.role)) {
    throw new StaffIdentityError(
      "FORBIDDEN",
      "No tienes permiso para invitar a este club."
    );
  }
}

async function requireActorOnClub(
  db: StaffIdentityClient,
  actor: StaffIdentityActor,
  clubId: string
): Promise<void> {
  if (actor.kind === "platform") {
    return;
  }
  await requireCoordinatorOnClub(db, actor.userId, clubId);
}

function requirePlatformActor(actor: StaffIdentityActor): void {
  if (actor.kind !== "platform") {
    throw new StaffIdentityError(
      "FORBIDDEN",
      "Solo un operador de plataforma puede hacer esto."
    );
  }
}

function resolveIssueActor(input: IssueStaffInvitationInput): StaffIdentityActor {
  return input.actor ?? { kind: "coordinator", userId: input.actorUserId };
}

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid")
  .min(2)
  .max(48);

const clubNameSchema = z.string().trim().min(2).max(80);

function isClubStaffRole(role: MembershipRole): role is StaffInviteRole {
  return role === "COORDINATOR" || role === "STAFF";
}

async function loadClubStaffMembership(
  db: StaffIdentityClient,
  clubId: string,
  membershipId: string
): Promise<MembershipRow> {
  const membership = await db.membership.findFirst({
    where: { id: membershipId, clubId },
  });
  if (!membership || !isClubStaffRole(membership.role)) {
    throw new StaffIdentityError(
      "MEMBERSHIP_NOT_FOUND",
      "No se encontró esa membresía."
    );
  }
  return membership;
}

async function coordinatorCountWouldDropToZero(
  db: StaffIdentityClient,
  clubId: string,
  membership: MembershipRow
): Promise<boolean> {
  if (membership.role !== "COORDINATOR") {
    return false;
  }
  const coordinators = await db.membership.findMany({
    where: { clubId, role: "COORDINATOR" },
  });
  return coordinators.length <= 1;
}

function lastCoordinatorError(): never {
  throw new StaffIdentityError(
    "LAST_COORDINATOR",
    "El club debe conservar al menos un coordinador."
  );
}

async function requireClub(
  db: StaffIdentityClient,
  clubId: string
): Promise<ClubRow> {
  const club = await db.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true },
  });
  if (!club) {
    throw new StaffIdentityError("CLUB_NOT_FOUND", "Club no encontrado.");
  }
  return club;
}

function isExpired(
  invitation: Pick<StaffInvitationRow, "expiresAt">,
  now: Date
): boolean {
  return invitation.expiresAt.getTime() < now.getTime();
}

async function markExpired(
  db: StaffIdentityClient,
  invitation: StaffInvitationRow
): Promise<never> {
  if (invitation.status === "PENDING") {
    await db.staffInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
  }
  throw new StaffIdentityError(
    "INVITE_EXPIRED",
    "Esta invitación ha caducado."
  );
}

async function loadPendingByToken(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  rawToken: string
): Promise<StaffInvitationRow> {
  const tokenHash = hashStaffInvitationToken(rawToken);
  const invitation = await db.staffInvitation.findFirst({
    where: { tokenHash },
  });
  if (!invitation) {
    throw new StaffIdentityError(
      "INVITE_NOT_FOUND",
      "Esta invitación no es válida."
    );
  }
  if (invitation.status === "CANCELLED") {
    throw new StaffIdentityError(
      "INVITE_CANCELLED",
      "Esta invitación fue cancelada."
    );
  }
  if (invitation.status === "ACCEPTED") {
    throw new StaffIdentityError(
      "INVITE_USED",
      "Esta invitación ya se usó."
    );
  }
  if (invitation.status === "EXPIRED" || isExpired(invitation, clock.now())) {
    await markExpired(db, invitation);
  }
  if (invitation.status !== "PENDING") {
    throw new StaffIdentityError(
      "NOT_PENDING",
      "Esta invitación no está pendiente."
    );
  }
  return invitation;
}

export async function issueStaffInvitation(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  input: IssueStaffInvitationInput
): Promise<IssueStaffInvitationResult> {
  const roleParsed = inviteRoleSchema.safeParse(input.role);
  if (!roleParsed.success) {
    throw new StaffIdentityError(
      "INVALID_ROLE",
      "El rol debe ser Coordinador o Staff."
    );
  }
  const email = normalizeEmail(input.email);
  const club = await requireClub(db, input.clubId);
  await requireActorOnClub(db, resolveIssueActor(input), input.clubId);

  const pending = await db.staffInvitation.findFirst({
    where: { clubId: input.clubId, email, status: "PENDING" },
  });
  if (pending) {
    if (!isExpired(pending, clock.now())) {
      throw new StaffIdentityError(
        "PENDING_EXISTS",
        "Ya hay una invitación pendiente para este email en este club."
      );
    }
    await db.staffInvitation.update({
      where: { id: pending.id },
      data: { status: "EXPIRED" },
    });
  }

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
  if (existingUser) {
    const existingMemberships = await db.membership.findMany({
      where: { userId: existingUser.id, clubId: input.clubId },
    });
    if (existingMemberships.length > 0) {
      throw new StaffIdentityError(
        "MEMBERSHIP_EXISTS",
        "Esta persona ya tiene acceso a este club."
      );
    }
  }

  const rawToken = (input.createToken ?? defaultCreateToken)();
  const now = clock.now();
  const invitation = await db.staffInvitation.create({
    data: {
      clubId: input.clubId,
      email,
      role: roleParsed.data,
      tokenHash: hashStaffInvitationToken(rawToken),
      expiresAt: new Date(now.getTime() + STAFF_INVITATION_TTL_MS),
      status: "PENDING",
      invitedById: input.actorUserId,
    },
  });

  return {
    invitationId: invitation.id,
    rawToken,
    emailIntent: {
      kind: "staff_invitation",
      to: email,
      clubName: club.name,
      acceptUrl: input.acceptUrlForToken(rawToken),
    },
  };
}

export async function resendStaffInvitation(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  input: {
    readonly actorUserId: string;
    readonly actor?: StaffIdentityActor;
    readonly invitationId: string;
    readonly acceptUrlForToken: (rawToken: string) => string;
    readonly createToken?: () => string;
  }
): Promise<IssueStaffInvitationResult> {
  const invitation = await db.staffInvitation.findFirst({
    where: { id: input.invitationId },
  });
  if (!invitation) {
    throw new StaffIdentityError(
      "INVITE_NOT_FOUND",
      "Esta invitación no es válida."
    );
  }
  await requireActorOnClub(
    db,
    input.actor ?? { kind: "coordinator", userId: input.actorUserId },
    invitation.clubId
  );
  if (invitation.status === "CANCELLED") {
    throw new StaffIdentityError(
      "INVITE_CANCELLED",
      "Esta invitación fue cancelada."
    );
  }
  if (invitation.status === "ACCEPTED") {
    throw new StaffIdentityError("INVITE_USED", "Esta invitación ya se usó.");
  }
  if (invitation.status !== "PENDING" || isExpired(invitation, clock.now())) {
    await markExpired(db, invitation);
  }

  const club = await requireClub(db, invitation.clubId);
  const rawToken = (input.createToken ?? defaultCreateToken)();
  const now = clock.now();
  await db.staffInvitation.update({
    where: { id: invitation.id },
    data: {
      tokenHash: hashStaffInvitationToken(rawToken),
      expiresAt: new Date(now.getTime() + STAFF_INVITATION_TTL_MS),
      status: "PENDING",
    },
  });

  return {
    invitationId: invitation.id,
    rawToken,
    emailIntent: {
      kind: "staff_invitation",
      to: invitation.email,
      clubName: club.name,
      acceptUrl: input.acceptUrlForToken(rawToken),
    },
  };
}

export async function cancelStaffInvitation(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  input: {
    readonly actorUserId: string;
    readonly actor?: StaffIdentityActor;
    readonly invitationId: string;
  }
): Promise<{ readonly invitationId: string }> {
  const invitation = await db.staffInvitation.findFirst({
    where: { id: input.invitationId },
  });
  if (!invitation) {
    throw new StaffIdentityError(
      "INVITE_NOT_FOUND",
      "Esta invitación no es válida."
    );
  }
  await requireActorOnClub(
    db,
    input.actor ?? { kind: "coordinator", userId: input.actorUserId },
    invitation.clubId
  );
  if (invitation.status !== "PENDING" || isExpired(invitation, clock.now())) {
    throw new StaffIdentityError(
      "NOT_PENDING",
      "Solo se puede cancelar una invitación pendiente."
    );
  }
  await db.staffInvitation.update({
    where: { id: invitation.id },
    data: { status: "CANCELLED" },
  });
  return { invitationId: invitation.id };
}

export async function peekStaffInvitation(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  rawToken: string
): Promise<PeekStaffInvitationResult> {
  try {
    const invitation = await loadPendingByToken(db, clock, rawToken);
    const club = await requireClub(db, invitation.clubId);
    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    return {
      ok: true,
      email: invitation.email,
      clubName: club.name,
      role: invitation.role,
      existingUser: existingUser !== null,
    };
  } catch (error) {
    if (error instanceof StaffIdentityError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

export async function acceptStaffInvitation(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  input: AcceptStaffInvitationInput
): Promise<AcceptStaffInvitationResult> {
  const invitation = await loadPendingByToken(db, clock, input.rawToken);
  const existingUser = await db.user.findUnique({
    where: { email: invitation.email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  let user: UserRow;
  let createdUser = false;

  if (existingUser) {
    user = existingUser;
  } else {
    const passwordParsed = passwordSchema.safeParse(input.password);
    if (!passwordParsed.success) {
      throw new StaffIdentityError(
        "INVALID_PASSWORD",
        "La contraseña debe tener entre 8 y 128 caracteres."
      );
    }
    const name =
      typeof input.name === "string" && input.name.trim().length > 0
        ? input.name.trim()
        : null;
    const passwordHash = await input.hashPassword(passwordParsed.data);
    user = await db.user.create({
      data: {
        email: invitation.email,
        passwordHash,
        name,
      },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    createdUser = true;
  }

  const existingMemberships = await db.membership.findMany({
    where: { userId: user.id, clubId: invitation.clubId },
  });
  if (existingMemberships.length > 0) {
    throw new StaffIdentityError(
      "MEMBERSHIP_EXISTS",
      "Ya tienes acceso a este club."
    );
  }

  const membership = await db.membership.create({
    data: {
      userId: user.id,
      clubId: invitation.clubId,
      role: invitation.role,
      hasAllTeams: true,
    },
  });

  await db.staffInvitation.update({
    where: { id: invitation.id },
    data: {
      status: "ACCEPTED",
      acceptedAt: clock.now(),
    },
  });

  return {
    userId: user.id,
    membershipId: membership.id,
    createdUser,
  };
}

export async function listPendingStaffInvitations(
  db: StaffIdentityClient,
  input: {
    readonly actorUserId: string;
    readonly actor?: StaffIdentityActor;
    readonly clubId: string;
  }
): Promise<StaffInvitationRow[]> {
  await requireActorOnClub(
    db,
    input.actor ?? { kind: "coordinator", userId: input.actorUserId },
    input.clubId
  );
  return db.staffInvitation.findMany({
    where: { clubId: input.clubId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export type ClubAccessMember = {
  readonly membershipId: string;
  readonly userId: string;
  readonly email: string;
  readonly name: string | null;
  readonly role: StaffInviteRole;
};

export type ClubAccess = {
  readonly members: ClubAccessMember[];
  readonly pendingInvites: StaffInvitationRow[];
};

export async function listClubAccess(
  db: StaffIdentityClient,
  input: {
    readonly actor: StaffIdentityActor;
    readonly clubId: string;
  }
): Promise<ClubAccess> {
  await requireActorOnClub(db, input.actor, input.clubId);
  const memberships = await db.membership.findMany({
    where: { clubId: input.clubId },
  });
  const members: ClubAccessMember[] = [];
  for (const membership of memberships) {
    if (!isClubStaffRole(membership.role)) {
      continue;
    }
    const user = await db.user.findUnique({
      where: { id: membership.userId },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user) {
      continue;
    }
    members.push({
      membershipId: membership.id,
      userId: membership.userId,
      email: user.email,
      name: user.name,
      role: membership.role,
    });
  }
  const pendingInvites = await db.staffInvitation.findMany({
    where: { clubId: input.clubId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  return { members, pendingInvites };
}

export async function revokeMembership(
  db: StaffIdentityClient,
  input: {
    readonly actor: StaffIdentityActor;
    readonly clubId: string;
    readonly membershipId: string;
  }
): Promise<{ readonly membershipId: string }> {
  await requireActorOnClub(db, input.actor, input.clubId);
  const membership = await loadClubStaffMembership(
    db,
    input.clubId,
    input.membershipId
  );
  if (await coordinatorCountWouldDropToZero(db, input.clubId, membership)) {
    lastCoordinatorError();
  }
  await db.membership.delete({ where: { id: membership.id } });
  return { membershipId: membership.id };
}

export async function changeMembershipRole(
  db: StaffIdentityClient,
  input: {
    readonly actor: StaffIdentityActor;
    readonly clubId: string;
    readonly membershipId: string;
    readonly role: StaffInviteRole;
  }
): Promise<{ readonly membershipId: string; readonly role: StaffInviteRole }> {
  const roleParsed = inviteRoleSchema.safeParse(input.role);
  if (!roleParsed.success) {
    throw new StaffIdentityError(
      "INVALID_ROLE",
      "El rol debe ser Coordinador o Staff."
    );
  }
  await requireActorOnClub(db, input.actor, input.clubId);
  const membership = await loadClubStaffMembership(
    db,
    input.clubId,
    input.membershipId
  );
  if (
    roleParsed.data === "STAFF" &&
    (await coordinatorCountWouldDropToZero(db, input.clubId, membership))
  ) {
    lastCoordinatorError();
  }
  const updated = await db.membership.update({
    where: { id: membership.id },
    data: { role: roleParsed.data },
  });
  return { membershipId: updated.id, role: roleParsed.data };
}

export type OperableClub = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
};

export async function listOperableClubs(
  db: StaffIdentityClient,
  input: { readonly actor: StaffIdentityActor }
): Promise<OperableClub[]> {
  requirePlatformActor(input.actor);
  const clubs = await db.club.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return clubs.map((club) => ({
    id: club.id,
    name: club.name,
    slug: club.slug ?? "",
  }));
}

export async function createClub(
  db: StaffIdentityClient,
  input: {
    readonly actor: StaffIdentityActor;
    readonly name: string;
    readonly slug: string;
  }
): Promise<OperableClub> {
  requirePlatformActor(input.actor);
  const nameParsed = clubNameSchema.safeParse(input.name);
  if (!nameParsed.success) {
    throw new StaffIdentityError(
      "INVALID_NAME",
      "El nombre del club no es válido."
    );
  }
  const slugParsed = slugSchema.safeParse(input.slug);
  if (!slugParsed.success) {
    throw new StaffIdentityError(
      "INVALID_SLUG",
      "El slug debe ser minúsculas, números y guiones."
    );
  }
  const existing = await db.club.findUnique({
    where: { slug: slugParsed.data },
    select: { id: true, name: true, slug: true },
  });
  if (existing) {
    throw new StaffIdentityError(
      "SLUG_TAKEN",
      "Ese slug ya está en uso."
    );
  }
  const club = await db.club.create({
    data: { name: nameParsed.data, slug: slugParsed.data },
  });
  return {
    id: club.id,
    name: club.name,
    slug: club.slug ?? slugParsed.data,
  };
}

export async function changeUserEmail(
  db: StaffIdentityClient,
  input: {
    readonly actor: StaffIdentityActor;
    readonly userId: string;
    readonly email: string;
  }
): Promise<{ readonly userId: string; readonly email: string }> {
  requirePlatformActor(input.actor);
  const email = normalizeEmail(input.email);
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
  if (!user) {
    throw new StaffIdentityError("USER_NOT_FOUND", "Usuario no encontrado.");
  }
  if (user.email !== email) {
    const taken = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (taken) {
      throw new StaffIdentityError(
        "EMAIL_TAKEN",
        "Ese email ya pertenece a otra cuenta."
      );
    }
    await db.user.update({
      where: { id: user.id },
      data: { email },
    });
  }
  return { userId: user.id, email };
}

export async function grantSuperAdmin(
  db: StaffIdentityClient,
  input: {
    readonly actor: StaffIdentityActor;
    readonly userId: string;
  }
): Promise<{ readonly userId: string; readonly platformRole: "SUPER_ADMIN" }> {
  requirePlatformActor(input.actor);
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      platformRole: true,
    },
  });
  if (!user) {
    throw new StaffIdentityError("USER_NOT_FOUND", "Usuario no encontrado.");
  }
  await db.user.update({
    where: { id: user.id },
    data: { platformRole: "SUPER_ADMIN" },
  });
  return { userId: user.id, platformRole: "SUPER_ADMIN" };
}
