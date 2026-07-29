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

/** Keep "" as blank separator lines (filter(Boolean) would strip them). */
function lines(...parts: (string | false | null | undefined)[]): string {
  return parts
    .filter((p): p is string => p !== null && p !== undefined && p !== false)
    .join("\n");
}

export function quoteReceivedSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = (opts.firstName || "there").trim().split(/\s+/)[0] || "there";
  if (opts.lang === "es") {
    return lines(
      `Hola ${name} — Toro Movers`,
      ``,
      `Recibimos tu solicitud de cotización.`,
      `Te llamamos pronto con precio y disponibilidad.`,
      ``,
      `Reseñas:`,
      MAPS,
      ``,
      `Dudas: ${PHONE}`,
      ``,
      `Responde STOP para salir.`,
    );
  }
  return lines(
    `Hi ${name} — Toro Movers`,
    ``,
    `We got your quote request.`,
    `We'll call you soon with pricing and availability.`,
    ``,
    `Reviews:`,
    MAPS,
    ``,
    `Questions? ${PHONE}`,
    ``,
    `Reply STOP to opt out.`,
  );
}

/** After quote call — ready to lock the date via Square */
export function quoteReadyToBookSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = (opts.firstName || "there").trim().split(/\s+/)[0] || "there";
  if (opts.lang === "es") {
    return lines(
      `Hola ${name} — Toro Movers`,
      ``,
      `Si el precio te funciona, agenda online.`,
      `El depósito se paga en Square al reservar.`,
      ``,
      `Book online:`,
      SQUARE_BOOKING_URL,
      ``,
      `O llama: ${PHONE}`,
      ``,
      `Responde STOP para salir.`,
    );
  }
  return lines(
    `Hi ${name} — Toro Movers`,
    ``,
    `If the quote works, book your date online.`,
    `Deposit is paid in Square when you reserve.`,
    ``,
    `Book here:`,
    SQUARE_BOOKING_URL,
    ``,
    `Or call: ${PHONE}`,
    ``,
    `Reply STOP to opt out.`,
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
