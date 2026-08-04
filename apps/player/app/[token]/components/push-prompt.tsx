"use client";

import { Button } from "@repo/design-system/components/button";
import { BellIcon, BellSlashIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import type { PushConsentUiMode } from "@repo/database/reminder-consent";
import { env } from "@/env";

type PushPromptProperties = {
  readonly token: string;
  readonly apiUrl: string;
  readonly uiMode: PushConsentUiMode;
  readonly canSubscribe: boolean;
  readonly canOptOut: boolean;
};

type ClientSurface =
  | "loading"
  | "unsupported"
  | "denied"
  | "ready"
  | "missing_vapid";

function CalmNote({
  title,
  body,
}: {
  readonly title: string;
  readonly body: string;
}) {
  return (
    <div className="rounded-3xl bg-bg-secondary p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-primary">
          <BellSlashIcon className="h-5 w-5 text-text-secondary" weight="regular" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{title}</p>
          <p className="mt-1 text-xs text-text-secondary">{body}</p>
        </div>
      </div>
    </div>
  );
}

export function PushPrompt({
  token,
  apiUrl,
  uiMode,
  canSubscribe,
  canOptOut,
}: PushPromptProperties) {
  const [surface, setSurface] = useState<ClientSurface>("loading");
  const [subscribedLocally, setSubscribedLocally] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSurface("unsupported");
        return;
      }

      if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        setSurface("missing_vapid");
        return;
      }

      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        setSurface("denied");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          setSubscribedLocally(true);
        }
      } catch {
        // Keep calm; treat as unsupported browser surface.
        setSurface("unsupported");
        return;
      }

      setSurface("ready");
    };

    void checkSupport();
  }, []);

  if (surface === "loading") {
    return null;
  }

  if (surface === "unsupported" || surface === "missing_vapid") {
    return (
      <CalmNote
        title="Notificaciones no disponibles"
        body="En este dispositivo no se pueden activar recordatorios por ahora. Puedes seguir registrando tu bienestar aquí."
      />
    );
  }

  if (surface === "denied") {
    return (
      <CalmNote
        title="Permiso de notificaciones desactivado"
        body="Si quieres recordatorios más adelante, actívalos en los ajustes del navegador. No pasa nada por dejarlo así."
      />
    );
  }

  if (uiMode === "needs_guardian_consent" || uiMode === "blocked") {
    return (
      <CalmNote
        title="Recordatorios gestionados por el club"
        body={
          uiMode === "needs_guardian_consent"
            ? "Cuando el tutor haya dado su consentimiento, un adulto podrá activar los recordatorios en este dispositivo."
            : "Los recordatorios push no están disponibles para este jugador en este momento."
        }
      />
    );
  }

  const showSubscribed = uiMode === "subscribed" || subscribedLocally;
  const showOptOut = showSubscribed && (canOptOut || subscribedLocally);
  const showOptIn =
    !showSubscribed &&
    canSubscribe &&
    (uiMode === "offer_opt_in" || uiMode === "offer_assisted_adult");

  if (!(showOptIn || showOptOut)) {
    return null;
  }

  async function handleSubscribe() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        if (permission === "denied") {
          setSurface("denied");
        }
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setSurface("missing_vapid");
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const subJson = subscription.toJSON();

      const response = await fetch(`${apiUrl}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
        }),
      });

      if (!response.ok) {
        await subscription.unsubscribe().catch(() => undefined);
        setLoading(false);
        return;
      }

      setSubscribedLocally(true);
    } catch {
      // Silently fail — calm degradation, no token in UI.
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (!existing) {
        setSubscribedLocally(false);
        setLoading(false);
        return;
      }

      const endpoint = existing.endpoint;
      await existing.unsubscribe().catch(() => undefined);

      await fetch(`${apiUrl}/api/push/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, endpoint }),
      });

      setSubscribedLocally(false);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  const isAssisted = uiMode === "offer_assisted_adult";

  return (
    <div className="rounded-3xl bg-bg-secondary p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-primary">
          <BellIcon className="h-5 w-5 text-text-brand" weight="regular" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">
            {showOptOut
              ? "Recordatorios activos"
              : isAssisted
                ? "Activar recordatorios (adulto)"
                : "Activar notificaciones"}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {showOptOut
              ? "Puedes desactivar los recordatorios push cuando quieras."
              : isAssisted
                ? "Con el consentimiento del tutor, activa los recordatorios en este dispositivo (adulto presente)."
                : "Recibe recordatorios para rellenar tu registro diario."}
          </p>
        </div>
        {showOptOut ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-border-secondary bg-bg-primary hover:bg-bg-tertiary"
            onClick={handleUnsubscribe}
            disabled={loading}
          >
            {loading ? "..." : "Desactivar"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-border-secondary bg-bg-primary hover:bg-bg-tertiary"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "..." : "Activar"}
          </Button>
        )}
      </div>
    </div>
  );
}
