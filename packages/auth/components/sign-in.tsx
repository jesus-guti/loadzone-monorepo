"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

type SignInState = {
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
};

export const SignIn = () => {
  const router = useRouter();
  const [state, setState] = useState<SignInState>({
    email: "",
    password: "",
    error: null,
    isSubmitting: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    setState((currentState) => ({
      ...currentState,
      error: null,
      isSubmitting: true,
    }));

    const result = await signIn("credentials", {
      email: state.email,
      password: state.password,
      redirect: false,
      callbackUrl: "/",
    });

    if (!result?.ok) {
      setState((currentState) => ({
        ...currentState,
        error: "Credenciales no válidas.",
        isSubmitting: false,
      }));
      return;
    }

    router.push(result.url ?? "/");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border-secondary bg-bg-primary p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Inicia sesión</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Accede al panel de LoadZone con tu cuenta.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={state.email}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                email: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-border-secondary bg-bg-secondary px-3 text-sm text-text-primary outline-none ring-0 placeholder:text-text-tertiary focus:border-brand"
            placeholder="staff@club.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-text-primary"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={state.password}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                password: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-border-secondary bg-bg-secondary px-3 text-sm text-text-primary outline-none ring-0 placeholder:text-text-tertiary focus:border-brand"
            placeholder="********"
            required
          />
        </div>

        {state.error ? (
          <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state.isSubmitting}
          className="h-11 w-full rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        ¿No tienes cuenta?{" "}
        <Link href="/sign-up" className="font-medium text-text-primary underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
};
