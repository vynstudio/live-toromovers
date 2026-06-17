"use client";

// Shared, mobile-first intake engine. Rendered identically by the homepage
// (/quote) and the ad funnel (/get-quote). One container, one question at a
// time, chips with auto-advance, masks + browser autocomplete, branching, and
// a single submit path (/api/ad-funnel) via the CRM mapping layer. Tracking
// (Pixel/GA4/CAPI dedup) is preserved: ViewContent on load, FormStart on first
// interaction, Lead on submit (shared eventId).

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

export function IntakeWizard({ entry }: { entry: "home" | "ad" }) {
  const router = useRouter();
  const [data, setData] = useState<IntakeData>({ ...EMPTY_INTAKE, entry });
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const L: Lang = data.language;

  // Branching: skip the destination step for single-location container jobs.
  const steps = useMemo<StepId[]>(() => {
    const base: StepId[] = ["language", "service", "job", "from", "to", "name", "phone", "email"];
    if (data.job_type && SINGLE_LOCATION_JOBS.includes(data.job_type)) {
      return base.filter((s) => s !== "to");
    }
    return base;
  }, [data.job_type]);

  const step = steps[Math.min(idx, steps.length - 1)];

  // On mount: restore + capture attribution + service preset + ViewContent.
  useEffect(() => {
    let restored: Partial<IntakeData> = {};
    try {
      restored = JSON.parse(localStorage.getItem(STORE) || "{}");
    } catch {
      restored = {};
    }
    const attr = captureAttribution();
    const svc = serviceFromUrl();
    setData((d) => ({
      ...d,
      ...restored,
      ...attr,
      ...(svc ? { service_type: svc } : {}),
      entry,
    }));
    window.fbq?.("track", "ViewContent", { content_name: "intake" });
    window.gtag?.("event", "view_content", { content_name: "intake" });
    (window.dataLayer = window.dataLayer || []).push({ event: "view_content", funnel: entry });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus the text input when a typed step shows.
  useEffect(() => {
    if (["from", "to", "name", "phone", "email"].includes(step)) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [step]);

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
  function advance() {
    setErr("");
    setIdx((i) => Math.min(i + 1, steps.length - 1));
  }
  function back() {
    setErr("");
    setIdx((i) => Math.max(i - 1, 0));
  }

  // Chip pick → set, mark start, auto-advance.
  function pick<K extends keyof IntakeData>(key: K, val: IntakeData[K]) {
    markStart();
    setData((d) => {
      const next = { ...d, [key]: val } as IntakeData;
      // Reset job if service changes so options stay valid.
      if (key === "service_type") next.job_type = "";
      persist(next);
      return next;
    });
    setErr("");
    setTimeout(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), 160);
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
  function fail(m: string) {
    setErr(m);
    return false;
  }

  async function next() {
    markStart();
    if (!validateTyped()) return;
    if (step !== "email") {
      advance();
      return;
    }
    await submit();
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const event_id = newEventId();
    const payload: IntakeData = {
      ...data,
      submitted_at: new Date().toISOString(),
      event_id,
    };
    // GA4 + dataLayer lead, then Pixel Lead (deduped server-side via eventId).
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

  return (
    <div className={styles.wiz} aria-live="polite">
      <div className={styles.bar}>
        <span style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.card}>
        {idx > 0 && (
          <button type="button" className={styles.back} onClick={back}>
            ← {COPY.back[L]}
          </button>
        )}

        {/* ----- CHIP STEPS ----- */}
        {step === "language" && (
          <Step q={COPY.langQ[L]}>
            <div className={styles.chips}>
              {LANG_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`${styles.chip} ${data.language === o.value ? styles.on : ""}`}
                  onClick={() => pick("language", o.value as Lang)}
                >
                  {o.label[L]}
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === "service" && (
          <Step q={COPY.serviceQ[L]}>
            <div className={styles.chips}>
              {SERVICE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`${styles.chip} ${data.service_type === o.value ? styles.on : ""}`}
                  onClick={() => pick("service_type", o.value)}
                >
                  {o.label[L]}
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === "job" && (
          <Step q={COPY.jobQ[L]}>
            <div className={styles.chipsGrid}>
              {jobOpts.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`${styles.chip} ${data.job_type === o.value ? styles.on : ""}`}
                  onClick={() => pick("job_type", o.value as JobType)}
                >
                  {o.label[L]}
                </button>
              ))}
            </div>
          </Step>
        )}

        {/* ----- TYPED STEPS ----- */}
        {step === "from" && (
          <Step q={COPY.fromQ[L]} err={err}>
            <input
              ref={inputRef}
              className={styles.input}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder={COPY.fromPh[L]}
              value={data.from_zip}
              onChange={(e) => set("from_zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => e.key === "Enter" && next()}
            />
          </Step>
        )}
        {step === "to" && (
          <Step q={COPY.toQ[L]} err={err}>
            <input
              ref={inputRef}
              className={styles.input}
              autoComplete="postal-code"
              placeholder={COPY.toPh[L]}
              value={data.to_location}
              onChange={(e) => set("to_location", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
            />
          </Step>
        )}
        {step === "name" && (
          <Step q={COPY.nameQ[L]} err={err}>
            <input
              ref={inputRef}
              className={styles.input}
              autoComplete="name"
              placeholder={COPY.namePh[L]}
              value={data.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
            />
          </Step>
        )}
        {step === "phone" && (
          <Step q={COPY.phoneQ[L]} err={err}>
            <input
              ref={inputRef}
              className={styles.input}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={COPY.phonePh[L]}
              value={data.phone}
              onChange={(e) => set("phone", fmtPhone(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && next()}
            />
          </Step>
        )}
        {step === "email" && (
          <Step q={COPY.emailQ[L]} err={err}>
            <input
              ref={inputRef}
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={COPY.emailPh[L]}
              value={data.email}
              onChange={(e) => set("email", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
            />
          </Step>
        )}

        {/* Continue / Submit only on typed steps (chips auto-advance) */}
        {["from", "to", "name", "phone", "email"].includes(step) && (
          <button
            type="button"
            className={styles.cta}
            disabled={submitting}
            onClick={next}
          >
            {step === "email"
              ? submitting
                ? COPY.sending[L]
                : COPY.submit[L]
              : COPY.continue[L]}
          </button>
        )}

        <p className={styles.trust}>{COPY.trust[L]}</p>
      </div>
    </div>
  );
}

function Step({
  q,
  err,
  children,
}: {
  q: string;
  err?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.step}>
      <h2 className={styles.q}>{q}</h2>
      {children}
      {err ? <p className={styles.err}>{err}</p> : null}
    </div>
  );
}
