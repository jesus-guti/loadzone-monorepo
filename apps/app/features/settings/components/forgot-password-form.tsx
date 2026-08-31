"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import Link from "next/link";
import { useState, useTransition } from "react";
import { requestStaffPasswordReset } from "@/features/settings/actions/staff-password-actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="font-semibold text-2xl text-text-primary">
          Revisa tu email
        </h1>
        <p className="text-sm text-text-secondary">
          Si existe una cuenta con ese email, te enviaremos un enlace para
          elegir una nueva contraseña.
        </p>
        <Button nativeButton={false} render={<Link href="/sign-in" />}>
          Volver a iniciar sesión
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
          const result = await requestStaffPasswordReset(email);
          if (!result.success) {
            setError(result.error ?? "No se pudo enviar el enlace.");
            return;
          }
          setDone(true);
        });
      }}
    >
      <div>
        <h1 className="font-semibold text-2xl text-text-primary">
          Restablecer contraseña
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Introduce el email de tu cuenta. Te enviaremos un enlace de un solo
          uso.
        </p>
      </div>
      <div className="space-y-1">
        <label
          className="text-sm font-medium text-text-primary"
          htmlFor="forgot-email"
        >
          Email
        </label>
        <Input
          autoComplete="username"
          id="forgot-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>
      {error ? (
        <p className="bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}
      <Button disabled={isPending} type="submit">
        Enviar enlace
      </Button>
      <p className="text-sm text-text-secondary">
        <Link className="font-medium text-text-primary underline" href="/sign-in">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
