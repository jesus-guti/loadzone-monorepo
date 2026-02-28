import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      VAPID_PUBLIC_KEY: z.string().optional(),
      VAPID_PRIVATE_KEY: z.string().optional(),
      VAPID_SUBJECT: z.string().email().optional(),
    },
    runtimeEnv: {
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    },
  });
