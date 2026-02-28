import "./styles.css";
import { fonts } from "@repo/design-system/lib/fonts";
import { Toaster } from "@repo/design-system/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "./components/sw-register";

export const metadata: Metadata = {
  title: "LoadZone",
  description: "Registro diario de bienestar y rendimiento",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LoadZone",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="es" suppressHydrationWarning>
    <body className="bg-background text-foreground">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        <main className="mx-auto min-h-dvh max-w-md">{children}</main>
        <Toaster />
        <ServiceWorkerRegister />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
