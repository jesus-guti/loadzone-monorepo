import { type NextRequest, NextResponse } from "next/server";

const CUID_PATTERN = /^c[a-z0-9]{24,}$/;
const TOKEN_COOKIE = "lz_player_token";

const INTERNAL_PATHS = new Set(["/manifest.json", "/sw.js"]);

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (INTERNAL_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // API routes are not player-token pages (cookie auth happens in the route).
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const savedToken = request.cookies.get(TOKEN_COOKIE)?.value;

    if (savedToken && CUID_PATTERN.test(savedToken)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${savedToken}`;
      return NextResponse.redirect(url);
    }
  }

  const token = pathname.split("/")[1];

  if (token && !CUID_PATTERN.test(token)) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // Persist token for same-origin subresources (e.g. cromo `<img>`) before hydration.
  if (token && CUID_PATTERN.test(token)) {
    const response = NextResponse.next();
    response.cookies.set(TOKEN_COOKIE, token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
