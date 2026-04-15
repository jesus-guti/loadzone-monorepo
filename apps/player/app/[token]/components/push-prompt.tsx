"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { BellIcon } from "lucide-react";
import { useState, useEffect } from "react";

type PushPromptProperties = {
  readonly token: string;
  readonly apiUrl: string;
};

export function PushPrompt({ token, apiUrl }: PushPromptProperties) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return;
      }

      setSupported(true);

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setSubscribed(true);
      }
    };

    checkSupport();
  }, []);

  if (!supported || subscribed) return null;

  async function handleSubscribe() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const subJson = subscription.toJSON();

      await fetch(`${apiUrl}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
        }),
      });

      setSubscribed(true);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-bg-secondary p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-primary">
          <BellIcon className="h-5 w-5 text-text-brand" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">
            Activar notificaciones
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Recibe recordatorios para rellenar tu registro diario.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-border-secondary bg-bg-primary hover:bg-bg-tertiary"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? "..." : "Activar"}
        </Button>
      </div>
    </div>
  );
}
