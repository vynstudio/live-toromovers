/**
 * Single allowed client SMS: quote request received.
 * Sent via Quo / OpenPhone only — no HubSpot, no n8n, no multi-step plan.
 */

import { sendSms } from "./providers";
import type { ChannelResult } from "./types";

const PHONE = "(689) 600-2720";

export function quoteReceivedSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = (opts.firstName || "there").trim().split(/\s+/)[0] || "there";
  if (opts.lang === "es") {
    return (
      `Hola ${name}, recibimos tu solicitud de cotización con Toro Movers. ` +
      `Te contactaremos pronto con precio y disponibilidad. ` +
      `Preguntas: ${PHONE}. Responde STOP para salir.`
    );
  }
  return (
    `Hi ${name}, we got your quote request with Toro Movers. ` +
    `We'll contact you soon with pricing and availability. ` +
    `Questions? Call ${PHONE}. Reply STOP to opt out.`
  );
}

/** One SMS only. No email. No follow-ups. */
export async function sendQuoteReceivedConfirmation(opts: {
  firstName: string;
  phone?: string;
  lang?: "en" | "es";
  /** If false, skip SMS (no consent) */
  consentSms?: boolean;
}): Promise<ChannelResult> {
  if (opts.consentSms === false) {
    return { ok: false, channel: "openphone", detail: "no SMS consent" };
  }
  if (!opts.phone?.trim()) {
    return { ok: false, channel: "openphone", detail: "no phone" };
  }
  const body = quoteReceivedSms({
    firstName: opts.firstName,
    lang: opts.lang,
  });
  return sendSms(opts.phone, body);
}
