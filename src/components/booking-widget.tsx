"use client";

import { useEffect, useRef, useState } from "react";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import {
  SQUARE_BOOKING_URL,
  DEPOSIT_AMOUNT_DISPLAY,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/lib/contact";

const SERVICES = [
  { id: "full-service", label: "Full service", hint: "Crew + truck" },
  { id: "labor-only", label: "Labor only", hint: "You have the truck" },
  { id: "packing", label: "Packing", hint: "Boxes + wrap" },
] as const;

type ServiceId = (typeof SERVICES)[number]["id"];
type Stage = "move" | "contact" | "done";

export function BookingWidget() {
  const [stage, setStage] = useState<Stage>("move");
  const [service, setService] = useState<ServiceId>("full-service");
  const [address, setAddress] = useState("");

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedAt = useRef(Date.now());
  const contactRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === "contact") contactRef.current?.focus();
    if (stage === "done") doneRef.current?.focus();
  }, [stage]);

  const moveReady = address.trim().length > 3;
  const contactReady = firstName.trim() !== "" && phone.replace(/\D/g, "").length >= 10;

  async function submit() {
    setBusy(true);
    setError(null);
    const svc = SERVICES.find((s) => s.id === service);
    try {
      const res = await fetch("/api/crm/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firstName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          serviceType: service,
          funnel: "bookings",
          source: "bookings-widget",
          note: [
            `Service: ${svc?.label ?? service}`,
            `Pickup: ${address.trim()}`,
            "Heading to the Square calendar to pick a slot.",
          ].join("\n"),
          hp,
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });
      if (!res.ok) throw new Error(`lead_failed_${res.status}`);
      setStage("done");
    } catch {
      // Never trap the customer behind a failed request — they can still pay,
      // and the phone number is right there.
      setError(
        "We couldn't save those details. You can still pick a time below, or call us and we'll take it down.",
      );
      setStage("done");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bw-card">
      {stage !== "done" && (
        <ol className="bw-steps" aria-label="Booking progress">
          <li className={stage === "move" ? "on" : "done"}>1. Your move</li>
          <li className={stage === "contact" ? "on" : ""}>2. Your details</li>
          <li>3. Pick your time</li>
        </ol>
      )}

      {stage === "move" && (
        <div className="bw-pane">
          <p className="bw-q">What can we help you with?</p>
          <div className="bw-chips" role="radiogroup" aria-label="Service type">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={service === s.id}
                className={`bw-chip${service === s.id ? " is-on" : ""}`}
                onClick={() => setService(s.id)}
              >
                <span className="bw-chip-label">{s.label}</span>
                <span className="bw-chip-hint">{s.hint}</span>
              </button>
            ))}
          </div>

          <div className="bw-row">
            <label className="bw-field bw-field-wide">
              <span className="bw-label">Pickup address</span>
              <AddressAutocomplete
                value={address}
                onChange={setAddress}
                placeholder="Start typing street…"
                ariaLabel="Pickup address"
              />
            </label>
          </div>

          <button
            type="button"
            className="bw-cta"
            disabled={!moveReady}
            onClick={() => setStage("contact")}
          >
            Continue
            <span className="arrow" aria-hidden />
          </button>
          {!moveReady && (
            <p className="bw-hint">Add your pickup address to continue.</p>
          )}
        </div>
      )}

      {stage === "contact" && (
        <div className="bw-pane" ref={contactRef} tabIndex={-1}>
          <p className="bw-q">Where should we send the confirmation?</p>

          <div className="bw-row">
            <label className="bw-field">
              <span className="bw-label">First name</span>
              <input
                className="bw-input"
                value={firstName}
                autoComplete="given-name"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="bw-field">
              <span className="bw-label">Mobile</span>
              <input
                className="bw-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(407) 555-0139"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="bw-field">
              <span className="bw-label">
                Email <span className="bw-opt">optional</span>
              </span>
              <input
                className="bw-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>

          {/* honeypot */}
          <input
            className="bw-hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />

          <div className="bw-actions">
            <button
              type="button"
              className="bw-cta"
              disabled={!contactReady || busy}
              onClick={submit}
            >
              {busy ? "Saving…" : "Continue"}
              <span className="arrow" aria-hidden />
            </button>
            <button type="button" className="bw-back" onClick={() => setStage("move")}>
              Back
            </button>
          </div>
          <p className="bw-hint">
            We text you a confirmation. No spam, and we never sell your details.
          </p>
        </div>
      )}

      {stage === "done" && (
        <div className="bw-pane" ref={doneRef} tabIndex={-1}>
          <p className="bw-done-eyebrow">Details saved</p>
          <h2 className="bw-done-title">Last step — pick your time</h2>
          <p className="bw-done-body">
            Choose from our live availability. The {DEPOSIT_AMOUNT_DISPLAY}{" "}
            deposit is taken when you book and comes off your final invoice —
            it is not an extra fee.
          </p>

          <dl className="bw-summary">
            <div>
              <dt>Service</dt>
              <dd>{SERVICES.find((s) => s.id === service)?.label}</dd>
            </div>
            <div>
              <dt>Pickup</dt>
              <dd>{address}</dd>
            </div>
          </dl>

          {error && <p className="bw-error">{error}</p>}

          <div className="bw-actions">
            <a
              className="bw-cta"
              href={SQUARE_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Pick your time
              <span className="arrow" aria-hidden />
            </a>
            <a href={PHONE_TEL} className="bw-back">
              Call {PHONE_DISPLAY}
            </a>
          </div>
          <p className="bw-hint">
            Opens the Toro Movers booking calendar on Square in a new tab. Payment is handled by Square — we never see your card details.
          </p>
        </div>
      )}
    </div>
  );
}
