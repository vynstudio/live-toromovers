import { NextResponse } from "next/server";
import {
  sendBookingSms,
  type BookingSmsKind,
} from "@/lib/crm/booking-sms";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * OpenPhone booking-flow SMS (intentional confirmations).
 *
 * POST /api/crm/booking-sms
 * Auth: x-lead-secret === LEAD_INTAKE_SECRET
 *
 * Body:
 *   kind: book_online | booked_confirm | checklist_reminder | day_before | review_request
 *   firstName, phone
 *   moveDate?  (booked_confirm / checklist_reminder / day_before)
 *   lang?      "en" | "es"
 *   consentSms? default true
 *
 * Examples:
 *   // After quote — send Square book link
 *   { "kind": "book_online", "firstName": "Maria", "phone": "+1689..." }
 *
 *   // After Square book + deposit
 *   { "kind": "booked_confirm", "firstName": "Maria", "phone": "+1689...", "moveDate": "Fri Aug 15" }
 *
 *   // Nudge for checklist
 *   { "kind": "checklist_reminder", "firstName": "Maria", "phone": "+1689..." }
 *
 *   // Night before
 *   { "kind": "day_before", "firstName": "Maria", "phone": "+1689...", "moveDate": "Fri Aug 15" }
 *
 *   // After move
 *   { "kind": "review_request", "firstName": "Maria", "phone": "+1689..." }
 */

const KINDS = new Set<BookingSmsKind>([
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
    key: `booking-sms:${clientIp(req)}`,
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
    phone?: string;
    moveDate?: string;
    lang?: string;
    consentSms?: boolean;
  } | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const kind = (body.kind || "").trim() as BookingSmsKind;
  if (!KINDS.has(kind)) {
    return NextResponse.json(
      {
        error: "invalid_kind",
        allowed: [...KINDS],
      },
      { status: 400 },
    );
  }

  const firstName = String(body.firstName || body.name || "there").trim();
  const phone = String(body.phone || "").trim();
  if (!phone) {
    return NextResponse.json({ error: "phone_required" }, { status: 400 });
  }

  const result = await sendBookingSms({
    kind,
    firstName,
    phone,
    moveDate: body.moveDate ? String(body.moveDate) : undefined,
    lang: body.lang === "es" ? "es" : "en",
    consentSms: body.consentSms,
  });

  return NextResponse.json({
    ok: result.ok,
    kind,
    channel: result.channel,
    detail: result.detail,
  });
}
