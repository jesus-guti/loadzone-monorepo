import { cn } from "@repo/design-system/lib/utils";

export type ScaleSize = "sm" | "md";

export type ScalePolarity = "higherIsBetter" | "higherIsWorse";

type SizeProps = {
  readonly size?: ScaleSize;
  readonly className?: string;
};

function sizeClass(size: ScaleSize, sm: string, md: string): string {
  return size === "sm" ? sm : md;
}

function sliderThumbTone(value: number, max: number, polarity: ScalePolarity): string {
  const ratio = max === 0 ? 0 : value / max;
  if (polarity === "higherIsWorse") {
    if (ratio <= 0.4) {
      return "bg-success";
    }
    if (ratio <= 0.7) {
      return "bg-premium";
    }
    return "bg-danger";
  }

  if (ratio >= 0.6) {
    return "bg-success";
  }
  if (ratio >= 0.4) {
    return "bg-premium";
  }
  return "bg-danger";
}

function sliderThumbSize(
  value: number,
  max: number,
  polarity: ScalePolarity,
  size: ScaleSize
): string {
  const ratio = max === 0 ? 0 : value / max;
  const isMild =
    polarity === "higherIsWorse" ? ratio <= 0.4 : ratio >= 0.6;
  const isHot =
    polarity === "higherIsWorse" ? ratio > 0.7 : ratio < 0.4;

  if (isMild) {
    return sizeClass(size, "size-2.5", "size-3");
  }
  if (isHot) {
    return sizeClass(size, "size-3.5", "size-5");
  }
  return sizeClass(size, "size-3", "size-4");
}

/** Continuous spectrum (RPE / recovery 0–10). */
export function ScaleSlider({
  value,
  max = 10,
  label,
  polarity = "higherIsWorse",
  size = "md",
  className,
}: SizeProps & {
  readonly value: number;
  readonly max?: number;
  readonly label?: string;
  readonly polarity?: ScalePolarity;
}) {
  const clamped = Math.min(max, Math.max(0, value));
  const ratio = max === 0 ? 0 : clamped / max;
  const thumb = sliderThumbTone(clamped, max, polarity);
  const thumbSize = sliderThumbSize(clamped, max, polarity, size);
  const trackGradient =
    polarity === "higherIsWorse"
      ? "bg-gradient-to-r from-success via-premium to-danger"
      : "bg-gradient-to-r from-danger via-premium to-success";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-sm bg-text-primary text-bg-primary",
          sizeClass(size, "px-1.5 py-0.5 text-[9px]", "px-2 py-1 text-[11px]")
        )}
      >
        <span className="font-bold tabular-nums">{clamped}</span>
        {label ? <span className="opacity-85">{label}</span> : null}
      </span>
      <div
        className={cn(
          "relative",
          sizeClass(size, "h-5 w-[120px]", "h-7 w-[200px]")
        )}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full",
            trackGradient,
            sizeClass(size, "h-1", "h-1.5")
          )}
        />
        <div
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg-primary shadow-sm",
            thumb,
            thumbSize
          )}
          style={{ left: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Segmented 1–5 (display / matrix contexts). */
export function ScaleSegmented({
  value,
  size = "md",
  className,
}: SizeProps & { readonly value: number }) {
  const short = ["MB", "B", "M", "A", "MX"] as const;
  return (
    <div
      className={cn(
        "inline-flex rounded-sm border border-border-tertiary bg-bg-secondary p-0.5",
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n === value;
        return (
          <div
            key={n}
            className={cn(
              "flex flex-col items-center justify-center rounded-[3px]",
              sizeClass(size, "min-w-7 px-2 py-1", "min-w-10 px-3 py-2"),
              on && "bg-brand text-brand-foreground shadow-sm"
            )}
          >
            <span
              className={cn(
                "font-bold tabular-nums",
                sizeClass(size, "text-[11px]", "text-sm"),
                !on && "text-text-primary"
              )}
            >
              {n}
            </span>
            {size === "md" ? (
              <span
                className={cn(
                  "text-[9px] font-medium",
                  on ? "text-brand-foreground/90" : "text-text-tertiary"
                )}
              >
                {short[n - 1]}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Cumulative intensity bars (soreness). */
export function ScaleIntensity({
  level,
  size = "md",
  className,
}: SizeProps & { readonly level: number }) {
  const heights =
    size === "sm"
      ? ["h-2", "h-2.5", "h-3.5", "h-4.5", "h-5.5"]
      : ["h-2.5", "h-3.5", "h-4.5", "h-6", "h-7.5"];
  const widths =
    size === "sm"
      ? ["w-2.5", "w-3", "w-3", "w-3.5", "w-4"]
      : ["w-3.5", "w-4", "w-4.5", "w-5", "w-5.5"];
  const tone =
    level <= 1 ? "bg-success" : level <= 3 ? "bg-premium" : "bg-danger";

  return (
    <div className={cn("inline-flex items-end gap-1", className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= level;
        const peak = n === level;
        return (
          <div
            key={n}
            className={cn(
              "rounded-[2px]",
              heights[n - 1],
              widths[n - 1],
              on ? tone : "bg-border-tertiary",
              on && !peak && "opacity-50"
            )}
          />
        );
      })}
    </div>
  );
}

/** Battery (energy). */
export function ScaleBattery({
  level,
  size = "md",
  className,
}: SizeProps & { readonly level: number }) {
  const tone =
    level <= 2 ? "bg-danger" : level === 3 ? "bg-premium" : "bg-success";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-px",
        sizeClass(size, "h-2.5", "h-3.5"),
        className
      )}
    >
      <div
        className={cn(
          "relative rounded-[2px] border border-text-secondary",
          sizeClass(size, "h-2.5 w-5", "h-3.5 w-7")
        )}
      >
        <div
          className={cn("absolute inset-y-0.5 left-0.5 rounded-[1px]", tone)}
          style={{ width: `${Math.max(12, (level / 5) * 72)}%` }}
        />
      </div>
      <div
        className={cn(
          "rounded-[1px] bg-text-secondary",
          sizeClass(size, "h-1 w-0.5", "h-1.5 w-[3px]")
        )}
      />
    </div>
  );
}

/** Thermometer (load / risk). */
export function ScaleThermometer({
  level,
  size = "md",
  className,
}: SizeProps & { readonly level: number }) {
  const tone =
    level <= 2 ? "bg-success" : level === 3 ? "bg-premium" : "bg-danger";
  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center",
        sizeClass(size, "h-[22px] w-2.5", "h-7 w-3"),
        className
      )}
    >
      <div
        className={cn(
          "absolute top-0 rounded-full bg-border-tertiary",
          sizeClass(size, "h-4 w-1", "h-5 w-1.5")
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 rounded-full",
          tone,
          sizeClass(size, "size-2.5", "size-3")
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-sm",
          tone,
          sizeClass(size, "w-0.5", "w-1")
        )}
        style={{
          bottom: size === "sm" ? 6 : 8,
          height: `${Math.max(20, (level / 5) * 55)}%`,
        }}
      />
    </div>
  );
}

/** Stars (sleep quality). */
export function ScaleStars({
  level,
  size = "md",
  className,
}: SizeProps & { readonly level: number }) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          aria-hidden
          className={cn(
            sizeClass(size, "size-3", "size-3.5"),
            n <= level ? "fill-brand" : "fill-border-tertiary"
          )}
          viewBox="0 0 14 14"
        >
          <path d="M7 1.2l1.6 3.3 3.6.5-2.6 2.6.6 3.6L7 9.5 3.8 11.2l.6-3.6L1.8 5l3.6-.5L7 1.2z" />
        </svg>
      ))}
    </div>
  );
}

/** Matrix radio (selection prototype). */
export function ScaleMatrixRadio({
  state,
  size = "md",
  className,
}: SizeProps & { readonly state: "off" | "hover" | "on" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        sizeClass(size, "size-5", "size-7"),
        className
      )}
    >
      <span
        className={cn(
          "rounded-full border transition-transform",
          state === "on" &&
            "border-brand bg-brand shadow-[inset_0_0_0_3px_var(--bg-primary)]",
          state === "hover" && "border-brand bg-brand/10",
          state === "off" && "border-border-primary bg-transparent",
          sizeClass(
            size,
            state === "on" ? "size-3.5" : "size-3",
            state === "on" ? "size-4.5" : "size-3.5"
          )
        )}
      />
    </span>
  );
}
