import { NextResponse } from "next/server";
import { buildSequence } from "@/lib/crm/sequences";
import { sendEmail, sendSms } from "@/lib/crm/providers";
import type { SequenceKey } from "@/lib/crm/types";

/**
 * Fire a client automation step.
 * Called by n8n Wait nodes, cron, or manual tools.
 *
 * Auth: x-lead-secret === LEAD_INTAKE_SECRET  OR  x-toro-secret === N8N_WEBHOOK_SECRET
 *
 * POST {
 *   sequence: "followup_1h" | "followup_24h" | ... | "post_move_review" | ...
 *   firstName, email?, phone?, lang?, funnel?,
 *   channels?: ("email"|"sms")[]   // default both when available
 * }
 */
export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  const n8n = process.env.N8N_WEBHOOK_SECRET;
  const hdr = req.headers.get("x-lead-secret");
  const hdrN8n = req.headers.get("x-toro-secret");
  if (secret || n8n) {
    const ok =
      (secret && hdr === secret) || (n8n && hdrN8n === n8n);
    if (!ok) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    return NextResponse.json(
      { error: "not configured — set LEAD_INTAKE_SECRET" },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    sequence?: string;
    firstName?: string;
    email?: string;
    phone?: string;
    lang?: "en" | "es";
    funnel?: string;
    channels?: ("email" | "sms")[];
  } | null;

  if (!body?.sequence || !body.firstName) {
    return NextResponse.json(
      { error: "sequence + firstName required" },
      { status: 400 },
    );
  }

  const msg = buildSequence(body.sequence as SequenceKey, {
    firstName: body.firstName,
    lang: body.lang,
    funnel: body.funnel,
  });

  const want = body.channels || ["email", "sms"];
  const results: { channel: string; ok: boolean; detail?: string }[] = [];

  if (want.includes("email") && body.email && msg.email) {
    const r = await sendEmail({
      to: body.email,
      subject: msg.email.subject,
      html: msg.email.html,
      text: msg.email.text,
    });
    results.push({ channel: "email", ok: r.ok, detail: r.detail });
  }

  if (want.includes("sms") && body.phone && msg.sms) {
    const r = await sendSms(body.phone, msg.sms);
    results.push({ channel: "sms", ok: r.ok, detail: r.detail });
  }

  return NextResponse.json({
    ok: results.some((r) => r.ok),
    sequence: body.sequence,
    results,
  });
}
