import type { ReactNode } from "react";

export default function MinutesPromptDevLayout({
  children,
}: {
  readonly children: ReactNode;
}): ReactNode {
  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">{children}</div>
  );
}
