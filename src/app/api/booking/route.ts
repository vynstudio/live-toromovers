import { NextResponse } from "next/server";
import { BookingSchema } from "@/lib/booking-schema";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // TODO: persist booking, send confirmation via Resend, notify owner inbox.
  // For now, this endpoint accepts the payload and returns success.
  // When RESEND_API_KEY is set, wire in the send call here.
  return NextResponse.json({ ok: true });
}
