"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAddressInput } from "./google-address-input";
import { useLang } from "./lang-provider";
import { trackInitiateCheckout } from "@/lib/track";

// Step-1 of the quote wizard, embedded above the fold on the ad LP. Submitting
// here fires the InitiateCheckout event and pushes the user to /quote with the
// addresses prefilled — the wizard auto-advances to step 2.
export function AdQuoteStart() {
  const router = useRouter();
  const { lang } = useLang();
  const es = lang === "es";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ready = from.trim() !== "" && to.trim() !== "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    trackInitiateCheckout();
    const params = new URLSearchParams({ from: from.trim(), to: to.trim() });
    router.push(`/quote?${params.toString()}`);
  };

  return (
    <form className="ad-start" onSubmit={submit}>
      <div className="ad-start-step">
        {es ? "Paso 1 de 4 · ¿De dónde a dónde?" : "Step 1 of 4 · Where are you moving?"}
      </div>
      <label className="ad-start-field">
        <span>{es ? "Desde" : "Moving from"}</span>
        <GoogleAddressInput
          value={from}
          onChange={setFrom}
          placeholder={es ? "Calle, ciudad, FL" : "Street, city, FL"}
          ariaLabel={es ? "Origen" : "Pickup"}
        />
      </label>
      <label className="ad-start-field">
        <span>{es ? "Hasta" : "Moving to"}</span>
        <GoogleAddressInput
          value={to}
          onChange={setTo}
          placeholder={es ? "Calle, ciudad, FL" : "Street, city, FL"}
          ariaLabel={es ? "Destino" : "Drop-off"}
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary ad-start-cta"
        disabled={!ready || submitting}
      >
        {submitting ? "…" : es ? "Continuar" : "Continue"}
        <span className="arrow" aria-hidden />
      </button>
      <div className="ad-start-trust">
        <span><b>No hidden fees</b></span>
        <span className="sep">·</span>
        <span><b>No hidden fees</b></span>
        <span className="sep">·</span>
        <span><b>Bilingual crew</b></span>
      </div>
    </form>
  );
}
