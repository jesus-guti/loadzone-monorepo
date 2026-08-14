"use client";

import { useSyncExternalStore } from "react";
import {
  getPrototypeStore,
  subscribePrototypeStore,
} from "./stub-store";

function snapshot(): string {
  return JSON.stringify(getPrototypeStore(), null, 2);
}

export function PrototypeStorePanel() {
  const data = useSyncExternalStore(
    subscribePrototypeStore,
    snapshot,
    snapshot
  );

  return (
    <aside className="rounded-md border border-border-secondary bg-bg-secondary p-3">
      <h2 className="mb-2 text-sm font-medium text-text-primary">
        Store en memoria
      </h2>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-mono text-xs text-text-secondary">
        {data}
      </pre>
    </aside>
  );
}
