// Toro Movers — HubSpot CRM webhook handler (Netlify Function, v2 / Web API).
//
// A HubSpot workflow ("Send a webhook" action) POSTs here whenever a deal
// changes stage in the "Mudanzas" deal pipeline. We validate the payload with
// Zod, pick the template for the new stage, and fan out to the customer over
// email (Resend) and SMS (Quo). All config comes from env vars — no secrets
// are hardcoded.
//
// Deployed URL:  https://<site>/.netlify/functions/crm-hook
//
// Stage → template map (mirrors the real 8-stage "Mudanzas" pipeline):
//   contact_attempt     → contact attempt ("we tried to reach you")
//   quote_sent          → quote follow-up
//   booked_scheduled    → booking + deposit link
//   move_completed      → review request
//   new_lead / contacted / review_request_sent / review_obtained
//                       → no message (handled, returns { skipped: true })
//   (en_route_eta template is kept available but no stage maps to it yet)
//
// Env vars (see .env.example):
//   HUBSPOT_TOKEN    — optional shared secret. When set, the incoming request
//                      must present it as `Authorization: Bearer <token>` or
//                      the `x-hubspot-token` header, or it's rejected (401).
//   RESEND_API_KEY   — Resend API key for transactional email.
//   RESEND_FROM_EMAIL— verified sender (defaults to hello@toromovers.net).
//   QUO_API_KEY      — Quo (formerly OpenPhone) API key for SMS.
//   QUO_FROM_NUMBER  — Quo sending number in E.164 (e.g. +16896002720).
//   QUO_API_URL      — optional override for the Quo messages endpoint.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Pipeline + payload schema
// ---------------------------------------------------------------------------

// Stage *slugs* the HubSpot workflow sends in the webhook body. These are
// stable, human-readable keys we control — NOT HubSpot's opaque internal
// stage IDs — so configure the workflow's webhook action to map the deal's
// pipeline stage onto one of these values.
export const Stage = z.enum([
  "new_lead",
  "contact_attempt",
  "contacted",
  "quote_sent",
  "booked_scheduled",
  "move_completed",
  "review_request_sent",
  "review_obtained",
]);
export type Stage = z.infer<typeof Stage>;

export const Lang = z.enum(["en", "es"]);
export type Lang = z.infer<typeof Lang>;

export const CrmHookSchema = z.object({
  stage: Stage,
  // Optional top-level language; per-contact language (below) wins if present.
  language: Lang.optional(),
  contact: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().min(7).optional(),
    language: Lang.optional(),
  }),
  // Deal fields mirror the custom HubSpot property internal names so the
  // workflow mapping is 1:1. All optional — templates degrade gracefully.
  deal: z
    .object({
      id: z.string().optional(),
      quote_amount: z.number().nonnegative().optional(),
      deposit_link: z.string().url().optional(),
      move_date: z.string().optional(), // ISO date (YYYY-MM-DD)
      eta_window: z.string().optional(), // e.g. "8:00–9:00 AM"
      review_link: z.string().url().optional(),
      last_customer_reply: z.string().optional(), // ISO datetime
    })
    .default({}),
});
export type CrmHookInput = z.infer<typeof CrmHookSchema>;

// All available message templates. `en_route_eta` has no stage mapped to it in
// the current pipeline but is kept for future use.
export type TemplateKey =
  | "contact_attempt"
  | "quote_follow_up"
  | "booking_deposit"
  | "en_route_eta"
  | "review_request";

// Which template (if any) each real pipeline stage triggers.
export const STAGE_TEMPLATE: Record<Stage, TemplateKey | null> = {
  new_lead: null,
  contact_attempt: "contact_attempt",
  contacted: null,
  quote_sent: "quote_follow_up",
  booked_scheduled: "booking_deposit",
  move_completed: "review_request",
  review_request_sent: null,
  review_obtained: null,
};

// ---------------------------------------------------------------------------
// Templates — bilingual (EN / ES). Each returns the rendered email + SMS copy.
// ---------------------------------------------------------------------------

const PHONE = "(689) 600-2720";

export type RenderedMessage = {
  subject: string;
  html: string;
  text: string;
  sms: string;
};

type Ctx = CrmHookInput;

const money = (n?: number) =>
  typeof n === "number"
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })
    : "";

/** Minimal branded email shell shared by every template. */
function shell(bodyHtml: string): string {
  return `<div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff;font:15px/1.55 system-ui,sans-serif;color:#0A0A0A">${bodyHtml}<p style="color:#6B6B72;font-size:13px;margin-top:24px">Family-owned · Fully insured · Hablamos español · <a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">${PHONE}</a></p></div>`;
}

const STOP_EN = " Reply STOP to opt out.";
const STOP_ES = " Responde STOP para no recibir más mensajes.";

const TEMPLATES: Record<TemplateKey, Record<Lang, (c: Ctx) => RenderedMessage>> = {
  contact_attempt: {
    en: (c) => {
      const first = c.contact.firstName;
      return {
        subject: "Toro Movers — we tried to reach you",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">Hi ${first}, we just tried to reach you</h2>
           <p>We got your moving request and tried to call about the details. We'd love to get you a quote — just reply here or give us a quick call.</p>
           <p style="margin-top:14px"><a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none;font:600 16px system-ui,sans-serif">${PHONE}</a></p>`,
        ),
        text: `Hi ${first}, Toro Movers here — we just tried to reach you about your move. Reply here or call ${PHONE} and we'll get you a quote.`,
        sms: `Hi ${first}, it's Toro Movers — we just tried to reach you about your move. Call us back at ${PHONE} or reply here and we'll get you a quote.${STOP_EN}`,
      };
    },
    es: (c) => {
      const first = c.contact.firstName;
      return {
        subject: "Toro Movers — intentamos contactarte",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">Hola ${first}, te acabamos de llamar</h2>
           <p>Recibimos tu solicitud de mudanza e intentamos comunicarnos contigo para ver los detalles. Nos encantaría darte una cotización — responde aquí o llámanos.</p>
           <p style="margin-top:14px"><a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none;font:600 16px system-ui,sans-serif">${PHONE}</a></p>`,
        ),
        text: `Hola ${first}, somos Toro Movers — intentamos contactarte sobre tu mudanza. Responde aquí o llama al ${PHONE} y te damos una cotización.`,
        sms: `Hola ${first}, somos Toro Movers — intentamos contactarte sobre tu mudanza. Llámanos al ${PHONE} o responde aquí y te cotizamos.${STOP_ES}`,
      };
    },
  },

  quote_follow_up: {
    en: (c) => {
      const amt = money(c.deal.quote_amount);
      const first = c.contact.firstName;
      return {
        subject: "Your Toro Movers quote — quick follow-up",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">Hi ${first}, about your quote${amt ? ` (${amt})` : ""}</h2>
           <p>Just checking in on the moving quote we put together for you. Happy to answer questions or fine-tune the details so the date works for you.</p>
           <p style="margin-top:14px">Ready to lock it in? Reply to this email or call <a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">${PHONE}</a>.</p>`,
        ),
        text: `Hi ${first}, following up on your Toro Movers quote${amt ? ` (${amt})` : ""}. Questions or want to lock in a date? Reply here or call ${PHONE}.`,
        sms: `Hi ${first}, it's Toro Movers following up on your moving quote${amt ? ` (${amt})` : ""}. Questions? Reply here or call ${PHONE}.${STOP_EN}`,
      };
    },
    es: (c) => {
      const amt = money(c.deal.quote_amount);
      const first = c.contact.firstName;
      return {
        subject: "Tu cotización de Toro Movers — seguimiento",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">Hola ${first}, sobre tu cotización${amt ? ` (${amt})` : ""}</h2>
           <p>Queríamos dar seguimiento a la cotización de mudanza que preparamos para ti. Con gusto resolvemos dudas o ajustamos los detalles para que la fecha te funcione.</p>
           <p style="margin-top:14px">¿Listo para reservar? Responde a este correo o llama al <a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">${PHONE}</a>.</p>`,
        ),
        text: `Hola ${first}, damos seguimiento a tu cotización de Toro Movers${amt ? ` (${amt})` : ""}. ¿Dudas o quieres reservar fecha? Responde o llama al ${PHONE}.`,
        sms: `Hola ${first}, somos Toro Movers dando seguimiento a tu cotización${amt ? ` (${amt})` : ""}. ¿Preguntas? Responde o llama al ${PHONE}.${STOP_ES}`,
      };
    },
  },

  booking_deposit: {
    en: (c) => {
      const first = c.contact.firstName;
      const date = c.deal.move_date ? ` for ${c.deal.move_date}` : "";
      const link = c.deal.deposit_link;
      const amt = money(c.deal.quote_amount);
      const cta = link
        ? `<p style="margin:18px 0"><a href="${link}" style="display:inline-block;background:#C81E3A;color:#fff;text-decoration:none;font:600 15px system-ui,sans-serif;padding:12px 22px;border-radius:8px">Place your deposit</a></p>`
        : `<p style="margin:18px 0">Our team will text you a secure deposit link shortly.</p>`;
      return {
        subject: "You're booked with Toro Movers — secure your slot",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">Great news, ${first} — your move is booked${date}!</h2>
           <p>To lock in your crew${amt ? ` (quote total ${amt})` : ""}, please place your deposit below.</p>${cta}`,
        ),
        text: `${first}, your Toro Movers move is booked${date}.${amt ? ` Quote total ${amt}.` : ""} Secure your slot${link ? `: ${link}` : " — we'll text you a deposit link shortly."}`,
        sms: `${first}, your Toro Movers booking${date} is reserved.${link ? ` Secure your slot with a deposit: ${link}` : " We'll text your deposit link shortly."}${STOP_EN}`,
      };
    },
    es: (c) => {
      const first = c.contact.firstName;
      const date = c.deal.move_date ? ` para el ${c.deal.move_date}` : "";
      const link = c.deal.deposit_link;
      const amt = money(c.deal.quote_amount);
      const cta = link
        ? `<p style="margin:18px 0"><a href="${link}" style="display:inline-block;background:#C81E3A;color:#fff;text-decoration:none;font:600 15px system-ui,sans-serif;padding:12px 22px;border-radius:8px">Pagar tu depósito</a></p>`
        : `<p style="margin:18px 0">Nuestro equipo te enviará un enlace seguro de depósito en breve.</p>`;
      return {
        subject: "Tu mudanza está reservada — asegura tu lugar",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">¡Buenas noticias, ${first} — tu mudanza está reservada${date}!</h2>
           <p>Para confirmar tu equipo${amt ? ` (total de cotización ${amt})` : ""}, realiza tu depósito a continuación.</p>${cta}`,
        ),
        text: `${first}, tu mudanza con Toro Movers está reservada${date}.${amt ? ` Total ${amt}.` : ""} Asegura tu lugar${link ? `: ${link}` : " — te enviaremos un enlace de depósito en breve."}`,
        sms: `${first}, tu reserva con Toro Movers${date} está confirmada.${link ? ` Asegura tu lugar con un depósito: ${link}` : " Te enviaremos el enlace de depósito en breve."}${STOP_ES}`,
      };
    },
  },

  en_route_eta: {
    en: (c) => {
      const first = c.contact.firstName;
      const eta = c.deal.eta_window ? ` Estimated arrival: ${c.deal.eta_window}.` : "";
      return {
        subject: "Your Toro Movers crew is on the way",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">On our way, ${first}! 🚚</h2>
           <p>Your Toro Movers crew is en route.${eta} We'll reach out if anything changes.</p>
           <p style="margin-top:14px">Need us? Call <a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">${PHONE}</a>.</p>`,
        ),
        text: `${first}, your Toro Movers crew is on the way.${eta} Need us? Call ${PHONE}.`,
        sms: `${first}, your Toro Movers crew is on the way!${eta} See you soon.${STOP_EN}`,
      };
    },
    es: (c) => {
      const first = c.contact.firstName;
      const eta = c.deal.eta_window ? ` Llegada estimada: ${c.deal.eta_window}.` : "";
      return {
        subject: "Tu equipo de Toro Movers va en camino",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">¡Vamos en camino, ${first}! 🚚</h2>
           <p>Tu equipo de Toro Movers va en camino.${eta} Te avisamos si algo cambia.</p>
           <p style="margin-top:14px">¿Nos necesitas? Llama al <a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">${PHONE}</a>.</p>`,
        ),
        text: `${first}, tu equipo de Toro Movers va en camino.${eta} ¿Nos necesitas? Llama al ${PHONE}.`,
        sms: `${first}, ¡tu equipo de Toro Movers va en camino!${eta} Nos vemos pronto.${STOP_ES}`,
      };
    },
  },

  review_request: {
    en: (c) => {
      const first = c.contact.firstName;
      const link = c.deal.review_link;
      const cta = link
        ? `<p style="margin:18px 0"><a href="${link}" style="display:inline-block;background:#C81E3A;color:#fff;text-decoration:none;font:600 15px system-ui,sans-serif;padding:12px 22px;border-radius:8px">Leave a review</a></p>`
        : "";
      return {
        subject: "Thanks for moving with Toro Movers 🐂",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">Thank you, ${first}!</h2>
           <p>It was a pleasure moving you. If everything went well, a quick review means the world to a family-owned crew.</p>${cta}
           <p style="margin-top:14px">— Diler &amp; the Toro Movers team</p>`,
        ),
        text: `${first}, thank you for moving with Toro Movers! A quick review would mean a lot${link ? `: ${link}` : ""}. — Diler & the Toro crew`,
        sms: `${first}, thank you for moving with Toro Movers! A quick review would mean a lot${link ? `: ${link}` : ""}.${STOP_EN}`,
      };
    },
    es: (c) => {
      const first = c.contact.firstName;
      const link = c.deal.review_link;
      const cta = link
        ? `<p style="margin:18px 0"><a href="${link}" style="display:inline-block;background:#C81E3A;color:#fff;text-decoration:none;font:600 15px system-ui,sans-serif;padding:12px 22px;border-radius:8px">Dejar una reseña</a></p>`
        : "";
      return {
        subject: "Gracias por mudarte con Toro Movers 🐂",
        html: shell(
          `<h2 style="font:600 20px/1.3 system-ui,sans-serif;margin:0 0 12px">¡Gracias, ${first}!</h2>
           <p>Fue un placer ayudarte con tu mudanza. Si todo salió bien, una breve reseña significa mucho para un equipo familiar.</p>${cta}
           <p style="margin-top:14px">— Diler y el equipo de Toro Movers</p>`,
        ),
        text: `${first}, ¡gracias por mudarte con Toro Movers! Una breve reseña significaría mucho${link ? `: ${link}` : ""}. — Diler y el equipo Toro`,
        sms: `${first}, ¡gracias por mudarte con Toro Movers! Una breve reseña significaría mucho${link ? `: ${link}` : ""}.${STOP_ES}`,
      };
    },
  },
};

export function renderMessages(
  template: TemplateKey,
  lang: Lang,
  data: CrmHookInput,
): RenderedMessage {
  return TEMPLATES[template][lang](data);
}

// ---------------------------------------------------------------------------
// Channels — Resend (email) + Quo (SMS). Both gated on env; never hardcode.
// ---------------------------------------------------------------------------

export async function sendEmail(
  to: string,
  msg: RenderedMessage,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!apiKey) {
    console.error("[crm-hook] RESEND_API_KEY missing — email skipped");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[crm-hook] Resend failed:", res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[crm-hook] Resend threw:", err);
    return false;
  }
}

export async function sendSms(to: string, content: string): Promise<boolean> {
  const apiKey = process.env.QUO_API_KEY;
  const from = process.env.QUO_FROM_NUMBER;
  // Quo is the rebranded OpenPhone; the messages endpoint is compatible.
  const url = process.env.QUO_API_URL || "https://api.openphone.com/v1/messages";
  if (!apiKey || !from) {
    console.error("[crm-hook] QUO_API_KEY/QUO_FROM_NUMBER missing — SMS skipped");
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], content }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[crm-hook] Quo failed:", res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[crm-hook] Quo threw:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Handler (Netlify Functions v2 — Web Request → Response)
// ---------------------------------------------------------------------------

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  // Optional shared-secret check — HubSpot's webhook action can attach a
  // static auth header. When HUBSPOT_TOKEN is set we enforce it.
  const secret = process.env.HUBSPOT_TOKEN;
  if (secret) {
    const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const provided = bearer || req.headers.get("x-hubspot-token") || "";
    if (provided !== secret) {
      return json({ ok: false, error: "unauthorized" }, 401);
    }
  }

  const raw = await req.json().catch(() => null);
  const parsed = CrmHookSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      { ok: false, error: "invalid_payload", issues: parsed.error.flatten() },
      400,
    );
  }
  const data = parsed.data;

  const template = STAGE_TEMPLATE[data.stage];
  if (!template) {
    return json({ ok: true, skipped: true, reason: `no template for stage "${data.stage}"` });
  }

  const lang: Lang = data.contact.language ?? data.language ?? "en";
  const msg = renderMessages(template, lang, data);

  // Fan out over whichever channels we have a destination for. Both fire when
  // the contact has an email AND a phone (the common case at "completed").
  const tasks: Array<Promise<["email" | "sms", boolean]>> = [];
  if (data.contact.email) {
    tasks.push(sendEmail(data.contact.email, msg).then((ok) => ["email", ok]));
  }
  if (data.contact.phone) {
    tasks.push(sendSms(data.contact.phone, msg.sms).then((ok) => ["sms", ok]));
  }

  const settled = await Promise.allSettled(tasks);
  const sent = { email: false, sms: false };
  for (const r of settled) {
    if (r.status === "fulfilled") {
      const [channel, ok] = r.value;
      sent[channel] = ok;
    }
  }

  return json({
    ok: true,
    stage: data.stage,
    template,
    lang,
    dealId: data.deal.id ?? null,
    sent,
  });
}

// Netlify Functions v2 config — pin a clean route alongside the default
// /.netlify/functions/crm-hook endpoint.
export const config = { path: "/api/crm-hook" };
