import { ShieldCheckIcon } from "@phosphor-icons/react/ssr";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="container relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div className="relative hidden h-full flex-col border-r border-border-secondary bg-bg-secondary p-10 lg:flex">
      <div className="absolute inset-0 bg-bg-secondary" />
      <div className="relative z-20 flex items-center font-medium text-lg text-text-primary">
        <ShieldCheckIcon className="mr-2 h-6 w-6" />
        LoadZone
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
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
