/**
 * OpenPhone / Quo SMS for the booking funnel:
 *   quote → book online (Square) → deposit → moving day checklist
 *
 * These are intentional confirmation texts (not multi-SMS drip).
 */

import { sendSms } from "./providers";
import type { ChannelResult } from "./types";
import {
  SQUARE_BOOKING_URL,
  PHONE_DISPLAY,
} from "@/lib/contact";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://toromovers.net";
const CHECKLIST = `${SITE}/move-day-checklist`;
const BOOK = SQUARE_BOOKING_URL;

export type BookingSmsKind =
  | "book_online"
  | "booked_confirm"
  | "checklist_reminder";

function firstName(name: string): string {
  return (name || "there").trim().split(/\s+/)[0] || "there";
}

/** 1) Ready to lock a date — send Square booking link */
export function bookOnlineSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);
  if (opts.lang === "es") {
    return (
      `Hola ${name}, Toro Movers — agenda tu mudanza online (depósito en Square): ${BOOK} ` +
      `O llama ${PHONE_DISPLAY}. Responde STOP para salir.`
    );
  }
  return (
    `Hi ${name}, Toro Movers — book your move date online (deposit via Square): ${BOOK} ` +
    `Or call ${PHONE_DISPLAY}. Reply STOP to opt out.`
  );
}

/** 2) Booked + deposit received — send checklist */
export function bookedConfirmSms(opts: {
  firstName: string;
  moveDate?: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);
  const dateBit = opts.moveDate?.trim()
    ? opts.lang === "es"
      ? ` para el ${opts.moveDate.trim()}`
      : ` for ${opts.moveDate.trim()}`
    : "";

  if (opts.lang === "es") {
    return (
      `✅ ${name}, tu mudanza con Toro está agendada${dateBit}. Depósito recibido. ` +
      `Checklist del día de mudanza (2 min) para mandar el crew correcto: ${CHECKLIST} ` +
      `Dudas: ${PHONE_DISPLAY}. Responde STOP para salir.`
    );
  }
  return (
    `✅ ${name}, you're booked with Toro Movers${dateBit}. Deposit received. ` +
    `Moving day checklist (2 min) so we send the right crew: ${CHECKLIST} ` +
    `Questions? ${PHONE_DISPLAY}. Reply STOP to opt out.`
  );
}

/** 3) Nudge if checklist not filled yet */
export function checklistReminderSms(opts: {
  firstName: string;
  moveDate?: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);
  const dateBit = opts.moveDate?.trim()
    ? opts.lang === "es"
      ? ` (${opts.moveDate.trim()})`
      : ` (${opts.moveDate.trim()})`
    : "";

  if (opts.lang === "es") {
    return (
      `Hola ${name}, aún necesitamos tu checklist del día de mudanza${dateBit}: ${CHECKLIST} ` +
      `— Toro Movers ${PHONE_DISPLAY}. STOP para salir.`
    );
  }
  return (
    `Hi ${name}, we still need your moving day checklist${dateBit}: ${CHECKLIST} ` +
    `— Toro Movers ${PHONE_DISPLAY}. Reply STOP to opt out.`
  );
}

export function buildBookingSms(
  kind: BookingSmsKind,
  opts: { firstName: string; moveDate?: string; lang?: "en" | "es" },
): string {
  switch (kind) {
    case "book_online":
      return bookOnlineSms(opts);
    case "booked_confirm":
      return bookedConfirmSms(opts);
    case "checklist_reminder":
      return checklistReminderSms(opts);
    default:
      return bookOnlineSms(opts);
  }
}

export async function sendBookingSms(opts: {
  kind: BookingSmsKind;
  firstName: string;
  phone: string;
  moveDate?: string;
  lang?: "en" | "es";
  consentSms?: boolean;
}): Promise<ChannelResult> {
  if (opts.consentSms === false) {
    return { ok: false, channel: "openphone", detail: "no SMS consent" };
  }
  if (!opts.phone?.trim()) {
    return { ok: false, channel: "openphone", detail: "no phone" };
  }
  const body = buildBookingSms(opts.kind, {
    firstName: opts.firstName,
    moveDate: opts.moveDate,
    lang: opts.lang,
  });
  return sendSms(opts.phone, body);
}
