"use client";

import { Button } from "@repo/design-system/components/button";
import { toast } from "@repo/design-system/components/sonner";
import { useTransition } from "react";
import type { StaffInviteRole } from "@repo/database/staff-identity";
import {
  changeClubMembershipRole,
  revokeClubMembership,
} from "../actions/staff-invite-actions";
import { SettingsSection } from "./settings-section";

export type ClubMemberView = {
  readonly membershipId: string;
  readonly userId: string;
  readonly email: string;
  readonly name: string | null;
  readonly role: StaffInviteRole;
};

type ClubMembersSectionProperties = {
  readonly clubId: string;
  readonly canManage: boolean;
  readonly members: readonly ClubMemberView[];
};

function roleLabel(role: StaffInviteRole): string {
  return role === "COORDINATOR" ? "Coordinador" : "Staff";
}

export function ClubMembersSection({
  clubId,
  canManage,
  members,
}: ClubMembersSectionProperties) {
  const [isPending, startTransition] = useTransition();

  if (!canManage) {
    return null;
  }

  return (
    <SettingsSection
      description="Revoca el acceso o cambia el rol. El usuario no se elimina."
      title="Miembros del club"
    >
      {members.length === 0 ? (
        <p className="pt-2 text-sm text-text-secondary">
          No hay miembros en este club.
        </p>
      ) : (
        <ul className="divide-y divide-border-secondary">
          {members.map((member) => {
            const nextRole: StaffInviteRole =
              member.role === "COORDINATOR" ? "STAFF" : "COORDINATOR";
            return (
              <li
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={member.membershipId}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-primary">
                    {member.name ?? member.email}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {member.email} · {roleLabel(member.role)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await changeClubMembershipRole(
                          clubId,
                          member.membershipId,
                          nextRole
                        );
                        if (!result.success) {
                          toast.error(
                            result.error ?? "No se pudo cambiar el rol."
                          );
                          return;
                        }
                        toast.success(
                          nextRole === "COORDINATOR"
                            ? "Promovido a coordinador."
                            : "Pasó a staff."
                        );
                      });
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {nextRole === "COORDINATOR"
                      ? "Hacer coordinador"
                      : "Hacer staff"}
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await revokeClubMembership(
                          clubId,
                          member.membershipId
                        );
                        if (!result.success) {
                          toast.error(
                            result.error ?? "No se pudo revocar el acceso."
                          );
                          return;
                        }
                        toast.success("Acceso revocado.");
                      });
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Revocar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SettingsSection>
  );
}
