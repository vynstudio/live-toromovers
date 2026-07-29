import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sendBookingSms } from "@/lib/crm/booking-sms";
import {
  buildBookingEmail,
  type BookingEmailKind,
} from "@/lib/crm/email-templates";
import { sendEmail, sendTelegram } from "@/lib/crm/providers";
import { EMAIL as REPLY } from "@/lib/contact";

/**
 * Square webhooks → auto SMS + email for booking / deposit flow.
 *
 * Configure in Square Developer Dashboard → Webhooks:
 *   URL: https://toromovers.com/api/webhooks/square
 *   Events (recommended):
 *     - payment.updated (status COMPLETED)  → booked_confirm
 *     - booking.created (optional)          → book_online if unpaid
 *
 * Env:
 *   SQUARE_WEBHOOK_SIGNATURE_KEY — HMAC key from Square (required in prod)
 *   SQUARE_WEBHOOK_NOTIFICATION_URL — exact registered URL (defaults to
 *     https://toromovers.com/api/webhooks/square)
 *   SQUARE_ACCESS_TOKEN — optional; looks up customer phone/email by id
 *
 * On successful deposit payment we send:
 *   - OpenPhone booked_confirm SMS (checklist link on .com)
 *   - Resend booked_confirm HTML email
 *   - Telegram team alert
 */

const DEFAULT_WEBHOOK_URL = "https://toromovers.com/api/webhooks/square";

type SquarePayment = {
  id?: string;
  status?: string;
  amount_money?: { amount?: number; currency?: string };
  buyer_email_address?: string;
  note?: string;
  customer_id?: string;
  order_id?: string;
};

type SquareCustomer = {
  given_name?: string;
  family_name?: string;
  email_address?: string;
  phone_number?: string;
};

function getHeader(req: Request, name: string): string {
  return req.headers.get(name) || req.headers.get(name.toLowerCase()) || "";
}

/**
 * Square webhook signature:
 * HMAC-SHA256( signatureKey, notificationUrl + body ) → base64
 * compared to x-square-hmacsha256-signature
 */
function verifySquareSignature(
  signatureKey: string,
  notificationUrl: string,
  body: string,
  signatureHeader: string,
): boolean {
  if (!signatureHeader) return false;
  const hmac = createHmac("sha256", signatureKey);
  hmac.update(notificationUrl + body);
  const expected = hmac.digest("base64");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signatureHeader);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function fetchSquareCustomer(
  customerId: string,
): Promise<SquareCustomer | null> {
  const token = process.env.SQUARE_ACCESS_TOKEN?.trim();
  if (!token || !customerId) return null;
  try {
    const res = await fetch(
      `https://connect.squareup.com/v2/customers/${encodeURIComponent(customerId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Square-Version": "2024-12-18",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      console.warn("[square-webhook] customer lookup failed", res.status);
      return null;
    }
    const json = (await res.json()) as { customer?: SquareCustomer };
    return json.customer || null;
  } catch (e) {
    console.warn("[square-webhook] customer lookup error", e);
    return null;
  }
}

/** Best-effort extract of name/phone/email/date from Square payload */
async function extractCustomer(body: Record<string, unknown>): Promise<{
  firstName: string;
  email?: string;
  phone?: string;
  moveDate?: string;
  paymentId?: string;
  amountLabel?: string;
  customerId?: string;
}> {
  const data = (body.data as Record<string, unknown>) || {};
  const obj = (data.object as Record<string, unknown>) || {};
  const payment = (obj.payment as SquarePayment) || (obj as SquarePayment);
  const booking =
    (obj.booking as Record<string, unknown>) ||
    (data.booking as Record<string, unknown>) ||
    {};

  let email: string | undefined =
    (typeof payment.buyer_email_address === "string" &&
      payment.buyer_email_address) ||
    undefined;

  let phone: string | undefined;
  let given: string | undefined;

  const nestedCustomer =
    (obj.customer as SquareCustomer) ||
    (booking.customer as SquareCustomer) ||
    null;

  if (nestedCustomer) {
    given = nestedCustomer.given_name;
    email = email || nestedCustomer.email_address;
    phone = nestedCustomer.phone_number;
  }

  const customerId =
    payment.customer_id ||
    (typeof booking.customer_id === "string" ? booking.customer_id : undefined);

  if (customerId && (!email || !phone || !given)) {
    const lookedUp = await fetchSquareCustomer(customerId);
    if (lookedUp) {
      given = given || lookedUp.given_name;
      email = email || lookedUp.email_address;
      phone = phone || lookedUp.phone_number;
    }
  }

  const startAt =
    (booking.start_at as string) ||
    ((booking.appointment_segments as { start_at?: string }[]) || [])[0]
      ?.start_at;

  let moveDate: string | undefined;
  if (startAt) {
    try {
      moveDate = new Date(startAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      });
    } catch {
      moveDate = String(startAt).slice(0, 10);
    }
  }

  // Manual / test overrides on body root
  if (typeof body.phone === "string" && body.phone.trim()) {
    phone = body.phone.trim();
  }
  if (typeof body.email === "string" && body.email.trim()) {
    email = body.email.trim();
  }

  const firstName =
    given ||
    (typeof body.firstName === "string" && body.firstName) ||
    (typeof email === "string" && email.split("@")[0]) ||
    "there";

  const amount = payment.amount_money?.amount;
  const currency = payment.amount_money?.currency || "USD";
  const amountLabel =
    typeof amount === "number"
      ? `${currency} ${(amount / 100).toFixed(2)}`
      : undefined;

  return {
    firstName: String(firstName).split(/\s+/)[0] || "there",
    email: typeof email === "string" && email.includes("@") ? email : undefined,
    phone: phone ? String(phone) : undefined,
    moveDate,
    paymentId: payment.id,
    amountLabel,
    customerId,
  };
}

function isCompletedPayment(body: Record<string, unknown>): boolean {
  const type = String(body.type || "");
  if (type === "payment.updated" || type === "payment.created") {
    const data = (body.data as Record<string, unknown>) || {};
    const obj = (data.object as Record<string, unknown>) || {};
    const payment = (obj.payment as SquarePayment) || {};
    return String(payment.status || "").toUpperCase() === "COMPLETED";
  }
  if (type.includes("payment") && type.includes("made")) return true;
  return false;
}

export async function POST(req: Request) {
  const raw = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const sigKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim();
  const notificationUrl =
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim() || DEFAULT_WEBHOOK_URL;
  const sig = getHeader(req, "x-square-hmacsha256-signature");

  // Allow internal test payloads with LEAD_INTAKE_SECRET (no Square signature)
  const testSecret = process.env.LEAD_INTAKE_SECRET;
  const isInternalTest =
    Boolean(testSecret) &&
    getHeader(req, "x-lead-secret") === testSecret &&
    body.test === true;

  if (!isInternalTest) {
    if (!sigKey) {
      console.warn(
        "[square-webhook] SQUARE_WEBHOOK_SIGNATURE_KEY unset — accepting without verify",
      );
    } else if (!verifySquareSignature(sigKey, notificationUrl, raw, sig)) {
      console.warn("[square-webhook] invalid signature");
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  const eventType = String(body.type || "unknown");
  console.log("[square-webhook]", eventType);

  // Only auto-notify on completed payments (deposit) or booking.created
  if (!isCompletedPayment(body) && eventType !== "booking.created") {
    return NextResponse.json({
      ok: true,
      ignored: true,
      type: eventType,
    });
  }

  // booking.created without payment → nudge to pay/book; payment COMPLETED → confirm
  const kind: BookingEmailKind =
    eventType === "booking.created" && !isCompletedPayment(body)
      ? "book_online"
      : "booked_confirm";

  const cust = await extractCustomer(body);

  const firstName = String(body.firstName || cust.firstName || "there");
  const email = String(body.email || cust.email || "").trim() || undefined;
  const phone = String(body.phone || cust.phone || "").trim() || undefined;
  const moveDate =
    String(body.moveDate || cust.moveDate || "").trim() || undefined;
  const lang = body.lang === "es" ? "es" : "en";

  const results: Record<string, unknown> = {
    kind,
    firstName,
    paymentId: cust.paymentId,
  };

  if (phone) {
    const sms = await sendBookingSms({
      kind: kind === "book_online" ? "book_online" : "booked_confirm",
      firstName,
      phone,
      moveDate,
      lang,
    });
    results.sms = sms;
  } else {
    results.sms = { ok: false, detail: "no_phone" };
  }

  if (email) {
    const built = buildBookingEmail(kind, {
      firstName,
      moveDate,
      lang,
    });
    const em = await sendEmail({
      to: email,
      subject: built.subject,
      html: built.html,
      text: built.text,
      replyTo: REPLY,
      fromName: "Toro Movers",
    });
    results.email = em;
  } else {
    results.email = { ok: false, detail: "no_email" };
  }

  const tg = await sendTelegram(
    [
      "💳 Square · toromovers.com",
      `Type: ${eventType}`,
      `Auto: ${kind}`,
      `Name: ${firstName}`,
      phone ? `Phone: ${phone}` : "Phone: (missing)",
      email ? `Email: ${email}` : "Email: (missing)",
      moveDate ? `Move: ${moveDate}` : null,
      cust.amountLabel ? `Amount: ${cust.amountLabel}` : null,
      cust.paymentId ? `Payment: ${cust.paymentId}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  results.telegram = tg;

  return NextResponse.json({ ok: true, results });
}

/** Square (and humans) may ping GET */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "square-webhook",
    site: process.env.NEXT_PUBLIC_SITE_URL || "https://toromovers.com",
    url: process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || DEFAULT_WEBHOOK_URL,
  });
}
