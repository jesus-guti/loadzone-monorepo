import type { ReactNode } from "react";
import { cn } from "@repo/design-system/lib/utils";

type FormSectionProps = {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {description ? (
          <p className="text-xs text-text-secondary">{description}</p>
        ) : null}
      </header>
      <div className=" border border-border-secondary bg-bg-primary p-4 md:p-5">
        <div className="space-y-5">{children}</div>
      </div>
    </section>
  );
}

type FieldLabelProps = {
  readonly children: ReactNode;
  readonly htmlFor?: string;
  readonly className?: string;
};

export function FieldLabel({
  children,
  htmlFor,
  className,
}: FieldLabelProps) {
  return (
    <label
      className={cn(
        "block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary",
        className
      )}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}
