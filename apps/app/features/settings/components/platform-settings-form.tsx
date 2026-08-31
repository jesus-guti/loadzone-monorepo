"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  changeStaffUserEmail,
  createOperatingClub,
  grantUserSuperAdmin,
  setActiveOperatingClub,
} from "../actions/platform-actions";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

export type OperableClubView = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
};

type PlatformSettingsFormProperties = {
  readonly activeClubId: string;
  readonly clubs: readonly OperableClubView[];
};

export function PlatformSettingsForm({
  activeClubId,
  clubs,
}: PlatformSettingsFormProperties) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clubName, setClubName] = useState("");
  const [clubSlug, setClubSlug] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [grantUserId, setGrantUserId] = useState("");

  return (
    <>
      <SettingsSection
        description="Elige el club en el que operas. No impersonas a nadie."
        title="Club en operación"
      >
        {clubs.length === 0 ? (
          <p className="pt-2 text-sm text-text-secondary">
            Todavía no hay clubs. Crea el primero abajo.
          </p>
        ) : (
          <SettingsRow htmlFor="operating-club" label="Club">
            <select
              className="h-8 w-full rounded-lg border border-border-secondary bg-bg-tertiary px-2.5 text-sm text-text-primary"
              disabled={isPending}
              id="operating-club"
              onChange={(event) => {
                const nextId = event.target.value;
                startTransition(async () => {
                  const result = await setActiveOperatingClub(nextId);
                  if (!result.success) {
                    toast.error(result.error ?? "No se pudo cambiar de club.");
                    return;
                  }
                  router.refresh();
                });
              }}
              value={activeClubId}
            >
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.slug})
                </option>
              ))}
            </select>
          </SettingsRow>
        )}
      </SettingsSection>

      <SettingsSection
        description="Crea el club sin membresía. Después invita al primer coordinador desde Club."
        title="Nuevo club"
      >
        <SettingsRow htmlFor="new-club-name" label="Nombre">
          <Input
            id="new-club-name"
            onChange={(event) => setClubName(event.target.value)}
            value={clubName}
          />
        </SettingsRow>
        <SettingsRow htmlFor="new-club-slug" label="Slug">
          <Input
            id="new-club-slug"
            onChange={(event) => setClubSlug(event.target.value)}
            placeholder="atletico-norte"
            value={clubSlug}
          />
        </SettingsRow>
        <div className="flex justify-end border-border-secondary border-t py-3">
          <Button
            disabled={isPending || clubName.trim().length < 2 || clubSlug.trim().length < 2}
            onClick={() => {
              startTransition(async () => {
                const result = await createOperatingClub(clubName, clubSlug);
                if (!result.success) {
                  toast.error(result.error ?? "No se pudo crear el club.");
                  return;
                }
                setClubName("");
                setClubSlug("");
                toast.success("Club creado.");
                router.refresh();
              });
            }}
            size="sm"
            type="button"
          >
            Crear club
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        description="El email de acceso solo lo cambia un operador. Debe ser único."
        title="Cambiar email de usuario"
      >
        <SettingsRow htmlFor="email-user-id" label="Id de usuario">
          <Input
            id="email-user-id"
            onChange={(event) => setUserId(event.target.value)}
            value={userId}
          />
        </SettingsRow>
        <SettingsRow htmlFor="email-user-email" label="Nuevo email">
          <Input
            autoComplete="off"
            id="email-user-email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </SettingsRow>
        <div className="flex justify-end border-border-secondary border-t py-3">
          <Button
            disabled={isPending || userId.trim().length === 0 || email.trim().length === 0}
            onClick={() => {
              startTransition(async () => {
                const result = await changeStaffUserEmail(userId, email);
                if (!result.success) {
                  toast.error(result.error ?? "No se pudo cambiar el email.");
                  return;
                }
                toast.success("Email actualizado.");
                router.refresh();
              });
            }}
            size="sm"
            type="button"
          >
            Guardar email
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        description="Un coordinador no puede conceder este rol. No hay impersonación."
        title="Conceder Super Admin"
      >
        <SettingsRow htmlFor="grant-user-id" label="Id de usuario">
          <Input
            id="grant-user-id"
            onChange={(event) => setGrantUserId(event.target.value)}
            value={grantUserId}
          />
        </SettingsRow>
        <div className="flex justify-end border-border-secondary border-t py-3">
          <Button
            disabled={isPending || grantUserId.trim().length === 0}
            onClick={() => {
              startTransition(async () => {
                const result = await grantUserSuperAdmin(grantUserId);
                if (!result.success) {
                  toast.error(result.error ?? "No se pudo conceder el rol.");
                  return;
                }
                toast.success("Super Admin concedido.");
              });
            }}
            size="sm"
            type="button"
          >
            Conceder Super Admin
          </Button>
        </div>
      </SettingsSection>
    </>
  );
}
