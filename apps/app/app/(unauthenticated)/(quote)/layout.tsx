import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import type { ReactNode } from "react";

function Wordmark() {
  return (
    <p className="font-medium text-[11px] text-text-secondary uppercase tracking-[0.16em]">
      LoadZone
    </p>
  );
}

type QuoteAuthLayoutProps = {
  readonly children: ReactNode;
};

const QuoteAuthLayout = ({ children }: QuoteAuthLayoutProps) => (
  <div className="container relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div className="relative hidden h-full flex-col border-r border-border-secondary bg-bg-secondary p-10 lg:flex">
      <div className="relative z-20 flex items-center text-lg">
        <Wordmark />
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="relative z-20 mt-auto text-text-primary">
        <blockquote className="space-y-2">
          <p className="text-lg">
            &ldquo;Centraliza wellness, sesiones y seguimiento del equipo en una
            sola vista de trabajo.&rdquo;
          </p>
          <footer className="text-sm text-text-secondary">
            Staff workspace para cuerpos técnicos
          </footer>
        </blockquote>
      </div>
    </div>
    <div className="lg:p-8">
      <div className="mx-auto flex w-full max-w-[460px] flex-col justify-center space-y-6">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default QuoteAuthLayout;
