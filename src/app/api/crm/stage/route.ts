import { NextResponse } from "next/server";

/** HubSpot stage advances removed. */
export async function GET() {
  return new NextResponse(
    `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><body style="font:16px system-ui;padding:24px">HubSpot stage automation removed.</body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "hubspot_removed" },
    { status: 410 },
  );
}
