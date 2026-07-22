import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { intakeLead, parseLooseLead } from "@/lib/crm/intake";

/**
 * Unified CRM lead intake.
 *
 * Public forms: rate-limited, honeypot.
 * Internal / Meta call log: header `x-lead-secret` === LEAD_INTAKE_SECRET
 *   (bypass honeypot, higher limit).
 *
 * POST JSON:
 *   firstName|name, email?, phone?, city?, funnel?, source?,
 *   serviceType?, moveDate?, note?, lang?, consentSms?, utm?
 */
export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  const isInternal =
    Boolean(secret) && req.headers.get("x-lead-secret") === secret;

  if (!isInternal) {
    // Public quote form: generous enough for retries / multi-tab, still
    // blocks SMS/email spam bombs. Internal secret bypasses entirely.
    const rl = await rateLimit({
      key: `crm:lead:${clientIp(req)}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }
  }

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (!isInternal) {
    const hp = typeof body.hp === "string" ? body.hp.trim() : "";
    const elapsedMs =
      typeof body.elapsedMs === "number" ? body.elapsedMs : Infinity;
    if (hp !== "" || elapsedMs < 1200) {
      return NextResponse.json({ ok: true, spam: true });
    }
  }

  const lead = parseLooseLead(body);
  if (!lead) {
    return NextResponse.json(
      { error: "name + (email or phone) required" },
      { status: 400 },
    );
  }

  // Default call-ad style when only phone from internal
  if (isInternal && !lead.email && lead.phone && lead.source === "manual") {
    lead.source = "meta_call";
    if (lead.funnel === "full-service" || !lead.funnel) lead.funnel = "call";
  }

  const result = await intakeLead(lead);

  return NextResponse.json({
    ok: result.ok,
    channels: result.channels.map((c) => ({
      channel: c.channel,
      ok: c.ok,
      detail: c.detail,
    })),
  });
}
