import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      AUTH_SECRET: z.string().min(1).optional(),
      AUTH_TRUST_HOST: z
        .enum(["true", "false"])
        .optional(),
    },
    client: {},
    runtimeEnv: {
      AUTH_SECRET:
        process.env.AUTH_SECRET && process.env.AUTH_SECRET.length > 0
          ? process.env.AUTH_SECRET
          : undefined,
      AUTH_TRUST_HOST:
        process.env.AUTH_TRUST_HOST === "true" ? "true" : undefined,
    },
  });
