import { NextResponse } from "next/server";

// ===========================================================================
// UNIVERSAL LEAD INTAKE — one pipe for EVERY source.
// ---------------------------------------------------------------------------
// Any off-web source (a ChatGPT custom-GPT Action, n8n, Zapier, a chatbot,
// manual quick-add, Instagram/WhatsApp automations, GBP, etc.) POSTs a lead
// here and it lands in HubSpot "Mudanzas" (contact + deal) + a Telegram alert,
// tagged by `source`. This complements the web forms (/api/ad-funnel,
// /api/booking) so leads from non-form channels stop being manual.
//
// Auth: requires header `x-lead-secret` === env LEAD_INTAKE_SECRET. If the env
// var is unset the endpoint is inert (503) — it can't be abused until you
// configure the secret in Netlify and in the caller (GPT Action / n8n).
//
// Body (JSON, flexible): {
//   source (required, e.g. "chatgpt" | "instagram" | "whatsapp" | "phone" |
//           "referral" | "gbp" | "manual"),
//   name (required), phone?, email?, notes?,
//   service_type?, job_type?, from_zip?, to_location?
// }  — at least one of phone/email is required.
// ===========================================================================

const HS_PIPELINE = "2345196253"; // "Mudanzas"
const HS_NEW_LEAD = "3821600460"; // "New Lead"

type Payload = Record<string, string>;

function normalizePhone(v: string): string {
  const d = String(v || "").replace(/\D/g, "");
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d[0] === "1") return "+" + d;
  return d ? "+" + d : "";
}

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
  const parts = name.split(/\s+/);
  const firstName = parts.shift() || name;
  const lastName = parts.join(" ");
  const phone = normalizePhone(phoneRaw);
  const city = p.from_zip || p.to_location || "";

  const summary = [
    `🆕 New lead — source: ${source}`,
    ``,
    `Name: ${name}`,
    `Phone: ${phone || phoneRaw || "—"}`,
    `Email: ${email || "—"}`,
    `Service: ${p.service_type || "—"}`,
    `Job: ${p.job_type || "—"}`,
    `From: ${p.from_zip || "—"}`,
    `To: ${p.to_location || "—"}`,
    `Notes: ${p.notes || "—"}`,
    `Source: ${source}`,
  ].join("\n");

  const results = await Promise.allSettled([
    hubspot(source, firstName, lastName, email, phone, p, city, summary),
    telegram(summary),
  ]);
  const ok = (i: number) =>
    results[i].status === "fulfilled" &&
    (results[i] as PromiseFulfilledResult<boolean>).value === true;

  return NextResponse.json({ ok: true, source, crmed: ok(0), telegram: ok(1) });
}

/* HubSpot: upsert contact (by email when present) + Mudanzas deal, source-tagged. */
async function hubspot(
  source: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  p: Payload,
  city: string,
  summary: string,
): Promise<boolean> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return false;
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const properties: Record<string, string> = {
    firstname: firstName,
    lifecyclestage: "lead",
    hs_lead_status: "NEW",
    message: summary, // full context + source on the contact record
  };
  if (lastName) properties.lastname = lastName;
  if (email) properties.email = email;
  if (phone) properties.phone = phone;
  if (p.from_zip) properties.city = p.from_zip;

  let contactId: string | undefined;
  try {
    const useUpsert = Boolean(email);
    const url = useUpsert
      ? "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert"
      : "https://api.hubapi.com/crm/v3/objects/contacts";
    const body = useUpsert
      ? { inputs: [{ idProperty: "email", id: email, properties }] }
      : { properties };
    const res = await fetch(url, { method: "POST", headers: h, body: JSON.stringify(body) });
    if (!res.ok) {
      console.error("[lead] hs upsert", res.status, await res.text().catch(() => ""));
      return false;
    }
    const d = await res.json().catch(() => null);
    contactId = useUpsert ? d?.results?.[0]?.id : d?.id;
  } catch (e) {
    console.error("[lead] hs threw", e);
    return false;
  }

  if (contactId) {
    try {
      const a = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/deals`,
        { headers: h },
      );
      const has =
        a.ok && (((await a.json().catch(() => ({}))).results) || []).length > 0;
      if (!has) {
        const svc = p.service_type ? ` — ${p.service_type}` : "";
        await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            properties: {
              // source tagged right in the deal name for instant reporting
              dealname: `${firstName}${svc} · ${source}${city ? ` (${city})` : ""}`,
              pipeline: HS_PIPELINE,
              dealstage: HS_NEW_LEAD,
            },
            associations: [
              {
                to: { id: contactId },
                types: [
                  { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 },
                ],
              },
            ],
          }),
        });
      }
    } catch {
      /* contact upserted — still a success */
    }
  }
  return true;
}

/* Telegram team alert (reuses the lead bot). */
async function telegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
