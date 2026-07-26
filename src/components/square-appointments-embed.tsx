"use client";

/**
 * Official Square Appointments buyer widget.
 * Embed code from Square Dashboard → Appointments → Online booking → Embed.
 *
 * Script injects the calendar UI next to itself; we mount it in a dedicated
 * container so Next.js App Router doesn't strip the node.
 */

import { useEffect, useRef, useState } from "react";

/** Toro Movers Square Appointments widget (production location). */
export const SQUARE_APPOINTMENTS_WIDGET_SRC =
  "https://square.site/appointments/buyer/widget/81n62yjpmpqdfr/L5D6N73XD7ADG.js";

type Props = {
  lang?: "en" | "es";
  className?: string;
};

export function SquareAppointmentsEmbed({ lang = "en", className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const es = lang === "es";

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Clear previous inject (Strict Mode remount / navigation back)
    el.innerHTML = "";
    setFailed(false);

    const script = document.createElement("script");
    script.src = SQUARE_APPOINTMENTS_WIDGET_SRC;
    script.async = true;
    script.onerror = () => setFailed(true);
    el.appendChild(script);

    return () => {
      // Remove script + anything Square injected under this mount
      el.innerHTML = "";
    };
  }, []);

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

      <div
        ref={mountRef}
        className="sq-appt-widget"
        id="square-appointments-widget"
        aria-label={es ? "Calendario de citas Square" : "Square booking calendar"}
      />

      {failed && (
        <p className="sq-appt-fallback" role="alert">
          {es
            ? "No se pudo cargar el calendario. Abra el enlace de reserva o llámenos."
            : "Couldn't load the calendar. Open the booking link or call us."}{" "}
          <a
            href="https://square.site/appointments/buyer/widget/81n62yjpmpqdfr/L5D6N73XD7ADG"
            target="_blank"
            rel="noopener noreferrer"
          >
            {es ? "Abrir reserva Square" : "Open Square booking"}
          </a>
        </p>
      )}
    </div>
  );
}
