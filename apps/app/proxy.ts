import { authMiddleware } from "@repo/auth/proxy";
import type { NextProxy } from "next/server";
import { NextResponse } from "next/server";

export default authMiddleware((request) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-loadzone-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}) as unknown as NextProxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
