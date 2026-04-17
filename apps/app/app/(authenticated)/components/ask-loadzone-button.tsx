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

const goldMetalStyle: CSSProperties = {
  backgroundColor: "#c79347",
  backgroundImage:
    "linear-gradient(180deg, #e9c684 0%, #c79347 55%, #97681f 100%)",
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
        "group relative overflow-hidden p-px transition-transform duration-300 hover:-translate-y-0.5",
        containerClassName
      )}
      style={{
        borderRadius,
        backgroundColor: "#a07327",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.98)` }}
      >
        <MovingBorder duration={2800} rx="30%" ry="30%">
          <div className="h-24 w-24 bg-[radial-gradient(circle,rgba(255,248,220,1)_4%,rgba(255,210,110,0.95)_30%,rgba(255,180,60,0.55)_55%,transparent_75%)] opacity-100" />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative h-full w-full overflow-hidden",
          contentClassName
        )}
        style={{
          ...goldMetalStyle,
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
          className="relative flex size-14 items-center justify-center rounded-full"
          href="/analysis"
        >
          <SparklesIcon className="relative z-10 size-6 text-[#2a1a05]" />
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
        className="relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-[#2a1a05]"
        href="/analysis"
      >
        <SparklesIcon className="relative z-10 size-4 text-[#2a1a05]" />
        <span className={cn("relative z-10 hidden sm:inline")}>Ask Loadzone</span>
      </Link>
    </AskLoadzoneFrame>
  );
}
