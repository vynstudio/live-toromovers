"use client";

import { useState } from "react";
import { useLang } from "./lang-provider";
import { trackInitiateCheckout } from "@/lib/track";
import { openQuote } from "@/lib/open-quote";

// Above-fold ad LP start — captures from/to then sends to /get-my-price funnel.
export function AdQuoteStart() {
  const { lang } = useLang();
  const es = lang === "es";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ready = from.trim() !== "" || to.trim() !== "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    trackInitiateCheckout();
    // Prefer destination city as a soft prefill when it looks like a city name
    const cityGuess =
      to.trim().split(",")[0]?.trim() ||
      from.trim().split(",")[0]?.trim() ||
      undefined;
    openQuote({
      source: "ads-lp-start",
      city: cityGuess,
      serviceType: "Full-service move",
    });
  };

  return (
    <form className="ad-start" onSubmit={submit}>
      <div className="ad-start-step">
        {es
          ? "Empieza tu cotización · ¿De dónde a dónde?"
          : "Start your quote · Where are you moving?"}
      </div>
      <label className="ad-start-field">
        <span>{es ? "Desde" : "Moving from"}</span>
        <input
          className="ad-start-input"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder={es ? "Ciudad o dirección" : "City or address"}
          autoComplete="address-line1"
        />
      </label>
      <label className="ad-start-field">
        <span>{es ? "Hasta" : "Moving to"}</span>
        <input
          className="ad-start-input"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={es ? "Ciudad o dirección" : "City or address"}
          autoComplete="address-line2"
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary ad-start-cta"
        disabled={submitting}
      >
        {submitting ? "…" : es ? "Continuar a cotización" : "Continue to quote"}
        <span className="arrow" aria-hidden />
      </button>
      <p className="ad-start-hint" style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
        {ready
          ? es
            ? "Siguiente: formulario rápido de cotización"
            : "Next: quick quote form"
          : es
            ? "Opcional — puedes dejar en blanco y continuar"
            : "Optional — you can leave blank and continue"}
      </p>
      <div className="ad-start-trust">
        <span>
          <b>No hidden fees</b>
        </span>
        <span className="sep">·</span>
        <span>
          <b>Bilingual crew</b>
        </span>
      </div>
    </form>
  );
}
