"use client";

import { useEffect, useState } from "react";
import { useBooking } from "./booking-provider";
import { useLang } from "./lang-provider";
import {
  HELP_LABEL,
  SIZE_LABEL,
  type HelpType,
  type MoveSize,
} from "@/lib/booking-schema";

type FormData = {
  helpType: HelpType;
  fromZip: string;
  toZip: string;
  size: MoveSize;
  date: string;
  specialItems: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const DEFAULT: FormData = {
  helpType: "labor-truck",
  fromZip: "",
  toZip: "",
  size: "two-br",
  date: "",
  specialItems: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const STEPS_COUNT = 5;

export function BookingModal() {
  const { open, setOpen } = useBooking();
  const { t, lang } = useLang();
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

  const next = () => setStep((s) => Math.min(s + 1, STEPS_COUNT + 1));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async () => {
    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      /* stub */
    }
    setStep(STEPS_COUNT + 1);
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const helpOptions: HelpType[] = ["labor", "labor-truck", "hauling"];
  const sizeOptions: MoveSize[] = ["studio", "one-br", "two-br", "three-br", "four-plus", "office"];

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
                {helpOptions.map((h) => (
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

          {/* STEP 2 — From / To */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 16 }}>
                {t.quote.fromQ}
              </h3>
              <div className="field">
                <label>{t.quote.fromQ}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder={t.quote.fromPh}
                  value={data.fromZip}
                  onChange={(e) => update("fromZip", e.target.value)}
                />
              </div>
              <div className="field">
                <label>{t.quote.toQ}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder={t.quote.toPh}
                  value={data.toZip}
                  onChange={(e) => update("toZip", e.target.value)}
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

          {/* STEP 3 — Size */}
          {step === 3 && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 16 }}>
                {t.quote.sizeQ}
              </h3>
              <div className="size-grid">
                {sizeOptions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`size-chip${data.size === s ? " selected" : ""}`}
                    onClick={() => update("size", s)}
                  >
                    {SIZE_LABEL[s][lang]}
                  </button>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-back" onClick={prev}>← {t.quote.back}</button>
                <button type="button" className="btn btn-primary" onClick={next}>
                  {t.quote.next} <span className="arrow" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Date + special */}
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
                  <span className="v">{data.fromZip || "—"} → {data.toZip || "—"}</span>
                </div>
                <div className="summary-row">
                  <span className="k">{t.quote.stepLabels[2]}</span>
                  <span className="v">{SIZE_LABEL[data.size][lang]}</span>
                </div>
                <div className="summary-row">
                  <span className="k">{t.quote.stepLabels[3]}</span>
                  <span className="v">{data.date || "—"}</span>
                </div>
              </div>

              <button type="button" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onSubmit}>
                {t.quote.confirm} <span className="arrow" />
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
