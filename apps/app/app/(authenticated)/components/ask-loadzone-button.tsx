"use client";

import { MovingBorder } from "@repo/design-system/components/ui/moving-border";
import { SparklesIcon } from "@heroicons/react/20/solid";
import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type AskLoadzoneButtonProperties = {
  readonly variant?: "pill" | "fab";
};

type AskLoadzoneFrameProperties = {
  readonly children: ReactNode;
  readonly containerClassName: string;
  readonly borderRadius: string;
  readonly contentClassName: string;
};

const goldShineStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, color-mix(in oklab, var(--premium) 34%, white) 0%, color-mix(in oklab, var(--premium) 16%, var(--bg-primary)) 42%, var(--bg-primary) 100%)",
  boxShadow:
    "inset 0 1px 0 color-mix(in oklab, var(--premium) 50%, white), inset 0 -1px 0 color-mix(in oklab, var(--premium) 18%, transparent)",
};

function AskLoadzoneFrame({
  children,
  containerClassName,
  borderRadius,
  contentClassName,
}: AskLoadzoneFrameProperties) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden p-px shadow-floating transition-transform duration-300 hover:-translate-y-0.5",
        containerClassName
      )}
      style={{ borderRadius }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.98)` }}
      >
        <MovingBorder duration={2800} rx="30%" ry="30%">
          <div className="h-20 w-20 bg-[radial-gradient(circle,rgba(255,236,182,0.95)_8%,rgba(255,196,58,0.9)_34%,rgba(255,196,58,0.08)_62%,transparent_72%)] opacity-95" />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative h-full w-full border border-premium/35 bg-bg-primary",
          contentClassName
        )}
        style={{
          ...goldShineStyle,
          borderRadius: `calc(${borderRadius} * 0.98)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function AskLoadzoneButton({
  variant = "pill",
}: AskLoadzoneButtonProperties) {
  if (variant === "fab") {
    return (
      <AskLoadzoneFrame
        borderRadius="9999px"
        containerClassName="rounded-full"
        contentClassName="rounded-full"
      >
        <Link
          aria-label="Ask Loadzone"
          className="relative flex size-14 items-center justify-center rounded-full text-text-primary"
          href="/analysis"
        >
          <span className="pointer-events-none absolute inset-x-3 top-1 h-px rounded-full bg-white/70 blur-[0.5px]" />
          <SparklesIcon className="relative z-10 size-6 text-premium drop-shadow-[0_0_12px_color-mix(in_oklab,var(--premium)_65%,white)]" />
          <span className="sr-only">Ask Loadzone</span>
        </Link>
      </AskLoadzoneFrame>
    );
  }

  return (
    <AskLoadzoneFrame
      borderRadius="9999px"
      containerClassName="rounded-full"
      contentClassName="rounded-full"
    >
      <Link
        className="relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-text-primary"
        href="/analysis"
      >
        <span className="pointer-events-none absolute inset-x-4 top-1 h-px rounded-full bg-white/70 blur-[0.5px]" />
        <SparklesIcon className="relative z-10 size-4 text-premium drop-shadow-[0_0_12px_color-mix(in_oklab,var(--premium)_65%,white)]" />
        <span className={cn("relative z-10 hidden sm:inline")}>Ask Loadzone</span>
      </Link>
    </AskLoadzoneFrame>
  );
}
