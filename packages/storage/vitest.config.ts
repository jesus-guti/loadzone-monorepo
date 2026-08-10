import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(
        dirname,
        "../database/test/shims/server-only-empty.ts"
      ),
    },
  },
  test: {
    environment: "node",
  },
});
