"use client";

import { useEffect, useState } from "react";
import { useBooking } from "./booking-provider";
import { useLang } from "./lang-provider";
import { AddressInput } from "./address-input";
import {
  HELP_LABEL,
  RESIDENCE_LABEL,
  FLOOR_LABEL,
  type HelpType,
  type ResidenceType,
  type ApartmentFloor,
} from "@/lib/booking-schema";
import { newEventId, trackLead } from "@/lib/track";

type FormData = {
  helpType: HelpType;
  fromAddress: string;
  fromResidence: ResidenceType;
  fromFloor?: ApartmentFloor;
  toAddress: string;
  toResidence: ResidenceType;
  toFloor?: ApartmentFloor;
  date: string;
  specialItems: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const DEFAULT: FormData = {
  helpType: "labor-truck",
  fromAddress: "",
  fromResidence: "house",
  fromFloor: undefined,
  toAddress: "",
  toResidence: "house",
  toFloor: undefined,
  date: "",
  specialItems: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const STEPS_COUNT = 5;

const HELP_OPTIONS: HelpType[] = ["labor", "labor-truck", "hauling"];
const RESIDENCE_OPTIONS: ResidenceType[] = [
  "house",
  "apartment",
  "townhome",
  "storage",
];
const FLOOR_OPTIONS: ApartmentFloor[] = ["1", "2", "3", "4", "5+"];

export function BookingModal() {
  const { open, setOpen } = useBooking();
  const { t, lang } = useLang();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(DEFAULT);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSubmitting(false);
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

  const next = () => setStep((s) => Math.min(s + 1, STEPS_COUNT + 1));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async () => {
    setSubmitting(true);
    const eventId = newEventId();
    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId }),
      });
      trackLead(eventId);
    } catch {
      /* network error — lead may not have been recorded */
    }
    setSubmitting(false);
    setStep(STEPS_COUNT + 1);
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  // When residence changes away from apartment, drop the floor
  const setResidence = (
    which: "from" | "to",
    value: ResidenceType,
  ) => {
    if (which === "from") {
      setData((d) => ({
        ...d,
        fromResidence: value,
        fromFloor: value === "apartment" ? d.fromFloor : undefined,
      }));
    } else {
      setData((d) => ({
        ...d,
        toResidence: value,
        toFloor: value === "apartment" ? d.toFloor : undefined,
      }));
    }
  };

  return (
    <div
      className={`modal-overlay${open ? " active" : ""}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
          setOpen(false);
        }
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button
          className="modal-close"
          onClick={() => setOpen(false)}
          aria-label="Close"
        />
        <div className="modal-inner">
          <div className="modal-header">
            <h2 className="modal-title">{t.quote.title}</h2>
            <p className="modal-sub">{t.quote.sub}</p>
          </div>

          <div className="steps-bar" aria-hidden>
            {Array.from({ length: STEPS_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`step-pip${
                  step > i + 1 ? " done" : step === i + 1 ? " active" : ""
                }`}
              />
            ))}
          </div>

          {/* STEP 1 — Help type */}
          {step === 1 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 8 }}>
                {t.quote.helpQ}
              </h3>
              <div className="choices">
                {HELP_OPTIONS.map((h) => (
                  <div
                    key={h}
                    className={`choice${data.helpType === h ? " selected" : ""}`}
                    onClick={() => update("helpType", h)}
                  >
                    <span className="choice-radio" aria-hidden />
                    <span className="choice-label">{HELP_LABEL[h][lang]}</span>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <span />
                <button type="button" className="btn btn-primary" onClick={next}>
                  {t.quote.next} <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — FROM address + residence + floor */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 16 }}>
                {t.quote.fromQ}
              </h3>
              <div className="field">
                <label>{t.quote.fromAddrLabel}</label>
                <AddressInput
                  value={data.fromAddress}
                  onChange={(v) => update("fromAddress", v)}
                  placeholder={t.quote.fromPh}
                  ariaLabel={t.quote.fromAddrLabel}
                />
              </div>

              <div className="field">
                <label>{t.quote.residenceQ}</label>
                <div className="size-grid" style={{ marginBottom: 0 }}>
                  {RESIDENCE_OPTIONS.map((r) => (
                    <button
                      type="button"
                      key={r}
                      className={`size-chip${data.fromResidence === r ? " selected" : ""}`}
                      onClick={() => setResidence("from", r)}
                    >
                      {RESIDENCE_LABEL[r][lang]}
                    </button>
                  ))}
                </div>
              </div>

              {data.fromResidence === "apartment" && (
                <div className="field">
                  <label>{t.quote.floorQ}</label>
                  <div className="size-grid" style={{ marginBottom: 0 }}>
                    {FLOOR_OPTIONS.map((f) => (
                      <button
                        type="button"
                        key={f}
                        className={`size-chip${data.fromFloor === f ? " selected" : ""}`}
                        onClick={() => update("fromFloor", f)}
                      >
                        {FLOOR_LABEL[f][lang]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={prev}>← {t.quote.back}</button>
                <button type="button" className="btn btn-primary" onClick={next}>
                  {t.quote.next} <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — TO address + residence + floor */}
          {step === 3 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 16 }}>
                {t.quote.toQ}
              </h3>
              <div className="field">
                <label>{t.quote.toAddrLabel}</label>
                <AddressInput
                  value={data.toAddress}
                  onChange={(v) => update("toAddress", v)}
                  placeholder={t.quote.toPh}
                  ariaLabel={t.quote.toAddrLabel}
                />
              </div>

              <div className="field">
                <label>{t.quote.residenceQ}</label>
                <div className="size-grid" style={{ marginBottom: 0 }}>
                  {RESIDENCE_OPTIONS.map((r) => (
                    <button
                      type="button"
                      key={r}
                      className={`size-chip${data.toResidence === r ? " selected" : ""}`}
                      onClick={() => setResidence("to", r)}
                    >
                      {RESIDENCE_LABEL[r][lang]}
                    </button>
                  ))}
                </div>
              </div>

              {data.toResidence === "apartment" && (
                <div className="field">
                  <label>{t.quote.floorQ}</label>
                  <div className="size-grid" style={{ marginBottom: 0 }}>
                    {FLOOR_OPTIONS.map((f) => (
                      <button
                        type="button"
                        key={f}
                        className={`size-chip${data.toFloor === f ? " selected" : ""}`}
                        onClick={() => update("toFloor", f)}
                      >
                        {FLOOR_LABEL[f][lang]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={prev}>← {t.quote.back}</button>
                <button type="button" className="btn btn-primary" onClick={next}>
                  {t.quote.next} <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Date + special items */}
          {step === 4 && (
            <div>
              <div className="field">
                <label>{t.quote.dateQ}</label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>
              <div className="field">
                <label>{t.quote.specialQ}</label>
                <textarea
                  placeholder={t.quote.specialPh}
                  value={data.specialItems}
                  onChange={(e) => update("specialItems", e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={prev}>← {t.quote.back}</button>
                <button type="button" className="btn btn-primary" onClick={next}>
                  {t.quote.next} <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 — Contact + review + submit */}
          {step === 5 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 16 }}>
                {t.quote.contactQ}
              </h3>
              <div className="field-row">
                <div className="field">
                  <label>{t.quote.firstName}</label>
                  <input
                    type="text"
                    autoComplete="given-name"
                    value={data.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>{t.quote.lastName}</label>
                  <input
                    type="text"
                    autoComplete="family-name"
                    value={data.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>{t.quote.email}</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="field">
                <label>{t.quote.phone}</label>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="(689) 600-2720"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              <div className="summary">
                <div className="summary-row">
                  <span className="k">{t.quote.stepLabels[0]}</span>
                  <span className="v">{HELP_LABEL[data.helpType][lang]}</span>
                </div>
                <div className="summary-row">
                  <span className="k">{t.quote.stepLabels[1]}</span>
                  <span className="v">
                    {data.fromAddress || "—"}
                    <br />
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {RESIDENCE_LABEL[data.fromResidence][lang]}
                      {data.fromResidence === "apartment" && data.fromFloor
                        ? ` · ${FLOOR_LABEL[data.fromFloor][lang]}`
                        : ""}
                    </span>
                  </span>
                </div>
                <div className="summary-row">
                  <span className="k">{t.quote.stepLabels[2]}</span>
                  <span className="v">
                    {data.toAddress || "—"}
                    <br />
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {RESIDENCE_LABEL[data.toResidence][lang]}
                      {data.toResidence === "apartment" && data.toFloor
                        ? ` · ${FLOOR_LABEL[data.toFloor][lang]}`
                        : ""}
                    </span>
                  </span>
                </div>
                <div className="summary-row">
                  <span className="k">{t.quote.stepLabels[3]}</span>
                  <span className="v">{data.date || "—"}</span>
                </div>
              </div>

              <button
                type="button"
                className={`btn btn-primary${submitting ? " btn-loading" : ""}`}
                style={{ width: "100%", justifyContent: "center" }}
                onClick={onSubmit}
                disabled={submitting}
              >
                {submitting ? (lang === "es" ? "Enviando..." : "Sending...") : t.quote.confirm}
                {!submitting && <span className="arrow" />}
              </button>

              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={prev}>← {t.quote.back}</button>
                <span />
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step === STEPS_COUNT + 1 && (
            <div className="success">
              <div className="success-mark" aria-hidden />
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 28, marginBottom: 12 }}>
                {t.quote.successTitle}
              </h3>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 28px" }}>
                {t.quote.successBody}
              </p>
              <button type="button" className="btn-back" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
