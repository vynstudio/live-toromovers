/**
 * Channel providers — Resend, OpenPhone (Quo), Telegram.
 * HubSpot removed. Fail-soft: never throws to callers.
 */

import { normalizePhone } from "@/lib/verify";
import { resolveOpenPhoneSmsFrom } from "@/config/business";
import type { ChannelResult } from "./types";

const RESEND = "https://api.resend.com/emails";
const OPENPHONE = "https://api.openphone.com/v1/messages"; // Quo = same OpenPhone API

/* ------------------------------------------------------------------ */
/* Resend                                                              */
/* ------------------------------------------------------------------ */

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  fromName?: string;
  /** Base64-encoded file attachments (Resend). */
  attachments?: { filename: string; content: string }[];
}): Promise<ChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
  // Client-facing from address (must be verified in Resend)
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!apiKey) {
    return { ok: false, channel: "resend", detail: "RESEND_API_KEY missing" };
  }
  try {
    const res = await fetch(RESEND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${opts.fromName || "Toro Movers"} <${from}>`,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        reply_to: opts.replyTo || from,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.attachments?.length
          ? { attachments: opts.attachments }
          : {}),
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[crm/resend]", res.status, t.slice(0, 200));
      return { ok: false, channel: "resend", detail: `HTTP ${res.status}` };
    }
    return { ok: true, channel: "resend" };
  } catch (err) {
    console.error("[crm/resend] threw", err);
    return { ok: false, channel: "resend", detail: "threw" };
  }
}

/** @deprecated Prefer Telegram for internal alerts. Kept for rare ops use. */
export async function sendTeamEmail(subject: string, html: string, text: string) {
  const to =
    process.env.LEAD_NOTIFICATION_EMAIL ||
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "hello@toromovers.net";
  return sendEmail({ to, subject, html, text });
}

/* ------------------------------------------------------------------ */
/* OpenPhone / Quo SMS                                                 */
/* ------------------------------------------------------------------ */

export async function sendSms(toRaw: string, content: string): Promise<ChannelResult> {
  const apiKey = process.env.OPENPHONE_API_KEY || process.env.QUO_API_KEY;
  const from = resolveOpenPhoneSmsFrom();
  if (!apiKey || !from) {
    return {
      ok: false,
      channel: "openphone",
      detail: "OPENPHONE_API_KEY / OPENPHONE_FROM_NUMBER missing",
    };
  }
  const to = normalizePhone(toRaw);
  if (!to || to.length < 11) {
    return { ok: false, channel: "openphone", detail: "invalid phone" };
  }
  try {
    const res = await fetch(OPENPHONE, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], content }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[crm/openphone]", res.status, t.slice(0, 400), "to=", to);
      let msg = `HTTP ${res.status}`;
      try {
        const j = JSON.parse(t) as { error?: { message?: string }; message?: string };
        msg = j?.error?.message || j?.message || msg;
      } catch {
        if (t) msg = `${msg}: ${t.slice(0, 180)}`;
      }
      return { ok: false, channel: "openphone", detail: msg };
    }
    return { ok: true, channel: "openphone" };
  } catch (err) {
    console.error("[crm/openphone] threw", err);
    return { ok: false, channel: "openphone", detail: "threw" };
  }
}

/* ------------------------------------------------------------------ */
/* Telegram                                                            */
/* ------------------------------------------------------------------ */

export async function sendTelegram(
  text: string,
  replyMarkup?: object,
): Promise<ChannelResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return {
      ok: false,
      channel: "telegram",
      detail: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing",
    };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[crm/telegram]", res.status, t.slice(0, 200));
      return { ok: false, channel: "telegram", detail: `HTTP ${res.status}` };
    }
    return { ok: true, channel: "telegram" };
  } catch (err) {
    console.error("[crm/telegram] threw", err);
    return { ok: false, channel: "telegram", detail: "threw" };
  }
}

/** Send a PDF (or any file) to the team Telegram chat. */
export async function sendTelegramDocument(opts: {
  filename: string;
  bytes: Buffer;
  caption?: string;
}): Promise<ChannelResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return {
      ok: false,
      channel: "telegram",
      detail: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing",
    };
  }
  try {
    const form = new FormData();
    form.append("chat_id", chatId);
    if (opts.caption) {
      form.append("caption", opts.caption.slice(0, 1024));
    }
    const blob = new Blob([new Uint8Array(opts.bytes)], {
      type: "application/pdf",
    });
    form.append("document", blob, opts.filename);

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendDocument`,
      { method: "POST", body: form },
    );
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[crm/telegram-doc]", res.status, t.slice(0, 200));
      return { ok: false, channel: "telegram", detail: `HTTP ${res.status}` };
    }
    return { ok: true, channel: "telegram" };
  } catch (err) {
    console.error("[crm/telegram-doc] threw", err);
    return { ok: false, channel: "telegram", detail: "threw" };
  }
}


