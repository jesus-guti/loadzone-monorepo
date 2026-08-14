import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      PWA_BLOB_PUBLIC_BASE_URL: z.string().url().optional(),
      PWA_ICON_PATH_SECRET: z.string().min(1).optional(),
    },
    client: {
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
    },
    runtimeEnv: {
      PWA_BLOB_PUBLIC_BASE_URL: process.env.PWA_BLOB_PUBLIC_BASE_URL,
      PWA_ICON_PATH_SECRET: process.env.PWA_ICON_PATH_SECRET,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    },
  });
