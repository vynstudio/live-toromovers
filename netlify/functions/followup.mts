import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

/**
 * Lead follow-up sequence (SMS + email) for Toro Movers.
 *
 * Cadence: SMS 3 / 2 / 1 across days 1-3 (touches at +4/+8/+12/+28/+32/+52h).
 * Email is sent once per day only (first touch of each day) to protect the
 * sending domain's reputation — touches 1, 4, 6. Everything is in the lead's
 * language. Progress is stored in a Netlify Blob so a touch never repeats. The
 * HubSpot status is the off-switch: the moment a lead leaves
 * hs_lead_status=NEW it stops appearing in the search and the sequence ends.
 *
 * Runs every 30 min. SAFETY: ships disabled — nothing sends unless
 * FOLLOWUP_ENABLED === "true". SMS also needs OPENPHONE_API_KEY (Quo key).
 */

const HOUR = 60 * 60 * 1000;

// Touch schedule (hours after the lead was created). SMS on every touch
// (3/2/1 across 3 days); email only on the first touch of each day.
const TOUCHES = [
  { id: 1, afterMs: 4 * HOUR, email: true }, // day 1
  { id: 2, afterMs: 8 * HOUR, email: false },
  { id: 3, afterMs: 12 * HOUR, email: false },
  { id: 4, afterMs: 28 * HOUR, email: true }, // day 2
  { id: 5, afterMs: 32 * HOUR, email: false },
  { id: 6, afterMs: 52 * HOUR, email: true }, // day 3
];

// Leave leads alone once the sequence window has fully passed.
const MAX_AGE_MS = 4 * 24 * HOUR;

const PHONE_DISPLAY = "(689) 600-2720";

type Lang = "en" | "es";

function pickLang(hsLanguage?: string): Lang {
  return (hsLanguage || "").toLowerCase().startsWith("es") ? "es" : "en";
}

// --- SMS copy: one variant per touch (1..6), bilingual ---
const SMS_ES: ((n: string) => string)[] = [
  (n) => `Hola${n}, somos Toro Movers 🐂 Recibimos tu solicitud e intentamos contactarte — responde aquí o llama al ${PHONE_DISPLAY} y aseguramos tu fecha. (STOP para salir)`,
  (n) => `Hola${n}, ¿viste nuestro mensaje? Podemos apartar tu fecha de mudanza hoy. Llama o escribe al ${PHONE_DISPLAY}. (STOP para salir)`,
  (n) => `Hola${n}, precio por hora, sin tarifas ocultas y fechas esta misma semana. ¿Te paso una cotización rápida? ${PHONE_DISPLAY}. (STOP para salir)`,
  (n) => `Hola${n}, ¿sigues planeando tu mudanza? Tenemos cuadrillas disponibles esta semana — ${PHONE_DISPLAY}. (STOP para salir)`,
  (n) => `Hola${n}, 4.9★ en Google, empresa familiar y asegurada. Con gusto te ayudamos con tu mudanza — ${PHONE_DISPLAY}. (STOP para salir)`,
  (n) => `Hola${n}, último aviso: vamos a liberar tu espacio. Llama al ${PHONE_DISPLAY} si aún necesitas mudanza. (STOP para salir)`,
];
const SMS_EN: ((n: string) => string)[] = [
  (n) => `Hi${n}, it's Toro Movers 🐂 We got your moving request and tried to reach you — reply here or call ${PHONE_DISPLAY} and we'll lock in your date. (Reply STOP to opt out)`,
  (n) => `Hi${n}, just making sure you saw us — we can hold your moving date today. Call or text ${PHONE_DISPLAY}. (Reply STOP to opt out)`,
  (n) => `Hi${n}, hourly pricing, no hidden fees, and same-week dates. Want a quick quote? ${PHONE_DISPLAY}. (Reply STOP to opt out)`,
  (n) => `Hi${n}, still planning your move? We have crews open this week — ${PHONE_DISPLAY}. (Reply STOP to opt out)`,
  (n) => `Hi${n}, 4.9★ on Google, family-owned & insured. Happy to help with your move — ${PHONE_DISPLAY}. (Reply STOP to opt out)`,
  (n) => `Hi${n}, last check-in — we're about to release your slot. Call ${PHONE_DISPLAY} if you still need movers. (Reply STOP to opt out)`,
];

// --- Email copy: subject + lead line per touch (1..6), shared template ---
const EMAIL_ES: { subject: (n: string) => string; lead: string }[] = [
  { subject: (n) => `¿Seguimos con tu mudanza${n}?`, lead: "Recibimos tu solicitud de cotización y queríamos retomarla." },
  { subject: () => `¿Apartamos tu fecha?`, lead: "Podemos asegurar tu fecha de mudanza hoy — solo dinos." },
  { subject: () => `Sin tarifas ocultas, fechas esta semana`, lead: "Precio por hora, asegurados, y probablemente tenemos tu fecha libre esta semana." },
  { subject: () => `Cuadrillas disponibles esta semana`, lead: "¿Sigues planeando tu mudanza? Tenemos cuadrillas disponibles esta semana." },
  { subject: () => `4.9★ y empresa familiar`, lead: "Un poco sobre nosotros: 4.9★ en Google, familiar y completamente asegurados." },
  { subject: () => `Último seguimiento de tu mudanza`, lead: "Estamos por liberar tu espacio — aquí seguimos si aún necesitas mudanza." },
];
const EMAIL_EN: { subject: (n: string) => string; lead: string }[] = [
  { subject: (n) => `Still moving${n}?`, lead: "We got your quote request and wanted to follow up." },
  { subject: () => `Want us to hold your date?`, lead: "We can lock in your moving date today — just say the word." },
  { subject: () => `No hidden fees, same-week dates`, lead: "Hourly pricing, fully insured, and we likely have your date open this week." },
  { subject: () => `Crews open this week`, lead: "Still planning your move? We have crews available this week." },
  { subject: () => `4.9★ and family-owned`, lead: "A bit about us: 4.9★ on Google, family-owned and fully insured." },
  { subject: () => `Last check-in on your move`, lead: "We're about to release your slot — still here if you need movers." },
];

function smsBody(touchId: number, firstName: string, lang: Lang): string {
  const n = firstName ? ` ${firstName}` : "";
  return (lang === "es" ? SMS_ES : SMS_EN)[touchId - 1](n);
}

function emailParts(touchId: number, firstName: string, lang: Lang) {
  const n = firstName ? ` ${firstName}` : "";
  const t = (lang === "es" ? EMAIL_ES : EMAIL_EN)[touchId - 1];
  const hi = firstName ? `${lang === "es" ? "Hola" : "Hi"} ${firstName}` : lang === "es" ? "Hola" : "Hi";
  const ctaLine = lang === "es" ? "La forma más rápida es una llamada corta:" : "The fastest way is a quick call:";
  const replyLine = lang === "es" ? "O responde a este correo y coordinamos por aquí." : "Or just reply to this email and we'll take it from here.";
  const footer = lang === "es"
    ? "Toro Movers · Familiar y asegurado · Hablamos español · Florida Central"
    : "Toro Movers · Family-owned & insured · Hablamos español · Central Florida";
  const html = `
  <div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#ffffff;font:15px/1.55 system-ui,sans-serif;color:#0A0A0A">
    <h2 style="font:600 22px/1.3 system-ui,sans-serif;margin:0 0 12px">${hi} 👋</h2>
    <p>${t.lead}</p>
    <p style="margin-top:16px">${ctaLine}</p>
    <p style="font:600 17px system-ui,sans-serif;margin:4px 0 20px"><a href="tel:+16896002720" style="color:#C81E3A;text-decoration:none">${PHONE_DISPLAY}</a></p>
    <p>${replyLine}</p>
    <p style="color:#6B6B72;font-size:13px;margin-top:24px">${footer}</p>
  </div>`;
  const text = `${hi}, ${t.lead} ${lang === "es" ? "Llámanos al" : "Call us at"} ${PHONE_DISPLAY}. — Toro Movers`;
  return { subject: t.subject(n), html, text };
}

type HsContact = {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    phone?: string;
    createdate?: string;
    hs_lead_status?: string;
    hs_language?: string;
  };
};

async function searchNewLeads(token: string): Promise<HsContact[]> {
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: "hs_lead_status", operator: "EQ", value: "NEW" }] },
      ],
      properties: ["email", "firstname", "phone", "createdate", "hs_lead_status", "hs_language"],
      sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
      limit: 100,
    }),
  });
  if (!res.ok) throw new Error(`HubSpot search ${res.status}: ${await res.text().catch(() => "")}`);
  const data = (await res.json()) as { results?: HsContact[] };
  return data.results ?? [];
}

async function sendSms(phone: string, body: string): Promise<boolean> {
  const apiKey = process.env.OPENPHONE_API_KEY;
  const from = process.env.OPENPHONE_FROM_NUMBER;
  if (!apiKey || !from) {
    console.error("[followup] OPENPHONE_API_KEY/FROM_NUMBER missing — SMS skipped");
    return false;
  }
  try {
    const res = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [phone], content: body }),
    });
    if (!res.ok) console.error("[followup] OpenPhone failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("[followup] OpenPhone threw:", err);
    return false;
  }
}

async function sendEmail(to: string, touchId: number, firstName: string, lang: Lang): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  if (!apiKey) {
    console.error("[followup] RESEND_API_KEY missing — email skipped");
    return false;
  }
  const { subject, html, text } = emailParts(touchId, firstName, lang);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `Toro Movers <${from}>`, to: [to], subject, html, text }),
    });
    if (!res.ok) console.error("[followup] Resend failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("[followup] Resend threw:", err);
    return false;
  }
}

export default async () => {
  if (process.env.FOLLOWUP_ENABLED !== "true") {
    console.log("[followup] disabled — set FOLLOWUP_ENABLED=true to activate");
    return new Response("followup disabled");
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    console.error("[followup] HUBSPOT_TOKEN missing");
    return new Response("no hubspot token", { status: 500 });
  }

  const now = Date.now();
  const store = getStore("toro-followup");
  let touches = 0;

  let leads: HsContact[] = [];
  try {
    leads = await searchNewLeads(token);
  } catch (err) {
    console.error("[followup]", err);
    return new Response("search failed", { status: 500 });
  }

  for (const c of leads) {
    const p = c.properties || {};
    const created = p.createdate ? Date.parse(p.createdate) : NaN;
    if (Number.isNaN(created)) continue;
    const ageMs = now - created;
    if (ageMs < 0 || ageMs > MAX_AGE_MS) continue;

    const doneRaw = await store.get(c.id, { type: "text" });
    const lastTouch = doneRaw ? parseInt(doneRaw, 10) : 0;

    // Next un-sent touch whose delay has elapsed (one per run per lead).
    const due = TOUCHES.find((s) => s.id > lastTouch && s.afterMs <= ageMs);
    if (!due) continue;

    const first = (p.firstname || "").trim();
    const lang = pickLang(p.hs_language);

    // SMS on every touch; email only on touches flagged email:true (1/day).
    const smsOk = p.phone ? await sendSms(p.phone, smsBody(due.id, first, lang)) : true;
    const emailOk = due.email && p.email ? await sendEmail(p.email, due.id, first, lang) : true;

    if (smsOk || emailOk) {
      await store.set(c.id, String(due.id));
      touches++;
      console.log(`[followup] lead ${c.id} → touch ${due.id} (sms:${smsOk} email:${emailOk}) ${lang}`);
    }
  }

  return new Response(`followup ran · ${leads.length} NEW leads · ${touches} touches`);
};

// Every 30 minutes.
export const config: Config = { schedule: "*/30 * * * *" };
