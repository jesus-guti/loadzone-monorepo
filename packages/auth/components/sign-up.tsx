"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

type SignUpState = {
  name: string;
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
};

export const SignUp = () => {
  const router = useRouter();
  const [state, setState] = useState<SignUpState>({
    name: "",
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

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: state.name,
        email: state.email,
        password: state.password,
      }),
    });

    const payload = (await response.json()) as { error?: string; ok?: boolean };

    if (!response.ok || !payload.ok) {
      setState((currentState) => ({
        ...currentState,
        error: payload.error ?? "No se pudo crear la cuenta.",
        isSubmitting: false,
      }));
      return;
    }

    const signInResult = await signIn("credentials", {
      email: state.email,
      password: state.password,
      redirect: false,
      callbackUrl: "/onboarding",
    });

    if (!signInResult?.ok) {
      setState((currentState) => ({
        ...currentState,
        error: "La cuenta se creó, pero no se pudo iniciar sesión.",
        isSubmitting: false,
      }));
      return;
    }

    router.push(signInResult.url ?? "/onboarding");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border-secondary bg-bg-primary p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Crear cuenta</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Registra tu usuario para crear tu club y empezar a trabajar.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-text-primary">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={state.name}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                name: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-border-secondary bg-bg-secondary px-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand"
            placeholder="Preparador físico"
            required
          />
        </div>

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
            className="h-11 w-full rounded-xl border border-border-secondary bg-bg-secondary px-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand"
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
            className="h-11 w-full rounded-xl border border-border-secondary bg-bg-secondary px-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand"
            placeholder="Mínimo 8 caracteres"
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
          {state.isSubmitting ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/sign-in" className="font-medium text-text-primary underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
};
