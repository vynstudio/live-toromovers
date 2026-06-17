"use client";

// Shared, mobile-first intake engine (homepage /quote + ad funnel /get-quote).
// 2-column shell: LEFT = form step (focal), RIGHT = softer trust panel.
//
// MOBILE KEYBOARD PERSISTENCE (iOS Safari + Instagram in-app browser):
// The five typed steps (from/to/name/phone/email) share ONE persistent <input>
// node that is ALWAYS mounted and never unmounts/remounts between steps — only
// its inputMode/value/autocomplete change. The node keeps a stable key, so a
// rerender never tears it down and focus (and the keyboard) survive step
// changes. The chip→first-text boundary focuses that input IN THE SAME pointer
// gesture (onPointerDown) so iOS opens the keyboard; the Continue button uses
// onPointerDown + preventDefault so it never steals focus / blurs the input.
// A requestAnimationFrame refocus after each rerender keeps it locked in.
// Steps never advance on blur.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { newEventId, trackLead } from "@/lib/track";
import {
  type IntakeData,
  type Lang,
  type ServiceType,
  type JobType,
  EMPTY_INTAKE,
  LANG_OPTIONS,
  SERVICE_OPTIONS,
  JOB_OPTIONS,
  SINGLE_LOCATION_JOBS,
  COPY,
  mapIntakeToCrm,
  captureAttribution,
  serviceFromUrl,
} from "@/lib/intake-config";
import styles from "./intake-wizard.module.css";

type StepId =
  | "language"
  | "service"
  | "job"
  | "from"
  | "to"
  | "name"
  | "phone"
  | "email";

const CHIP_STEPS: StepId[] = ["language", "service", "job"];
const STORE = "toro_intake_v1";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function fmtPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6, 10);
  if (d.length > 6) return `(${a}) ${b}-${c}`;
  if (d.length > 3) return `(${a}) ${b}`;
  if (d.length > 0) return `(${a}`;
  return "";
}
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

type InputMode = "text" | "tel" | "email" | "numeric";

export function IntakeWizard({ entry }: { entry: "home" | "ad" }) {
  const router = useRouter();
  const [data, setData] = useState<IntakeData>({ ...EMPTY_INTAKE, entry });
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const L: Lang = data.language;

  const steps = useMemo<StepId[]>(() => {
    const base: StepId[] = ["language", "service", "job", "from", "to", "name", "phone", "email"];
    if (data.job_type && SINGLE_LOCATION_JOBS.includes(data.job_type)) {
      return base.filter((s) => s !== "to");
    }
    return base;
  }, [data.job_type]);

  const step = steps[Math.min(idx, steps.length - 1)];
  const isTyped = !CHIP_STEPS.includes(step);

  // The persistent input is pre-armed as the first typed field while we're on a
  // chip step, so focusing it in-gesture (at job→from) opens the right keyboard.
  const fieldKey: Exclude<StepId, "language" | "service" | "job"> = isTyped
    ? (step as Exclude<StepId, "language" | "service" | "job">)
    : "from";

  const FIELD: Record<
    string,
    { im: InputMode; ac: string; max?: number; ph: string; value: string; set: (v: string) => void }
  > = {
    from: {
      im: "numeric", ac: "postal-code", max: 5, ph: COPY.fromPh[L],
      value: data.from_zip, set: (v) => set("from_zip", v.replace(/\D/g, "").slice(0, 5)),
    },
    to: {
      im: "text", ac: "postal-code", ph: COPY.toPh[L],
      value: data.to_location, set: (v) => set("to_location", v),
    },
    name: {
      im: "text", ac: "name", ph: COPY.namePh[L],
      value: data.full_name, set: (v) => set("full_name", v),
    },
    phone: {
      im: "tel", ac: "tel", ph: COPY.phonePh[L],
      value: data.phone, set: (v) => set("phone", fmtPhone(v)),
    },
    email: {
      im: "email", ac: "email", ph: COPY.emailPh[L],
      value: data.email, set: (v) => set("email", v),
    },
  };
  const field = FIELD[fieldKey];

  // On mount: restore + attribution + service preset + ViewContent.
  useEffect(() => {
    let restored: Partial<IntakeData> = {};
    try {
      restored = JSON.parse(localStorage.getItem(STORE) || "{}");
    } catch {
      restored = {};
    }
    const attr = captureAttribution();
    const svc = serviceFromUrl();
    setData((d) => ({ ...d, ...restored, ...attr, ...(svc ? { service_type: svc } : {}), entry }));
    window.fbq?.("track", "ViewContent", { content_name: "intake" });
    window.gtag?.("event", "view_content", { content_name: "intake" });
    (window.dataLayer = window.dataLayer || []).push({ event: "view_content", funnel: entry });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After any rerender into a typed step, re-assert focus on the SAME persistent
  // node via rAF — keeps the keyboard open without flicker (never remounts it).
  useEffect(() => {
    if (!isTyped) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [step, isTyped]);

  function persist(next: IntakeData) {
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  function markStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    window.fbq?.("trackCustom", "FormStart", { content_name: "intake" });
    window.gtag?.("event", "form_start", { content_name: "intake" });
    (window.dataLayer = window.dataLayer || []).push({ event: "form_start", funnel: entry });
  }
  function set<K extends keyof IntakeData>(key: K, val: IntakeData[K]) {
    setData((d) => {
      const next = { ...d, [key]: val };
      persist(next);
      return next;
    });
  }
  function back() {
    setErr("");
    setIdx((i) => Math.max(i - 1, 0));
  }

  // Chip → chip (language, service): no keyboard involved; brief feedback delay.
  function pickChip<K extends keyof IntakeData>(key: K, val: IntakeData[K]) {
    markStart();
    setData((d) => {
      const next = { ...d, [key]: val } as IntakeData;
      if (key === "service_type") next.job_type = "";
      persist(next);
      return next;
    });
    setErr("");
    setTimeout(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), 140);
  }

  // Chip → first text (job): focus the persistent input IN-GESTURE so the iOS /
  // in-app keyboard opens, then advance. No unmount, no blur, no delay.
  function pickJob(val: JobType) {
    markStart();
    setData((d) => {
      const next = { ...d, job_type: val };
      persist(next);
      return next;
    });
    setErr("");
    inputRef.current?.focus(); // synchronous, inside the pointer gesture
    setIdx((i) => Math.min(i + 1, steps.length - 1));
  }

  function fail(m: string) {
    setErr(m);
    return false;
  }
  function validateTyped(): boolean {
    if (step === "from") {
      if (!/^\d{5}$/.test(data.from_zip.trim())) return fail(COPY.badZip[L]);
    } else if (step === "to") {
      if (data.to_location.trim().length < 3) return fail(COPY.badTo[L]);
    } else if (step === "name") {
      if (data.full_name.trim().length < 2) return fail(COPY.badName[L]);
    } else if (step === "phone") {
      if (data.phone.replace(/\D/g, "").length !== 10) return fail(COPY.badPhone[L]);
    } else if (step === "email") {
      if (!emailOk(data.email)) return fail(COPY.badEmail[L]);
    }
    return true;
  }

  // Advance the typed steps. Triggered from the Continue button's pointerdown
  // (which preventDefaults so it never blurs the input) and from Enter.
  function next() {
    markStart();
    if (!validateTyped()) return;
    if (step !== "email") {
      setErr("");
      setIdx((i) => Math.min(i + 1, steps.length - 1));
      // keep the same node focused across the step change
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    void submit();
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const event_id = newEventId();
    const payload: IntakeData = { ...data, submitted_at: new Date().toISOString(), event_id };
    window.gtag?.("event", "generate_lead", {
      service: payload.service_type,
      job: payload.job_type,
      campaign: payload.utm_campaign || "",
    });
    (window.dataLayer = window.dataLayer || []).push({
      event: "lead_submit",
      funnel: entry,
      service_type: payload.service_type,
      job_type: payload.job_type,
      utm_source: payload.utm_source,
      utm_campaign: payload.utm_campaign,
    });
    trackLead(event_id);
    try {
      await fetch("/api/ad-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapIntakeToCrm(payload)),
      });
    } catch {
      /* never block the customer */
    }
    try {
      localStorage.removeItem(STORE);
    } catch {
      /* ignore */
    }
    router.push("/thank-you");
  }

  const pct = Math.round(((idx + 1) / steps.length) * 100);
  const jobOpts = data.service_type ? JOB_OPTIONS[data.service_type as ServiceType] : [];
  const QMAP: Record<StepId, string> = {
    language: COPY.langQ[L], service: COPY.serviceQ[L], job: COPY.jobQ[L],
    from: COPY.fromQ[L], to: COPY.toQ[L], name: COPY.nameQ[L],
    phone: COPY.phoneQ[L], email: COPY.emailQ[L],
  };
  const hint = step === "phone" ? COPY.phoneHint[L] : step === "email" ? COPY.emailHint[L] : "";

  return (
    <div className={styles.shell}>
      {/* ============ LEFT: FORM (focal) ============ */}
      <div className={styles.formCol}>
        <div className={styles.head}>
          <div className={styles.headTop}>
            {idx > 0 ? (
              <button type="button" className={styles.back} onClick={back}>
                ← {COPY.back[L]}
              </button>
            ) : (
              <span className={styles.brandTag}>TORO·MOVERS</span>
            )}
            <span className={styles.stepNum}>
              {COPY.stepOf[L]} {idx + 1} {COPY.stepOfMid[L]} {steps.length}
            </span>
          </div>
          <div className={styles.bar}>
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className={styles.body} aria-live="polite">
          {/* Question + chips remount per step (animate). The input below is a
              SIBLING with a stable key and never remounts. */}
          <div className={styles.step} key={step}>
            <h2 className={styles.q}>{QMAP[step]}</h2>

            {step === "language" && (
              <div className={styles.chips}>
                {LANG_OPTIONS.map((o) => (
                  <button key={o.value} type="button"
                    className={`${styles.chip} ${data.language === o.value ? styles.on : ""}`}
                    onPointerDown={(e) => { e.preventDefault(); pickChip("language", o.value as Lang); }}>
                    {o.label[L]}
                  </button>
                ))}
              </div>
            )}
            {step === "service" && (
              <div className={styles.chips}>
                {SERVICE_OPTIONS.map((o) => (
                  <button key={o.value} type="button"
                    className={`${styles.chip} ${data.service_type === o.value ? styles.on : ""}`}
                    onPointerDown={(e) => { e.preventDefault(); pickChip("service_type", o.value); }}>
                    {o.label[L]}
                  </button>
                ))}
              </div>
            )}
            {step === "job" && (
              <div className={styles.chipsGrid}>
                {jobOpts.map((o) => (
                  <button key={o.value} type="button"
                    className={`${styles.chip} ${data.job_type === o.value ? styles.on : ""}`}
                    onPointerDown={(e) => { e.preventDefault(); pickJob(o.value as JobType); }}>
                    {o.label[L]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PERSISTENT INPUT — always mounted, stable key, never remounts.
              Hidden (focusable) on chip steps; visible on typed steps. */}
          <input
            key="intake-typed-input"
            ref={inputRef}
            className={isTyped ? styles.input : styles.inputHidden}
            type="text"
            inputMode={field.im}
            autoComplete={field.ac}
            maxLength={field.max}
            placeholder={isTyped ? field.ph : ""}
            value={field.value}
            tabIndex={isTyped ? 0 : -1}
            aria-hidden={!isTyped}
            onChange={(e) => field.set(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                next();
              }
            }}
          />

          {isTyped && hint ? <p className={styles.hint}>{hint}</p> : null}
          {err ? <p className={styles.err}>{err}</p> : null}

          {isTyped && (
            <button
              type="button"
              className={styles.cta}
              disabled={submitting}
              // pointerdown + preventDefault: advance in-gesture WITHOUT blurring
              // the input, so the keyboard never closes between steps.
              onPointerDown={(e) => { e.preventDefault(); next(); }}
            >
              {step === "email"
                ? submitting ? COPY.sending[L] : COPY.submit[L]
                : COPY.continue[L]}
            </button>
          )}

          <p className={styles.note}>{COPY.trust[L]}</p>
        </div>
      </div>

      {/* ============ RIGHT: TRUST PANEL (softer, secondary) ============ */}
      <aside className={styles.trustCol}>
        <span className={styles.kicker}>{COPY.panelKicker[L]}</span>
        <h3 className={styles.trustH}>{COPY.panelHeadline[L]}</h3>

        <ul className={styles.checks}>
          {COPY.panelBullets[L].map((b) => (
            <li key={b}>
              <span className={styles.tick} aria-hidden>✓</span>
              {b}
            </li>
          ))}
        </ul>

        <div className={styles.nextBox}>
          <p className={styles.nextT}>{COPY.nextTitle[L]}</p>
          <ol className={styles.nextSteps}>
            {COPY.nextSteps[L].map((s, i) => (
              <li key={s}>
                <span className={styles.nextNum}>{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <figure className={styles.review}>
          <div className={styles.stars} aria-hidden>★★★★★</div>
          <blockquote>{COPY.reviewQuote[L]}</blockquote>
          <figcaption>{COPY.reviewAuthor[L]}</figcaption>
        </figure>

        <p className={styles.rating}>{COPY.ratingLine[L]}</p>
      </aside>
    </div>
  );
}
