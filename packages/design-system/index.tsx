import type { ThemeProviderProps } from "next-themes";
import { Toaster } from "./components/sonner";
import { TooltipProvider } from "./components/tooltip";
import { ThemeProvider } from "./providers/theme";

export const DesignSystemProvider = ({
  children,
  ...properties
}: ThemeProviderProps) => (
  <ThemeProvider {...properties}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
);
