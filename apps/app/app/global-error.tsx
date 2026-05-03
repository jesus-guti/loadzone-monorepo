"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { fonts } from "@repo/design-system/lib/fonts";
import { captureException } from "@sentry/nextjs";
import type NextError from "next/error";
import { useEffect } from "react";

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html className={fonts} lang="es">
      <body className="bg-bg-primary text-text-primary antialiased">
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-start justify-center gap-4 px-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-brand">
              Error inesperado
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              No pudimos cargar esta pantalla
            </h1>
            <p className="text-sm text-text-secondary">
              Vuelve a intentarlo. Si el problema continúa, revisa la
              configuración reciente o prueba de nuevo en unos minutos.
            </p>
          </div>
          <Button onClick={() => reset()}>Reintentar</Button>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
