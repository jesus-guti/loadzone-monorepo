import { env } from "@/env";
import "./styles.css";
import { AuthProvider } from "@repo/auth/provider";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  icons: {
    icon: "/brand/mark.svg",
  },
};

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="es" suppressHydrationWarning>
    <body className="bg-bg-primary text-text-primary antialiased">
      <DesignSystemProvider>
        <AuthProvider
          helpUrl={env.NEXT_PUBLIC_DOCS_URL}
          privacyUrl={new URL(
            "/es/legal/privacy",
            env.NEXT_PUBLIC_WEB_URL
          ).toString()}
          termsUrl={new URL(
            "/es/legal/legal-notice",
            env.NEXT_PUBLIC_WEB_URL
          ).toString()}
        >
          {children}
        </AuthProvider>
      </DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
