"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import Link from "next/link";
import { useState, useTransition } from "react";
import { acceptClubStaffInvitation } from "@/features/settings/actions/staff-invite-actions";

type StaffInviteAcceptFormProperties = {
  readonly rawToken: string;
  readonly email: string;
  readonly clubName: string;
  readonly existingUser: boolean;
};

export function StaffInviteAcceptForm({
  rawToken,
  email,
  clubName,
  existingUser,
}: StaffInviteAcceptFormProperties) {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="font-semibold text-2xl text-text-primary">
          Ya formas parte de {clubName}
        </h1>
        <p className="text-sm text-text-secondary">
          Entra con tu email y contraseña para abrir el espacio de staff.
        </p>
        <Button nativeButton={false} render={<Link href="/sign-in" />}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await acceptClubStaffInvitation({
            rawToken,
            password: existingUser ? undefined : password,
            name: existingUser ? undefined : name,
          });
          if (!result.success) {
            setError(result.error ?? "No se pudo aceptar la invitación.");
            return;
          }
          setDone(true);
        });
      }}
    >
      <div>
        <h1 className="font-semibold text-2xl text-text-primary">
          Únete a {clubName}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Invitación para <span className="text-text-primary">{email}</span>
        </p>
      </div>

      {existingUser ? (
        <p className="text-sm text-text-secondary">
          Ya tienes cuenta. Confirma para unirte a este club con la misma
          contraseña.
        </p>
      ) : (
        <>
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-text-primary"
              htmlFor="invite-name"
            >
              Nombre (opcional)
            </label>
            <Input
              id="invite-name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </div>
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-text-primary"
              htmlFor="invite-password"
            >
              Contraseña
            </label>
            <Input
              autoComplete="new-password"
              id="invite-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            <p className="text-xs text-text-secondary">Mínimo 8 caracteres.</p>
          </div>
        </>
      )}

      {error ? (
        <p className="bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}

      <Button disabled={isPending} type="submit">
        {existingUser ? "Unirme al club" : "Crear cuenta y unirme"}
      </Button>
    </form>
  );
}
