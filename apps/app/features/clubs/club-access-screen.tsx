"use client";

import type { StaffInviteRole } from "@repo/database/staff-identity";
import { Button } from "@repo/design-system/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import Link from "next/link";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import {
  addClubToMember,
  cancelClubInvitation,
  changeClubMemberEmail,
  changeClubMemberRole,
  deleteClubUser,
  inviteClubMember,
  resendClubInvitation,
  revokeClubMember,
  transferClubMember,
} from "./actions";

export type ClubOption = {
  readonly id: string;
  readonly name: string;
};

export type MemberRow = {
  readonly membershipId: string;
  readonly userId: string;
  readonly email: string;
  readonly name: string | null;
  readonly role: StaffInviteRole;
  readonly platformRole: "USER" | "SUPER_ADMIN";
};

export type PendingRow = {
  readonly id: string;
  readonly email: string;
  readonly role: StaffInviteRole;
  readonly expiresLabel: string;
};

const SEARCH_MIN = 8;

type ClubAccessScreenProperties = {
  readonly clubId: string;
  readonly clubName: string;
  readonly clubs: readonly ClubOption[];
  readonly members: readonly MemberRow[];
  readonly pending: readonly PendingRow[];
};

type ClubDialog =
  | { kind: "link"; url: string }
  | { kind: "email"; member: MemberRow }
  | { kind: "transfer"; member: MemberRow }
  | { kind: "add"; member: MemberRow }
  | { kind: "revoke"; member: MemberRow }
  | { kind: "delete"; member: MemberRow }
  | null;

function roleLabel(role: StaffInviteRole): string {
  return role === "COORDINATOR" ? "Coordinador" : "Staff";
}

async function copyText(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}

export function ClubAccessScreen({
  clubId,
  clubName,
  clubs,
  members,
  pending,
}: ClubAccessScreenProperties) {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffInviteRole>("STAFF");
  const [dialog, setDialog] = useState<ClubDialog>(null);
  const [draftEmail, setDraftEmail] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [destinationRole, setDestinationRole] =
    useState<StaffInviteRole>("STAFF");
  const [isPending, startTransition] = useTransition();

  const otherClubs = clubs.filter((club) => club.id !== clubId);
  const needle = query.trim().toLowerCase();
  const visibleMembers = useMemo(() => {
    if (needle.length === 0) {
      return members;
    }
    return members.filter((member) => {
      const name = member.name?.toLowerCase() ?? "";
      return (
        member.email.toLowerCase().includes(needle) || name.includes(needle)
      );
    });
  }, [members, needle]);

  function showLink(url: string | undefined, fallback: string): void {
    if (!url) {
      toast.error(fallback);
      return;
    }
    setDialog({ kind: "link", url });
  }

  function onInvite(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await inviteClubMember(clubId, email, role);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo invitar.");
        return;
      }
      setEmail("");
      showLink(result.acceptUrl, "No se pudo invitar.");
    });
  }

  return (
    <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-8 px-4 py-6 md:px-10">
      <header className="flex flex-col gap-1">
        <Link className="text-xs text-text-secondary" href="/clubs">
          Clubes
        </Link>
        <h1 className="font-medium text-lg text-text-primary">{clubName}</h1>
      </header>

      <form
        className="flex flex-col gap-3 border-b border-border-secondary pb-6"
        onSubmit={onInvite}
      >
        <label
          className="flex flex-col gap-1 text-sm text-text-primary"
          htmlFor="invite-email"
        >
          Email
          <Input
            disabled={isPending}
            id="invite-email"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            placeholder="persona@club.test"
            required
            type="email"
            value={email}
          />
        </label>
        <label
          className="flex flex-col gap-1 text-sm text-text-primary"
          htmlFor="invite-role"
        >
          Rol
          <select
            className="h-9 rounded-md border border-border-secondary bg-bg-primary px-2 text-sm"
            id="invite-role"
            onChange={(event) => {
              setRole(
                event.target.value === "COORDINATOR" ? "COORDINATOR" : "STAFF"
              );
            }}
            value={role}
          >
            <option value="COORDINATOR">Coordinador</option>
            <option value="STAFF">Staff</option>
          </select>
        </label>
        <Button disabled={isPending} type="submit">
          Invitar
        </Button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs uppercase tracking-wide text-text-secondary">
          Miembros
        </h2>
        {members.length >= SEARCH_MIN ? (
          <Input
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Buscar miembro"
            value={query}
          />
        ) : null}
        {members.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No hay miembros en este club.
          </p>
        ) : (
          <ul>
            {visibleMembers.map((member) => {
              const nextRole: StaffInviteRole =
                member.role === "COORDINATOR" ? "STAFF" : "COORDINATOR";
              return (
                <li
                  className="flex flex-col gap-2 border-t border-border-secondary py-3"
                  key={member.membershipId}
                >
                  <div>
                    <p className="text-sm text-text-primary">
                      {member.name ?? member.email}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {member.email} · {roleLabel(member.role)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const result = await changeClubMemberRole(
                            clubId,
                            member.membershipId,
                            nextRole
                          );
                          if (!result.success) {
                            toast.error(
                              result.error ?? "No se pudo cambiar el rol."
                            );
                          }
                        });
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Cambiar rol
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={() => {
                        setDraftEmail(member.email);
                        setDialog({ kind: "email", member });
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Cambiar email
                    </Button>
                    <Button
                      disabled={isPending || otherClubs.length === 0}
                      onClick={() => {
                        setDestinationId(otherClubs[0]?.id ?? "");
                        setDestinationRole("STAFF");
                        setDialog({ kind: "transfer", member });
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Transferir
                    </Button>
                    <Button
                      disabled={isPending || otherClubs.length === 0}
                      onClick={() => {
                        setDestinationId(otherClubs[0]?.id ?? "");
                        setDestinationRole("STAFF");
                        setDialog({ kind: "add", member });
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Añadir club
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={() => {
                        setDialog({ kind: "revoke", member });
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Revocar
                    </Button>
                    {member.platformRole === "SUPER_ADMIN" ? null : (
                      <Button
                        disabled={isPending}
                        onClick={() => {
                          setDialog({ kind: "delete", member });
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Borrar usuario
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs uppercase tracking-wide text-text-secondary">
          Invitaciones pendientes
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No hay invitaciones pendientes.
          </p>
        ) : (
          <ul>
            {pending.map((invite) => (
              <li
                className="flex flex-col gap-2 border-t border-border-secondary py-3"
                key={invite.id}
              >
                <p className="text-sm text-text-primary">{invite.email}</p>
                <p className="text-xs text-text-secondary">
                  {roleLabel(invite.role)} · caduca {invite.expiresLabel}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await resendClubInvitation(
                          clubId,
                          invite.id
                        );
                        if (!result.success) {
                          toast.error(
                            result.error ?? "No se pudo copiar el enlace."
                          );
                          return;
                        }
                        showLink(
                          result.acceptUrl,
                          "No se pudo copiar el enlace."
                        );
                      });
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Copiar enlace
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await cancelClubInvitation(
                          clubId,
                          invite.id
                        );
                        if (!result.success) {
                          toast.error(result.error ?? "No se pudo anular.");
                        }
                      });
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Anular
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
          }
        }}
        open={dialog !== null}
      >
        <DialogContent>
          {dialog?.kind === "link" ? (
            <>
              <DialogHeader>
                <DialogTitle>Enlace de invitación</DialogTitle>
                <DialogDescription>
                  Copia el enlace y entrégalo. No se envía por correo.
                </DialogDescription>
              </DialogHeader>
              <p className="break-all px-4 text-sm text-text-primary">
                {dialog.url}
              </p>
              <DialogFooter>
                <Button
                  onClick={() => {
                    const url = dialog.url;
                    startTransition(async () => {
                      await copyText(url);
                      toast.success("Enlace copiado.");
                    });
                  }}
                  type="button"
                >
                  Copiar enlace
                </Button>
              </DialogFooter>
            </>
          ) : null}
          {dialog?.kind === "email" ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const member = dialog.member;
                startTransition(async () => {
                  const result = await changeClubMemberEmail(
                    clubId,
                    member.userId,
                    draftEmail
                  );
                  if (!result.success) {
                    toast.error(result.error ?? "No se pudo cambiar el email.");
                    return;
                  }
                  setDialog(null);
                });
              }}
            >
              <DialogHeader>
                <DialogTitle>Cambiar email</DialogTitle>
                <DialogDescription>
                  El nuevo email tiene que estar libre.
                </DialogDescription>
              </DialogHeader>
              <div className="px-4">
                <Input
                  onChange={(event) => {
                    setDraftEmail(event.target.value);
                  }}
                  required
                  type="email"
                  value={draftEmail}
                />
              </div>
              <DialogFooter>
                <Button disabled={isPending} type="submit">
                  Cambiar email
                </Button>
              </DialogFooter>
            </form>
          ) : null}
          {dialog?.kind === "transfer" || dialog?.kind === "add" ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const member = dialog.member;
                const kind = dialog.kind;
                startTransition(async () => {
                  const result =
                    kind === "transfer"
                      ? await transferClubMember(
                          clubId,
                          member.membershipId,
                          destinationId,
                          destinationRole
                        )
                      : await addClubToMember(
                          clubId,
                          member.userId,
                          destinationId,
                          destinationRole
                        );
                  if (!result.success) {
                    toast.error(result.error ?? "No se pudo completar.");
                    return;
                  }
                  setDialog(null);
                });
              }}
            >
              <DialogHeader>
                <DialogTitle>
                  {dialog.kind === "transfer" ? "Transferir" : "Añadir club"}
                </DialogTitle>
                <DialogDescription>
                  El acceso en el club de destino queda activo al confirmar.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 px-4">
                <select
                  className="h-9 rounded-md border border-border-secondary bg-bg-primary px-2 text-sm"
                  onChange={(event) => {
                    setDestinationId(event.target.value);
                  }}
                  value={destinationId}
                >
                  {otherClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 rounded-md border border-border-secondary bg-bg-primary px-2 text-sm"
                  onChange={(event) => {
                    setDestinationRole(
                      event.target.value === "COORDINATOR"
                        ? "COORDINATOR"
                        : "STAFF"
                    );
                  }}
                  value={destinationRole}
                >
                  <option value="COORDINATOR">Coordinador</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              <DialogFooter>
                <Button disabled={isPending} type="submit">
                  {dialog.kind === "transfer" ? "Transferir" : "Añadir club"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
          {dialog?.kind === "revoke" ? (
            <>
              <DialogHeader>
                <DialogTitle>Revocar</DialogTitle>
                <DialogDescription>
                  {dialog.member.email} deja este club. El inicio de sesión
                  sigue existiendo.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  disabled={isPending}
                  onClick={() => {
                    const member = dialog.member;
                    startTransition(async () => {
                      const result = await revokeClubMember(
                        clubId,
                        member.membershipId
                      );
                      if (!result.success) {
                        toast.error(result.error ?? "No se pudo revocar.");
                        return;
                      }
                      setDialog(null);
                    });
                  }}
                  type="button"
                >
                  Revocar
                </Button>
              </DialogFooter>
            </>
          ) : null}
          {dialog?.kind === "delete" ? (
            <>
              <DialogHeader>
                <DialogTitle>Borrar usuario</DialogTitle>
                <DialogDescription>
                  Se borra el inicio de sesión de {dialog.member.email} y sus
                  accesos a todos los clubes.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  disabled={isPending}
                  onClick={() => {
                    const member = dialog.member;
                    startTransition(async () => {
                      const result = await deleteClubUser(
                        clubId,
                        member.userId
                      );
                      if (!result.success) {
                        toast.error(result.error ?? "No se pudo borrar.");
                        return;
                      }
                      setDialog(null);
                    });
                  }}
                  type="button"
                >
                  Borrar usuario
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
