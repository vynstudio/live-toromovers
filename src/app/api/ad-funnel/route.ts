import { NextResponse } from "next/server";
import { createHash } from "crypto";

// Toro Movers — ad-funnel lead intake. Serves the paid-traffic funnel at
// /get-quote (public/get-quote.html). Ported verbatim from the standalone quote
// site's Netlify function so the 6 service types and every channel behave
// exactly as before: HubSpot (contact + deal), Telegram alert, OpenPhone/Quo
// SMS, Resend customer email + team alert, Meta CAPI. Each integration is a
// no-op when its env var(s) are missing — the page never breaks, and whatever
// IS configured delivers. Email is required (keeps the existing contract).

type Payload = Record<string, string>;

const SVC: Record<string, string> = {
  "labor-truck": "Home/Apartment — Labor moving + truck",
  "labor-only": "Home/Apartment — Labor moving only",
  "full-service": "Full-service move (pack, load & move)",
  storage: "Storage",
  uhaul: "Load / Unload U-Haul",
  rearrangement: "In-home rearrangement",
};
const WHEN: Record<string, string> = {
  asap: "ASAP / Same day",
  "this-week": "This week",
  "two-weeks": "Next 2 weeks",
  planning: "Just planning",
};

function normalizePhone(v: string): string {
  const d = String(v || "").replace(/\D/g, "");
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d[0] === "1") return "+" + d;
  return d ? "+" + d : "";
}
function esc(s: string): string {
  return String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ] as string),
  );
}
function cookie(raw: string | null, name: string): string | undefined {
  const m = new RegExp("(?:^|;\\s*)" + name + "=([^;]+)").exec(raw || "");
  return m ? m[1] : undefined;
}

export async function POST(req: Request) {
  let p: Payload;
  try {
    p = (await req.json()) as Payload;
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }
  if (!p || !p.email) {
    return NextResponse.json({ error: "email required" }, { status: 422 });
  }

  const parts = String(p.name || "").trim().split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ");
  const phone = normalizePhone(p.phone);
  const service = SVC[p.servicetype] || p.servicetype || "";
  const when = WHEN[p.timing] || p.timing || "";
  const opts = [
    p.opt_stairs && "stairs",
    p.opt_elevator && "elevator",
    p.opt_truck && "truck needed",
    p.opt_laboronly && "labor only",
  ]
    .filter(Boolean)
    .join(", ");
  const city = p.city || p.pickup || "";
  // submit requires the consent box; presence of email implies it was checked
  const consent =
    String(p.consent || "").toLowerCase() === "yes" || Boolean(p.email);
  const wantsSms = consent && Boolean(phone);

  const text = [
    "🟥 New QUOTE-FUNNEL lead — Toro Movers",
    "",
    `Name: ${firstName}${lastName ? " " + lastName : ""}`,
    `Phone: ${phone || p.phone || "—"}`,
    `Email: ${p.email}`,
    `Lang: ${p.language || "—"}`,
    `Service: ${service || "—"}`,
    `When: ${when || "—"}`,
    `From: ${p.pickup || "—"}`,
    `To: ${p.dropoff || "—"}`,
    `Home/job: ${p.hometype || "—"}`,
    `Options: ${opts || "—"}`,
    `Notes: ${p.notes || "—"}`,
    "",
    `UTM: ${[p.utm_source, p.utm_medium, p.utm_campaign, p.utm_content].filter(Boolean).join(" / ") || "—"}`,
    `IDs: campaign=${p.campaign_id || "—"} adset=${p.adset_id || "—"} ad=${p.ad_id || "—"}`,
    "Source: toromovers.net/get-quote",
  ].join("\n");

  const results = await Promise.allSettled([
    hubspot(p, firstName, lastName, phone, service, city),
    telegram(text, p.email),
    wantsSms ? openphoneSms(phone, firstName, service) : Promise.resolve(false),
    customerEmail(p.email, firstName, service),
    teamEmail(p.email, firstName, city, service, text),
    metaCapi(p, phone, req),
  ]);
  const ok = (i: number) =>
    results[i].status === "fulfilled" &&
    (results[i] as PromiseFulfilledResult<boolean>).value === true;

  const body = {
    ok: true,
    crmed: ok(0),
    telegram: ok(1),
    smsSent: ok(2),
    customerEmailed: ok(3),
    teamAlerted: ok(4),
    capi: ok(5),
  };
  if (!body.crmed && !body.teamAlerted && !body.telegram) {
    console.error("[ad-funnel] no channel delivered:", p.email, phone);
  }
  return NextResponse.json(body);
}

/* ---- HubSpot: upsert contact (proven props) + create deal if none ---- */
async function hubspot(
  p: Payload,
  firstName: string,
  lastName: string,
  phone: string,
  service: string,
  city: string,
): Promise<boolean> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return false;
  const h = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const properties: Record<string, string> = {
    email: p.email,
    firstname: firstName,
    lifecyclestage: "lead",
    hs_lead_status: "ATTEMPTED_TO_CONTACT",
  };
  if (lastName) properties.lastname = lastName;
  if (phone) properties.phone = phone;
  if (service) properties.servicetype = service;
  if (city) properties.city = city;
  if (p.pickup) properties.pickup_address = p.pickup;
  if (p.dropoff) properties.dropoff_address = p.dropoff;
  if (p.language) properties.hs_language = p.language;

  let contactId: string | undefined;
  try {
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
      {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          inputs: [{ idProperty: "email", id: p.email, properties }],
        }),
      },
    );
    if (!res.ok) {
      console.error("[ad-funnel] hs upsert", res.status, await res.text().catch(() => ""));
      return false;
    }
    const d = await res.json().catch(() => null);
    contactId = d && d.results && d.results[0] && d.results[0].id;
  } catch (e) {
    console.error("[ad-funnel] hs threw", e);
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
        await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            properties: {
              dealname: `${firstName} — ${service || "Quote"}${city ? ` (${city})` : ""}`,
              pipeline: "2345196253",
              dealstage: "3821600460",
            },
            associations: [
              {
                to: { id: contactId },
                types: [
                  {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 3,
                  },
                ],
              },
            ],
          }),
        });
      }
    } catch {
      /* contact already upserted — still a success */
    }
  }
  return true;
}

/* ---- Telegram: team alert with one-tap stage buttons ---- */
function stageKb(email: string) {
  if (!email) return undefined;
  const S = "https://n8n-production-d3d0.up.railway.app/webhook/toro-stage";
  const u = (s: string) => `${S}?e=${encodeURIComponent(email)}&s=${s}`;
  return {
    inline_keyboard: [
      [
        { text: "📞 No Answer", url: u("a") },
        { text: "✅ Contacted", url: u("c") },
      ],
      [
        { text: "💲 Quote Sent", url: u("q") },
        { text: "📅 Booked", url: u("b") },
        { text: "🚚 Move Done", url: u("m") },
      ],
      [
        { text: "⭐ Review Sent", url: u("r") },
        { text: "🌟 Review Got", url: u("o") },
      ],
    ],
  };
}
async function telegram(text: string, email: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat,
          text,
          disable_web_page_preview: true,
          reply_markup: stageKb(email),
        }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

/* ---- OpenPhone / Quo: customer confirmation SMS ---- */
async function openphoneSms(
  phone: string,
  firstName: string,
  service: string,
): Promise<boolean> {
  const key = process.env.OPENPHONE_API_KEY;
  const from = process.env.OPENPHONE_FROM_NUMBER;
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: { Authorization: key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [phone],
        content: `Hi ${firstName}, this is Toro Movers — got your ${service || "moving"} request and we'll call shortly to check availability. Reply STOP to opt out.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---- Resend: customer confirmation email ---- */
async function customerEmail(
  email: string,
  firstName: string,
  service: string,
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!key) return false;
  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#fff;font:15px/1.6 system-ui,sans-serif;color:#0A0A0A">
    <h2 style="font:600 22px/1.3 system-ui,sans-serif;margin:0 0 10px">Thanks, ${esc(firstName)} — your moving request is in.</h2>
    <p style="margin:0 0 18px;color:#3A3A3A">A Toro Movers team member will text or call you shortly to check availability and confirm your up-front rate.</p>
    <p style="margin:0 0 4px">Want to speed it up? Call us now:</p>
    <p style="font:600 18px system-ui,sans-serif;margin:4px 0 20px"><a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">(689) 600-2720</a></p>
    <p style="color:#6B6B72;font-size:13px;margin:24px 0 0;border-top:1px solid #ECECEC;padding-top:16px">Family-owned · Fully insured · Up-front pricing · Hablamos español<br>Toro Movers · (689) 600-2720</p>
  </div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [email],
        reply_to: from,
        subject: "Your moving quote request — Toro Movers",
        html,
        text: `Hi ${firstName}, we got your ${service || "moving"} request and a Toro Movers crew member will text or call shortly. Speed it up: (689) 600-2720.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---- Resend: internal team alert email ---- */
async function teamEmail(
  email: string,
  firstName: string,
  city: string,
  service: string,
  text: string,
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  const to =
    process.env.LEAD_NOTIFICATION_EMAIL ||
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    from;
  if (!key) return false;
  const html = `<div style="max-width:560px;margin:0 auto;padding:24px"><h2 style="font:600 18px system-ui,sans-serif;color:#141414;margin:0 0 12px">Quote-funnel lead — ${esc(firstName)} · ${esc(city)}</h2><pre style="white-space:pre-wrap;font:13px/1.5 ui-monospace,Menlo,monospace;color:#2A2A2A;background:#F7F7F8;padding:16px 18px;border-radius:8px;border:1px solid #E6E6EA">${esc(text)}</pre></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [to],
        reply_to: email,
        subject: `Quote-funnel lead: ${firstName} · ${city || ""}`,
        html,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---- Meta CAPI: server-side Lead (deduped with the browser pixel via event_id) ---- */
async function metaCapi(
  p: Payload,
  phone: string,
  req: Request,
): Promise<boolean> {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID || "985575491098437";
  const token = process.env.META_ACCESS_TOKEN;
  if (!pixel || !token) return false;
  const sha = (v: string) =>
    createHash("sha256").update(String(v || "").trim().toLowerCase()).digest("hex");
  const d = String(phone || "").replace(/\D/g, "");
  const e164 = d.length === 10 ? "1" + d : d;
  const ud: Record<string, unknown> = {
    em: [sha(p.email)],
    ph: [sha(e164)],
    fn: [sha((p.name || "").trim().split(/\s+/)[0] || "")],
  };
  const ua = req.headers.get("user-agent");
  if (ua) ud.client_user_agent = ua;
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (ip) ud.client_ip_address = ip;
  const ck = req.headers.get("cookie");
  const fbp = cookie(ck, "_fbp");
  if (fbp) ud.fbp = fbp;
  const fbc = cookie(ck, "_fbc");
  if (fbc) ud.fbc = fbc;
  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: p.eventId || "lead_" + (p.submitted_at || ""),
        action_source: "website",
        event_source_url:
          req.headers.get("referer") || "https://toromovers.net/get-quote",
        custom_data: {
          content_name: "quote_funnel",
          content_category: p.servicetype || "",
        },
        user_data: ud,
      },
    ],
  };
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixel}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
