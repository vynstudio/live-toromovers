"use client";

/**
 * Official Square Appointments booking UI.
 *
 * Do NOT inject Square’s embed .js dynamically with async — their script
 * relies on document.currentScript / static parent placement and fails under
 * Next.js client mount (blank widget). Use the same iframe URL the official
 * embed would create, plus a full-page fallback button.
 */

import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

/** Widget iframe (what the official embed script inserts). */
export const SQUARE_APPOINTMENTS_IFRAME_SRC =
  "https://app.squareup.com/appointments/buyer/widget/81n62yjpmpqdfr/L5D6N73XD7ADG";

/** Full booking flow (new tab / mobile fallback). */
export const SQUARE_APPOINTMENTS_BOOK_URL =
  "https://book.squareup.com/appointments/81n62yjpmpqdfr/location/L5D6N73XD7ADG/services";

type Props = {
  lang?: "en" | "es";
  className?: string;
};

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
            ? "Elija servicio, fecha y pague el depósito de forma segura con Square."
            : "Pick a service and date, then pay your deposit securely with Square."}
        </p>
      </div>

      <div className="sq-appt-actions">
        <a
          href={SQUARE_APPOINTMENTS_BOOK_URL}
          className="fn-btn fn-btn-primary fn-btn-lg lca-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          {es ? "Abrir reserva segura →" : "Open secure booking →"}
        </a>
        <p className="sq-appt-or">
          {es ? "O reserve aquí abajo" : "Or book in the calendar below"}
        </p>
      </div>

      <div
        className="sq-appt-widget"
        id="square-appointments-widget"
        aria-label={es ? "Calendario de citas Square" : "Square booking calendar"}
      >
        <iframe
          title={es ? "Reserva Square — Toro Movers" : "Square booking — Toro Movers"}
          src={SQUARE_APPOINTMENTS_IFRAME_SRC}
          className="sq-appt-iframe"
          // payment: Apple Pay / Google Pay inside Square
          allow="payment *"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="sq-appt-fallback">
        {es ? "¿Problemas para ver el calendario?" : "Calendar not loading?"}{" "}
        <a
          href={SQUARE_APPOINTMENTS_BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {es ? "Abrir en Square" : "Open on Square"}
        </a>
        {" · "}
        <a href={PHONE_TEL}>
          {es ? "Llamar" : "Call"} {PHONE_DISPLAY}
        </a>
      </p>
    </div>
  );
}
