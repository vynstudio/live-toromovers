"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  SERVICE_CITY_OPTIONS,
  MOVE_TYPE_LABEL,
  type MoveType,
} from "@/lib/lead-magnet-schema";
import {
  newEventId,
  trackLeadMagnetView,
  trackLeadMagnetSubmit,
  trackFormSubmit,
} from "@/lib/track";
import { getAttributionSummary, getAttribution } from "@/lib/utm";

const MOVE_TYPES = Object.keys(MOVE_TYPE_LABEL) as MoveType[];
const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function LeadMagnetForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [moveType, setMoveType] = useState<MoveType>("apartment");
  const [moveDate, setMoveDate] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const startRef = useRef(Date.now());

  // LP viewed — top of the checklist funnel (fires once on mount).
  useEffect(() => {
    trackLeadMagnetView();
  }, []);

  const phoneDigits = phone.replace(/\D/g, "");
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

  const errors = {
    firstName: firstName.trim() === "" ? "Please enter your first name." : "",
    email: email.trim() === ""
      ? "Please enter your email."
      : !emailValid(email)
        ? "That email doesn't look right."
        : "",
    phone: phone !== "" && phoneDigits.length !== 10 ? "Enter a 10-digit phone, or leave it blank." : "",
    city: city === "" ? "Pick your city." : "",
  };
  const formValid = !errors.firstName && !errors.email && !errors.phone && !errors.city;

  const show = (field: keyof typeof errors) => touched[field] && errors[field];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, email: true, phone: true, city: true });
    if (!formValid || submitting) return;

    setSubmitting(true);
    setSubmitError("");
    const eventId = newEventId();
    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          phone: phoneDigits.length === 10 ? phone : "",
          city,
          moveType,
          moveDate: moveDate || "",
          smsOptIn: smsOptIn && phoneDigits.length === 10,
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
      trackFormSubmit("moving_checklist");
      trackLeadMagnetSubmit(eventId);
      router.push("/thank-you-checklist");
    } catch {
      setSubmitError(
        "Something went wrong sending your checklist. Please try again, or call us at (689) 600-2720.",
      );
      setSubmitting(false);
    }
  };

  return (
    <form className="magnet-form" onSubmit={submit} noValidate>
      {/* honeypot: hidden off-screen; only bots fill it */}
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

      <label className="magnet-field">
        <span>First name</span>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
          placeholder="Your first name"
          aria-invalid={Boolean(show("firstName"))}
          autoComplete="given-name"
        />
        {show("firstName") && <em className="magnet-err">{errors.firstName}</em>}
      </label>

      <label className="magnet-field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="you@email.com"
          aria-invalid={Boolean(show("email"))}
          autoComplete="email"
          inputMode="email"
        />
        {show("email") && <em className="magnet-err">{errors.email}</em>}
      </label>

      <label className="magnet-field">
        <span>Phone <i>(optional)</i></span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          placeholder="(689) 600-2720"
          aria-invalid={Boolean(show("phone"))}
          autoComplete="tel"
          inputMode="tel"
        />
        {show("phone") && <em className="magnet-err">{errors.phone}</em>}
      </label>

      <div className="magnet-row">
        <label className="magnet-field">
          <span>City</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, city: true }))}
            aria-invalid={Boolean(show("city"))}
          >
            <option value="" disabled>
              Choose your city
            </option>
            {SERVICE_CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {show("city") && <em className="magnet-err">{errors.city}</em>}
        </label>

        <label className="magnet-field">
          <span>Move type</span>
          <select value={moveType} onChange={(e) => setMoveType(e.target.value as MoveType)}>
            {MOVE_TYPES.map((m) => (
              <option key={m} value={m}>
                {MOVE_TYPE_LABEL[m]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="magnet-field">
        <span>Move date <i>(optional)</i></span>
        <input
          type="date"
          value={moveDate}
          onChange={(e) => setMoveDate(e.target.value)}
          autoComplete="off"
        />
      </label>

      {phoneDigits.length === 10 && (
        <label className="magnet-check">
          <input
            type="checkbox"
            checked={smsOptIn}
            onChange={(e) => setSmsOptIn(e.target.checked)}
          />
          <span>Text me the checklist link too (msg rates may apply, reply STOP to opt out).</span>
        </label>
      )}

      <button className="btn btn-primary magnet-submit" type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Get My Free Checklist"}
        <span className="arrow" aria-hidden />
      </button>

      {submitError && (
        <p className="magnet-err magnet-err-submit" role="alert">
          {submitError}
        </p>
      )}

      <p className="magnet-fine">
        Instant email delivery. No spam — just your checklist and a few local moving tips.
      </p>
    </form>
  );
}
