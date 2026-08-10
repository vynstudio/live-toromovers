/**
 * OpenPhone / Quo SMS for the booking funnel:
 *   quote → book online (Square) → deposit → moving day checklist
 *
 * Line breaks keep each message easy to scan on a phone.
 */

import { sendSms } from "./providers";
import type { ChannelResult } from "./types";
import {
  BOOKINGS_PATH,
  DEPOSIT_AMOUNT_DISPLAY,
  PHONE_DISPLAY,
} from "@/lib/contact";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://toromovers.com";
const CHECKLIST = `${SITE}/move-day-checklist`;
const BOOK = `${SITE}${BOOKINGS_PATH}`;
const REVIEW =
  process.env.GOOGLE_REVIEW_URL ||
  "https://g.page/r/CYAKurQHh5TvEAI/review";

export type BookingSmsKind =
  | "book_online"
  | "booked_confirm"
  | "checklist_reminder"
  | "day_before"
  | "review_request";

function firstName(name: string): string {
  return (name || "there").trim().split(/\s+/)[0] || "there";
}

/**
 * Join lines with newlines. Keep "" as blank separator lines.
 * Only drop null/undefined/false (optional bits), not empty strings.
 */
function lines(...parts: (string | false | null | undefined)[]): string {
  return parts
    .filter((p): p is string => p !== null && p !== undefined && p !== false)
    .join("\n");
}

/** 1) Ready to lock a date — send Square booking link */
export function bookOnlineSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);
  if (opts.lang === "es") {
    return lines(
      `Hola ${name} — Toro Movers`,
      ``,
      `Agenda tu mudanza online.`,
      `El depósito se paga en Square al reservar.`,
      ``,
      `────────`,
      `Elige tu horario (depósito ${DEPOSIT_AMOUNT_DISPLAY} al reservar):`,
      BOOK,
      `────────`,
      ``,
      `O llama: ${PHONE_DISPLAY}`,
      ``,
      `Responde STOP para salir.`,
    );
  }
  return lines(
    `Hi ${name} — Toro Movers`,
    ``,
    `Book your move date online.`,
    `Deposit is paid in Square when you reserve.`,
    ``,
    `────────`,
    `Pick your time (${DEPOSIT_AMOUNT_DISPLAY} deposit at booking):`,
    BOOK,
    `────────`,
    ``,
    `Or call: ${PHONE_DISPLAY}`,
    ``,
    `Reply STOP to opt out.`,
  );
}

/** 2) Booked + deposit received — send checklist */
export function bookedConfirmSms(opts: {
  firstName: string;
  moveDate?: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);
  const date = opts.moveDate?.trim();

  if (opts.lang === "es") {
    return lines(
      `✅ ${name}, ¡estás agendado con Toro!`,
      date ? `Fecha: ${date}` : null,
      `Depósito recibido.`,
      ``,
      `Siguiente paso — checklist del día (2 min)`,
      `para mandar el crew correcto:`,
      ``,
      `────────`,
      CHECKLIST,
      `────────`,
      ``,
      `Dudas: ${PHONE_DISPLAY}`,
      ``,
      `Responde STOP para salir.`,
    );
  }
  return lines(
    `✅ ${name}, you're booked with Toro Movers!`,
    date ? `Date: ${date}` : null,
    `Deposit received.`,
    ``,
    `Next step — moving day checklist (2 min)`,
    `so we send the right crew:`,
    ``,
    `────────`,
    CHECKLIST,
    `────────`,
    ``,
    `Questions? ${PHONE_DISPLAY}`,
    ``,
    `Reply STOP to opt out.`,
  );
}

/** 3) Nudge if checklist not filled yet */
export function checklistReminderSms(opts: {
  firstName: string;
  moveDate?: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);
  const date = opts.moveDate?.trim();

  if (opts.lang === "es") {
    return lines(
      `Hola ${name} — Toro Movers`,
      ``,
      `Aún necesitamos tu checklist del día de mudanza.`,
      date ? `Mudanza: ${date}` : null,
      ``,
      `────────`,
      `Complétalo aquí (2 min):`,
      CHECKLIST,
      `────────`,
      ``,
      `${PHONE_DISPLAY}`,
      ``,
      `Responde STOP para salir.`,
    );
  }
  return lines(
    `Hi ${name} — Toro Movers`,
    ``,
    `We still need your moving day checklist.`,
    date ? `Move date: ${date}` : null,
    ``,
    `────────`,
    `Finish it here (2 min):`,
    CHECKLIST,
    `────────`,
    ``,
    `${PHONE_DISPLAY}`,
    ``,
    `Reply STOP to opt out.`,
  );
}

/** 4) Night before move day */
export function dayBeforeSms(opts: {
  firstName: string;
  moveDate?: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);
  const date = opts.moveDate?.trim();

  if (opts.lang === "es") {
    return lines(
      `Hola ${name} — Toro Movers`,
      ``,
      `Mañana es el día de mudanza.`,
      date ? `Fecha: ${date}` : null,
      ``,
      `Ten listo: acceso, elevador si aplica, cajas cerradas.`,
      ``,
      `────────`,
      `Checklist:`,
      CHECKLIST,
      `────────`,
      ``,
      `Dudas: ${PHONE_DISPLAY}`,
      ``,
      `Responde STOP para salir.`,
    );
  }
  return lines(
    `Hi ${name} — Toro Movers`,
    ``,
    `Tomorrow is move day.`,
    date ? `Date: ${date}` : null,
    ``,
    `Have ready: building access, elevator if needed, boxes closed.`,
    ``,
    `────────`,
    `Checklist:`,
    CHECKLIST,
    `────────`,
    ``,
    `Questions? ${PHONE_DISPLAY}`,
    ``,
    `Reply STOP to opt out.`,
  );
}

/** 5) Post-move Google review ask */
export function reviewRequestSms(opts: {
  firstName: string;
  lang?: "en" | "es";
}): string {
  const name = firstName(opts.firstName);

  if (opts.lang === "es") {
    return lines(
      `Gracias ${name} — Toro Movers`,
      ``,
      `Si el crew hizo un gran trabajo, una reseña en Google nos ayuda muchísimo:`,
      ``,
      `────────`,
      REVIEW,
      `────────`,
      ``,
      `¿Algo que mejorar? ${PHONE_DISPLAY}`,
      ``,
      `Responde STOP para salir.`,
    );
  }
  return lines(
    `Thank you ${name} — Toro Movers`,
    ``,
    `If the crew did a great job, a Google review helps our family business a lot:`,
    ``,
    `────────`,
    REVIEW,
    `────────`,
    ``,
    `Anything to improve? ${PHONE_DISPLAY}`,
    ``,
    `Reply STOP to opt out.`,
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
    case "day_before":
      return dayBeforeSms(opts);
    case "review_request":
      return reviewRequestSms(opts);
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
