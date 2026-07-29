import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * job-size.toromovers.com / job-size.toromovers.net → /move-day-checklist
 * API routes pass through so the form can POST to /api/job-size on the same host.
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  const isJobSizeHost =
    host === "job-size.toromovers.com" || host === "job-size.toromovers.net";
  if (!isJobSizeHost) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

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

  if (
    pathname === "/move-day-checklist" ||
    pathname.startsWith("/move-day-checklist/")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/move-day-checklist";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|webmanifest)$).*)",
  ],
};
