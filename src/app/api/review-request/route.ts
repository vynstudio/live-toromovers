import { NextResponse } from "next/server";

// ===========================================================================
// REVIEW REQUEST — automate the post-job Google review ask.
// ---------------------------------------------------------------------------
// After a completed move, a caller (n8n off the Telegram "🚚 Move Done" button,
// Zapier, or a manual quick-fire) POSTs the customer here and they get a text
// (and/or email) with the Google review link. A steady drip of Google reviews
// is the single biggest local-pack lever, so this turns "remember to ask for a
// review" into one automated step.
//
// Auth: header `x-lead-secret` === env LEAD_INTAKE_SECRET (same secret the
// universal /api/lead endpoint uses — callers already have it). If the env var
// is unset the endpoint is inert (503).
//
// Body (JSON): {
//   name (required),
//   phone?  — E.164 or US 10/11-digit; SMS sent if present + OpenPhone configured
//   email?  — email sent if present (and SMS not the only channel) + Resend configured
//   lang?   — "es" | "en" (default "en")
// }  — at least one of phone/email is required.
//
// Review link: env GOOGLE_REVIEW_URL, else the live GBP link.
// ===========================================================================

const REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL || "https://g.page/r/CYAKurQHh5TvEAI/review";

type Payload = Record<string, string>;

function normalizePhone(v: string): string {
  const d = String(v || "").replace(/\D/g, "");
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d[0] === "1") return "+" + d;
  return d ? "+" + d : "";
}

function smsCopy(firstName: string, lang: string): string {
  if (lang === "es") {
    return `Hola ${firstName}, ¡gracias por mudarte con Toro Movers! 🚚 Si el equipo hizo buen trabajo, una reseña en Google nos ayuda muchísimo: ${REVIEW_URL} — Toro Movers. Responde STOP para no recibir más.`;
  }
  return `Hi ${firstName}, thanks for moving with Toro Movers! 🚚 If the crew did a great job, a quick Google review really helps our family business: ${REVIEW_URL} — Toro Movers. Reply STOP to opt out.`;
}

function emailCopy(
  firstName: string,
  lang: string,
): { subject: string; html: string } {
  if (lang === "es") {
    return {
      subject: "¿Cómo estuvo tu mudanza? 🚚",
      html: `<p>Hola ${firstName},</p><p>¡Gracias por elegir Toro Movers! Si todo salió bien, ¿nos dejarías una reseña en Google? Toma 30 segundos y ayuda muchísimo a nuestro negocio familiar:</p><p><a href="${REVIEW_URL}">Dejar una reseña en Google</a></p><p>— El equipo de Toro Movers · (689) 600-2720</p>`,
    };
  }
  return {
    subject: "How was your move? 🚚",
    html: `<p>Hi ${firstName},</p><p>Thank you for choosing Toro Movers! If everything went well, would you take 30 seconds to leave us a Google review? It genuinely helps our small family business:</p><p><a href="${REVIEW_URL}">Leave a Google review</a></p><p>— The Toro Movers team · (689) 600-2720</p>`,
  };
}

export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "not configured (set LEAD_INTAKE_SECRET)" },
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

  const name = (p.name || "").trim();
  const email = (p.email || "").trim();
  const phone = normalizePhone((p.phone || "").trim());
  const lang = (p.lang || "").trim().toLowerCase() === "es" ? "es" : "en";
  if (!name || (!phone && !email)) {
    return NextResponse.json(
      { error: "name and (phone or email) required" },
      { status: 422 },
    );
  }
  const firstName = name.split(/\s+/)[0] || name;

  const tasks: Array<Promise<boolean>> = [];
  const channels: string[] = [];
  if (phone) {
    channels.push("sms");
    tasks.push(openphoneSms(phone, smsCopy(firstName, lang)));
  }
  if (email) {
    channels.push("email");
    tasks.push(resendEmail(email, emailCopy(firstName, lang)));
  }

  const results = await Promise.allSettled(tasks);
  const out: Record<string, boolean> = {};
  channels.forEach((c, i) => {
    const r = results[i];
    out[c] =
      r.status === "fulfilled" && (r as PromiseFulfilledResult<boolean>).value;
  });

  const anyOk = Object.values(out).some(Boolean);
  // Team gets a heads-up either way (so a misconfig is visible in Telegram).
  await telegram(
    `${anyOk ? "✅" : "⚠️"} Review request ${anyOk ? "sent" : "FAILED"} → ${name} (${channels.join("+") || "no channel"})${out.sms === false ? " · sms✗" : ""}${out.email === false ? " · email✗" : ""}`,
  );

  return NextResponse.json({ ok: anyOk, ...out });
}

/* ---- OpenPhone SMS (mirrors /api/ad-funnel) ---- */
async function openphoneSms(phone: string, content: string): Promise<boolean> {
  const key = process.env.OPENPHONE_API_KEY;
  const from = process.env.OPENPHONE_FROM_NUMBER;
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: { Authorization: key, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [phone], content }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---- Resend email (mirrors /api/ad-funnel) ---- */
async function resendEmail(
  email: string,
  msg: { subject: string; html: string },
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [email],
        reply_to: from,
        subject: msg.subject,
        html: msg.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ---- Telegram team confirmation (reuses the lead bot) ---- */
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
