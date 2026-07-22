import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createHash } from "crypto";
import {
  BookingSchema,
  HELP_LABEL,
  RESIDENCE_LABEL,
  FLOOR_LABEL,
  SIZE_LABEL,
  type QuoteInput,
} from "@/lib/booking-schema";
import { normalizePhone, sendConfirmationSms } from "@/lib/verify";

export async function POST(req: Request) {
  // Rate-limit public form submits per IP to blunt bot spam (best-effort, fails open).
  const rl = await rateLimit({ key: `form:booking:${clientIp(req)}`, limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }
  const body = await req.json().catch(() => null);

  // Spam filter: honeypot filled, or submitted implausibly fast (bots) →
  // pretend success without notifying anyone.
  const hp = typeof body?.hp === "string" ? body.hp.trim() : "";
  const elapsedMs = typeof body?.elapsedMs === "number" ? body.elapsedMs : Infinity;
  if (hp !== "" || elapsedMs < 1500) {
    return NextResponse.json({ ok: true });
  }

  const parsed = BookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const q = parsed.data;

  const eventId =
    body && typeof body.eventId === "string" ? body.eventId : undefined;

  const help = HELP_LABEL[q.helpType]?.en ?? q.helpType;
  const fromRes = q.fromResidence ? (RESIDENCE_LABEL[q.fromResidence]?.en ?? q.fromResidence) : "";
  const toRes = q.toResidence ? (RESIDENCE_LABEL[q.toResidence]?.en ?? q.toResidence) : "";
  const fromFloor = q.fromFloor ? ` · ${FLOOR_LABEL[q.fromFloor]?.en ?? q.fromFloor}` : "";
  const toFloor = q.toFloor ? ` · ${FLOOR_LABEL[q.toFloor]?.en ?? q.toFloor}` : "";
  const size = q.size ? (SIZE_LABEL[q.size]?.en ?? q.size) : "—";
  const fullName = `${q.firstName} ${q.lastName ?? ""}`.trim();
  const distance = await computeRoute(q.fromAddress, q.toAddress);

  // Plain-text summary reused by both notification channels.
  const text = [
    `🚚 New quote request — Toro Movers`,
    ``,
    `Service: ${help}`,
    `Move date: ${q.date || "—"}`,
    `From: ${q.fromAddress}${fromRes ? ` (${fromRes}${fromFloor})` : ""}`,
    `To: ${q.toAddress}${toRes ? ` (${toRes}${toFloor})` : ""}`,
    `Distance: ${distance || "—"}`,
    `Size: ${size}`,
    `Special items: ${q.specialItems || "—"}`,
    ``,
    fullName,
    `${q.email}`,
    `${q.phone}`,
    `Source: ${q.source || "—"}`,
  ].join("\n");

  // Instant customer confirmation (Resend email + OpenPhone SMS) + internal lead
  // alerts (team email + Telegram) + Meta CAPI + HubSpot upsert. All in
  // parallel; none can block the others.
  const results = await Promise.allSettled([
    sendEmail(q, help, fromRes, toRes, fromFloor, toFloor, size, distance, fullName, text),
    sendTelegram(text, q),
    sendMetaCapi(q, eventId, req),
    sendClientConfirmationEmail(q, fullName),
    sendConfirmationSms(normalizePhone(q.phone), q.firstName),
    createHubspotContact(q, fullName, help, distance, text),
  ]);
  const emailed = results[0].status === "fulfilled" && results[0].value === true;
  const telegrammed = results[1].status === "fulfilled" && results[1].value === true;
  const capi = results[2].status === "fulfilled" && results[2].value === true;
  const crmed = results[5].status === "fulfilled" && results[5].value === true;

  if (!emailed && !telegrammed) {
    console.error("[booking] NO notification channel delivered the lead:", JSON.stringify(q));
  }

  return NextResponse.json({ ok: true, emailed, telegrammed, capi, crmed });
}

async function sendEmail(
  q: QuoteInput,
  help: string,
  fromRes: string,
  toRes: string,
  fromFloor: string,
  toFloor: string,
  size: string,
  distance: string,
  fullName: string,
  text: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  const to =
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    process.env.LEAD_NOTIFICATION_EMAIL ||
    from;

  if (!apiKey) {
    console.error("[booking] RESEND_API_KEY missing — email skipped");
    return false;
  }

  const row = (label: string, value: string) =>
    `<tr><td style="padding:5px 14px 5px 0;color:#8a8a8a;font:13px/1.5 system-ui,sans-serif;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:5px 0;color:#141414;font:14px/1.5 system-ui,sans-serif">${value || "—"}</td></tr>`;

  const fromCell = fromRes
    ? `${q.fromAddress}<br><span style="color:#8a8a8a">${fromRes}${fromFloor}</span>`
    : q.fromAddress;
  const toCell = toRes
    ? `${q.toAddress}<br><span style="color:#8a8a8a">${toRes}${toFloor}</span>`
    : q.toAddress;

  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff">
    <h2 style="font:600 18px/1.3 system-ui,sans-serif;color:#141414;margin:0 0 4px">New quote request — Toro Movers</h2>
    <p style="font:14px/1.5 system-ui,sans-serif;color:#6a6a6a;margin:0 0 22px">${fullName} just requested a quote.</p>
    <table style="border-collapse:collapse;width:100%">
      ${row("Service", help)}
      ${row("Move date", q.date || "—")}
      ${row("From", fromCell)}
      ${row("To", toCell)}
      ${row("Distance", distance)}
      ${row("Size", size)}
      ${row("Special items", q.specialItems || "—")}
      ${row("Name", fullName)}
      ${row("Email", `<a href="mailto:${q.email}" style="color:#c0392b">${q.email}</a>`)}
      ${row("Phone", `<a href="tel:${q.phone}" style="color:#c0392b">${q.phone}</a>`)}
      ${row("Source", q.source || "—")}
    </table>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [to],
        reply_to: q.email,
        subject: `New quote: ${fullName} · ${help}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[booking] Resend failed:", res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[booking] Resend threw:", err);
    return false;
  }
}

async function sendTelegram(text: string, q: QuoteInput): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("[booking] TELEGRAM_BOT_TOKEN/CHAT_ID missing — telegram skipped");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[booking] Telegram failed:", res.status, detail, "lead:", q.email);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[booking] Telegram threw:", err, "lead:", q.email);
    return false;
  }
}

/** Driving distance + time via the Google Routes API. Uses a server-side key
 *  (GOOGLE_MAPS_SERVER_KEY — no referrer restriction, restricted to Routes API).
 *  Returns e.g. "12.4 mi · 22 min drive", or "" when unavailable. */
async function computeRoute(from: string, to: string): Promise<string> {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key || !from || !to) return "";
  try {
    const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({
        origin: { address: from },
        destination: { address: to },
        travelMode: "DRIVE",
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const r = data?.routes?.[0];
    if (!r) return "";
    const miles = r.distanceMeters ? r.distanceMeters / 1609.344 : 0;
    const secs = r.duration ? parseInt(String(r.duration).replace(/\D/g, ""), 10) : 0;
    const mins = Math.round(secs / 60);
    const dur = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;
    return miles ? `${miles.toFixed(1)} mi · ${dur} drive` : "";
  } catch {
    return "";
  }
}

const sha256 = (v: string) =>
  createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

function cookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie") || "";
  return new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(raw)?.[1];
}

/** Server-side Lead event to the Meta Conversions API. Shares event_id with
 *  the browser pixel so Meta deduplicates; enriched with fbp/fbc/ip/ua. */
async function sendMetaCapi(
  q: QuoteInput,
  eventId: string | undefined,
  req: Request,
): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !token) {
    console.error("[booking] Meta pixel id / access token missing — CAPI skipped");
    return false;
  }

  const digits = q.phone.replace(/\D/g, "");
  const phone = digits.length === 10 ? `1${digits}` : digits;

  const userData: Record<string, unknown> = {
    em: [sha256(q.email)],
    ph: [sha256(phone)],
    fn: [sha256(q.firstName)],
  };
  if (q.lastName) userData.ln = [sha256(q.lastName)];
  const fbp = cookie(req, "_fbp");
  const fbc = cookie(req, "_fbc");
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  const ua = req.headers.get("user-agent");
  if (ua) userData.client_user_agent = ua;
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  if (ip) userData.client_ip_address = ip;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url:
          req.headers.get("referer") || process.env.NEXT_PUBLIC_SITE_URL || undefined,
        user_data: userData,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[booking] Meta CAPI failed:", res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[booking] Meta CAPI threw:", err);
    return false;
  }
}

/** Confirmation email to the CUSTOMER (separate from the lead-notification
 *  email that goes to hello@toromovers.net). Friendly, short, no quote yet —
 *  Diler closes the price on the phone. */
async function sendClientConfirmationEmail(
  q: QuoteInput,
  fullName: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!apiKey || !q.email) return false;

  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff;font:15px/1.55 system-ui,sans-serif;color:#0A0A0A">
    <h2 style="font:600 22px/1.3 system-ui,sans-serif;margin:0 0 12px">Thanks, ${q.firstName} — we got your request.</h2>
    <p>A team member will contact you in a couple minutes to confirm details and lock in your slot. You'll also get a text from us.</p>
    <p style="margin-top:18px">If you'd like to speed things up, give us a call:</p>
    <p style="font:600 17px system-ui,sans-serif;margin:4px 0 20px"><a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">(689) 600-2720</a></p>
    <p style="color:#6B6B72;font-size:13px;margin-top:24px">Family-owned · Up-front hourly pricing · Hablamos español</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [q.email],
        subject: `We got your moving request — Toro Movers`,
        html,
        text: `Hi ${q.firstName}, thanks for your request. A team member will contact you in a couple minutes. Speed it up by calling (689) 600-2720. — Toro Movers`,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[booking] client confirmation email threw:", err);
    return false;
  }
}

/** Upsert the lead into HubSpot so follow-up (sequences, tasks, pipeline) can
 *  start. Keyed on email so a returning customer updates the same contact
 *  instead of creating a dupe. Only standard properties are used so it never
 *  400s on a missing custom field. Gated on HUBSPOT_TOKEN (private app token). */
async function createHubspotContact(
  q: QuoteInput,
  fullName: string,
  help: string,
  distance: string,
  text: string,
): Promise<boolean> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return false;
  if (!q.email && !q.phone) return false; // nothing to key/contact on

  const properties: Record<string, string> = {
    firstname: q.firstName,
    lifecyclestage: "lead",
    hs_lead_status: "NEW",
    message: text, // full move summary lands on the contact record
  };
  if (q.lastName) properties.lastname = q.lastName;
  if (q.email) properties.email = q.email;
  if (q.phone) properties.phone = q.phone;
  if (q.lang) properties.hs_language = q.lang; // drives follow-up language

  // Upsert by email when we have one (avoids dupes on repeat requests);
  // otherwise plain create.
  const h = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const useUpsert = Boolean(q.email);
  const url = useUpsert
    ? "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert"
    : "https://api.hubapi.com/crm/v3/objects/contacts";
  const payload = useUpsert
    ? { inputs: [{ idProperty: "email", id: q.email, properties }] }
    : { properties };

  let contactId: string | undefined;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: h,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[booking] HubSpot failed:", res.status, detail, "lead:", q.email || q.phone);
      return false;
    }
    const d = await res.json().catch(() => null);
    contactId = useUpsert ? d?.results?.[0]?.id : d?.id;
  } catch (err) {
    console.error("[booking] HubSpot threw:", err, "lead:", q.email || q.phone);
    return false;
  }

  // Create a deal in the "Mudanzas" pipeline (New Lead stage) when the contact
  // has none yet — so quote-wizard leads land in the same pipeline as the
  // ad-funnel leads instead of sitting as a contact with no deal.
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
              dealname: `${fullName} — ${help}`,
              pipeline: "2345196253",
              dealstage: "3821600460",
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
      /* contact upserted — still a success even if the deal step fails */
    }
  }
  return true;
}
