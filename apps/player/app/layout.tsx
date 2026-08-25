import "./styles.css";
import { Toaster } from "@repo/design-system/components/sonner";
import { fonts } from "@repo/design-system/lib/fonts";
import { cn } from "@repo/design-system/lib/utils";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "./components/sw-register";
import { cromoFraunces, cromoInstrument } from "../lib/cromo-fonts";

export const metadata: Metadata = {
  title: "LoadZone",
  description: "Registro diario de bienestar y rendimiento",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
  <html
    className={cn(fonts, cromoInstrument.variable, cromoFraunces.variable)}
    lang="es"
    suppressHydrationWarning
  >
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
