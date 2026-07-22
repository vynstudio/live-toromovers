/**
 * Client automation copy — email + SMS by lifecycle step.
 * Phone: (689) 600-2720 · Brand: Toro Movers
 */

import type { SequenceKey } from "./types";

const PHONE_DISPLAY = "(689) 600-2720";
const PHONE_TEL = "+16896002720";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://toromovers.net";
const QUOTE = `${SITE}/quote`;
const REVIEW =
  process.env.GOOGLE_REVIEW_URL || "https://g.page/r/CYAKurQHh5TvEAI/review";

export type SequenceMessage = {
  email?: { subject: string; html: string; text: string };
  sms?: string;
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(body: string) {
  return `<div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#fff;font:15px/1.6 system-ui,sans-serif;color:#0A0A0A">${body}<p style="color:#6B6B72;font-size:13px;margin:28px 0 0;border-top:1px solid #ECECEC;padding-top:16px">Family-owned · Up-front pricing · Hablamos español<br>Toro Movers · <a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p></div>`;
}

export function buildSequence(
  key: SequenceKey,
  opts: {
    firstName: string;
    lang?: "en" | "es";
    funnel?: string;
  },
): SequenceMessage {
  const name = opts.firstName || "there";
  const es = opts.lang === "es";
  const funnel =
    opts.funnel === "labor"
      ? es
        ? "ayuda de carga"
        : "labor-only"
      : opts.funnel === "checklist"
        ? es
          ? "checklist"
          : "checklist"
        : es
          ? "mudanza full-service"
          : "full-service";

  switch (key) {
    case "call_instant":
      return {
        sms: es
          ? `Hola ${name}, Toro Movers. Vimos tu interés en mudanza full-service. Te llamamos del ${PHONE_DISPLAY}. ¿Cuándo te acomoda? Responde STOP para salir.`
          : `Hi ${name}, this is Toro Movers. Saw you were looking for full-service movers — we'll call from ${PHONE_DISPLAY}. When works for you? Reply STOP to opt out.`,
        email: {
          subject: es
            ? "Toro Movers — te contactamos pronto"
            : "Toro Movers — a team member will contact you shortly",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Hola ${esc(name)},</h2><p>Gracias por tu interés en mudanzas full-service en Florida Central. Un miembro del equipo te llama pronto al número que nos diste.</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Hi ${esc(name)},</h2><p>Thanks for checking out full-service movers in Central Florida. A team member will contact you in a couple minutes at the number you used.</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p>`,
          ),
          text: es
            ? `Hola ${name}, Toro Movers te contacta pronto. ${PHONE_DISPLAY}`
            : `Hi ${name}, a team member will contact you in a couple minutes. ${PHONE_DISPLAY}`,
        },
      };

    case "followup_1h":
      return {
        sms: es
          ? `Hola ${name}, Toro Movers. ¿Aún necesitas ${funnel}? Responde con tu fecha o llama ${PHONE_DISPLAY}. STOP para salir.`
          : `Hi ${name}, Toro Movers here. Still need ${funnel} help? Reply with your move date or call ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es
            ? "¿Sigues planeando tu mudanza?"
            : "Still planning your move?",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">${esc(name)}, ¿seguimos?</h2><p>Recibimos tu solicitud de <strong>${esc(funnel)}</strong>. Si aún no hablamos, responde este correo o llama:</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p><p><a href="${QUOTE}" style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;font:600 15px system-ui;padding:12px 22px;border-radius:8px">Ver cotización →</a></p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">${esc(name)}, still moving?</h2><p>We got your <strong>${esc(funnel)}</strong> request. If we haven't connected yet, reply to this email or call:</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p><p><a href="${QUOTE}" style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;font:600 15px system-ui;padding:12px 22px;border-radius:8px">Review quote details →</a></p>`,
          ),
          text: es
            ? `${name}, ¿sigues con la mudanza? Llama ${PHONE_DISPLAY} o cotiza: ${QUOTE}`
            : `${name}, still moving? Call ${PHONE_DISPLAY} or quote: ${QUOTE}`,
        },
      };

    case "followup_24h":
      return {
        sms: es
          ? `${name}, Toro Movers — camión + cuadrilla, precio claro. ¿Fecha de mudanza? ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, Toro Movers — truck + crew, up-front pricing. What's your move date? ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es
            ? "Camión + cuadrilla incluidos"
            : "Truck + crew included",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Full-service sin sorpresas</h2><p>Hola ${esc(name)}, en Toro Movers traemos camión, cuadrilla y protección. Precio por hora al frente — sin cargos ocultos en Florida Central.</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Full-service, no surprises</h2><p>Hi ${esc(name)}, Toro brings the truck, crew, and furniture protection. Up-front hourly pricing — no hidden fees across Central Florida.</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p>`,
          ),
          text: es
            ? `Full-service Toro: camión + cuadrilla. ${PHONE_DISPLAY}`
            : `Full-service Toro: truck + crew. ${PHONE_DISPLAY}`,
        },
      };

    case "followup_72h":
      return {
        sms: es
          ? `${name}, última nota de Toro: ¿agendamos tu mudanza? ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, last note from Toro — ready to lock a date? ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "¿Cerramos la fecha?" : "Ready to lock a date?",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Último seguimiento</h2><p>${esc(name)}, si tu mudanza sigue en pie, respondemos el mismo día cuando llamas. Estamos en Florida Central · bilingües.</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Last follow-up</h2><p>${esc(name)}, if your move is still on, we usually reply the same day when you call. Central Florida · bilingual crew.</p><p style="font:600 18px system-ui"><a href="tel:${PHONE_TEL}" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p>`,
          ),
          text: es
            ? `Toro Movers — ¿agendamos? ${PHONE_DISPLAY}`
            : `Toro Movers — lock a date? ${PHONE_DISPLAY}`,
        },
      };

    case "booked_confirm":
      return {
        sms: es
          ? `✅ ${name}, tu mudanza con Toro está agendada. Te escribimos con detalles. Dudas: ${PHONE_DISPLAY}. STOP para salir.`
          : `✅ ${name}, your Toro move is booked. We'll text details soon. Questions: ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Mudanza confirmada — Toro Movers" : "Move confirmed — Toro Movers",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">¡Estás agendado, ${esc(name)}!</h2><p>Gracias por confiar en Toro. Revisaremos detalles de llegada y contacto el día anterior. ¿Preguntas? <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">You're booked, ${esc(name)}!</h2><p>Thanks for choosing Toro. We'll confirm arrival window and contact the day before. Questions? <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></p>`,
          ),
          text: es
            ? `Mudanza Toro confirmada. ${PHONE_DISPLAY}`
            : `Toro move confirmed. ${PHONE_DISPLAY}`,
        },
      };

    case "move_day_eve":
      return {
        sms: es
          ? `${name}, mañana es el día 🚚. Cuadrilla Toro lista. Contacto: ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, move day is tomorrow 🚚. Toro crew is set. Contact: ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Mañana es el día — Toro Movers" : "Move day tomorrow — Toro Movers",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Mañana mudamos contigo</h2><p>${esc(name)}, ten listos accesos, elevadores y llaves. Si cambia algo, avísanos al <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a>.</p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">We move you tomorrow</h2><p>${esc(name)}, please have access, elevators, and keys ready. If anything changes, call <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a>.</p>`,
          ),
          text: es
            ? `Mañana mudanza Toro. ${PHONE_DISPLAY}`
            : `Toro move tomorrow. ${PHONE_DISPLAY}`,
        },
      };

    case "post_move_review":
      return {
        sms: es
          ? `Hola ${name}, ¡gracias por mudarte con Toro! 🚚 Si todo salió bien: ${REVIEW} — STOP para salir.`
          : `Hi ${name}, thanks for moving with Toro! 🚚 If it went well: ${REVIEW} — STOP to opt out.`,
        email: {
          subject: es ? "¿Cómo estuvo tu mudanza?" : "How was your move?",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Gracias, ${esc(name)}</h2><p>Si el equipo hizo buen trabajo, una reseña en Google nos ayuda muchísimo:</p><p><a href="${REVIEW}" style="display:inline-block;background:#C81E3A;color:#fff;text-decoration:none;font:600 15px system-ui;padding:12px 22px;border-radius:8px">Dejar reseña →</a></p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Thank you, ${esc(name)}</h2><p>If the crew did a great job, a Google review helps our family business a lot:</p><p><a href="${REVIEW}" style="display:inline-block;background:#C81E3A;color:#fff;text-decoration:none;font:600 15px system-ui;padding:12px 22px;border-radius:8px">Leave a review →</a></p>`,
          ),
          text: es
            ? `Reseña Google Toro: ${REVIEW}`
            : `Google review for Toro: ${REVIEW}`,
        },
      };

    case "nurture_checklist":
      return {
        email: {
          subject: es
            ? "Tu checklist de mudanza — Toro"
            : "Your moving checklist — Toro",
          html: wrap(
            es
              ? `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Planifica sin estrés</h2><p>${esc(name)}, cuando estés listo para la cuadrilla, estamos a un llamado: <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a> o <a href="${QUOTE}">cotiza aquí</a>.</p>`
              : `<h2 style="font:600 22px/1.3 system-ui;margin:0 0 10px">Plan without the stress</h2><p>${esc(name)}, when you're ready for a crew, we're one call away: <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a> or <a href="${QUOTE}">get a quote</a>.</p>`,
          ),
          text: es
            ? `Checklist Toro — cotiza: ${QUOTE} · ${PHONE_DISPLAY}`
            : `Toro checklist — quote: ${QUOTE} · ${PHONE_DISPLAY}`,
        },
      };

    default:
      return {};
  }
}

/** Default drip schedule after a new high-intent lead (hours from now). */
export const FOLLOWUP_SCHEDULE: { key: SequenceKey; delayHours: number }[] = [
  { key: "followup_1h", delayHours: 1 },
  { key: "followup_24h", delayHours: 24 },
  { key: "followup_72h", delayHours: 72 },
];
