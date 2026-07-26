"use client";

/**
 * Square Appointments booking entry for Toro Movers.
 *
 * Official embed script fails under Next.js; iframe often shows only the logo
 * (SPA blank) because of third‑party cookie / frame restrictions. Full-page
 * Square booking is the reliable path for real services + payments.
 */

import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

/** Full Square booking flow (services → date → pay). */
export const SQUARE_APPOINTMENTS_BOOK_URL =
  "https://book.squareup.com/appointments/81n62yjpmpqdfr/location/L5D6N73XD7ADG/services";

type Props = {
  lang?: "en" | "es";
  className?: string;
};

const SERVICES = [
  {
    en: "Labor — 1 mover",
    es: "Labor — 1 mudancero",
    hintEn: "You have the truck · billed as set in Square",
    hintEs: "Tú traes el camión · según precio en Square",
  },
  {
    en: "Labor — 2 movers",
    es: "Labor — 2 mudanceros",
    hintEn: "Faster load/unload · set price in Square",
    hintEs: "Carga más rápida · precio en Square",
  },
] as const;

export function SquareAppointmentsEmbed({ lang = "en", className }: Props) {
  const es = lang === "es";

  return (
    <div className={className ? `sq-appt ${className}` : "sq-appt"}>
      <div className="sq-appt-intro">
        <h1 className="sq-appt-title">
          {es ? "Reserve su mudanza" : "Book your move"}
        </h1>
        <p className="sq-appt-lede">
          {es
            ? "Se abre la reserva segura de Square: elija servicio, fecha y pague el depósito. Su pago va directo a Toro Movers."
            : "Opens secure Square booking: pick a service, choose a date, and pay. Payment goes straight to Toro Movers."}
        </p>
      </div>

      <ul className="sq-appt-services" aria-label={es ? "Servicios" : "Services"}>
        {SERVICES.map((s) => (
          <li key={s.en} className="sq-appt-service">
            <strong>{es ? s.es : s.en}</strong>
            <span>{es ? s.hintEs : s.hintEn}</span>
          </li>
        ))}
      </ul>

      <div className="sq-appt-actions">
        <a
          href={SQUARE_APPOINTMENTS_BOOK_URL}
          className="fn-btn fn-btn-primary fn-btn-lg lca-full"
          // Same tab = best mobile conversion; Square is the checkout host
        >
          {es ? "Continuar a Square →" : "Continue to Square →"}
        </a>
        <a href={PHONE_TEL} className="fn-btn fn-btn-ghost-light lca-full">
          {es ? "Prefiero llamar" : "Prefer to call"} — {PHONE_DISPLAY}
        </a>
      </div>

      <p className="sq-appt-fine">
        {es
          ? "Powered by Square · tarjeta segura · se aplica al total si es depósito"
          : "Powered by Square · secure card checkout · deposit applies to your move when set in Square"}
      </p>

      <p className="sq-appt-fallback">
        <a href="/get-my-price">
          {es ? "Solo quiero una cotización gratis" : "I only want a free quote"}
        </a>
      </p>
    </div>
  );
}
