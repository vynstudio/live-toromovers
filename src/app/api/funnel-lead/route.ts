import { NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  FunnelLeadSchema,
  FUNNEL_LABEL,
  type FunnelLeadInput,
} from "@/lib/funnel-schema";
import { normalizePhone } from "@/lib/verify";
import { upsertLeadToHubspot, telegramStageKeyboard } from "@/lib/hubspot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";
const QUOTE_URL = `${SITE_URL}/quote`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  // Spam filter: honeypot filled, or submitted implausibly fast (bots).
  const hp = typeof body?.hp === "string" ? body.hp.trim() : "";
  const elapsedMs = typeof body?.elapsedMs === "number" ? body.elapsedMs : Infinity;
  if (hp !== "" || elapsedMs < 1500) {
    return NextResponse.json({ ok: true });
  }

  const parsed = FunnelLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const lead = parsed.data;
  const isLabor = lead.funnel === "labor";
  const funnelLabel = FUNNEL_LABEL[lead.funnel];
  const phone = lead.phone.trim();

  const details = isLabor
    ? `Help needed: ${lead.helpNeeded?.length ? lead.helpNeeded.join(", ") : "—"}`
    : `Property: ${lead.propertyType || "—"} · Packing: ${lead.packingHelp ? "yes" : "no"}`;

  const text = [
    `${isLabor ? "💪" : "⭐"} New ${funnelLabel.toUpperCase()} lead — Toro Movers`,
    ``,
    `Name: ${lead.firstName}`,
    `Phone: ${phone}`,
    `Email: ${lead.email}`,
    `City: ${lead.city}`,
    `Move date: ${lead.moveDate}`,
    details,
    `SMS consent: ${lead.smsConsent ? "yes" : "no"}`,
    `Language: ${lead.lang || "en"}`,
    `Landing: ${lead.landingPage || "—"}`,
    `Source: ${lead.source || "—"}`,
    ``,
    `Funnel: ${funnelLabel}`,
  ].join("\n");

  const wantsSms = Boolean(lead.smsConsent && phone);

  const results = await Promise.allSettled([
    sendCustomerEmail(lead, isLabor),
    sendTeamAlertEmail(lead, funnelLabel, details, text),
    sendTelegram(text, lead.email),
    wantsSms ? sendConfirmationSms(normalizePhone(phone), lead.firstName, isLabor) : Promise.resolve(false),
    sendMetaCapi(lead, phone, req),
    upsertHubspotContact(lead, phone, funnelLabel, details, text),
    postToN8n(lead, phone, funnelLabel),
  ]);

  const ok = (i: number) =>
    results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<boolean>).value === true;

  const customerEmailed = ok(0);
  const teamAlerted = ok(1) || ok(2);
  if (!customerEmailed && !teamAlerted) {
    console.error("[funnel-lead] NO channel delivered the lead:", lead.funnel, lead.email, phone);
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
/* Customer confirmation email — funnel-specific tone                  */
/* ------------------------------------------------------------------ */

async function sendCustomerEmail(lead: FunnelLeadInput, isLabor: boolean): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!apiKey || !lead.email) {
    if (!apiKey) console.error("[funnel-lead] RESEND_API_KEY missing — customer email skipped");
    return false;
  }

  const headline = isLabor
    ? `Thanks, ${escapeHtml(lead.firstName)} — your labor-only request is in.`
    : `Thanks, ${escapeHtml(lead.firstName)} — your full-service request is in.`;
  const line = isLabor
    ? "A Toro Movers team member will call you shortly to check availability and confirm your up-front hourly rate. You'll get a text too."
    : "A Toro Movers team member will call you shortly to check availability and put together your full-service pricing. You'll get a text too.";

  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff;font:15px/1.6 system-ui,sans-serif;color:#0A0A0A">
    <h2 style="font:600 22px/1.3 system-ui,sans-serif;margin:0 0 10px">${headline}</h2>
    <p style="margin:0 0 18px;color:#3A3A3A">${line}</p>
    <p style="margin:0 0 4px">Want to speed it up? Call us now:</p>
    <p style="font:600 18px system-ui,sans-serif;margin:4px 0 20px"><a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">(689) 600-2720</a></p>
    <p style="margin:0 0 22px"><a href="${QUOTE_URL}" style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;font:600 15px system-ui,sans-serif;padding:12px 22px;border-radius:8px">Review your quote details →</a></p>
    <p style="color:#6B6B72;font-size:13px;margin:24px 0 0;border-top:1px solid #ECECEC;padding-top:16px">Family-owned · Fully insured · Up-front hourly pricing · Hablamos español<br>Toro Movers · (689) 600-2720</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [lead.email],
        reply_to: from,
        subject: isLabor
          ? "Your labor-only moving request — Toro Movers"
          : "Your full-service moving request — Toro Movers",
        html,
        text: `Hi ${lead.firstName}, ${line} Speed it up: (689) 600-2720. Review details: ${QUOTE_URL} — Toro Movers`,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[funnel-lead] customer Resend threw:", err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Internal alerts                                                     */
/* ------------------------------------------------------------------ */

async function sendTeamAlertEmail(
  lead: FunnelLeadInput,
  funnelLabel: string,
  details: string,
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
    <h2 style="font:600 18px/1.3 system-ui,sans-serif;color:#141414;margin:0 0 4px">${escapeHtml(funnelLabel)} lead — ${escapeHtml(lead.firstName)}</h2>
    <p style="font:14px/1.5 system-ui,sans-serif;color:#6a6a6a;margin:0 0 18px">${escapeHtml(lead.city)} · ${escapeHtml(lead.moveDate)} · ${escapeHtml(details)}</p>
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
        subject: `${funnelLabel} lead: ${lead.firstName} · ${lead.city}`,
        html,
        text,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[funnel-lead] team Resend threw:", err);
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

async function sendConfirmationSms(
  phone: string,
  firstName: string,
  isLabor: boolean,
): Promise<boolean> {
  const apiKey = process.env.OPENPHONE_API_KEY;
  const fromNumber = process.env.OPENPHONE_FROM_NUMBER;
  if (!apiKey || !fromNumber) return false;
  const what = isLabor ? "labor-only" : "full-service";
  try {
    const res = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromNumber,
        to: [phone],
        content: `Hi ${firstName}, this is Toro Movers — got your ${what} request and we'll call shortly to check availability. Reply STOP to opt out.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Meta CAPI — server-side Lead                                        */
/* ------------------------------------------------------------------ */

const sha256 = (v: string) =>
  createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

function cookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie") || "";
  return new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(raw)?.[1];
}

async function sendMetaCapi(
  lead: FunnelLeadInput,
  phone: string,
  req: Request,
): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !token) return false;

  const digits = phone.replace(/\D/g, "");
  const e164 = digits.length === 10 ? `1${digits}` : digits;
  const userData: Record<string, unknown> = {
    em: [sha256(lead.email)],
    ph: [sha256(e164)],
    fn: [sha256(lead.firstName)],
  };
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
        event_id: lead.eventId,
        action_source: "website",
        event_source_url:
          req.headers.get("referer") ||
          `${SITE_URL}/${lead.funnel === "labor" ? "labor-only-moving" : "full-service-moving"}`,
        custom_data: { content_name: `${lead.funnel}_funnel` },
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
      console.error("[funnel-lead] Meta CAPI failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[funnel-lead] Meta CAPI threw:", err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* HubSpot — upsert by email, routed by funnel                         */
/* ------------------------------------------------------------------ */

async function upsertHubspotContact(
  lead: FunnelLeadInput,
  phone: string,
  funnelLabel: string,
  details: string,
  text: string,
): Promise<boolean> {
  const completedAt = new Date().toISOString();
  const note = [text, ``, `— routing —`, `funnel_type: ${lead.funnel}`, `service: ${details}`, `completed_at: ${completedAt}`].join("\n");
  return upsertLeadToHubspot({
    email: lead.email,
    firstName: lead.firstName,
    phone,
    city: lead.city,
    lang: lead.lang,
    funnel: lead.funnel,
    serviceType: details,
    moveDate: lead.moveDate,
    utm: lead.utm,
    note,
  });
}

/* ------------------------------------------------------------------ */
/* n8n — fire-and-forget webhook (per-funnel drip)                     */
/* ------------------------------------------------------------------ */

async function postToN8n(
  lead: FunnelLeadInput,
  phone: string,
  funnelLabel: string,
): Promise<boolean> {
  const url = process.env.N8N_FUNNEL_WEBHOOK_URL;
  if (!url) return false; // drip not wired yet — instant delivery still worked
  const serviceType = lead.funnel === "labor"
    ? (lead.helpNeeded?.length ? lead.helpNeeded.join(", ") : "Labor-only")
    : [lead.propertyType, lead.packingHelp ? "with packing" : "no packing"].filter(Boolean).join(" · ");
  try {
    // Hard 2.5s cap: the drip is fire-and-forget, so a slow/unreachable n8n must
    // never delay the customer reaching the thank-you page. On timeout the fetch
    // aborts → caught below → returns false (fail-soft).
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
        event: "funnel_submit",
        funnel: lead.funnel,
        funnelLabel,
        serviceType,
        firstName: lead.firstName,
        email: lead.email,
        phone,
        consentSms: Boolean(lead.smsConsent && phone),
        smsConsent: Boolean(lead.smsConsent && phone), // kept for the imported workflow's field name
        consentEmail: true, // form submit implies email opt-in for transactional + nurture
        city: lead.city,
        moveDate: lead.moveDate,
        helpNeeded: lead.helpNeeded || [],
        propertyType: lead.propertyType || "",
        packingHelp: Boolean(lead.packingHelp),
        lang: lead.lang || "en",
        source: lead.source || "",
        landingPage: lead.landingPage || "",
        utm: lead.utm || {},
        links: { quote: QUOTE_URL },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[funnel-lead] n8n webhook failed (non-blocking):", err instanceof Error ? err.name : err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}
