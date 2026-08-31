"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import { useState, useTransition } from "react";
import type { StaffInviteRole } from "@repo/database/staff-identity";
import {
  cancelClubStaffInvitation,
  issueClubStaffInvitation,
  resendClubStaffInvitation,
} from "../actions/staff-invite-actions";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

export type PendingStaffInviteView = {
  readonly id: string;
  readonly email: string;
  readonly role: StaffInviteRole;
  readonly expiresAt: string;
};

type StaffInvitesSectionProperties = {
  readonly clubId: string;
  readonly canInvite: boolean;
  readonly pendingInvites: readonly PendingStaffInviteView[];
};

function roleLabel(role: StaffInviteRole): string {
  return role === "COORDINATOR" ? "Coordinador" : "Staff";
}

export function StaffInvitesSection({
  clubId,
  canInvite,
  pendingInvites,
}: StaffInvitesSectionProperties) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffInviteRole>("STAFF");
  const [isPending, startTransition] = useTransition();

  if (!canInvite) {
    return null;
  }

  const submitInvite = (): void => {
    startTransition(async () => {
      const result = await issueClubStaffInvitation(clubId, email, role);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo enviar la invitación.");
        return;
      }
      setEmail("");
      toast.success("Invitación enviada.");
    });
  };

  return (
    <SettingsSection
      description="Invita a coordinadores o staff. Recibirán un enlace de un solo uso."
      title="Invitaciones"
    >
      <SettingsRow htmlFor="staff-invite-email" label="Email">
        <Input
          autoComplete="email"
          id="staff-invite-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="coach@club.es"
          type="email"
          value={email}
        />
      </SettingsRow>
      <SettingsRow htmlFor="staff-invite-role" label="Rol">
        <select
          className="h-8 w-full rounded-lg border border-border-secondary bg-bg-tertiary px-2.5 text-sm text-text-primary"
          id="staff-invite-role"
          onChange={(event) =>
            setRole(event.target.value as StaffInviteRole)
          }
          value={role}
        >
          <option value="STAFF">Staff</option>
          <option value="COORDINATOR">Coordinador</option>
        </select>
      </SettingsRow>
      <div className="flex justify-end border-border-secondary border-t py-3">
        <Button
          disabled={isPending || email.trim().length === 0}
          onClick={submitInvite}
          size="sm"
          type="button"
        >
          Enviar invitación
        </Button>
      </div>

      {pendingInvites.length === 0 ? (
        <p className="pt-2 text-sm text-text-secondary">
          No hay invitaciones pendientes.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border-secondary">
          {pendingInvites.map((invite) => (
            <li
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              key={invite.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">{invite.email}</p>
                <p className="text-xs text-text-secondary">
                  {roleLabel(invite.role)} · caduca{" "}
                  {new Date(invite.expiresAt).toLocaleDateString("es")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await resendClubStaffInvitation(
                        clubId,
                        invite.id
                      );
                      if (!result.success) {
                        toast.error(result.error ?? "No se pudo reenviar.");
                        return;
                      }
                      toast.success("Invitación reenviada.");
                    });
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Reenviar
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await cancelClubStaffInvitation(
                        clubId,
                        invite.id
                      );
                      if (!result.success) {
                        toast.error(result.error ?? "No se pudo cancelar.");
                        return;
                      }
                      toast.success("Invitación cancelada.");
                    });
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}
