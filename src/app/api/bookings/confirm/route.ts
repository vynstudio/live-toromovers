import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getBooking, updateBooking, listScheduledOnDate } from "@/lib/bookings/store";
import { maxMovesPerDay } from "@/lib/bookings/slots";
import {
  TIME_SLOT_LABELS,
  type TimeSlotId,
} from "@/lib/bookings/types";
import { isOrderPaid } from "@/lib/square/client";
import { intakeLead } from "@/lib/crm/intake";
import {
  HOME_SIZE_LABELS,
  SERVICE_LABELS,
  type HomeSize,
  type ServiceKind,
} from "@/lib/price-bands";

/**
 * POST /api/bookings/confirm
 * After deposit is paid: lock move date + time window.
 */
export async function POST(req: Request) {
  const rl = await rateLimit({
    key: `bookings:confirm:${clientIp(req)}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const rid = String(body.rid || body.reservationId || "").trim();
  const moveDate = String(body.moveDate || "").trim(); // YYYY-MM-DD
  const timeSlot = String(body.timeSlot || "").trim() as TimeSlotId;

  if (!rid || !/^\d{4}-\d{2}-\d{2}$/.test(moveDate)) {
    return NextResponse.json(
      { error: "rid_and_date_required" },
      { status: 400 },
    );
  }
  if (!TIME_SLOT_LABELS[timeSlot]) {
    return NextResponse.json({ error: "invalid_slot" }, { status: 400 });
  }

  let rec = await getBooking(rid);
  if (!rec) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (rec.status === "scheduled") {
    return NextResponse.json({
      ok: true,
      already: true,
      moveDate: rec.moveDate,
      timeSlot: rec.timeSlot,
    });
  }

  // Must be paid
  if (rec.status === "pending_payment") {
    if (rec.orderId && (await isOrderPaid(rec.orderId))) {
      rec =
        (await updateBooking(rid, {
          status: "paid",
          paidAt: new Date().toISOString(),
        })) || rec;
    } else {
      return NextResponse.json(
        { error: "payment_required", message: "Complete deposit first." },
        { status: 402 },
      );
    }
  }

  // Capacity
  const existing = await listScheduledOnDate(moveDate);
  if (existing.length >= maxMovesPerDay()) {
    return NextResponse.json(
      { error: "day_full", message: "That day is full. Pick another date." },
      { status: 409 },
    );
  }

  // Weekday check Mon–Sat (0=Sun)
  const [y, m, d] = moveDate.split("-").map(Number);
  const probe = new Date(Date.UTC(y!, m! - 1, d!, 16, 0, 0));
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
  }).format(probe);
  if (wd === "Sun") {
    return NextResponse.json(
      { error: "sunday_closed", message: "Sunday moves are on request — call us." },
      { status: 400 },
    );
  }

  const updated = await updateBooking(rid, {
    status: "scheduled",
    moveDate,
    timeSlot,
    scheduledAt: new Date().toISOString(),
  });

  if (!updated) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  const slot = TIME_SLOT_LABELS[timeSlot];
  const svcLabel =
    SERVICE_LABELS[updated.service as ServiceKind] || updated.service;
  const sizeLabel =
    updated.homeSize &&
    HOME_SIZE_LABELS[updated.homeSize as Exclude<HomeSize, "">]
      ? HOME_SIZE_LABELS[updated.homeSize as Exclude<HomeSize, "">]
      : updated.homeSize;

  void intakeLead({
    firstName: updated.name.split(/\s+/)[0] || updated.name,
    lastName: updated.name.split(/\s+/).slice(1).join(" ") || undefined,
    email: updated.email,
    phone: updated.phone,
    city: updated.fromZip,
    lang: updated.lang,
    funnel: updated.service === "labor" ? "labor" : "booking",
    source: "booking",
    serviceType: `BOOKED · deposit paid · ${svcLabel}`,
    moveDate: `${moveDate} · ${slot.en} (${slot.hours})`,
    note: [
      "✅ BOOKED — deposit paid + date locked",
      `Reservation: ${rid}`,
      `Deposit: $${(updated.amountCents / 100).toFixed(2)}`,
      `Move date: ${moveDate}`,
      `Window: ${slot.en} · ${slot.hours}`,
      `Service: ${svcLabel}`,
      sizeLabel && `Size: ${sizeLabel}`,
      `From ZIP: ${updated.fromZip}`,
      `To ZIP: ${updated.toZip}`,
      updated.orderId && `Square order: ${updated.orderId}`,
    ]
      .filter(Boolean)
      .join(" — "),
    utm: updated.utm,
    landingPage: "/book/schedule",
    consentSms: updated.consentSms,
    consentEmail: Boolean(updated.email),
  }).catch((e) => console.error("[bookings/confirm] intake", e));

  return NextResponse.json({
    ok: true,
    rid,
    moveDate,
    timeSlot,
    timeLabel: slot.en,
    hours: slot.hours,
  });
}
