"use client";

import { useMemo, useRef, useState } from "react";
import {
  ACCESS_TYPES,
  CONTACT_METHODS,
  DATE_FLEX,
  MOVE_SIZES,
  PROPERTY_TYPES,
  QUOTE_COPY,
  REQUEST_TYPES,
  SPECIAL_ITEMS,
  YES_NO_UNSURE,
} from "@/config/quote-form";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import { getAttribution, getAttributionSummary } from "@/lib/utm";

type Step = 1 | 2 | 3 | 4;
type Opt = { id: string; label: string };

function phoneDigitsOf(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.slice(0, 10);
}

function formatPhone(raw: string) {
  const d = phoneDigitsOf(raw);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length > 0) return `(${d}`;
  return "";
}

function emailLooksOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function labelOf(list: readonly Opt[], id: string) {
  return list.find((x) => x.id === id)?.label || id;
}

function ChipGroup({
  options,
  value,
  onChange,
  labelledBy,
}: {
  options: readonly Opt[];
  value: string;
  onChange: (id: string) => void;
  labelledBy?: string;
}) {
  return (
    <div className="qf-chip-row" aria-labelledby={labelledBy}>
      {options.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`qf-chip${value === m.id ? " on" : ""}`}
          aria-pressed={value === m.id}
          onClick={(e) => {
            e.preventDefault();
            onChange(m.id);
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export function UniversalQuoteForm() {
  const startRef = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState("");

  const [requestType, setRequestType] = useState("");
  const [dateFlex, setDateFlex] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [originZip, setOriginZip] = useState("");
  const [destZip, setDestZip] = useState("");
  const [moveSize, setMoveSize] = useState("");

  const [pickupProperty, setPickupProperty] = useState("");
  const [deliveryProperty, setDeliveryProperty] = useState("");
  const [pickupAccess, setPickupAccess] = useState("");
  const [deliveryAccess, setDeliveryAccess] = useState("");
  const [packing, setPacking] = useState("");
  const [storage, setStorage] = useState("");
  const [specials, setSpecials] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [consentContact, setConsentContact] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phoneDigits = phoneDigitsOf(phone);
  const progress = done ? "100%" : `${(step / 4) * 100}%`;

  function go(next: Step) {
    setErrors({});
    setSubmitError("");
    setStep(next);
    requestAnimationFrame(() => {
      try {
        scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      } catch {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }
    });
  }

  function validate(s: Step): boolean {
    const next: Record<string, string> = {};
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (s === 1) {
      if (fn.length < 1) next.firstName = "Enter your first name.";
      if (ln.length < 1 && !fn.includes(" ")) next.lastName = "Enter your last name.";
      if (phoneDigits.length !== 10) next.phone = "Enter a 10-digit US mobile number.";
      if (!emailLooksOk(email)) next.email = "Enter a valid email address.";
    }
    if (s === 2) {
      if (!requestType) next.requestType = "Choose the type of help you need.";
      if (!dateFlex) next.dateFlex = "Tell us about your move date.";
      if (dateFlex === "exact" && !moveDate)
        next.moveDate = "Pick a date, or choose flexible / unknown.";
      if (!/^\d{5}$/.test(originZip)) next.originZip = "Enter a 5-digit origin ZIP.";
      if (!/^\d{5}$/.test(destZip)) next.destZip = "Enter a 5-digit destination ZIP.";
      if (!moveSize) next.moveSize = "Choose a move size, or Not sure.";
    }
    if (s === 4 && !consentContact) {
      next.consent = "Check the box so we can contact you about this request.";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => {
        scrollRef.current
          ?.querySelector(".lca-err, [aria-invalid='true']")
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return false;
    }
    return true;
  }

  function splitName() {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (ln) return { firstName: fn, lastName: ln };
    const parts = fn.split(/\s+/);
    if (parts.length > 1) {
      return { firstName: parts[0] || fn, lastName: parts.slice(1).join(" ") };
    }
    return { firstName: fn, lastName: ln };
  }

  function advance(from: Step) {
    if (!validate(from)) return;
    go((from + 1) as Step);
  }

  async function submitLead() {
    if (!validate(4) || sending) return;
    setSending(true);
    setSubmitError("");
    const wait = 1300 - (Date.now() - startRef.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    const names = splitName();
    const dateLabel =
      dateFlex === "exact" ? moveDate : labelOf(DATE_FLEX, dateFlex);
    const specialLabels = specials.map((id) => labelOf(SPECIAL_ITEMS, id));

    try {
      const res = await fetch("/api/crm/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: names.firstName,
          lastName: names.lastName,
          name: `${names.firstName} ${names.lastName}`.trim(),
          phone: phoneDigits,
          email: email.trim(),
          funnel: "full-service",
          source: "funnel",
          serviceType: labelOf(REQUEST_TYPES, requestType),
          city: originZip,
          moveDate: dateLabel,
          consentSms: consentContact,
          consentEmail: true,
          landingPage: "/get-a-quote",
          utm: getAttribution(),
          hp: "",
          elapsedMs: Math.max(Date.now() - startRef.current, 1300),
          note: [
            "get-a-quote form",
            `help=${labelOf(REQUEST_TYPES, requestType)}`,
            `size=${labelOf(MOVE_SIZES, moveSize)}`,
            `from=${originZip} to=${destZip}`,
            `date=${dateLabel}`,
            contactMethod && `prefer=${labelOf(CONTACT_METHODS, contactMethod)}`,
            pickupProperty && `pickup=${labelOf(PROPERTY_TYPES, pickupProperty)}`,
            deliveryProperty && `drop=${labelOf(PROPERTY_TYPES, deliveryProperty)}`,
            pickupAccess && `pickup_access=${labelOf(ACCESS_TYPES, pickupAccess)}`,
            deliveryAccess && `drop_access=${labelOf(ACCESS_TYPES, deliveryAccess)}`,
            packing && `packing=${labelOf(YES_NO_UNSURE, packing)}`,
            storage && `storage=${labelOf(YES_NO_UNSURE, storage)}`,
            specialLabels.length ? `items=${specialLabels.join(", ")}` : "",
            consentMarketing ? "marketing_opt_in=yes" : "marketing_opt_in=no",
            getAttributionSummary() && `attr=${getAttributionSummary()}`,
            notes.trim() && `notes=${notes.trim()}`,
          ]
            .filter(Boolean)
            .join(" · "),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        spam?: boolean;
        error?: string;
      };
      if (!res.ok || data.spam || data.ok === false) {
        throw new Error(data.error || `status ${res.status}`);
      }
      setDone(true);
    } catch {
      setSubmitError(
        `Couldn't send. Please call ${PHONE_DISPLAY} or try again.`,
      );
    } finally {
      setSending(false);
    }
  }

  const review = useMemo(
    () => [
      ["Name", `${firstName} ${lastName}`.trim()],
      ["Phone", phone],
      ["Email", email],
      ["Help needed", labelOf(REQUEST_TYPES, requestType)],
      [
        "Move date",
        dateFlex === "exact" ? moveDate : labelOf(DATE_FLEX, dateFlex),
      ],
      ["From ZIP", originZip],
      ["To ZIP", destZip],
      ["Size", labelOf(MOVE_SIZES, moveSize)],
      ["Notes", notes.trim() || "—"],
    ],
    [
      firstName,
      lastName,
      phone,
      email,
      requestType,
      dateFlex,
      moveDate,
      originZip,
      destZip,
      moveSize,
      notes,
    ],
  );

  if (done) {
    return (
      <div className="lca">
        <div className="lca-progress" aria-hidden>
          <span style={{ width: "100%" }} />
        </div>
        <div className="lca-scroll lca-scroll--done">
          <div className="lca-done lca-enter" role="status">
            <div className="lca-done-check" aria-hidden>
              ✓
            </div>
            <p className="lca-done-eyebrow">Thanks — we received your request.</p>
            <h2 className="lca-done-h2">
              A Toro Movers team member will contact you shortly.
            </h2>
            <ol className="qf-next">
              <li>We review the details you provided.</li>
              <li>A team member contacts you.</li>
              <li>We discuss your moving needs and next steps.</li>
            </ol>
            <a href={PHONE_TEL} className="fn-btn fn-btn-primary fn-btn-lg lca-full">
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className="lca qf"
      onSubmit={(e) => {
        e.preventDefault();
        if (sending) return;
        if (step < 4) advance(step);
        else void submitLead();
      }}
    >
      <div className="lca-progress" aria-hidden>
        <span style={{ width: progress }} />
      </div>

      <div className="lca-scroll" ref={scrollRef}>
        <p className="lca-step">
          Step {step} of 4
          <span className="lca-step-hint">
            {step === 1
              ? " · contact"
              : step === 2
                ? " · move basics"
                : step === 3
                  ? " · optional"
                  : " · review"}
          </span>
        </p>

        {step === 1 && (
          <div className="lca-form lca-enter">
            <h2 className="lca-q">{QUOTE_COPY.headline}</h2>
            <p className="lca-help">{QUOTE_COPY.subheadline}</p>
            <p className="qf-pills">
              {QUOTE_COPY.trustPoints.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </p>

            <div className="qf-two">
              <label className="lca-field">
                <span>First name</span>
                <input
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                />
              </label>
              <label className="lca-field">
                <span>Last name</span>
                <input
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                />
              </label>
            </div>
            {(errors.firstName || errors.lastName) && (
              <p className="lca-err">{errors.firstName || errors.lastName}</p>
            )}

            <label className="lca-field">
              <span>Mobile phone</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder={PHONE_DISPLAY}
                aria-invalid={Boolean(errors.phone)}
              />
            </label>
            {errors.phone && <p className="lca-err">{errors.phone}</p>}

            <label className="lca-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
            </label>
            {errors.email && <p className="lca-err">{errors.email}</p>}

            <p className="qf-label" id="qf-pref">
              Preferred contact (optional)
            </p>
            <ChipGroup
              labelledBy="qf-pref"
              options={CONTACT_METHODS}
              value={contactMethod}
              onChange={setContactMethod}
            />
          </div>
        )}

        {step === 2 && (
          <div className="lca-form lca-enter">
            <h2 className="lca-q">Tell us about your move</h2>
            <p className="lca-help">ZIPs are enough. Street address is optional later.</p>

            <p className="qf-label" id="qf-help">
              Type of help needed
            </p>
            <div className={errors.requestType ? "is-error" : undefined}>
              <ChipGroup
                labelledBy="qf-help"
                options={REQUEST_TYPES}
                value={requestType}
                onChange={setRequestType}
              />
            </div>
            {errors.requestType && <p className="lca-err">{errors.requestType}</p>}

            <p className="qf-label" id="qf-date">
              Move date
            </p>
            <div className={errors.dateFlex ? "is-error" : undefined}>
              <ChipGroup
                labelledBy="qf-date"
                options={DATE_FLEX}
                value={dateFlex}
                onChange={setDateFlex}
              />
            </div>
            {dateFlex === "exact" && (
              <label className="lca-field" style={{ marginTop: 12 }}>
                <span>Exact date</span>
                <input
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                />
              </label>
            )}
            {errors.dateFlex && <p className="lca-err">{errors.dateFlex}</p>}
            {errors.moveDate && <p className="lca-err">{errors.moveDate}</p>}

            <div className="qf-two" style={{ marginTop: 8 }}>
              <label className="lca-field">
                <span>Origin ZIP</span>
                <input
                  className="qf-zip"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={originZip}
                  onChange={(e) =>
                    setOriginZip(e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                  aria-invalid={Boolean(errors.originZip)}
                />
              </label>
              <label className="lca-field">
                <span>Destination ZIP</span>
                <input
                  className="qf-zip"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={destZip}
                  onChange={(e) =>
                    setDestZip(e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                  aria-invalid={Boolean(errors.destZip)}
                />
              </label>
            </div>
            {(errors.originZip || errors.destZip) && (
              <p className="lca-err">{errors.originZip || errors.destZip}</p>
            )}

            <p className="qf-label" id="qf-size">
              Move size
            </p>
            <div className={errors.moveSize ? "is-error" : undefined}>
              <ChipGroup
                labelledBy="qf-size"
                options={MOVE_SIZES}
                value={moveSize}
                onChange={setMoveSize}
              />
            </div>
            {errors.moveSize && <p className="lca-err">{errors.moveSize}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="lca-form lca-enter">
            <h2 className="lca-q">Any extra details?</h2>
            <p className="lca-help">Optional — skip anything you don’t know.</p>

            <p className="qf-label">Pickup property</p>
            <ChipGroup options={PROPERTY_TYPES} value={pickupProperty} onChange={setPickupProperty} />
            <p className="qf-label">Delivery property</p>
            <ChipGroup
              options={PROPERTY_TYPES}
              value={deliveryProperty}
              onChange={setDeliveryProperty}
            />
            <p className="qf-label">Pickup access</p>
            <ChipGroup options={ACCESS_TYPES} value={pickupAccess} onChange={setPickupAccess} />
            <p className="qf-label">Delivery access</p>
            <ChipGroup options={ACCESS_TYPES} value={deliveryAccess} onChange={setDeliveryAccess} />
            <p className="qf-label">Packing help?</p>
            <ChipGroup options={YES_NO_UNSURE} value={packing} onChange={setPacking} />
            <p className="qf-label">Storage needed?</p>
            <ChipGroup options={YES_NO_UNSURE} value={storage} onChange={setStorage} />

            <p className="qf-label">Special or large items</p>
            <div className="qf-chip-row">
              {SPECIAL_ITEMS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`qf-chip${specials.includes(m.id) ? " on" : ""}`}
                  aria-pressed={specials.includes(m.id)}
                  onClick={() =>
                    setSpecials((cur) =>
                      cur.includes(m.id) ? cur.filter((x) => x !== m.id) : [...cur, m.id],
                    )
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>

            <label className="lca-field" style={{ marginTop: 16 }}>
              <span>Notes</span>
              <textarea
                className="lca-textarea"
                maxLength={2000}
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
                placeholder="Stairs, elevator windows, items to leave — whatever helps."
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="lca-form lca-enter">
            <h2 className="lca-q">Review and send</h2>
            <p className="lca-help">Check this looks right. You can go back to edit.</p>
            <dl className="qf-review">
              {review.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <label className="lca-consent">
              <input
                type="checkbox"
                checked={consentContact}
                onChange={(e) => setConsentContact(e.target.checked)}
              />
              <span>
                {QUOTE_COPY.consentContact}{" "}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  Privacy
                </a>
              </span>
            </label>
            {errors.consent && <p className="lca-err">{errors.consent}</p>}

            <label className="lca-consent">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
              />
              <span>{QUOTE_COPY.consentMarketing}</span>
            </label>
            {submitError && <p className="lca-err">{submitError}</p>}
          </div>
        )}
      </div>

      <div className="lca-footer qf-footer">
        {step > 1 ? (
          <button
            type="button"
            className="fn-btn fn-btn-ghost-light qf-back"
            onClick={() => go((step - 1) as Step)}
            disabled={sending}
          >
            Back
          </button>
        ) : null}
        {step < 4 ? (
          <button type="submit" className="fn-btn fn-btn-primary">
            Continue
          </button>
        ) : (
          <button type="submit" className="fn-btn fn-btn-primary" disabled={sending}>
            {sending ? QUOTE_COPY.sendingCta : QUOTE_COPY.primaryCta}
          </button>
        )}
      </div>
    </form>
  );
}
