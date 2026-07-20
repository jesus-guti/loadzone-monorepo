"use client";

import { useEffect } from "react";
import { savePlayerToken } from "@/app/lib/token-storage";

type TokenPersistenceProperties = {
  readonly token: string;
};

export function TokenPersistence({ token }: TokenPersistenceProperties) {
  useEffect(() => {
    savePlayerToken(token);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({ type: "SET_TOKEN", token });
      });
    }
  }, [token]);

  return null;
}
