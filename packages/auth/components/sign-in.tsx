"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import {
  REMEMBERED_EMAIL_STORAGE_KEY,
  REMEMBER_ME_COOKIE_MAX_AGE_SECONDS,
  REMEMBER_ME_COOKIE_NAME,
  parseRememberMeValue,
} from "../session-persistence";

type SignInState = {
  email: string;
  password: string;
  rememberMe: boolean;
  error: string | null;
  isSubmitting: boolean;
};

function getCookieValue(name: string): string | undefined {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie?.split("=")[1];
}

function getCookieAttributes(maxAge: number): string {
  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";

  return `Path=/; Max-Age=${maxAge}; SameSite=Lax${secureAttribute}`;
}

function loadRememberedSignInState(): Pick<SignInState, "email" | "rememberMe"> {
  const rememberedEmail =
    typeof window.localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY) === "string"
      ? window.localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY)?.trim() ?? ""
      : "";

  return {
    email: rememberedEmail,
    rememberMe: parseRememberMeValue(getCookieValue(REMEMBER_ME_COOKIE_NAME)),
  };
}

function persistRememberedSignInState(email: string, rememberMe: boolean): void {
  if (rememberMe) {
    window.localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, email);
    document.cookie = `${REMEMBER_ME_COOKIE_NAME}=true; ${getCookieAttributes(REMEMBER_ME_COOKIE_MAX_AGE_SECONDS)}`;

    return;
  }

  window.localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY);
  document.cookie = `${REMEMBER_ME_COOKIE_NAME}=; ${getCookieAttributes(0)}`;
}

type CredentialsContainerWithStore = CredentialsContainer & {
  store?: (credential: Credential) => Promise<Credential | null>;
};

type PasswordCredentialConstructor = new (data: {
  id: string;
  password: string;
  name?: string;
}) => Credential;

async function offerBrowserCredentialSave(
  email: string,
  password: string
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const credentialsContainer = navigator.credentials as
    | CredentialsContainerWithStore
    | undefined;
  const PasswordCredentialCtor = (
    window as unknown as {
      PasswordCredential?: PasswordCredentialConstructor;
    }
  ).PasswordCredential;

  if (!credentialsContainer?.store || !PasswordCredentialCtor) {
    return;
  }

  try {
    const credential = new PasswordCredentialCtor({
      id: email,
      password,
      name: email,
    });

    await credentialsContainer.store(credential);
  } catch {
    // Browsers without support or denied permissions just ignore this.
  }
}

export const SignIn = () => {
  const router = useRouter();
  const [state, setState] = useState<SignInState>({
    email: "",
    password: "",
    rememberMe: false,
    error: null,
    isSubmitting: false,
  });

  useEffect(() => {
    try {
      const rememberedState = loadRememberedSignInState();

      setState((currentState) => ({
        ...currentState,
        email: currentState.email || rememberedState.email,
        rememberMe: rememberedState.rememberMe,
      }));
    } catch {
      // Ignore storage access errors and fall back to browser autofill only.
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const normalizedEmail = state.email.trim().toLowerCase();

    setState((currentState) => ({
      ...currentState,
      email: normalizedEmail,
      error: null,
      isSubmitting: true,
    }));

    try {
      persistRememberedSignInState(normalizedEmail, state.rememberMe);
    } catch {
      // Ignore storage access errors and continue with sign-in.
    }

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password: state.password,
      rememberMe: state.rememberMe ? "true" : "false",
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

    await offerBrowserCredentialSave(normalizedEmail, state.password);

    router.push(result.url ?? "/");
    router.refresh();
  }

  return (
    <div className="w-full rounded-2xl border border-border-secondary bg-bg-primary p-6 shadow-sm sm:p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Inicia sesión
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Accede al panel de LoadZone con tu cuenta.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        method="post"
        action="/api/auth/callback/credentials"
        autoComplete="on"
      >
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
            className="h-12 w-full  border border-border-secondary bg-bg-secondary px-4 text-sm text-text-primary outline-none ring-0 placeholder:text-text-tertiary focus:border-brand"
            placeholder="staff@club.com"
            autoComplete="email"
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
            className="h-12 w-full  border border-border-secondary bg-bg-secondary px-4 text-sm text-text-primary outline-none ring-0 placeholder:text-text-tertiary focus:border-brand"
            placeholder="********"
            autoComplete="current-password"
            required
          />
        </div>

        <label className="flex items-start gap-3 py-1 text-text-secondary">
          <input
            type="checkbox"
            checked={state.rememberMe}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                rememberMe: event.target.checked,
              }))
            }
            className="mt-0.5 h-4 w-4 rounded border-border-secondary text-brand focus:ring-brand"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-text-primary">
              Recordarme
            </span>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              Mantiene la sesión abierta durante más tiempo en este dispositivo y
              recuerda tu email.
            </span>
          </span>
        </label>

        {state.error ? (
          <p className=" bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state.isSubmitting}
          className="h-12 w-full  bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
