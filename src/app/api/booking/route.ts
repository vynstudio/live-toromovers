import { NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  BookingSchema,
  HELP_LABEL,
  RESIDENCE_LABEL,
  FLOOR_LABEL,
  SIZE_LABEL,
  type QuoteInput,
} from "@/lib/booking-schema";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
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
  const fromRes = RESIDENCE_LABEL[q.fromResidence]?.en ?? q.fromResidence;
  const toRes = RESIDENCE_LABEL[q.toResidence]?.en ?? q.toResidence;
  const fromFloor = q.fromFloor ? ` · ${FLOOR_LABEL[q.fromFloor]?.en ?? q.fromFloor}` : "";
  const toFloor = q.toFloor ? ` · ${FLOOR_LABEL[q.toFloor]?.en ?? q.toFloor}` : "";
  const size = q.size ? (SIZE_LABEL[q.size]?.en ?? q.size) : "—";

  // Plain-text summary reused by both notification channels.
  const text = [
    `🚚 New quote request — Toro Movers`,
    ``,
    `Service: ${help}`,
    `Move date: ${q.date}`,
    `From: ${q.fromAddress} (${fromRes}${fromFloor})`,
    `To: ${q.toAddress} (${toRes}${toFloor})`,
    `Size: ${size}`,
    `Special items: ${q.specialItems || "—"}`,
    ``,
    `${q.firstName} ${q.lastName}`,
    `${q.email}`,
    `${q.phone}`,
  ].join("\n");

  // Notify (email + Telegram) and report the conversion to Meta in parallel.
  const results = await Promise.allSettled([
    sendEmail(q, help, fromRes, toRes, fromFloor, toFloor, size, text),
    sendTelegram(text, q),
    sendMetaCapi(q, eventId, req),
  ]);
  const emailed = results[0].status === "fulfilled" && results[0].value === true;
  const telegrammed = results[1].status === "fulfilled" && results[1].value === true;
  const capi = results[2].status === "fulfilled" && results[2].value === true;

  if (!emailed && !telegrammed) {
    console.error("[booking] NO notification channel delivered the lead:", JSON.stringify(q));
  }

  return NextResponse.json({ ok: true, emailed, telegrammed, capi });
}

async function sendEmail(
  q: QuoteInput,
  help: string,
  fromRes: string,
  toRes: string,
  fromFloor: string,
  toFloor: string,
  size: string,
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

  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff">
    <h2 style="font:600 18px/1.3 system-ui,sans-serif;color:#141414;margin:0 0 4px">New quote request — Toro Movers</h2>
    <p style="font:14px/1.5 system-ui,sans-serif;color:#6a6a6a;margin:0 0 22px">${q.firstName} ${q.lastName} just requested a quote.</p>
    <table style="border-collapse:collapse;width:100%">
      ${row("Service", help)}
      ${row("Move date", q.date)}
      ${row("From", `${q.fromAddress}<br><span style="color:#8a8a8a">${fromRes}${fromFloor}</span>`)}
      ${row("To", `${q.toAddress}<br><span style="color:#8a8a8a">${toRes}${toFloor}</span>`)}
      ${row("Size", size)}
      ${row("Special items", q.specialItems || "—")}
      ${row("Name", `${q.firstName} ${q.lastName}`)}
      ${row("Email", `<a href="mailto:${q.email}" style="color:#c0392b">${q.email}</a>`)}
      ${row("Phone", `<a href="tel:${q.phone}" style="color:#c0392b">${q.phone}</a>`)}
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
        subject: `New quote: ${q.firstName} ${q.lastName} · ${help}`,
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
    ln: [sha256(q.lastName)],
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
