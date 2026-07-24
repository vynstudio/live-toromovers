import { NextResponse } from "next/server";
import { sendEmail, sendSms } from "@/lib/crm/providers";

/**
 * Internal send proxy for Toro Pipeline CRM (and other trusted tools).
 * Auth: x-lead-secret === LEAD_INTAKE_SECRET
 *
 * POST { channel: "sms"|"email", to, body, subject? }
 */
export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  const hdr = req.headers.get("x-lead-secret");
  if (!secret || hdr !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    channel?: "sms" | "email";
    to?: string;
    body?: string;
    subject?: string;
  } | null;

  if (!body?.channel || !body.to || !body.body) {
    return NextResponse.json(
      { error: "channel, to, body required" },
      { status: 400 },
    );
  }

  if (body.channel === "sms") {
    const r = await sendSms(body.to, body.body);
    return NextResponse.json({
      ok: r.ok,
      channel: "sms",
      detail: r.detail,
    });
  }

  if (body.channel === "email") {
    const r = await sendEmail({
      to: body.to,
      subject: body.subject || "Toro Movers",
      text: body.body,
      html: body.body.replace(/\n/g, "<br/>"),
    });
    return NextResponse.json({
      ok: r.ok,
      channel: "email",
      detail: r.detail,
    });
  }

  return NextResponse.json({ error: "invalid channel" }, { status: 400 });
}
