"use client";

import { CheckIcon, ClipboardTextIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import { useState, useTransition } from "react";
import type { StaffInviteRole } from "@repo/database/staff-identity";
import { UI_FEEDBACK_TIMEOUT_MS } from "@/lib/durations";
import {
  cancelClubStaffInvitation,
  issueClubStaffInvitation,
  resendClubStaffInvitation,
  type StaffInviteActionResult,
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
  const [lastAcceptUrl, setLastAcceptUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const applyInviteSuccess = (
    result: StaffInviteActionResult,
    fallbackError: string
  ): boolean => {
    if (!result.success) {
      toast.error(result.error ?? fallbackError);
      return false;
    }
    if (result.acceptUrl) {
      setLastAcceptUrl(result.acceptUrl);
      setCopied(false);
    }
    return true;
  };

  const copyAcceptUrl = async (): Promise<void> => {
    if (!lastAcceptUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(lastAcceptUrl);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), UI_FEEDBACK_TIMEOUT_MS);
    } catch {
      toast.error("No se pudo copiar el enlace. Inténtalo de nuevo.");
    }
  };

  if (!canInvite) {
    return null;
  }

  const submitInvite = (): void => {
    startTransition(async () => {
      const result = await issueClubStaffInvitation(clubId, email, role);
      if (!applyInviteSuccess(result, "No se pudo enviar la invitación.")) {
        return;
      }
      setEmail("");
      toast.success(
        "Invitación lista. Copia el enlace y envíaselo a la persona invitada."
      );
    });
  };

  return (
    <SettingsSection
      description="Invita a coordinadores o staff. Copia el enlace de un solo uso y envíaselo; el correo aún no se envía automáticamente."
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

      {lastAcceptUrl ? (
        <div className="border-border-secondary border-t py-3">
          <p className="mb-2 text-sm text-text-secondary">
            Enlace de aceptación (cópialo ahora; no se volverá a mostrar):
          </p>
          <div className="flex items-center gap-2">
            <Input
              aria-label="Enlace de aceptación"
              className="font-mono text-xs"
              readOnly
              value={lastAcceptUrl}
            />
            <Button
              onClick={() => {
                void copyAcceptUrl();
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              {copied ? (
                <CheckIcon className="size-4 text-brand" />
              ) : (
                <ClipboardTextIcon className="size-4" />
              )}
              Copiar enlace
            </Button>
          </div>
        </div>
      ) : null}

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
                      if (!applyInviteSuccess(result, "No se pudo reenviar.")) {
                        return;
                      }
                      toast.success(
                        "Nuevo enlace listo. Cópialo y envíaselo; el anterior deja de valer."
                      );
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
