/**
 * Toro CRM channel providers — Resend, OpenPhone (Quo), Telegram, HubSpot.
 * Fail-soft: each helper returns boolean / ChannelResult, never throws to callers.
 */

import { normalizePhone } from "@/lib/verify";
import type { ChannelResult } from "./types";

const RESEND = "https://api.resend.com/emails";
const OPENPHONE = "https://api.openphone.com/v1/messages"; // Quo = same OpenPhone API
const HS = "https://api.hubapi.com";

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
}): Promise<ChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
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
  const from =
    process.env.OPENPHONE_FROM_NUMBER || process.env.QUO_FROM_NUMBER;
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
      console.error("[crm/openphone]", res.status, t.slice(0, 200));
      return { ok: false, channel: "openphone", detail: `HTTP ${res.status}` };
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

/* ------------------------------------------------------------------ */
/* HubSpot low-level helpers                                           */
/* ------------------------------------------------------------------ */

function hsHeaders(): HeadersInit | null {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function hsSearchContactByEmail(
  email: string,
): Promise<string | null> {
  const h = hsHeaders();
  if (!h || !email) return null;
  try {
    const res = await fetch(`${HS}/crm/v3/objects/contacts/search`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: "email", operator: "EQ", value: email },
            ],
          },
        ],
        properties: ["email", "phone", "firstname"],
        limit: 1,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function hsSearchContactByPhone(
  phoneRaw: string,
): Promise<string | null> {
  const h = hsHeaders();
  const phone = normalizePhone(phoneRaw);
  if (!h || !phone) return null;
  // Try E.164 and bare 10-digit variants
  const digits = phone.replace(/\D/g, "");
  const variants = Array.from(
    new Set([phone, digits, digits.length === 11 ? digits.slice(1) : digits]),
  );
  try {
    for (const value of variants) {
      const res = await fetch(`${HS}/crm/v3/objects/contacts/search`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: "phone", operator: "EQ", value },
              ],
            },
            {
              filters: [
                { propertyName: "mobilephone", operator: "EQ", value },
              ],
            },
          ],
          properties: ["email", "phone", "firstname"],
          limit: 1,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const id = data?.results?.[0]?.id;
      if (id) return id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function hsPatchContact(
  contactId: string,
  properties: Record<string, string>,
): Promise<boolean> {
  const h = hsHeaders();
  if (!h) return false;
  try {
    const res = await fetch(`${HS}/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ properties }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function hsGetDealIdsForContact(
  contactId: string,
): Promise<string[]> {
  const h = hsHeaders();
  if (!h) return [];
  try {
    const res = await fetch(
      `${HS}/crm/v3/objects/contacts/${contactId}/associations/deals`,
      { headers: h },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.results || [])
      .map((r: { id?: string; toObjectId?: string }) => r.id || r.toObjectId)
      .filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export async function hsPatchDeal(
  dealId: string,
  properties: Record<string, string>,
): Promise<boolean> {
  const h = hsHeaders();
  if (!h) return false;
  try {
    const res = await fetch(`${HS}/crm/v3/objects/deals/${dealId}`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ properties }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function hsCreateContact(
  properties: Record<string, string>,
): Promise<string | null> {
  const h = hsHeaders();
  if (!h) return null;
  try {
    const res = await fetch(`${HS}/crm/v3/objects/contacts`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) {
      console.error("[crm/hubspot] create contact", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    return data?.id ?? null;
  } catch (err) {
    console.error("[crm/hubspot] create threw", err);
    return null;
  }
}

export async function hsCreateDeal(opts: {
  dealname: string;
  pipeline: string;
  dealstage: string;
  contactId: string;
}): Promise<string | null> {
  const h = hsHeaders();
  if (!h) return null;
  try {
    const res = await fetch(`${HS}/crm/v3/objects/deals`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        properties: {
          dealname: opts.dealname,
          pipeline: opts.pipeline,
          dealstage: opts.dealstage,
        },
        associations: [
          {
            to: { id: opts.contactId },
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
    if (!res.ok) {
      console.error("[crm/hubspot] create deal", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    return data?.id ?? null;
  } catch {
    return null;
  }
}
