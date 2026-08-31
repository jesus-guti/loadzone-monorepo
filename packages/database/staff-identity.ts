/**
 * Staff Invitation seam (SI-01): issue / accept / resend / cancel.
 * Callers inject a Prisma-shaped client, clock, token factory, and hashPassword.
 * Mail is an email intent — tests never call SMTP.
 */

import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { MembershipRole } from "./generated/client";

export const STAFF_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

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

export type PasswordResetEmailIntent = {
  readonly kind: "password_reset";
  readonly to: string;
  readonly resetUrl: string;
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
  | "INVITE_NOT_FOUND"
  | "INVITE_USED"
  | "INVITE_CANCELLED"
  | "INVITE_EXPIRED"
  | "INVALID_PASSWORD"
  | "CLUB_NOT_FOUND"
  | "NOT_PENDING"
  | "RESET_NOT_FOUND"
  | "RESET_USED"
  | "RESET_EXPIRED"
  | "CURRENT_PASSWORD_INVALID"
  | "USER_NOT_FOUND";

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

export function hashPasswordResetToken(rawToken: string): string {
  return hashStaffInvitationToken(rawToken);
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

type UserRow = {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly passwordHash: string | null;
};

type ClubRow = {
  readonly id: string;
  readonly name: string;
};

export type PasswordResetTokenRow = {
  readonly id: string;
  readonly userId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
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
      where: { id: string };
      select: { id: true; name: true };
    }) => Promise<ClubRow | null>;
  };
  readonly user: {
    findUnique: (args: {
      where: { id?: string; email?: string };
      select?: {
        id?: true;
        email?: true;
        name?: true;
        passwordHash?: true;
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
      data: { passwordHash: string };
    }) => Promise<UserRow>;
  };
  readonly membership: {
    findFirst: (args: {
      where: {
        userId: string;
        clubId: string;
        role?: MembershipRole;
      };
    }) => Promise<MembershipRow | null>;
    findMany: (args: {
      where: { userId: string; clubId: string };
    }) => Promise<MembershipRow[]>;
    create: (args: {
      data: {
        userId: string;
        clubId: string;
        role: StaffInviteRole;
        hasAllTeams: boolean;
      };
    }) => Promise<MembershipRow>;
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
  readonly passwordResetToken: {
    findFirst: (args: {
      where: {
        id?: string;
        tokenHash?: string;
        userId?: string;
        usedAt?: Date | null;
      };
    }) => Promise<PasswordResetTokenRow | null>;
    findMany: (args: {
      where: { userId: string; usedAt: Date | null };
    }) => Promise<PasswordResetTokenRow[]>;
    create: (args: {
      data: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
      };
    }) => Promise<PasswordResetTokenRow>;
    update: (args: {
      where: { id: string };
      data: { usedAt?: Date | null };
    }) => Promise<PasswordResetTokenRow>;
  };
};

export type IssueStaffInvitationInput = {
  readonly actorUserId: string;
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
  await requireCoordinatorOnClub(db, input.actorUserId, input.clubId);

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
  await requireCoordinatorOnClub(db, input.actorUserId, invitation.clubId);
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
  input: { readonly actorUserId: string; readonly invitationId: string }
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
  await requireCoordinatorOnClub(db, input.actorUserId, invitation.clubId);
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
  input: { readonly actorUserId: string; readonly clubId: string }
): Promise<StaffInvitationRow[]> {
  await requireCoordinatorOnClub(db, input.actorUserId, input.clubId);
  return db.staffInvitation.findMany({
    where: { clubId: input.clubId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export type RequestPasswordResetInput = {
  readonly email: string;
  readonly resetUrlForToken: (rawToken: string) => string;
  readonly createToken?: () => string;
};

export type RequestPasswordResetResult = {
  readonly emailIntent: PasswordResetEmailIntent | null;
};

export type CompletePasswordResetInput = {
  readonly rawToken: string;
  readonly password: string;
  readonly hashPassword: (plain: string) => Promise<string>;
};

export type ChangePasswordInput = {
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly verifyPassword: (
    plain: string,
    passwordHash: string
  ) => Promise<boolean>;
  readonly hashPassword: (plain: string) => Promise<string>;
};

function parseEmailOrNull(raw: string): string | null {
  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }
  return parsed.data.toLowerCase();
}

async function loadResetByToken(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  rawToken: string
): Promise<PasswordResetTokenRow> {
  const tokenHash = hashPasswordResetToken(rawToken);
  const reset = await db.passwordResetToken.findFirst({
    where: { tokenHash },
  });
  if (!reset) {
    throw new StaffIdentityError(
      "RESET_NOT_FOUND",
      "Este enlace de restablecimiento no es válido."
    );
  }
  if (reset.usedAt) {
    throw new StaffIdentityError(
      "RESET_USED",
      "Este enlace de restablecimiento ya se usó."
    );
  }
  if (reset.expiresAt.getTime() < clock.now().getTime()) {
    await db.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: clock.now() },
    });
    throw new StaffIdentityError(
      "RESET_EXPIRED",
      "Este enlace de restablecimiento ha caducado."
    );
  }
  return reset;
}

export async function requestPasswordReset(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  input: RequestPasswordResetInput
): Promise<RequestPasswordResetResult> {
  const email = parseEmailOrNull(input.email);
  if (!email) {
    return { emailIntent: null };
  }
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
  if (!user) {
    return { emailIntent: null };
  }

  const unused = await db.passwordResetToken.findMany({
    where: { userId: user.id, usedAt: null },
  });
  const now = clock.now();
  for (const token of unused) {
    await db.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    });
  }

  const rawToken = (input.createToken ?? defaultCreateToken)();
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashPasswordResetToken(rawToken),
      expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
    },
  });

  return {
    emailIntent: {
      kind: "password_reset",
      to: email,
      resetUrl: input.resetUrlForToken(rawToken),
    },
  };
}

export async function peekPasswordReset(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  rawToken: string
): Promise<{ readonly ok: true } | { readonly ok: false; readonly message: string }> {
  try {
    await loadResetByToken(db, clock, rawToken);
    return { ok: true };
  } catch (error) {
    if (error instanceof StaffIdentityError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

export async function completePasswordReset(
  db: StaffIdentityClient,
  clock: StaffIdentityClock,
  input: CompletePasswordResetInput
): Promise<{ readonly userId: string }> {
  const reset = await loadResetByToken(db, clock, input.rawToken);
  const passwordParsed = passwordSchema.safeParse(input.password);
  if (!passwordParsed.success) {
    throw new StaffIdentityError(
      "INVALID_PASSWORD",
      "La contraseña debe tener entre 8 y 128 caracteres."
    );
  }
  const passwordHash = await input.hashPassword(passwordParsed.data);
  await db.user.update({
    where: { id: reset.userId },
    data: { passwordHash },
  });
  await db.passwordResetToken.update({
    where: { id: reset.id },
    data: { usedAt: clock.now() },
  });
  return { userId: reset.userId };
}

export async function changePassword(
  db: StaffIdentityClient,
  input: ChangePasswordInput
): Promise<{ readonly userId: string }> {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
  if (!user) {
    throw new StaffIdentityError("USER_NOT_FOUND", "Usuario no encontrado.");
  }
  if (!user.passwordHash) {
    throw new StaffIdentityError(
      "CURRENT_PASSWORD_INVALID",
      "La contraseña actual no es correcta."
    );
  }
  const matches = await input.verifyPassword(
    input.currentPassword,
    user.passwordHash
  );
  if (!matches) {
    throw new StaffIdentityError(
      "CURRENT_PASSWORD_INVALID",
      "La contraseña actual no es correcta."
    );
  }
  const passwordParsed = passwordSchema.safeParse(input.newPassword);
  if (!passwordParsed.success) {
    throw new StaffIdentityError(
      "INVALID_PASSWORD",
      "La contraseña debe tener entre 8 y 128 caracteres."
    );
  }
  const passwordHash = await input.hashPassword(passwordParsed.data);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  return { userId: user.id };
}
