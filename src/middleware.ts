import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * job-size.toromovers.net → serve /job-size (keep subdomain in the bar).
 * API routes pass through so the form can POST to /api/job-size on the same host.
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (host !== "job-size.toromovers.net") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Let API, Next internals, and static assets through unchanged
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/icon.svg" ||
    pathname === "/apple-icon.png"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/job-size" || pathname.startsWith("/job-size/")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/job-size";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|webmanifest)$).*)"],
};
