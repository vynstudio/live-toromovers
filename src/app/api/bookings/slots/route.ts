import { NextResponse } from "next/server";
import { buildAvailability } from "@/lib/bookings/slots";

/** GET /api/bookings/slots — next ~45 days of open move days. */
export async function GET() {
  const days = await buildAvailability(45);
  return NextResponse.json({
    ok: true,
    timezone: "America/New_York",
    days: days.filter((d) => d.open),
    all: days,
  });
}
