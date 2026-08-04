import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@repo": path.resolve(__dirname, "../../packages"),
    },
  },
});
