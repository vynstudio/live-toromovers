/**
 * Interactive HTML email templates for Toro Movers booking flow.
 * Table-based, mobile-friendly, Gmail/Apple Mail/Outlook-safe.
 *
 * Flow: quote → book (Square) → deposit → moving day checklist
 */

import {
  BUSINESS_NAME,
  EMAIL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SQUARE_BOOKING_URL,
  SLOGAN,
} from "@/lib/contact";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://toromovers.net";
const CHECKLIST = `${SITE}/move-day-checklist`;
const BOOK = SQUARE_BOOKING_URL;
const CHERRY = "#C8102E";
const NAVY = "#1B2A52";
const INK = "#0A0A0A";
const MUTED = "#5C6370";
const LINE = "#E8E8EC";
const BG = "#F4F5F7";

export type EmailLang = "en" | "es";

export type BookingEmailKind =
  | "quote_received"
  | "book_online"
  | "booked_confirm"
  | "checklist_reminder";

export type BookingEmailOpts = {
  firstName: string;
  lang?: EmailLang;
  moveDate?: string;
  /** Optional preheader (inbox preview text) */
  preheader?: string;
};

export type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstName(name: string): string {
  return (name || "there").trim().split(/\s+/)[0] || "there";
}

/** Primary CTA button (bulletproof table pattern) */
function ctaButton(href: string, label: string, color = CHERRY): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
  <tr>
    <td align="center" bgcolor="${color}" style="border-radius:10px;background:${color};">
      <a href="${esc(href)}" target="_blank"
         style="display:inline-block;padding:16px 28px;font:700 16px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;">
        ${esc(label)}
      </a>
    </td>
  </tr>
</table>`;
}

/** Secondary outline button */
function ctaOutline(href: string, label: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:12px auto 0;">
  <tr>
    <td align="center" style="border-radius:10px;border:2px solid ${NAVY};">
      <a href="${esc(href)}" target="_blank"
         style="display:inline-block;padding:14px 24px;font:600 15px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${NAVY};text-decoration:none;border-radius:10px;">
        ${esc(label)}
      </a>
    </td>
  </tr>
</table>`;
}

/** Interactive 3-step progress (clickable) */
function progressSteps(
  active: 1 | 2 | 3,
  lang: EmailLang,
): string {
  const labels =
    lang === "es"
      ? (["Agendar", "Depósito", "Checklist"] as const)
      : (["Book", "Deposit", "Checklist"] as const);
  const hrefs = [BOOK, BOOK, CHECKLIST] as const;

  const cells = labels
    .map((label, i) => {
      const n = (i + 1) as 1 | 2 | 3;
      const on = n === active;
      const done = n < active;
      const bg = on ? CHERRY : done ? NAVY : "#FFFFFF";
      const fg = on || done ? "#FFFFFF" : MUTED;
      const border = on || done ? bg : LINE;
      return `
      <td align="center" valign="top" width="33%" style="padding:0 4px;">
        <a href="${esc(hrefs[i])}" target="_blank" style="text-decoration:none;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom:8px;">
                <div style="display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background:${bg};border:2px solid ${border};font:700 14px/32px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${fg};">
                  ${done ? "✓" : n}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="font:600 12px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${on ? INK : MUTED};">
                ${esc(label)}
              </td>
            </tr>
          </table>
        </a>
      </td>`;
    })
    .join("");

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
  <tr>${cells}</tr>
</table>`;
}

function shell(opts: {
  preheader: string;
  title: string;
  bodyHtml: string;
  lang: EmailLang;
}): string {
  const footerNote =
    opts.lang === "es"
      ? "Family-owned · Precio claro · Hablamos español"
      : "Family-owned · Up-front pricing · Hablamos español";

  return `<!DOCTYPE html>
<html lang="${opts.lang === "es" ? "es" : "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${esc(opts.title)}</title>
  <!--[if mso]><style>table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG};-webkit-text-size-adjust:100%;">
  <!-- Preheader (hidden inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${esc(opts.preheader)}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BG};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${LINE};">
          <!-- Header -->
          <tr>
            <td style="background:${NAVY};padding:22px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font:700 13px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:#ffffff;">
                    ${esc(BUSINESS_NAME)}
                  </td>
                  <td align="right" style="font:500 12px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:rgba(255,255,255,0.75);">
                    ${esc(SLOGAN)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 28px 8px;font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
              ${opts.bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:8px 28px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid ${LINE};">
                <tr>
                  <td style="padding-top:18px;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${MUTED};">
                    ${esc(footerNote)}<br />
                    <a href="${PHONE_TEL}" style="color:${CHERRY};text-decoration:none;font-weight:600;">${PHONE_DISPLAY}</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:${EMAIL}" style="color:${MUTED};text-decoration:none;">${EMAIL}</a>
                    &nbsp;·&nbsp;
                    <a href="${SITE}" style="color:${MUTED};text-decoration:none;">toromovers.net</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;font:12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#9AA0A6;text-align:center;">
          ${opts.lang === "es" ? "Recibiste este correo porque solicitaste servicio con Toro Movers." : "You received this email because you requested service with Toro Movers."}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function textFooter(lang: EmailLang): string {
  return lang === "es"
    ? `\n\n—\nToro Movers · ${PHONE_DISPLAY} · ${SITE}\nFamily-owned · Hablamos español`
    : `\n\n—\nToro Movers · ${PHONE_DISPLAY} · ${SITE}\nFamily-owned · Up-front pricing · Hablamos español`;
}

export function buildBookingEmail(
  kind: BookingEmailKind,
  opts: BookingEmailOpts,
): BuiltEmail {
  const name = firstName(opts.firstName);
  const lang: EmailLang = opts.lang === "es" ? "es" : "en";
  const date = opts.moveDate?.trim();

  switch (kind) {
    case "quote_received": {
      const subject =
        lang === "es"
          ? `Toro Movers — recibimos tu solicitud, ${name}`
          : `Toro Movers — we got your quote request, ${name}`;
      const preheader =
        lang === "es"
          ? "Te contactamos pronto con precio y disponibilidad."
          : "We'll call you soon with pricing and availability.";

      const body =
        lang === "es"
          ? `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              Hola ${esc(name)},
            </h1>
            <p style="margin:0 0 16px;color:${MUTED};">
              Recibimos tu solicitud de cotización. Un miembro del equipo te contacta pronto con precio y disponibilidad.
            </p>
            ${progressSteps(1, lang)}
            <p style="margin:0 0 20px;color:${MUTED};font-size:14px;">
              Cuando el precio te funcione, podrás <strong style="color:${INK};">agendar online</strong> y pagar el depósito en Square.
            </p>
            ${ctaButton(BOOK, "Ver agenda online →", NAVY)}
            ${ctaOutline(PHONE_TEL, `Llamar ${PHONE_DISPLAY}`)}
          `
          : `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              Hi ${esc(name)},
            </h1>
            <p style="margin:0 0 16px;color:${MUTED};">
              We got your quote request. A team member will contact you shortly with pricing and availability.
            </p>
            ${progressSteps(1, lang)}
            <p style="margin:0 0 20px;color:${MUTED};font-size:14px;">
              When the quote works for you, you can <strong style="color:${INK};">book online</strong> and pay the deposit in Square.
            </p>
            ${ctaButton(BOOK, "View booking calendar →", NAVY)}
            ${ctaOutline(PHONE_TEL, `Call ${PHONE_DISPLAY}`)}
          `;

      const text =
        lang === "es"
          ? `Hola ${name},\n\nRecibimos tu solicitud de cotización. Te contactamos pronto.\n\nAgenda: ${BOOK}\nLlámanos: ${PHONE_DISPLAY}${textFooter(lang)}`
          : `Hi ${name},\n\nWe got your quote request. We'll contact you soon.\n\nBook: ${BOOK}\nCall: ${PHONE_DISPLAY}${textFooter(lang)}`;

      return {
        subject,
        html: shell({
          preheader: opts.preheader || preheader,
          title: subject,
          bodyHtml: body,
          lang,
        }),
        text,
      };
    }

    case "book_online": {
      const subject =
        lang === "es"
          ? `${name}, agenda tu mudanza con Toro`
          : `${name}, book your move with Toro`;
      const preheader =
        lang === "es"
          ? "Reserva la fecha y paga el depósito en Square."
          : "Reserve your date and pay the deposit in Square.";

      const body =
        lang === "es"
          ? `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              Agenda tu mudanza
            </h1>
            <p style="margin:0 0 16px;color:${MUTED};">
              Hola ${esc(name)} — elige fecha y hora online. El depósito se paga en Square al reservar y se aplica a la factura final.
            </p>
            ${progressSteps(1, lang)}
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;background:${BG};border-radius:12px;">
              <tr>
                <td style="padding:16px 18px;font-size:14px;color:${MUTED};">
                  <strong style="color:${INK};">Qué pasa después</strong><br />
                  1. Reservas en Square<br />
                  2. Pagas el depósito<br />
                  3. Completas el checklist del día de mudanza
                </td>
              </tr>
            </table>
            ${ctaButton(BOOK, "Book online now →")}
            ${ctaOutline(PHONE_TEL, `O llama ${PHONE_DISPLAY}`)}
          `
          : `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              Book your move
            </h1>
            <p style="margin:0 0 16px;color:${MUTED};">
              Hi ${esc(name)} — pick your date and time online. Deposit is paid in Square when you reserve and applies to your final invoice.
            </p>
            ${progressSteps(1, lang)}
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;background:${BG};border-radius:12px;">
              <tr>
                <td style="padding:16px 18px;font-size:14px;color:${MUTED};">
                  <strong style="color:${INK};">What happens next</strong><br />
                  1. Book in Square<br />
                  2. Pay the deposit<br />
                  3. Complete the moving day checklist
                </td>
              </tr>
            </table>
            ${ctaButton(BOOK, "Book online now →")}
            ${ctaOutline(PHONE_TEL, `Or call ${PHONE_DISPLAY}`)}
          `;

      const text =
        lang === "es"
          ? `Hola ${name},\n\nAgenda tu mudanza online (depósito en Square):\n${BOOK}\n\nO llama ${PHONE_DISPLAY}${textFooter(lang)}`
          : `Hi ${name},\n\nBook your move online (deposit via Square):\n${BOOK}\n\nOr call ${PHONE_DISPLAY}${textFooter(lang)}`;

      return {
        subject,
        html: shell({
          preheader: opts.preheader || preheader,
          title: subject,
          bodyHtml: body,
          lang,
        }),
        text,
      };
    }

    case "booked_confirm": {
      const subject =
        lang === "es"
          ? `✅ ${name}, tu mudanza está confirmada`
          : `✅ ${name}, your move is confirmed`;
      const preheader =
        lang === "es"
          ? "Depósito recibido. Completa el checklist del día."
          : "Deposit received. Complete your moving day checklist.";

      const dateRow = date
        ? lang === "es"
          ? `<p style="margin:0 0 8px;"><strong style="color:${INK};">Fecha:</strong> ${esc(date)}</p>`
          : `<p style="margin:0 0 8px;"><strong style="color:${INK};">Date:</strong> ${esc(date)}</p>`
        : "";

      const body =
        lang === "es"
          ? `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              ¡Estás agendado, ${esc(name)}!
            </h1>
            <p style="margin:0 0 8px;color:${MUTED};">Depósito recibido. Tu fecha está reservada.</p>
            ${dateRow}
            ${progressSteps(3, lang)}
            <p style="margin:0 0 20px;color:${MUTED};">
              Último paso: el <strong style="color:${INK};">checklist del día de mudanza</strong> (direcciones, hora de inicio, inventario) para mandar el crew correcto.
            </p>
            ${ctaButton(CHECKLIST, "Completar checklist (2 min) →")}
            ${ctaOutline(PHONE_TEL, `Preguntas? ${PHONE_DISPLAY}`)}
          `
          : `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              You're booked, ${esc(name)}!
            </h1>
            <p style="margin:0 0 8px;color:${MUTED};">Deposit received. Your date is locked in.</p>
            ${dateRow}
            ${progressSteps(3, lang)}
            <p style="margin:0 0 20px;color:${MUTED};">
              Last step: the <strong style="color:${INK};">moving day checklist</strong> (addresses, start time, inventory) so we send the right crew.
            </p>
            ${ctaButton(CHECKLIST, "Complete checklist (2 min) →")}
            ${ctaOutline(PHONE_TEL, `Questions? ${PHONE_DISPLAY}`)}
          `;

      const text =
        lang === "es"
          ? `✅ ${name}, estás agendado con Toro.${date ? `\nFecha: ${date}` : ""}\nDepósito recibido.\n\nChecklist del día:\n${CHECKLIST}\n\n${PHONE_DISPLAY}${textFooter(lang)}`
          : `✅ ${name}, you're booked with Toro.${date ? `\nDate: ${date}` : ""}\nDeposit received.\n\nMoving day checklist:\n${CHECKLIST}\n\n${PHONE_DISPLAY}${textFooter(lang)}`;

      return {
        subject,
        html: shell({
          preheader: opts.preheader || preheader,
          title: subject,
          bodyHtml: body,
          lang,
        }),
        text,
      };
    }

    case "checklist_reminder": {
      const subject =
        lang === "es"
          ? `${name}, falta tu checklist del día de mudanza`
          : `${name}, we still need your moving day checklist`;
      const preheader =
        lang === "es"
          ? "2 minutos — direcciones, hora e inventario."
          : "2 minutes — addresses, start time, and inventory.";

      const dateRow = date
        ? lang === "es"
          ? `<p style="margin:0 0 16px;color:${MUTED};">Mudanza: <strong style="color:${INK};">${esc(date)}</strong></p>`
          : `<p style="margin:0 0 16px;color:${MUTED};">Move date: <strong style="color:${INK};">${esc(date)}</strong></p>`
        : "";

      const body =
        lang === "es"
          ? `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              Checklist pendiente
            </h1>
            <p style="margin:0 0 8px;color:${MUTED};">
              Hola ${esc(name)} — aún necesitamos el checklist del día de mudanza para preparar el crew.
            </p>
            ${dateRow}
            ${progressSteps(3, lang)}
            ${ctaButton(CHECKLIST, "Abrir checklist →")}
            ${ctaOutline(PHONE_TEL, PHONE_DISPLAY)}
          `
          : `
            <h1 style="margin:0 0 12px;font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${INK};letter-spacing:-0.02em;">
              Checklist still needed
            </h1>
            <p style="margin:0 0 8px;color:${MUTED};">
              Hi ${esc(name)} — we still need your moving day checklist so we can prep the crew.
            </p>
            ${dateRow}
            ${progressSteps(3, lang)}
            ${ctaButton(CHECKLIST, "Open checklist →")}
            ${ctaOutline(PHONE_TEL, PHONE_DISPLAY)}
          `;

      const text =
        lang === "es"
          ? `Hola ${name},\n\nAún necesitamos tu checklist del día de mudanza.${date ? `\nMudanza: ${date}` : ""}\n\n${CHECKLIST}\n\n${PHONE_DISPLAY}${textFooter(lang)}`
          : `Hi ${name},\n\nWe still need your moving day checklist.${date ? `\nMove date: ${date}` : ""}\n\n${CHECKLIST}\n\n${PHONE_DISPLAY}${textFooter(lang)}`;

      return {
        subject,
        html: shell({
          preheader: opts.preheader || preheader,
          title: subject,
          bodyHtml: body,
          lang,
        }),
        text,
      };
    }

    default:
      return buildBookingEmail("book_online", opts);
  }
}
