import { type NextRequest, NextResponse } from "next/server";

const CUID_PATTERN = /^c[a-z0-9]{24,}$/;

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const token = pathname.split("/")[1];

  if (token && !CUID_PATTERN.test(token)) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
