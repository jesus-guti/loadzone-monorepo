"use client";

import { Spinner } from "@repo/design-system/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPlayerToken } from "./lib/token-storage";

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getPlayerToken();

    if (token) {
      router.replace(`/${token}`);
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold">Enlace no válido</h1>
      <p className="mt-2 text-muted-foreground">
        Abre LoadZone desde el enlace personal que te ha compartido tu cuerpo
        técnico. Si ya lo usaste, puedes añadirlo a la pantalla de inicio para
        abrirlo como una app.
      </p>
    </div>
  );
}
