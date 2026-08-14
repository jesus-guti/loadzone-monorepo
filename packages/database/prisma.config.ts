import { defineConfig } from "prisma/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { keys } from "./keys";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const existingDatabaseUrl = process.env.DATABASE_URL;
const existingDirectUrl = process.env.DIRECT_DATABASE_URL;

config({ path: join(__dirname, ".env") });
config({ path: join(__dirname, ".env.local"), override: true });

if (existingDatabaseUrl) {
  process.env.DATABASE_URL = existingDatabaseUrl;
}
if (existingDirectUrl) {
  process.env.DIRECT_DATABASE_URL = existingDirectUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: keys().DATABASE_URL,
    directUrl: process.env.DIRECT_DATABASE_URL,
  },
});
