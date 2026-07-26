import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { saveBooking } from "@/lib/bookings/store";
import type { BookingRecord } from "@/lib/bookings/types";
import {
  depositCents,
  squareConfigured,
  siteUrl,
} from "@/lib/square/config";
import { createDepositPaymentLink } from "@/lib/square/client";
import { intakeLead } from "@/lib/crm/intake";
import { SERVICE_LABELS, HOME_SIZE_LABELS, type HomeSize, type ServiceKind } from "@/lib/price-bands";
import { normalizePhone } from "@/lib/verify";

/**
 * POST /api/square/deposit
 * Creates a pending reservation + Square Checkout payment link.
 * Client redirects to `url` to pay the deposit, then lands on /book/schedule.
 */
export async function POST(req: Request) {
  const rl = await rateLimit({
    key: `square:deposit:${clientIp(req)}`,
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  if (!squareConfigured()) {
    return NextResponse.json(
      {
        error: "square_not_configured",
        message:
          "Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID (Sandbox first).",
      },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // Honeypot + speed trap
  const hp = typeof body.hp === "string" ? body.hp.trim() : "";
  const elapsedMs =
    typeof body.elapsedMs === "number" ? body.elapsedMs : Infinity;
  if (hp !== "" || elapsedMs < 1500) {
    return NextResponse.json({ ok: true, spam: true, url: "/" });
  }

  const name = String(body.name || "").trim();
  const phoneRaw = String(body.phone || "").replace(/\D/g, "");
  const email = String(body.email || "").trim().toLowerCase() || undefined;
  const lang = body.lang === "es" ? "es" : "en";
  const consentSms = body.consentSms !== false;
  const service = (String(body.service || "full-service") ||
    "full-service") as ServiceKind;
  const fromZip = String(body.fromZip || "").replace(/\D/g, "").slice(0, 5);
  const toZip = String(body.toZip || "").replace(/\D/g, "").slice(0, 5);
  const homeSize = String(body.homeSize || "");

  if (name.length < 2) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (phoneRaw.length !== 10) {
    return NextResponse.json({ error: "phone_required" }, { status: 400 });
  }
  if (fromZip.length !== 5 || toZip.length !== 5) {
    return NextResponse.json({ error: "zips_required" }, { status: 400 });
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `b_${Date.now().toString(36)}`;

  const phoneE164 = normalizePhone(phoneRaw);
  const amountCents = depositCents();
  const now = new Date().toISOString();
  const sizeLabel =
    homeSize && HOME_SIZE_LABELS[homeSize as Exclude<HomeSize, "">]
      ? HOME_SIZE_LABELS[homeSize as Exclude<HomeSize, "">]
      : homeSize;
  const svcLabel =
    SERVICE_LABELS[service as ServiceKind] || String(service);

  const utm =
    body.utm && typeof body.utm === "object"
      ? (body.utm as Record<string, string>)
      : undefined;

  const record: BookingRecord = {
    id,
    status: "pending_payment",
    createdAt: now,
    updatedAt: now,
    name,
    phone: phoneRaw,
    email,
    lang,
    consentSms,
    service:
      service === "labor" || service === "not-sure" ? service : "full-service",
    fromZip,
    toZip,
    homeSize,
    amountCents,
    utm,
    source: String(body.source || "book-deposit"),
  };

  await saveBooking(record);

  const redirectUrl = `${siteUrl()}/book/schedule?rid=${encodeURIComponent(id)}&lang=${lang}`;

  const link = await createDepositPaymentLink({
    reservationId: id,
    name,
    email,
    phoneE164: phoneE164 || undefined,
    redirectUrl,
    serviceLabel: [svcLabel, sizeLabel].filter(Boolean).join(" · "),
  });

  if (!link.ok) {
    return NextResponse.json(
      { error: "checkout_failed", detail: link.error },
      { status: 502 },
    );
  }

  record.paymentLinkId = link.paymentLinkId;
  record.orderId = link.orderId;
  await saveBooking(record);

  // Soft CRM lead so abandoned checkouts still show up for follow-up
  void intakeLead({
    firstName: name.split(/\s+/)[0] || name,
    lastName: name.split(/\s+/).slice(1).join(" ") || undefined,
    email,
    phone: phoneRaw,
    city: fromZip,
    lang,
    funnel: service === "labor" ? "labor" : "full-service",
    source: "booking",
    serviceType: `Deposit pending · ${svcLabel}${sizeLabel ? ` · ${sizeLabel}` : ""} · ${fromZip}→${toZip}`,
    note: [
      "💳 Deposit checkout started (not paid yet)",
      `Reservation: ${id}`,
      `Amount: $${(amountCents / 100).toFixed(2)}`,
      `Service: ${svcLabel}`,
      sizeLabel && `Size: ${sizeLabel}`,
      `From ZIP: ${fromZip}`,
      `To ZIP: ${toZip}`,
      `Payment link: ${link.paymentLinkId}`,
    ]
      .filter(Boolean)
      .join(" — "),
    utm,
    landingPage: "/book",
    consentSms,
    consentEmail: Boolean(email),
  }).catch((e) => console.error("[square/deposit] intake soft lead", e));

  return NextResponse.json({
    ok: true,
    reservationId: id,
    url: link.url,
    amountCents,
  });
}
