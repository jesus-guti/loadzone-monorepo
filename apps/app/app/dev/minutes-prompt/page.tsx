import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { MinutesPromptDevPreview } from "@/features/minutes/components/minutes-prompt-dev-preview";

export default function MinutesPromptDevPage(): ReactElement {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <MinutesPromptDevPreview />;
}
