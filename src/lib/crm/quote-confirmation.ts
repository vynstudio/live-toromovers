/**
 * Client SMS: quote request received (OpenPhone / Quo).
 * Mentions next step: book online after we confirm pricing.
 */

import { sendSms } from "./providers";
import type { ChannelResult } from "./types";
import { PHONE_DISPLAY, SQUARE_BOOKING_URL } from "@/lib/contact";

const PHONE = PHONE_DISPLAY;
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
      `Reseñas: ${MAPS} · Dudas: ${PHONE}. Responde STOP para salir.`
    );
  }
  return (
    `Hi ${name}, this is Toro Movers — we got your quote request. ` +
    `We'll call you soon with pricing and availability. ` +
    `Reviews: ${MAPS} · Questions? ${PHONE}. Reply STOP to opt out.`
  );
}

/** After quote call — ready to lock the date via Square */
export function quoteReadyToBookSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = (opts.firstName || "there").trim().split(/\s+/)[0] || "there";
  if (opts.lang === "es") {
    return (
      `Hola ${name}, Toro — si el precio te funciona, agenda online (depósito en Square): ${SQUARE_BOOKING_URL} ` +
      `O llama ${PHONE}. STOP para salir.`
    );
  }
  return (
    `Hi ${name}, Toro — if the quote works, book online (deposit via Square): ${SQUARE_BOOKING_URL} ` +
    `Or call ${PHONE}. Reply STOP to opt out.`
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
