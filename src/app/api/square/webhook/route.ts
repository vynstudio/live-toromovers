import { NextResponse } from "next/server";
import { getBooking, updateBooking } from "@/lib/bookings/store";
import { isOrderPaid } from "@/lib/square/client";

/**
 * POST /api/square/webhook
 * Marks reservations paid when Square reports order/payment activity.
 *
 * In Developer Console → Webhooks, point Sandbox/Production to:
 *   https://toromovers.net/api/square/webhook
 * Events: order.updated, payment.updated (or payment.created)
 *
 * Optional: SQUARE_WEBHOOK_SIGNATURE_KEY for signature verification later.
 */
export async function POST(req: Request) {
  let body: {
    type?: string;
    data?: {
      id?: string;
      object?: {
        order_id?: string;
        payment?: { order_id?: string; status?: string };
        order?: { id?: string; state?: string; tenders?: unknown[] };
      };
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const type = body.type || "";
  const obj = body.data?.object;

  let orderId =
    obj?.order_id ||
    obj?.payment?.order_id ||
    obj?.order?.id ||
    body.data?.id ||
    "";

  // payment events sometimes nest differently
  if (!orderId && obj && "payment" in (obj as object)) {
    orderId = (obj as { payment?: { order_id?: string } }).payment?.order_id || "";
  }

  if (!orderId) {
    // Acknowledge so Square doesn't retry forever
    return NextResponse.json({ ok: true, ignored: true, type });
  }

  // Find reservation by orderId — list is expensive; we also accept payment_note in future.
  // For now scan is not ideal; client also verifies on /book/schedule.
  // Best path: store index orderId → rid when creating link.
  const ridFromNote = await findRidByOrderId(orderId);
  if (ridFromNote) {
    const paid =
      (Array.isArray(obj?.order?.tenders) && obj!.order!.tenders!.length > 0) ||
      obj?.payment?.status === "COMPLETED" ||
      obj?.order?.state === "OPEN" ||
      (await isOrderPaid(orderId));

    if (paid) {
      await updateBooking(ridFromNote, {
        status: "paid",
        paidAt: new Date().toISOString(),
        orderId,
      });
    }
  } else {
    // Still try isOrderPaid path if we later index; no-op for unknown orders
    void orderId;
  }

  return NextResponse.json({ ok: true, type, orderId });
}

async function findRidByOrderId(orderId: string): Promise<string | null> {
  // Lightweight: Netlify Blobs list + match (ok for low volume movers)
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("bookings");
    const listed = await store.list();
    for (const blob of listed.blobs || []) {
      const rec = (await store.get(blob.key, { type: "json" })) as {
        id?: string;
        orderId?: string;
      } | null;
      if (rec?.orderId === orderId && rec.id) return rec.id;
    }
  } catch {
    /* local dev without blobs */
  }
  return null;
}

/** Health check for webhook URL setup */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "square-webhook",
    hint: "POST Square event notifications here",
  });
}
