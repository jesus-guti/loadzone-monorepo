"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import Link from "next/link";
import { useState, useTransition } from "react";
import { completeStaffPasswordReset } from "@/features/settings/actions/staff-password-actions";

type ResetPasswordFormProperties = {
  readonly rawToken: string;
};

export function ResetPasswordForm({ rawToken }: ResetPasswordFormProperties) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="font-semibold text-2xl text-text-primary">
          Contraseña actualizada
        </h1>
        <p className="text-sm text-text-secondary">
          Ya puedes entrar con tu nueva contraseña.
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
          const result = await completeStaffPasswordReset({
            rawToken,
            password,
          });
          if (!result.success) {
            setError(result.error ?? "No se pudo restablecer la contraseña.");
            return;
          }
          setDone(true);
        });
      }}
    >
      <div>
        <h1 className="font-semibold text-2xl text-text-primary">
          Nueva contraseña
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Elige una contraseña de al menos 8 caracteres.
        </p>
      </div>
      <div className="space-y-1">
        <label
          className="text-sm font-medium text-text-primary"
          htmlFor="reset-password"
        >
          Contraseña
        </label>
        <Input
          autoComplete="new-password"
          id="reset-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      {error ? (
        <p className="bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}
      <Button disabled={isPending} type="submit">
        Guardar contraseña
      </Button>
    </form>
  );
}
