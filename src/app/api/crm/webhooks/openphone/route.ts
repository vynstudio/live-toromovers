import { NextResponse } from "next/server";
import { advanceStage } from "@/lib/crm/stage";
import { sendTelegram } from "@/lib/crm/providers";
import { normalizePhone } from "@/lib/verify";

/**
 * OpenPhone / Quo inbound webhook.
 *
 * Point OpenPhone → Settings → Webhooks → message.received
 *   URL: https://toromovers.net/api/crm/webhooks/openphone
 * Optional: set OPENPHONE_WEBHOOK_SECRET and send as header x-openphone-secret
 *
 * On inbound customer SMS:
 *   1) Advance deal → Contacted
 *   2) Set contact CONNECTED
 *   3) Telegram ping (optional)
 */
export async function POST(req: Request) {
  const expected = process.env.OPENPHONE_WEBHOOK_SECRET;
  if (expected && req.headers.get("x-openphone-secret") !== expected) {
    // Also accept x-toro-secret for n8n forwards
    const n8n = process.env.N8N_WEBHOOK_SECRET;
    if (!n8n || req.headers.get("x-toro-secret") !== n8n) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // Normalize Quo/OpenPhone payload shapes
  const type = String(body.type || body.event || "");
  const data =
    (body.data as Record<string, unknown>) ||
    ((body.data as { object?: Record<string, unknown> })?.object as Record<
      string,
      unknown
    >) ||
    body;
  const obj =
    (data.object as Record<string, unknown>) ||
    (data as Record<string, unknown>);

  const direction = String(obj.direction || data.direction || "");
  const isInbound =
    /message\.received/i.test(type) ||
    direction === "incoming" ||
    direction === "inbound";

  if (!isInbound) {
    return NextResponse.json({ ok: true, skipped: "not_inbound" });
  }

  const from = String(obj.from || data.from || "").trim();
  if (!from) {
    return NextResponse.json({ ok: true, skipped: "no_from" });
  }

  const phone = normalizePhone(from);
  const text = String(obj.body || obj.text || obj.content || data.body || "").slice(
    0,
    280,
  );

  const result = await advanceStage({
    phone,
    stage: "contacted",
    notifyTelegram: false,
    label: "contacted (SMS reply)",
  });

  await sendTelegram(
    [
      `💬 Inbound SMS`,
      `From: ${phone}`,
      text ? `Msg: ${text}` : "",
      result.ok
        ? `✅ HubSpot → Contacted`
        : `⚠️ CRM: ${result.error || "no match"}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return NextResponse.json({
    ok: true,
    advanced: result.ok,
    contactId: result.contactId,
    error: result.error,
  });
}
