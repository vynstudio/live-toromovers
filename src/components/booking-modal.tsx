"use client";

import { useEffect, useState } from "react";
import { useBooking } from "./booking-provider";
import { SERVICE_LABEL, type ServiceType } from "@/lib/booking-schema";

type FormData = {
  zip: string;
  beds: string;
  baths: string;
  sqft: string;
  service: ServiceType;
  date: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const DEFAULT: FormData = {
  zip: "",
  beds: "3",
  baths: "2",
  sqft: "1,500 — 2,500",
  service: "deep",
  date: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export function BookingModal() {
  const { open, setOpen } = useBooking();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(DEFAULT);

  useEffect(() => {
    if (open) {
      setStep(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const onConfirm = async () => {
    // Production: call /api/checkout to create Stripe session → redirect.
    // For now, simulate completion.
    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      /* swallow — stub */
    }
    setStep(6);
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  return (
    <div
      className={`modal-overlay${open ? " active" : ""}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
          setOpen(false);
        }
      }}
    >
      <div className="modal">
        <button
          className="modal-close"
          onClick={() => setOpen(false)}
          aria-label="Close"
        />
        <div className="modal-inner">
          <div className="modal-brand">
            Grace<span className="ampersand"> &amp;</span> Co.
          </div>
          <div className="modal-tag">Request service</div>

          <div className="steps-bar">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`step-pip${
                  step > n ? " done" : step === n ? " active" : ""
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="modal-step active">
              <div className="step-counter">i. &mdash; Residence</div>
              <h3 className="step-title">Where is your home?</h3>
              <p className="step-sub">
                We currently serve Jacksonville, Ponte Vedra and St. Augustine.
              </p>
              <div className="field">
                <label htmlFor="zip">Postal code</label>
                <input
                  id="zip"
                  type="text"
                  maxLength={5}
                  placeholder="32082"
                  value={data.zip}
                  onChange={(e) => update("zip", e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <span />
                <button className="btn btn-primary" onClick={next}>
                  Continue <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="modal-step active">
              <div className="step-counter">ii. &mdash; The home</div>
              <h3 className="step-title">Tell us about the residence.</h3>
              <p className="step-sub">Approximate is perfectly fine.</p>
              <div className="field-row">
                <div className="field">
                  <label>Bedrooms</label>
                  <select
                    value={data.beds}
                    onChange={(e) => update("beds", e.target.value)}
                  >
                    {["1", "2", "3", "4", "5+"].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Bathrooms</label>
                  <select
                    value={data.baths}
                    onChange={(e) => update("baths", e.target.value)}
                  >
                    {["1", "2", "3", "4", "5+"].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Approximate size</label>
                <select
                  value={data.sqft}
                  onChange={(e) => update("sqft", e.target.value)}
                >
                  <option>Under 1,500 sqft</option>
                  <option>1,500 — 2,500</option>
                  <option>2,500 — 3,500</option>
                  <option>3,500 — 5,000</option>
                  <option>5,000+</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-back" onClick={prev}>
                  <span className="btn-back-icon">&larr;</span> Back
                </button>
                <button className="btn btn-primary" onClick={next}>
                  Continue <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="modal-step active">
              <div className="step-counter">iii. &mdash; Service</div>
              <h3 className="step-title">Which relationship suits you?</h3>
              <p className="step-sub">All new clients begin with a deep reset.</p>
              <div className="choice-grid">
                {(
                  [
                    {
                      v: "deep" as const,
                      t: "Initial Deep Reset",
                      d: "A complete reset. Required for all new clients.",
                    },
                    {
                      v: "recurring" as const,
                      t: "Deep Reset + Recurring",
                      d: "Initial deep reset plus ongoing maintenance.",
                    },
                    {
                      v: "movein" as const,
                      t: "Transition Care",
                      d: "Move-in, move-out, or pre-listing service.",
                    },
                  ]
                ).map((c) => (
                  <div
                    key={c.v}
                    className={`choice${data.service === c.v ? " selected" : ""}`}
                    onClick={() => update("service", c.v)}
                  >
                    <div className="choice-title">
                      <span className="check" />
                      {c.t}
                    </div>
                    <div className="choice-desc">{c.d}</div>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button className="btn-back" onClick={prev}>
                  <span className="btn-back-icon">&larr;</span> Back
                </button>
                <button className="btn btn-primary" onClick={next}>
                  Continue <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="modal-step active">
              <div className="step-counter">iv. &mdash; Schedule &amp; contact</div>
              <h3 className="step-title">When may we visit?</h3>
              <p className="step-sub">
                We will confirm the exact time within one business day.
              </p>
              <div className="field">
                <label htmlFor="date">Preferred date</label>
                <input
                  id="date"
                  type="date"
                  value={data.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>First name</label>
                  <input
                    type="text"
                    placeholder="Margaret"
                    value={data.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input
                    type="text"
                    placeholder="Williams"
                    value={data.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="m.williams@residence.com"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Telephone</label>
                <input
                  type="tel"
                  placeholder="(904) 555·0000"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-back" onClick={prev}>
                  <span className="btn-back-icon">&larr;</span> Back
                </button>
                <button className="btn btn-primary" onClick={next}>
                  Review <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="modal-step active">
              <div className="step-counter">v. &mdash; Confirm</div>
              <h3 className="step-title">Confirm your reservation.</h3>
              <p className="step-sub">
                A refundable deposit secures your appointment. This amount is
                applied directly to your first service invoice.
              </p>
              <div className="summary">
                <div className="summary-row">
                  <span className="k">Service</span>
                  <span className="v">{SERVICE_LABEL[data.service]}</span>
                </div>
                <div className="summary-row">
                  <span className="k">Residence</span>
                  <span className="v">
                    {data.beds} bed &middot; {data.baths} bath
                  </span>
                </div>
                <div className="summary-row">
                  <span className="k">Area</span>
                  <span className="v">
                    Northeast FL &middot; {data.zip || "—"}
                  </span>
                </div>
              </div>
              <div className="deposit-block">
                <span className="k">Refundable deposit</span>
                <span className="v">$50</span>
              </div>
              <div className="deposit-note">
                Your appointment is secured upon receipt of the deposit. Fully
                refundable up to 48 hours prior to your scheduled service.
                Processed securely via Stripe.
              </div>
              <button className="btn btn-primary" onClick={onConfirm}>
                Confirm reservation <span className="arrow" />
              </button>
              <div className="modal-actions">
                <button className="btn-back" onClick={prev}>
                  <span className="btn-back-icon">&larr;</span> Back
                </button>
                <span />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="modal-step active">
              <div className="success">
                <div className="success-mark" />
                <h3 className="step-title">Reserved.</h3>
                <p
                  className="step-sub"
                  style={{ maxWidth: 360, margin: "0 auto 32px" }}
                >
                  A confirmation has been sent to your inbox. We will reach out
                  within one business day to arrange the precise time.
                </p>
                <button className="btn-back" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
