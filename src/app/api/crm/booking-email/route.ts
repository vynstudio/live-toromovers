import { NextResponse } from "next/server";
import {
  buildBookingEmail,
  type BookingEmailKind,
} from "@/lib/crm/email-templates";
import { sendEmail } from "@/lib/crm/providers";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { EMAIL as REPLY } from "@/lib/contact";

/**
 * Interactive HTML booking emails via Resend.
 *
 * POST /api/crm/booking-email
 * Auth: x-lead-secret === LEAD_INTAKE_SECRET
 *
 * Body:
 *   kind: quote_received | book_online | booked_confirm | checklist_reminder
 *         | day_before | review_request
 *   firstName, email
 *   moveDate?, lang?
 */

const KINDS = new Set<BookingEmailKind>([
  "quote_received",
  "book_online",
  "booked_confirm",
  "checklist_reminder",
  "day_before",
  "review_request",
]);

export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  const hdr = req.headers.get("x-lead-secret");
  if (!secret || hdr !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit({
    key: `booking-email:${clientIp(req)}`,
    limit: 40,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    kind?: string;
    firstName?: string;
    name?: string;
    email?: string;
    moveDate?: string;
    lang?: string;
  } | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const kind = (body.kind || "").trim() as BookingEmailKind;
  if (!KINDS.has(kind)) {
    return NextResponse.json(
      { error: "invalid_kind", allowed: [...KINDS] },
      { status: 400 },
    );
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  const firstName = String(body.firstName || body.name || "there").trim();
  const built = buildBookingEmail(kind, {
    firstName,
    moveDate: body.moveDate ? String(body.moveDate) : undefined,
    lang: body.lang === "es" ? "es" : "en",
  });

  const result = await sendEmail({
    to: email,
    subject: built.subject,
    html: built.html,
    text: built.text,
    replyTo: REPLY,
    fromName: "Toro Movers",
  });

  return NextResponse.json({
    ok: result.ok,
    kind,
    channel: result.channel,
    detail: result.detail,
    subject: built.subject,
  });
}
