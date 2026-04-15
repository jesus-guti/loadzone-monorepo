import type { NextMiddleware } from "next/server";

export function authMiddleware(handler: NextMiddleware): NextMiddleware {
  return handler;
}
