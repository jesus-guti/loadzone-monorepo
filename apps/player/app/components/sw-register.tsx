"use client";

import { useEffect } from "react";

import { shouldRegisterPlayerServiceWorker } from "../../lib/player-sw-policy";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (!shouldRegisterPlayerServiceWorker(process.env.NODE_ENV)) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister())
          )
        )
        .catch(() => {
          // Unregister is best-effort during local dev.
        });
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Cache clear is best-effort during local dev.
        });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed silently
    });
  }, []);

  return null;
}
