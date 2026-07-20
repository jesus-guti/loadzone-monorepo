"use client";

import {
  DeviceMobileIcon,
  PlusIcon,
  ShareIcon,
  XIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const IOS_USER_AGENT_PATTERN = /iPad|iPhone|iPod/;

function isIos(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return (
    IOS_USER_AGENT_PATTERN.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && window.navigator.standalone === true)
  );
}

export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      return;
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (isIos()) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (installEvent) {
      await installEvent.prompt();
      await installEvent.userChoice;
      setCanInstall(false);
      setOpen(false);
    } else if (isIos()) {
      setOpen(false);
      setIosInstructionsOpen(true);
    }
  }, [installEvent]);

  if (!canInstall) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-border-primary bg-bg-primary p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15">
            <DeviceMobileIcon className="size-5 text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary">
              Añade LoadZone a tu pantalla de inicio
            </p>
            <p className="text-xs text-text-secondary">
              Accede más rápido y usa la app como si estuviera instalada.
            </p>
          </div>
          <button
            aria-label="Cerrar"
            className="shrink-0 text-text-tertiary transition hover:text-text-primary"
            onClick={() => setCanInstall(false)}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <Button
          className="mt-3 h-11 w-full rounded-full text-sm font-semibold"
          onClick={() => setOpen(true)}
        >
          Cómo instalar
        </Button>
      </div>

      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="rounded-t-3xl" side="bottom">
          <SheetHeader className="space-y-1 pb-2">
            <SheetTitle className="text-lg">
              Añadir a la pantalla de inicio
            </SheetTitle>
            <SheetDescription>
              Instala LoadZone para acceder directamente desde tu móvil.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 py-4">
            {installEvent ? (
              <Button
                className="h-12 w-full rounded-full text-sm font-semibold"
                onClick={handleInstall}
              >
                Instalar aplicación
              </Button>
            ) : (
              <>
                {isIos() ? (
                  <div className="space-y-4 rounded-2xl bg-bg-secondary p-4 text-sm text-text-secondary">
                    <p className="font-medium text-text-primary">
                      En iPhone o iPad:
                    </p>
                    <ol className="list-decimal space-y-2 pl-5">
                      <li className="pl-1">
                        Pulsa el botón{" "}
                        <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                          Compartir <ShareIcon className="size-4" />
                        </span>{" "}
                        en la barra de Safari.
                      </li>
                      <li className="pl-1">
                        Desplázate y selecciona{" "}
                        <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                          Añadir a pantalla de inicio{" "}
                          <PlusIcon className="size-4" />
                        </span>
                        .
                      </li>
                      <li className="pl-1">Confirma tocando Añadir.</li>
                    </ol>
                    <p>
                      El icono se guardará con tu enlace personal, así no
                      tendrás que buscarlo cada vez.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl bg-bg-secondary p-4 text-sm text-text-secondary">
                    <p className="font-medium text-text-primary">En Android:</p>
                    <ol className="list-decimal space-y-2 pl-5">
                      <li className="pl-1">
                        Abre el menú de Chrome (los tres puntos).
                      </li>
                      <li className="pl-1">
                        Selecciona{" "}
                        <span className="font-medium text-text-primary">
                          Añadir a pantalla de inicio
                        </span>
                        .
                      </li>
                      <li className="pl-1">
                        Confirma el nombre y toca Añadir.
                      </li>
                    </ol>
                    <p>
                      El icono se guardará con tu enlace personal, así no
                      tendrás que buscarlo cada vez.
                    </p>
                  </div>
                )}
                <Button
                  className="h-12 w-full rounded-full text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Entendido
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet onOpenChange={setIosInstructionsOpen} open={iosInstructionsOpen}>
        <SheetContent className="rounded-t-3xl" side="bottom">
          <SheetHeader className="space-y-1 pb-2">
            <SheetTitle className="text-lg">Añadir en iPhone o iPad</SheetTitle>
            <SheetDescription>
              Sigue estos pasos en Safari para instalar LoadZone.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-2xl bg-bg-secondary p-4 text-sm text-text-secondary">
              <ol className="list-decimal space-y-2 pl-5">
                <li className="pl-1">
                  Pulsa{" "}
                  <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                    Compartir <ShareIcon className="size-4" />
                  </span>{" "}
                  en la barra inferior.
                </li>
                <li className="pl-1">
                  Desplázate y elige{" "}
                  <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                    Añadir a pantalla de inicio <PlusIcon className="size-4" />
                  </span>
                  .
                </li>
                <li className="pl-1">Toca Añadir.</li>
              </ol>
            </div>
            <Button
              className="h-12 w-full rounded-full text-sm font-semibold"
              onClick={() => setIosInstructionsOpen(false)}
            >
              Entendido
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
