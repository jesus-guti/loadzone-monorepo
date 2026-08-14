"use client";

import dynamic from "next/dynamic";

export const PromotePainAlertForm = dynamic(
  () =>
    import("./promote-pain-alert-form").then(
      (mod) => mod.PromotePainAlertForm
    ),
  { ssr: false }
);
