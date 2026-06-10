"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/cities";
import {
  LABOR_HELP_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  MOVE_DATE_CHIPS,
  type FunnelType,
} from "@/lib/funnel-schema";
import {
  newEventId,
  trackFormStart,
  trackFormStepComplete,
  trackFunnelSubmit,
  trackFormSubmit,
} from "@/lib/track";
import { getAttributionSummary, getAttribution } from "@/lib/utm";

const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const CITY_CHIPS = CITIES.slice(0, 8).map((c) => c.name);

export function StepFunnelForm({ funnel }: { funnel: FunnelType }) {
  const router = useRouter();
  const isLabor = funnel === "labor";
  const thankYou = isLabor ? "/thank-you-labor" : "/thank-you-full-service";

  const [step, setStep] = useState(1);
  const [started, setStarted] = useState(false);

  const [city, setCity] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [helpNeeded, setHelpNeeded] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState("");
  const [packingHelp, setPackingHelp] = useState<"yes" | "no" | "">("");

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(true);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hp, setHp] = useState("");
  const startRef = useRef(Date.now());

  const TOTAL = 4;

  const begin = () => {
    if (!started) {
      setStarted(true);
      trackFormStart(funnel);
    }
  };

  const advance = (from: number) => {
    trackFormStepComplete(funnel, from);
    setStep((s) => Math.min(s + 1, TOTAL));
  };

  // Phone formatting (US).
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length === 10;
  const onPhoneChange = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    setPhone(
      d.length > 6
        ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
        : d.length > 3
          ? `(${d.slice(0, 3)}) ${d.slice(3)}`
          : d.length > 0
            ? `(${d}`
            : "",
    );
  };

  const toggleHelp = (opt: string) =>
    setHelpNeeded((cur) =>
      cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
    );

  const step3Valid = isLabor ? helpNeeded.length > 0 : propertyType !== "" && packingHelp !== "";

  const contactErrors = {
    firstName: firstName.trim() === "" ? "Please enter your first name." : "",
    email: email.trim() === "" ? "Please enter your email." : !emailValid(email) ? "That email doesn't look right." : "",
    phone: !phoneValid ? "Enter a 10-digit phone." : "",
  };
  const contactValid = !contactErrors.firstName && !contactErrors.email && !contactErrors.phone;
  const showErr = (f: keyof typeof contactErrors) => touched[f] && contactErrors[f];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, email: true, phone: true });
    if (!contactValid || submitting) return;

    setSubmitting(true);
    setSubmitError("");
    const eventId = newEventId();
    try {
      const res = await fetch("/api/funnel-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnel,
          firstName: firstName.trim(),
          email: email.trim(),
          phone,
          moveDate,
          city,
          helpNeeded: isLabor ? helpNeeded : [],
          propertyType: isLabor ? "" : propertyType,
          packingHelp: !isLabor && packingHelp === "yes",
          smsConsent,
          source: getAttributionSummary() || undefined,
          utm: getAttribution(),
          landingPage: typeof window !== "undefined" ? window.location.pathname : undefined,
          lang: "en",
          eventId,
          hp,
          elapsedMs: Date.now() - startRef.current,
        }),
      });
      if (!res.ok) throw new Error("bad_status");
      trackFormStepComplete(funnel, 4);
      trackFormSubmit(`${funnel}_funnel`);
      trackFunnelSubmit(funnel, eventId);
      router.push(thankYou);
    } catch {
      setSubmitError(
        "Something went wrong sending your request. Please try again, or call us at (689) 600-2720.",
      );
      setSubmitting(false);
    }
  };

  const pct = useMemo(() => `${(step / TOTAL) * 100}%`, [step]);

  return (
    <form className="sf" onSubmit={submit} noValidate>
      <input
        className="hp-field"
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
      />

      <div className="sf-progress" aria-hidden>
        <span style={{ width: pct }} />
      </div>
      <p className="sf-step-label">Step {step} of {TOTAL}</p>

      {/* STEP 1 — CITY */}
      {step === 1 && (
        <div className="sf-step">
          <h2 className="sf-q">Where is your move taking place?</h2>
          <p className="sf-help">City helps us confirm we serve your area.</p>
          <div className="sf-options">
            {CITY_CHIPS.map((c) => (
              <button
                type="button"
                key={c}
                className={`sf-opt${city === c ? " on" : ""}`}
                onClick={() => { begin(); setCity(c); advance(1); }}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              className={`sf-opt${city === "Other Central Florida" ? " on" : ""}`}
              onClick={() => { begin(); setCity("Other Central Florida"); advance(1); }}
            >
              Other Central FL
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — MOVE DATE */}
      {step === 2 && (
        <div className="sf-step">
          <h2 className="sf-q">When are you moving?</h2>
          <p className="sf-help">Move date helps us confirm availability.</p>
          <div className="sf-options">
            {MOVE_DATE_CHIPS.map((d) => (
              <button
                type="button"
                key={d}
                className={`sf-opt${moveDate === d ? " on" : ""}`}
                onClick={() => { setMoveDate(d); advance(2); }}
              >
                {d}
              </button>
            ))}
          </div>
          <label className="sf-field sf-or">
            <span>Or pick a date</span>
            <input
              type="date"
              value={/^\d{4}-\d{2}-\d{2}$/.test(moveDate) ? moveDate : ""}
              onChange={(e) => setMoveDate(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="sf-actions">
            <button type="button" className="sf-back" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="fn-btn fn-btn-primary" disabled={!moveDate} onClick={() => advance(2)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — SERVICE */}
      {step === 3 && (
        <div className="sf-step">
          {isLabor ? (
            <>
              <h2 className="sf-q">What do you need help with?</h2>
              <p className="sf-help">Pick all that apply.</p>
              <div className="sf-options">
                {LABOR_HELP_OPTIONS.map((o) => (
                  <button
                    type="button"
                    key={o}
                    className={`sf-opt${helpNeeded.includes(o) ? " on" : ""}`}
                    onClick={() => toggleHelp(o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="sf-q">What are we moving?</h2>
              <p className="sf-help">Property type and packing help.</p>
              <div className="sf-options">
                {PROPERTY_TYPE_OPTIONS.map((o) => (
                  <button
                    type="button"
                    key={o}
                    className={`sf-opt${propertyType === o ? " on" : ""}`}
                    onClick={() => setPropertyType(o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
              <p className="sf-help" style={{ marginTop: 18 }}>Need packing help?</p>
              <div className="sf-options">
                {(["yes", "no"] as const).map((v) => (
                  <button
                    type="button"
                    key={v}
                    className={`sf-opt${packingHelp === v ? " on" : ""}`}
                    onClick={() => setPackingHelp(v)}
                  >
                    {v === "yes" ? "Yes — pack for me" : "No — I'll pack"}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="sf-actions">
            <button type="button" className="sf-back" onClick={() => setStep(2)}>Back</button>
            <button type="button" className="fn-btn fn-btn-primary" disabled={!step3Valid} onClick={() => advance(3)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — CONTACT */}
      {step === 4 && (
        <div className="sf-step">
          <h2 className="sf-q">Where do we send your quote?</h2>
          <label className="sf-field">
            <span>First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
              placeholder="Your first name"
              aria-invalid={Boolean(showErr("firstName"))}
              autoComplete="given-name"
            />
            {showErr("firstName") && <em className="sf-err">{contactErrors.firstName}</em>}
          </label>
          <label className="sf-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@email.com"
              aria-invalid={Boolean(showErr("email"))}
              autoComplete="email"
              inputMode="email"
            />
            <i className="sf-micro">We'll send your quote details here.</i>
            {showErr("email") && <em className="sf-err">{contactErrors.email}</em>}
          </label>
          <label className="sf-field">
            <span>Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              placeholder="(689) 600-2720"
              aria-invalid={Boolean(showErr("phone"))}
              autoComplete="tel"
              inputMode="tel"
            />
            <i className="sf-micro">For faster updates and availability.</i>
            {showErr("phone") && <em className="sf-err">{contactErrors.phone}</em>}
          </label>
          <label className="sf-consent">
            <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} />
            <span>Text me availability updates (msg rates may apply, reply STOP to opt out).</span>
          </label>

          <div className="sf-actions">
            <button type="button" className="sf-back" onClick={() => setStep(3)}>Back</button>
            <button className="fn-btn fn-btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Submit Request"}
            </button>
          </div>
          {submitError && <p className="sf-err sf-err-submit" role="alert">{submitError}</p>}
        </div>
      )}
    </form>
  );
}
