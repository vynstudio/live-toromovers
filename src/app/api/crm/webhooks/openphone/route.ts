import { NextResponse } from "next/server";
import { sendTelegram } from "@/lib/crm/providers";
import { normalizePhone } from "@/lib/verify";

/**
 * OpenPhone / Quo inbound webhook — notify team only.
 * No HubSpot stage changes. No automated reply SMS.
 */
export async function POST(req: Request) {
  const expected = process.env.OPENPHONE_WEBHOOK_SECRET;
  if (expected && req.headers.get("x-openphone-secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const data =
    (body.data as Record<string, unknown>) ||
    body;
  const obj =
    (data.object as Record<string, unknown>) ||
    (data as Record<string, unknown>);

  const direction = String(obj.direction || data.direction || "");
  const isInbound =
    direction.toLowerCase() === "incoming" ||
    direction.toLowerCase() === "inbound" ||
    String(body.type || "").includes("received");

  if (!isInbound) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const from = String(
    obj.from || obj.phoneNumber || data.from || "",
  ).trim();
  const text = String(obj.body || obj.text || data.body || "").slice(0, 500);
  const phone = from ? normalizePhone(from) : "";

  await sendTelegram(
    `💬 Inbound SMS${phone ? ` from ${phone}` : ""}\n${text || "(empty)"}`,
  );

  return NextResponse.json({ ok: true, hubspot: false, autoReply: false });
}
