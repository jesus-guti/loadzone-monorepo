"use client";

import dynamic from "next/dynamic";

/**
 * Client-only InstallPrompt so Phosphor CSR icons never enter the RSC/HMR
 * graph via the token layout. `ssr: false` requires a Client Component host.
 */
export const InstallPromptLazy = dynamic(
  () =>
    import("./install-prompt").then((module) => module.InstallPrompt),
  { ssr: false }
);
