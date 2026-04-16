"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";

type AskLoadzoneButtonProperties = {
  readonly variant?: "pill" | "fab";
};

const premiumGradient =
  "linear-gradient(135deg, var(--premium), color-mix(in oklab, var(--premium) 65%, white), color-mix(in oklab, var(--premium) 35%, var(--brand)))";

export function AskLoadzoneButton({
  variant = "pill",
}: AskLoadzoneButtonProperties) {
  if (variant === "fab") {
    return (
      <Link
        aria-label="Ask Loadzone"
        className="group relative inline-flex size-14 items-center justify-center rounded-full p-px shadow-floating transition-transform hover:-translate-y-0.5"
        href="/analysis"
        style={{ backgroundImage: premiumGradient }}
      >
        <span className="flex size-full items-center justify-center rounded-full bg-bg-primary text-text-primary transition-colors group-hover:bg-bg-secondary">
          <SparklesIcon className="size-6 text-premium" />
          <span className="sr-only">Ask Loadzone</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      className="group relative inline-flex h-9 items-center rounded-md p-px"
      href="/analysis"
      style={{ backgroundImage: premiumGradient }}
    >
      <span className="flex h-full items-center gap-2 rounded-[5px] bg-bg-primary px-3 text-sm font-medium text-text-primary transition-colors group-hover:bg-bg-secondary">
        <SparklesIcon className="size-4 text-premium" />
        <span className={cn("hidden sm:inline")}>Ask Loadzone</span>
      </span>
    </Link>
  );
}
