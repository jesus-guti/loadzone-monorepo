import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      BLOB_READ_WRITE_TOKEN: z.string().optional(),
      PWA_BLOB_READ_WRITE_TOKEN: z.string().optional(),
      PWA_BLOB_PUBLIC_BASE_URL: z.string().url().optional(),
      PWA_ICON_PATH_SECRET: z.string().min(1).optional(),
    },
    runtimeEnv: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      PWA_BLOB_READ_WRITE_TOKEN: process.env.PWA_BLOB_READ_WRITE_TOKEN,
      PWA_BLOB_PUBLIC_BASE_URL: process.env.PWA_BLOB_PUBLIC_BASE_URL,
      PWA_ICON_PATH_SECRET: process.env.PWA_ICON_PATH_SECRET,
    },
  });
