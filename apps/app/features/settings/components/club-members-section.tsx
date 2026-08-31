import type { StaffInviteRole } from "@repo/database/staff-identity";
import { SettingsSection } from "./settings-section";

export type ClubMemberView = {
  readonly membershipId: string;
  readonly email: string;
  readonly name: string | null;
  readonly role: StaffInviteRole;
};

type ClubMembersSectionProperties = {
  readonly members: readonly ClubMemberView[];
};

function roleLabel(role: StaffInviteRole): string {
  return role === "COORDINATOR" ? "Coordinador" : "Staff";
}

export function ClubMembersSection({ members }: ClubMembersSectionProperties) {
  return (
    <SettingsSection
      description="Quién tiene acceso al espacio del club. Revocar o cambiar el rol llega en la siguiente entrega."
      title="Usuarios"
    >
      {members.length === 0 ? (
        <p className="py-3 text-sm text-text-secondary">
          Aún no hay usuarios en este club.
        </p>
      ) : (
        <ul className="divide-y divide-border-secondary">
          {members.map((member) => (
            <li
              className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              key={member.membershipId}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">
                  {member.name?.trim() || member.email}
                </p>
                {member.name?.trim() ? (
                  <p className="truncate text-xs text-text-secondary">
                    {member.email}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-xs text-text-secondary">
                {roleLabel(member.role)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}
