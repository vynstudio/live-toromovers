/**
 * Stage-based SMS (+ email) follow-up plan for HubSpot Mudanzas stages.
 *
 * Instant steps fire when a lead is created or stage advances.
 * Delayed steps are meant for n8n Wait nodes (or cron) calling:
 *   POST /api/crm/sequences/stage-run
 *
 * SMS counts are intentional and documented — adjust here, not in n8n.
 */

import type { StageKey } from "./types";

const PHONE_DISPLAY = "(689) 600-2720";
const REVIEW =
  process.env.GOOGLE_REVIEW_URL ||
  "https://g.page/r/CYAKurQHh5TvEAI/review";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://toromovers.net";

/** Canonical online book / price funnel (all CTAs → /get-my-price). */
function bookUrl(opts: { stepId: string; lang?: "en" | "es" }): string {
  const path = opts.lang === "es" ? "/es/get-my-price" : "/get-my-price";
  // src=sms-* so Meta/GA can attribute SMS → funnel (no secrets in URL)
  return `${SITE}${path}?src=sms&step=${encodeURIComponent(opts.stepId)}`;
}

export type StageSmsStep = {
  /** Unique id for this step within the stage (for n8n + logging) */
  id: string;
  /** Delay after entering the stage before sending. 0 = fire immediately */
  delayMinutes: number;
  channel: "sms" | "email" | "both";
  /** Stop if deal has already moved past this stage (n8n should check HubSpot) */
  cancelIfStageChanged?: boolean;
};

export type StageSmsCopy = {
  sms?: string;
  email?: { subject: string; text: string };
};

export type StagePlan = {
  stage: StageKey;
  label: string;
  /** How many SMS this stage is designed to send over time */
  smsCount: number;
  steps: StageSmsStep[];
};

/**
 * Plan summary (SMS only counts):
 *
 * | Stage            | SMS count | Timing                          |
 * |------------------|-----------|---------------------------------|
 * | New Lead         | 4         | 0 · 1h · 24h · 72h              |
 * | No Answer        | 3         | 0 · 4h · 24h                    |
 * | Contacted        | 2         | 0 · 24h                         |
 * | Quote Sent       | 3         | 0 · 24h · 48h                   |
 * | Booked           | 2         | 0 · eve-of-move* (manual/n8n)   |
 * | Move Done        | 1         | 0 (review ask)                  |
 * | Review Sent      | 1         | 0 (nudge)                       |
 * | Review Got       | 0         | —                               |
 *
 * *move_day_eve is step id booked_eve; n8n should schedule relative to move date when available.
 */
export const STAGE_SMS_PLANS: StagePlan[] = [
  {
    stage: "newLead",
    label: "New Lead",
    smsCount: 4,
    steps: [
      { id: "new_0", delayMinutes: 0, channel: "both", cancelIfStageChanged: true },
      { id: "new_1h", delayMinutes: 60, channel: "both", cancelIfStageChanged: true },
      { id: "new_24h", delayMinutes: 24 * 60, channel: "both", cancelIfStageChanged: true },
      { id: "new_72h", delayMinutes: 72 * 60, channel: "both", cancelIfStageChanged: true },
    ],
  },
  {
    stage: "contactAttempt",
    label: "No Answer",
    smsCount: 3,
    steps: [
      { id: "attempt_0", delayMinutes: 0, channel: "both", cancelIfStageChanged: true },
      { id: "attempt_4h", delayMinutes: 4 * 60, channel: "sms", cancelIfStageChanged: true },
      { id: "attempt_24h", delayMinutes: 24 * 60, channel: "both", cancelIfStageChanged: true },
    ],
  },
  {
    stage: "contacted",
    label: "Contacted",
    smsCount: 2,
    steps: [
      { id: "contacted_0", delayMinutes: 0, channel: "both", cancelIfStageChanged: true },
      { id: "contacted_24h", delayMinutes: 24 * 60, channel: "sms", cancelIfStageChanged: true },
    ],
  },
  {
    stage: "quoteSent",
    label: "Quote Sent",
    smsCount: 3,
    steps: [
      { id: "quote_0", delayMinutes: 0, channel: "both", cancelIfStageChanged: true },
      { id: "quote_24h", delayMinutes: 24 * 60, channel: "both", cancelIfStageChanged: true },
      { id: "quote_48h", delayMinutes: 48 * 60, channel: "sms", cancelIfStageChanged: true },
    ],
  },
  {
    stage: "booked",
    label: "Booked",
    smsCount: 2,
    steps: [
      { id: "booked_0", delayMinutes: 0, channel: "both", cancelIfStageChanged: false },
      // n8n should fire the day before move when move date is known; delayMinutes is a fallback
      { id: "booked_eve", delayMinutes: 24 * 60, channel: "both", cancelIfStageChanged: false },
    ],
  },
  {
    stage: "completed",
    label: "Move Done",
    smsCount: 1,
    steps: [
      { id: "done_review", delayMinutes: 0, channel: "both", cancelIfStageChanged: false },
    ],
  },
  {
    stage: "reviewRequested",
    label: "Review Sent",
    smsCount: 1,
    steps: [
      { id: "review_nudge", delayMinutes: 0, channel: "sms", cancelIfStageChanged: false },
    ],
  },
  {
    stage: "reviewObtained",
    label: "Review Got",
    smsCount: 0,
    steps: [],
  },
];

export function getStagePlan(stage: StageKey): StagePlan | undefined {
  return STAGE_SMS_PLANS.find((p) => p.stage === stage);
}

export function getInstantSteps(stage: StageKey): StageSmsStep[] {
  return (getStagePlan(stage)?.steps || []).filter((s) => s.delayMinutes === 0);
}

export function getDelayedSteps(stage: StageKey): StageSmsStep[] {
  return (getStagePlan(stage)?.steps || []).filter((s) => s.delayMinutes > 0);
}

export function buildStageStepCopy(
  stepId: string,
  opts: { firstName: string; lang?: "en" | "es" },
): StageSmsCopy {
  const name = opts.firstName || "there";
  const es = opts.lang === "es";
  const BOOK = bookUrl({ stepId, lang: opts.lang });

  switch (stepId) {
    // ── New Lead: confirmation / call-back only — NO funnel links.
    // Lead already finished the form; a book URL reopens /get-my-price and
    // causes duplicate intakes.
    case "new_0":
      return {
        sms: es
          ? `Hola ${name}, Toro Movers — recibimos tu solicitud. Te contactamos pronto. Llama o escribe al ${PHONE_DISPLAY}. Responde STOP para salir.`
          : `Hi ${name}, Toro Movers — we got your request. We'll be in touch shortly. Call or text ${PHONE_DISPLAY}. Reply STOP to opt out.`,
        email: {
          subject: es
            ? "Toro Movers — recibimos tu solicitud"
            : "Toro Movers — we got your request",
          text: es
            ? `Hola ${name}, recibimos tu solicitud de mudanza. Un miembro del equipo te contacta pronto.\n\nPreguntas: ${PHONE_DISPLAY}`
            : `Hi ${name}, we got your move request. A team member will contact you shortly.\n\nQuestions: ${PHONE_DISPLAY}`,
        },
      };

    case "new_1h":
      return {
        sms: es
          ? `Hola ${name}, Toro — ¿aún necesitas mudanza? Responde con tu fecha o llama ${PHONE_DISPLAY}. STOP para salir.`
          : `Hi ${name}, Toro — still need movers? Reply with your move date or call ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "¿Sigues planeando tu mudanza?" : "Still planning your move?",
          text: es
            ? `${name}, ¿sigues con la mudanza? Responde este correo o llama ${PHONE_DISPLAY}`
            : `${name}, still moving? Reply to this email or call ${PHONE_DISPLAY}`,
        },
      };

    case "new_24h":
      return {
        sms: es
          ? `${name}, Toro — camión + cuadrilla, precio claro. ¿Fecha de mudanza? ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, Toro — truck + crew, up-front pricing. What's your move date? ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Camión + cuadrilla — Toro" : "Truck + crew — Toro",
          text: es
            ? `Full-service Toro: camión + cuadrilla. Llama ${PHONE_DISPLAY}`
            : `Full-service Toro: truck + crew. Call ${PHONE_DISPLAY}`,
        },
      };

    case "new_72h":
      return {
        sms: es
          ? `${name}, última nota Toro: ¿agendamos tu mudanza? ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, last note from Toro — ready to lock a date? ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "¿Cerramos la fecha?" : "Ready to lock a date?",
          text: es
            ? `Toro Movers — ¿agendamos? ${PHONE_DISPLAY}`
            : `Toro Movers — lock a date? ${PHONE_DISPLAY}`,
        },
      };

    // ── Other pre-book stages: may still include online book CTA ─────

    case "attempt_0":
      return {
        sms: es
          ? `Hola ${name}, Toro intentó llamarte. Reserva online cuando quieras: ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `Hi ${name}, Toro tried to reach you. Book online anytime: ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Intentamos contactarte" : "We tried to reach you",
          text: es
            ? `${name}, intentamos llamarte. Reserva aquí: ${BOOK}\n\nO llama ${PHONE_DISPLAY}.`
            : `${name}, we tried calling. Book here: ${BOOK}\n\nOr call ${PHONE_DISPLAY}.`,
        },
      };

    case "attempt_4h":
      return {
        sms: es
          ? `${name}, Toro de nuevo — agenda online sin esperar: ${BOOK} · o responde SÍ y te llamamos. STOP para salir.`
          : `${name}, Toro again — book online now: ${BOOK} · or reply YES and we'll call. STOP to opt out.`,
      };

    case "attempt_24h":
      return {
        sms: es
          ? `${name}, Toro sigue disponible. Reserva tu mudanza: ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, Toro is still available. Book your move: ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Seguimos aquí — reserva online" : "We're still here — book online",
          text: es
            ? `${name}, cuando quieras agendar: ${BOOK}\n\n${PHONE_DISPLAY}`
            : `${name}, when you're ready to book: ${BOOK}\n\n${PHONE_DISPLAY}`,
        },
      };

    case "contacted_0":
      return {
        sms: es
          ? `Gracias por hablar con Toro, ${name}. Completa / reserva online: ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `Thanks for chatting with Toro, ${name}. Finish / book online: ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Gracias por conversar — Toro" : "Thanks for chatting — Toro",
          text: es
            ? `${name}, gracias. Siguiente paso — reserva online: ${BOOK}\n\n${PHONE_DISPLAY}`
            : `${name}, thanks. Next step — book online: ${BOOK}\n\n${PHONE_DISPLAY}`,
        },
      };

    case "contacted_24h":
      return {
        sms: es
          ? `${name}, ¿listo para agendar con Toro? ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, ready to book with Toro? ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
      };

    case "quote_0":
      return {
        sms: es
          ? `${name}, tu cotización Toro está lista. Reserva online: ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, your Toro estimate is ready. Book online: ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Tu cotización Toro — reserva online" : "Your Toro estimate — book online",
          text: es
            ? `${name}, cotización lista. Reserva aquí: ${BOOK}\n\nO llama ${PHONE_DISPLAY}`
            : `${name}, estimate ready. Book here: ${BOOK}\n\nOr call ${PHONE_DISPLAY}`,
        },
      };

    case "quote_24h":
      return {
        sms: es
          ? `${name}, Toro — ¿dudas de la cotización? Reserva cuando quieras: ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, Toro — questions on the estimate? Book when ready: ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "¿Dudas de la cotización?" : "Questions about your estimate?",
          text: es
            ? `${name}, estamos para ayudarte. Reserva: ${BOOK}\n\n${PHONE_DISPLAY}`
            : `${name}, we're here to help. Book: ${BOOK}\n\n${PHONE_DISPLAY}`,
        },
      };

    case "quote_48h":
      return {
        sms: es
          ? `${name}, fechas se llenan. Reserva con Toro ahora: ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, dates fill up — book with Toro now: ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
      };

    // ── Post-book: no funnel CTA ───────────────────────────────────────
    case "booked_0":
      return {
        sms: es
          ? `✅ ${name}, mudanza Toro confirmada. Te escribimos con detalles. ${PHONE_DISPLAY}. STOP para salir.`
          : `✅ ${name}, your Toro move is booked. Details coming. ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Mudanza confirmada" : "Move confirmed",
          text: es
            ? `${name}, estás agendado con Toro. ${PHONE_DISPLAY}`
            : `${name}, you're booked with Toro. ${PHONE_DISPLAY}`,
        },
      };

    case "booked_eve":
      return {
        sms: es
          ? `${name}, mañana es el día 🚚. Cuadrilla Toro lista. ${PHONE_DISPLAY}. STOP para salir.`
          : `${name}, move day tomorrow 🚚. Toro crew is set. ${PHONE_DISPLAY}. STOP to opt out.`,
        email: {
          subject: es ? "Mañana es el día" : "Move day tomorrow",
          text: es
            ? `${name}, mañana mudamos. Ten listos accesos y llaves. ${PHONE_DISPLAY}`
            : `${name}, we move you tomorrow. Have access & keys ready. ${PHONE_DISPLAY}`,
        },
      };

    case "done_review":
      return {
        sms: es
          ? `Hola ${name}, ¡gracias por mudarte con Toro! 🚚 Si todo salió bien: ${REVIEW} — STOP para salir.`
          : `Hi ${name}, thanks for moving with Toro! 🚚 If it went well: ${REVIEW} — STOP to opt out.`,
        email: {
          subject: es ? "¿Cómo estuvo tu mudanza?" : "How was your move?",
          text: es
            ? `${name}, deja una reseña: ${REVIEW}`
            : `${name}, leave a review: ${REVIEW}`,
        },
      };

    case "review_nudge":
      return {
        sms: es
          ? `${name}, un recordatorio amable de Toro ⭐ ${REVIEW} — ¡gracias! STOP para salir.`
          : `${name}, friendly nudge from Toro ⭐ ${REVIEW} — thank you! STOP to opt out.`,
      };

    default:
      return {
        sms: es
          ? `Hola ${name}, Toro Movers — reserva: ${BOOK} · ${PHONE_DISPLAY}. STOP para salir.`
          : `Hi ${name}, Toro Movers — book: ${BOOK} · ${PHONE_DISPLAY}. STOP to opt out.`,
      };
  }
}

/** Human-readable table for docs / admin */
export function stageSmsPlanSummary(): string {
  return STAGE_SMS_PLANS.map(
    (p) =>
      `${p.label} (${p.stage}): ${p.smsCount} SMS · steps: ${p.steps
        .map((s) => `${s.id}@${s.delayMinutes}m`)
        .join(", ") || "none"}`,
  ).join("\n");
}
