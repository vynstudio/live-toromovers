import { NextResponse } from "next/server";
import { intakeLead } from "@/lib/crm/intake";

/**
 * Universal lead intake (manual / GPT / tools).
 * Auth: x-lead-secret === LEAD_INTAKE_SECRET
 *
 * HubSpot removed. Sends Telegram + one Quo quote-received SMS.
 */

type Payload = Record<string, string>;

export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "intake not configured (set LEAD_INTAKE_SECRET)" },
      { status: 503 },
    );
  }
  if (req.headers.get("x-lead-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let p: Payload;
  try {
    p = (await req.json()) as Payload;
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }

  const source = (p.source || "").trim() || "manual";
  const name = (p.name || "").trim();
  const email = (p.email || "").trim();
  const phoneRaw = (p.phone || "").trim();
  if (!name || (!email && !phoneRaw)) {
    return NextResponse.json(
      { error: "name and (phone or email) required" },
      { status: 422 },
    );
  }

  const result = await intakeLead({
    firstName: name.split(/\s+/)[0] || name,
    lastName: name.split(/\s+/).slice(1).join(" ") || undefined,
    email: email || undefined,
    phone: phoneRaw || undefined,
    city: p.from_zip || p.to_location || undefined,
    funnel: "manual",
    source: "manual",
    serviceType: p.service_type || p.job_type || undefined,
    note: [
      `source=${source}`,
      p.notes && `notes=${p.notes}`,
      p.from_zip && `from=${p.from_zip}`,
      p.to_location && `to=${p.to_location}`,
    ]
      .filter(Boolean)
      .join(" · "),
    consentSms: true,
    consentEmail: true,
  });

  return NextResponse.json({
    ok: result.ok,
    source,
    crmed: false,
    hubspot: false,
    telegram: result.channels.some((c) => c.channel === "telegram" && c.ok),
    sms: result.channels.some((c) => c.channel === "openphone" && c.ok),
  });
}
