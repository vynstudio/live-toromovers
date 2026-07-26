import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createHash } from "crypto";
import {
  LeadMagnetSchema,
  MOVE_TYPE_LABEL,
  type LeadMagnetInput,
} from "@/lib/lead-magnet-schema";
import { normalizePhone } from "@/lib/verify";
import { upsertLeadToHubspot, telegramStageKeyboard } from "@/lib/hubspot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";
const PDF_URL = `${SITE_URL}/central-florida-moving-checklist.pdf`;
const WEB_CHECKLIST_URL = `${SITE_URL}/checklist`;
const QUOTE_URL = `${SITE_URL}/quote`;

export async function POST(req: Request) {
  // Rate-limit public form submits per IP to blunt bot spam (best-effort, fails open).
  const rl = await rateLimit({ key: `form:leadmagnet:${clientIp(req)}`, limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }
  const body = await req.json().catch(() => null);

  // Spam filter: honeypot filled, or submitted implausibly fast (bots) →
  // pretend success without notifying anyone (honeypot / spam).
  const hp = typeof body?.hp === "string" ? body.hp.trim() : "";
  const elapsedMs = typeof body?.elapsedMs === "number" ? body.elapsedMs : Infinity;
  if (hp !== "" || elapsedMs < 1500) {
    return NextResponse.json({ ok: true });
  }

  const parsed = LeadMagnetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const lead = parsed.data;
  const eventId = lead.eventId;
  const phone = lead.phone?.trim() || "";
  const moveLabel = MOVE_TYPE_LABEL[lead.moveType];
  const wantsSms = Boolean(lead.smsOptIn && phone);

  // Plain-text summary reused by the team alert + Telegram + HubSpot note.
  const text = [
    `📥 New checklist lead — Toro Movers`,
    ``,
    `Name: ${lead.firstName}`,
    `Email: ${lead.email}`,
    `Phone: ${phone || "—"}${wantsSms ? " (asked for SMS copy)" : ""}`,
    `City: ${lead.city}`,
    `Move type: ${moveLabel}`,
    `Move date: ${lead.moveDate?.trim() || "—"}`,
    `Language: ${lead.lang || "en"}`,
    `Source: ${lead.source || "—"}`,
    ``,
    `Magnet: Central Florida Moving Checklist`,
  ].join("\n");

  const results = await Promise.allSettled([
    sendCustomerChecklistEmail(lead, moveLabel),
    sendTeamAlertEmail(lead, moveLabel, text),
    sendTelegram(text, lead.email),
    wantsSms ? sendChecklistSms(normalizePhone(phone), lead.firstName) : Promise.resolve(false),
    sendMetaCapi(lead, phone, eventId, req),
    upsertHubspotContact(lead, phone, moveLabel, text),
    postToN8n(lead, phone, moveLabel),
  ]);

  const ok = (i: number) =>
    results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<boolean>).value === true;

  const customerEmailed = ok(0);
  const teamAlerted = ok(1) || ok(2);
  if (!customerEmailed && !teamAlerted) {
    console.error("[lead-magnet] NO channel delivered the lead:", lead.email, phone);
  }

  return NextResponse.json({
    ok: true,
    customerEmailed,
    smsSent: ok(3),
    capi: ok(4),
    crmed: ok(5),
    drip: ok(6),
  });
}

/* ------------------------------------------------------------------ */
/* Customer delivery — the actual lead magnet                          */
/* ------------------------------------------------------------------ */

async function sendCustomerChecklistEmail(
  lead: LeadMagnetInput,
  moveLabel: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!apiKey || !lead.email) {
    if (!apiKey) console.error("[lead-magnet] RESEND_API_KEY missing — customer email skipped");
    return false;
  }

  const tip =
    lead.moveType === "apartment"
      ? "Reserve the elevator and a loading spot with your building today — it's the #1 thing that slows an Orlando apartment move."
      : lead.moveType === "commercial"
        ? "Label every workstation and map where it lands at the new office — it turns a chaotic move into a fast one."
        : "Start with the rooms you use least (garage, closets, guest room). Packing those first makes the final week calm.";

  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff;font:15px/1.6 system-ui,sans-serif;color:#0A0A0A">
    <h2 style="font:600 22px/1.3 system-ui,sans-serif;margin:0 0 8px">Your Central Florida Moving Checklist, ${escapeHtml(lead.firstName)}.</h2>
    <p style="margin:0 0 20px;color:#3A3A3A">Plan your move, pack faster, and have everything ready for an accurate quote. Two ways to use it:</p>
    <table style="border-collapse:collapse;margin:0 0 22px">
      <tr><td style="padding:0 0 10px">
        <a href="${PDF_URL}" style="display:inline-block;background:#C81E3A;color:#fff;text-decoration:none;font:600 15px system-ui,sans-serif;padding:13px 22px;border-radius:8px">⬇ Download the PDF checklist</a>
      </td></tr>
      <tr><td>
        <a href="${WEB_CHECKLIST_URL}" style="color:#C81E3A;font:500 14px system-ui,sans-serif">Or use the interactive version online →</a>
      </td></tr>
    </table>
    <p style="margin:0 0 6px;font:600 14px system-ui,sans-serif">One tip for your ${escapeHtml(moveLabel.toLowerCase())}:</p>
    <p style="margin:0 0 22px;color:#3A3A3A">${tip}</p>
    <p style="margin:0 0 4px">When you're ready, we'll give you an up-front hourly price — no surprises:</p>
    <p style="margin:0 0 22px"><a href="${QUOTE_URL}" style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;font:600 15px system-ui,sans-serif;padding:12px 22px;border-radius:8px">Request a Quote →</a></p>
    <p style="color:#6B6B72;font-size:13px;margin:24px 0 0;border-top:1px solid #ECECEC;padding-top:16px">Family-owned · Local Central Florida movers · Hablamos español<br>Toro Movers · <a href="tel:+16896002720" style="color:#6B6B72">(689) 600-2720</a></p>
  </div>`;

  const textBody = [
    `Your Central Florida Moving Checklist, ${lead.firstName}.`,
    ``,
    `Download the PDF: ${PDF_URL}`,
    `Interactive version: ${WEB_CHECKLIST_URL}`,
    ``,
    `One tip for your ${moveLabel.toLowerCase()}: ${tip}`,
    ``,
    `Ready for an up-front price? Request a quote: ${QUOTE_URL}`,
    ``,
    `Family-owned · Hablamos español · Toro Movers · (689) 600-2720`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [lead.email],
        reply_to: from,
        subject: "Your Central Florida Moving Checklist",
        html,
        text: textBody,
      }),
    });
    if (!res.ok) {
      console.error("[lead-magnet] customer Resend failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lead-magnet] customer Resend threw:", err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Internal alerts                                                     */
/* ------------------------------------------------------------------ */

async function sendTeamAlertEmail(
  lead: LeadMagnetInput,
  moveLabel: string,
  text: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  const to =
    process.env.LEAD_NOTIFICATION_EMAIL ||
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    from;
  if (!apiKey) return false;

  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff">
    <h2 style="font:600 18px/1.3 system-ui,sans-serif;color:#141414;margin:0 0 4px">New checklist lead — ${escapeHtml(lead.firstName)}</h2>
    <p style="font:14px/1.5 system-ui,sans-serif;color:#6a6a6a;margin:0 0 18px">${escapeHtml(lead.city)} · ${escapeHtml(moveLabel)}</p>
    <pre style="white-space:pre-wrap;font:13px/1.5 ui-monospace,Menlo,monospace;color:#2A2A2A;background:#F7F7F8;padding:16px 18px;border-radius:8px;border:1px solid #E6E6EA">${escapeHtml(text)}</pre>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [to],
        reply_to: lead.email,
        subject: `New checklist lead: ${lead.firstName} · ${lead.city}`,
        html,
        text,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[lead-magnet] team Resend threw:", err);
    return false;
  }
}

async function sendTelegram(text: string, email?: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        reply_markup: telegramStageKeyboard(email),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Deliver the checklist by SMS too (only when the customer opted in and gave a
 *  phone). Uses OpenPhone / Quo, same creds as lib/verify. */
async function sendChecklistSms(phone: string, firstName: string): Promise<boolean> {
  const apiKey = process.env.OPENPHONE_API_KEY;
  const fromNumber = process.env.OPENPHONE_FROM_NUMBER;
  if (!apiKey || !fromNumber) return false;
  try {
    const res = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromNumber,
        to: [phone],
        content: `Hi ${firstName}, your Central Florida Moving Checklist is ready: ${PDF_URL} — Toro Movers. Reply STOP to opt out.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Meta CAPI — server-side Lead, deduped with the browser Pixel        */
/* ------------------------------------------------------------------ */

const sha256 = (v: string) =>
  createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

function cookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie") || "";
  return new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(raw)?.[1];
}

async function sendMetaCapi(
  lead: LeadMagnetInput,
  phone: string,
  eventId: string | undefined,
  req: Request,
): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !token) return false;

  const userData: Record<string, unknown> = {
    em: [sha256(lead.email)],
    fn: [sha256(lead.firstName)],
  };
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    const e164 = digits.length === 10 ? `1${digits}` : digits;
    userData.ph = [sha256(e164)];
  }
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
          req.headers.get("referer") || `${SITE_URL}/central-florida-moving-checklist`,
        custom_data: { content_name: "moving_checklist" },
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
      console.error("[lead-magnet] Meta CAPI failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lead-magnet] Meta CAPI threw:", err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* HubSpot — upsert by email, tagged as a checklist lead               */
/* ------------------------------------------------------------------ */

async function upsertHubspotContact(
  lead: LeadMagnetInput,
  phone: string,
  moveLabel: string,
  text: string,
): Promise<boolean> {
  return upsertLeadToHubspot({
    email: lead.email,
    firstName: lead.firstName,
    phone,
    city: lead.city,
    lang: lead.lang,
    funnel: "checklist",
    serviceType: moveLabel,
    moveDate: lead.moveDate?.trim() || undefined,
    utm: lead.utm,
    note: `${text}\n\nMove type: ${moveLabel}`,
  });
}

/* ------------------------------------------------------------------ */
/* n8n (on Railway) — fire-and-forget webhook that owns the drip       */
/* (5-email + 3-SMS nurture sequence). Instant delivery already        */
/* happened above; n8n is purely the follow-up scheduler.              */
/* ------------------------------------------------------------------ */

async function postToN8n(
  lead: LeadMagnetInput,
  phone: string,
  moveLabel: string,
): Promise<boolean> {
  const url = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!url) return false; // drip not wired yet — instant delivery still worked
  try {
    // Hard 2.5s cap so a slow/unreachable n8n never delays the thank-you page.
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET
          ? { "x-toro-secret": process.env.N8N_WEBHOOK_SECRET }
          : {}),
      },
      signal: AbortSignal.timeout(2500),
      body: JSON.stringify({
        event: "lead_magnet_submit",
        funnel: "checklist",
        magnet: "central-florida-moving-checklist",
        serviceType: moveLabel,
        firstName: lead.firstName,
        email: lead.email,
        phone,
        consentSms: Boolean(lead.smsOptIn && phone),
        smsOptIn: Boolean(lead.smsOptIn && phone), // kept for the imported workflow's field name
        consentEmail: true,
        city: lead.city,
        moveType: lead.moveType,
        moveLabel,
        moveDate: lead.moveDate?.trim() || "",
        lang: lead.lang || "en",
        source: lead.source || "",
        landingPage: lead.landingPage || "/central-florida-moving-checklist",
        utm: lead.utm || {},
        links: { pdf: PDF_URL, webChecklist: WEB_CHECKLIST_URL, quote: QUOTE_URL },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[lead-magnet] n8n webhook failed (non-blocking):", err instanceof Error ? err.name : err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}
