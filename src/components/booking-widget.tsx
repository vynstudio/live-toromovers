"use client";

import { useEffect, useRef, useState } from "react";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import {
  SQUARE_DEPOSIT_URL,
  DEPOSIT_AMOUNT_DISPLAY,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/lib/contact";

const SERVICES = [
  { id: "full-service", label: "Full service", hint: "Crew + truck" },
  { id: "labor-only", label: "Labor only", hint: "You have the truck" },
  { id: "packing", label: "Packing", hint: "Boxes + wrap" },
] as const;

const WINDOWS = [
  { id: "morning", label: "Morning (8–11am)" },
  { id: "midday", label: "Midday (11am–2pm)" },
  { id: "afternoon", label: "Afternoon (2–5pm)" },
  { id: "flexible", label: "I'm flexible" },
] as const;

type ServiceId = (typeof SERVICES)[number]["id"];
type Stage = "move" | "contact" | "done";

/** Local yyyy-mm-dd — avoids the UTC shift that backdates evening entries. */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function BookingWidget() {
  const [stage, setStage] = useState<Stage>("move");
  const [service, setService] = useState<ServiceId>("full-service");
  const [address, setAddress] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [window_, setWindow] = useState<string>("morning");

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

  const moveReady = address.trim().length > 3 && moveDate !== "";
  const contactReady = firstName.trim() !== "" && phone.replace(/\D/g, "").length >= 10;

  async function submit() {
    setBusy(true);
    setError(null);
    const svc = SERVICES.find((s) => s.id === service);
    const win = WINDOWS.find((w) => w.id === window_);
    try {
      const res = await fetch("/api/crm/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firstName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          serviceType: service,
          moveDate,
          funnel: "bookings",
          source: "bookings-widget",
          note: [
            `Service: ${svc?.label ?? service}`,
            `Pickup: ${address.trim()}`,
            `Date: ${moveDate}`,
            `Start: ${win?.label ?? window_}`,
            "Heading to deposit checkout.",
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
        "We couldn't save those details. You can still pay the deposit, or call us and we'll take it down.",
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
          <li>3. Deposit</li>
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

            <label className="bw-field">
              <span className="bw-label">Move date</span>
              <input
                type="date"
                className="bw-input"
                value={moveDate}
                min={todayISO()}
                onChange={(e) => setMoveDate(e.target.value)}
              />
            </label>

            <label className="bw-field">
              <span className="bw-label">Start time</span>
              <select
                className="bw-input"
                value={window_}
                onChange={(e) => setWindow(e.target.value)}
              >
                {WINDOWS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
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
            <p className="bw-hint">Add your pickup address and move date to continue.</p>
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
              {busy ? "Saving…" : `Continue to ${DEPOSIT_AMOUNT_DISPLAY} deposit`}
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
          <h2 className="bw-done-title">Last step — hold your date</h2>
          <p className="bw-done-body">
            Your {DEPOSIT_AMOUNT_DISPLAY} deposit locks the slot and comes off
            your final invoice. It is not an extra fee.
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
            <div>
              <dt>Date</dt>
              <dd>{moveDate}</dd>
            </div>
            <div>
              <dt>Start</dt>
              <dd>{WINDOWS.find((w) => w.id === window_)?.label}</dd>
            </div>
          </dl>

          {error && <p className="bw-error">{error}</p>}

          <div className="bw-actions">
            <a
              className="bw-cta"
              href={SQUARE_DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Pay {DEPOSIT_AMOUNT_DISPLAY} deposit
              <span className="arrow" aria-hidden />
            </a>
            <a href={PHONE_TEL} className="bw-back">
              Call {PHONE_DISPLAY}
            </a>
          </div>
          <p className="bw-hint">
            Payment is handled by Square in a new tab — we never see your card details.
          </p>
        </div>
      )}
    </div>
  );
}
