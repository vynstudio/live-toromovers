/**
 * Single allowed client SMS: quote request received.
 * Sent via Quo / OpenPhone only.
 */

import { sendSms } from "./providers";
import type { ChannelResult } from "./types";

const PHONE = "(689) 600-2720";
/** Google Maps listing — reviews while we call */
const MAPS =
  process.env.GOOGLE_MAPS_REVIEWS_URL ||
  "https://maps.app.goo.gl/HBfjZzWu2YbdXUW1A?g_st=ic";

export function quoteReceivedSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = (opts.firstName || "there").trim().split(/\s+/)[0] || "there";
  if (opts.lang === "es") {
    return (
      `Hola ${name}, somos Toro Movers — recibimos tu solicitud de cotización. ` +
      `Te llamamos pronto con precio y disponibilidad. ` +
      `Mientras tanto, mira nuestras reseñas en Google Maps: ${MAPS} ` +
      `Dudas: ${PHONE}. Responde STOP para salir.`
    );
  }
  return (
    `Hi ${name}, this is Toro Movers — we got your quote request. ` +
    `We'll call you soon with pricing and availability. ` +
    `While you wait, take a look at Toro Movers on Google Maps: ${MAPS} ` +
    `Questions? ${PHONE}. Reply STOP to opt out.`
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
