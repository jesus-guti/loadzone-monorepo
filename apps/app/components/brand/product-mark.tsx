import { cn } from "@repo/design-system/lib/utils";

type ProductMarkProps = {
  readonly className?: string;
  readonly compact?: boolean;
  readonly wordmark?: boolean;
};

export function ProductMark({
  className,
  compact = false,
  wordmark = true,
}: ProductMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-text-primary",
        compact ? "gap-1.5 text-xs" : "gap-2",
        className
      )}
    >
      <svg
        aria-hidden
        className={cn("shrink-0 text-brand", compact ? "size-4" : "size-6")}
        fill="none"
        viewBox="0 0 24 24"
      >
        <rect
          height="18"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.75"
          width="18"
          x="3"
          y="3"
        />
        <path
          d="M7 15.5c1.6-3.2 3.1-4.8 5-4.8s3.4 1.6 5 4.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.75"
        />
        <path
          d="M9 12.2c1-.9 1.9-1.4 3-1.4s2 .5 3 1.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.75"
        />
      </svg>
      {wordmark ? (
        <span className="font-semibold tracking-tight">LoadZone</span>
      ) : null}
    </span>
  );
}
