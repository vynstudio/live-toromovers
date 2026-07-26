import { NextResponse } from "next/server";
import { getBooking, updateBooking } from "@/lib/bookings/store";
import { isOrderPaid } from "@/lib/square/client";
import { depositDollarsLabel } from "@/lib/square/config";

/**
 * GET /api/bookings/status?rid=...
 * Returns reservation status; re-checks Square order if still pending_payment.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rid = url.searchParams.get("rid")?.trim() || "";
  const orderIdParam = url.searchParams.get("orderId")?.trim() || "";

  if (!rid) {
    return NextResponse.json({ error: "rid_required" }, { status: 400 });
  }

  let rec = await getBooking(rid);
  if (!rec) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Capture orderId from Square redirect if present
  if (orderIdParam && !rec.orderId) {
    rec = (await updateBooking(rid, { orderId: orderIdParam })) || rec;
  }

  if (rec.status === "pending_payment" && (rec.orderId || orderIdParam)) {
    const oid = rec.orderId || orderIdParam;
    const paid = await isOrderPaid(oid);
    if (paid) {
      rec =
        (await updateBooking(rid, {
          status: "paid",
          paidAt: new Date().toISOString(),
          orderId: oid,
        })) || rec;
    }
  }

  return NextResponse.json({
    ok: true,
    id: rec.id,
    status: rec.status,
    name: rec.name,
    amountCents: rec.amountCents,
    amountLabel: depositDollarsLabel(),
    service: rec.service,
    fromZip: rec.fromZip,
    toZip: rec.toZip,
    homeSize: rec.homeSize,
    moveDate: rec.moveDate,
    timeSlot: rec.timeSlot,
    canSchedule: rec.status === "paid" || rec.status === "scheduled",
    scheduled: rec.status === "scheduled",
  });
}
