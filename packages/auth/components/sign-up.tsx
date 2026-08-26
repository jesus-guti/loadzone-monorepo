"use client";

import Link from "next/link";
import { getCsrfToken } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";

type SignUpState = {
  name: string;
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
};

export const SignUp = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [state, setState] = useState<SignUpState>({
    name: "",
    email: "",
    password: "",
    error: null,
    isSubmitting: false,
  });

  useEffect(() => {
    void getCsrfToken().then((token) => {
      if (token) {
        setCsrfToken(token);
      }
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const form = event.currentTarget;
    const emailInput = form.elements.namedItem("email");

    if (!(emailInput instanceof HTMLInputElement)) {
      return;
    }

    const normalizedEmail = emailInput.value.trim().toLowerCase();
    emailInput.value = normalizedEmail;

    setState((currentState) => ({
      ...currentState,
      email: normalizedEmail,
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
        email: normalizedEmail,
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

    form.action = "/api/auth/callback/credentials";
    form.method = "post";
    HTMLFormElement.prototype.submit.call(form);
  }

  return (
    <div className="w-full rounded-2xl border border-border-secondary bg-bg-primary p-6 shadow-sm sm:p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Registra tu usuario para crear tu club y empezar a trabajar.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        method="post"
        action="/api/auth/register"
        autoComplete="on"
      >
        <input name="csrfToken" type="hidden" value={csrfToken} />
        <input name="callbackUrl" type="hidden" value="/onboarding" />
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-text-primary">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={state.name}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                name: event.target.value,
              }))
            }
            className="h-12 w-full  border border-border-secondary bg-bg-secondary px-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand"
            placeholder="Preparador físico"
            autoComplete="name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={state.email}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                email: event.target.value,
              }))
            }
            className="h-12 w-full  border border-border-secondary bg-bg-secondary px-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand"
            placeholder="staff@club.com"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="email"
            spellCheck={false}
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
            name="password"
            type="password"
            value={state.password}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                password: event.target.value,
              }))
            }
            className="h-12 w-full  border border-border-secondary bg-bg-secondary px-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
          />
        </div>

        {state.error ? (
          <p className=" bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state.isSubmitting || !csrfToken}
          className="h-12 w-full  bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
