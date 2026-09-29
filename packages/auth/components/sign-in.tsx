"use client";

import Link from "next/link";
import { getCsrfToken } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";
import {
  parseRememberMeValue,
  REMEMBER_ME_COOKIE_MAX_AGE_SECONDS,
  REMEMBER_ME_COOKIE_NAME,
  REMEMBERED_EMAIL_STORAGE_KEY,
} from "../session-persistence";

type SignInLegalLinks = {
  privacyUrl: string;
  cookiesUrl: string;
  legalNoticeUrl: string;
};

type SignInProps = {
  readonly legalLinks?: SignInLegalLinks;
};

type SignInState = {
  rememberMe: boolean;
  error: string | null;
  showPassword: boolean;
};

function getCookieValue(name: string): string | undefined {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie?.split("=")[1];
}

function getCookieAttributes(maxAge: number): string {
  const secureAttribute =
    window.location.protocol === "https:" ? "; Secure" : "";

  return `Path=/; Max-Age=${maxAge}; SameSite=Lax${secureAttribute}`;
}

function loadRememberedEmail(): string {
  const stored = window.localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY);

  return typeof stored === "string" ? stored.trim() : "";
}

function persistRememberedSignInState(
  email: string,
  rememberMe: boolean
): void {
  if (rememberMe) {
    window.localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, email);
    document.cookie = `${REMEMBER_ME_COOKIE_NAME}=true; ${getCookieAttributes(REMEMBER_ME_COOKIE_MAX_AGE_SECONDS)}`;

    return;
  }

  window.localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY);
  document.cookie = `${REMEMBER_ME_COOKIE_NAME}=; ${getCookieAttributes(0)}`;
}

export const SignIn = ({ legalLinks }: SignInProps) => {
  const [csrfToken, setCsrfToken] = useState("");
  const [state, setState] = useState<SignInState>({
    rememberMe: false,
    error: null,
    showPassword: false,
  });

  useEffect(() => {
    void getCsrfToken().then((token) => {
      if (token) {
        setCsrfToken(token);
      }
    });

    const signInError = new URLSearchParams(window.location.search).get(
      "error"
    );

    if (signInError) {
      setState((currentState) => ({
        ...currentState,
        error: "Credenciales no válidas.",
      }));
    }

    try {
      setState((currentState) => ({
        ...currentState,
        rememberMe: parseRememberMeValue(
          getCookieValue(REMEMBER_ME_COOKIE_NAME)
        ),
      }));

      const emailInput = document.getElementById("email");

      if (
        emailInput instanceof HTMLInputElement &&
        emailInput.value.trim() === ""
      ) {
        const rememberedEmail = loadRememberedEmail();

        if (rememberedEmail) {
          emailInput.value = rememberedEmail;
        }
      }
    } catch {
      // Ignore storage access errors and fall back to browser autofill only.
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem("email");

    if (!(emailInput instanceof HTMLInputElement)) {
      event.preventDefault();
      return;
    }

    const normalizedEmail = emailInput.value.trim().toLowerCase();
    emailInput.value = normalizedEmail;

    try {
      persistRememberedSignInState(normalizedEmail, state.rememberMe);
    } catch {
      // Ignore storage access errors and continue with sign-in.
    }
  }

  const fieldClassName =
    "h-12 w-full border border-border-secondary bg-bg-primary px-3 text-sm text-text-primary outline-none rounded-md placeholder:text-text-tertiary focus:border-text-primary";

  return (
    <div className="w-full">
      <p className="text-center text-sm leading-6 text-text-secondary">
        Identifícate con tu cuenta de staff de LoadZone.
      </p>
      <h1 className="mx-auto mt-6 w-fit border-b-2 border-text-primary pb-2 text-center text-lg font-semibold text-text-primary">
        Iniciar sesión
      </h1>

      <form
        action="/api/auth/callback/credentials"
        autoComplete="on"
        className="mt-8 space-y-5"
        method="post"
        onSubmit={handleSubmit}
      >
        <input name="csrfToken" type="hidden" value={csrfToken} />
        <input name="callbackUrl" type="hidden" value="/" />
        <input
          name="rememberMe"
          type="hidden"
          value={state.rememberMe ? "true" : "false"}
        />

        <div className="space-y-2">
          <label
            className={
              state.error ? "text-sm text-danger" : "text-sm text-text-primary"
            }
            htmlFor="email"
          >
            Correo electrónico
          </label>
          <input
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            className={fieldClassName}
            id="email"
            inputMode="email"
            name="email"
            placeholder="Correo electrónico"
            required
            spellCheck={false}
            type="email"
          />
          {state.error ? (
            <p className="text-sm text-danger">{state.error}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-text-primary" htmlFor="password">
            Contraseña
          </label>
          <div className="flex items-center gap-2">
            <input
              autoComplete="current-password"
              className={fieldClassName}
              id="password"
              name="password"
              placeholder="Contraseña"
              required
              type={state.showPassword ? "text" : "password"}
            />
            <button
              aria-label={
                state.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="flex size-12 shrink-0 rounded-md items-center justify-center border border-border-secondary text-text-secondary"
              onClick={() =>
                setState((currentState) => ({
                  ...currentState,
                  showPassword: !currentState.showPassword,
                }))
              }
              type="button"
            >
              <PasswordVisibilityIcon hidden={!state.showPassword} />
            </button>
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          <Link className="underline" href="/forgot-password">
            ¿Has olvidado la contraseña?
          </Link>
        </p>

        <label className="flex items-center gap-3 text-sm text-text-primary">
          <input
            checked={state.rememberMe}
            className="size-4 border-border-secondary"
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                rememberMe: event.target.checked,
              }))
            }
            type="checkbox"
          />
          Recordarme en este dispositivo
        </label>

        <button
          className="h-12 w-full rounded-md bg-text-primary text-sm font-semibold text-bg-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!csrfToken}
          type="submit"
        >
          Iniciar sesión
        </button>
      </form>

      {legalLinks ? (
        <nav className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-text-tertiary">
          <a href={legalLinks.privacyUrl}>Política de privacidad</a>
          <a href={legalLinks.cookiesUrl}>Política de cookies</a>
          <a href={legalLinks.legalNoticeUrl}>Aviso legal</a>
        </nav>
      ) : null}
    </div>
  );
};

function PasswordVisibilityIcon({ hidden }: { readonly hidden: boolean }) {
  return (
    <svg aria-hidden className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      {hidden ? (
        <path d="M5 19 19 5" stroke="currentColor" strokeWidth="1.5" />
      ) : null}
    </svg>
  );
}
