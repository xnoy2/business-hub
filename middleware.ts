import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "nxps_hub_session";

const PUBLIC = ["/login", "/api/auth/login", "/api/auth/logout"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    // If already logged in and hitting /login, redirect home
    if (pathname.startsWith("/login") && request.cookies.has(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protect everything else
  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
