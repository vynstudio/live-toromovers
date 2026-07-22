"use client";

/**
 * Global lead form — same fields/flow as toromoveit.com / go.toromovers.net QuoteFormFields.
 * Used inside QuoteModal (popup). Posts to /api/crm/lead for HubSpot + Telegram + etc.
 */

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useLang } from "./lang-provider";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import { newEventId, trackLead } from "@/lib/track";
import { getAttributionSummary } from "@/lib/utm";

const SERVICES_EN = [
  "Full-service move",
  "Labor only",
  "Long distance",
  "Packing help",
];
const SERVICES_ES = [
  "Mudanza full-service",
  "Solo labor",
  "Larga distancia",
  "Empaque",
];
const JOBS_EN = ["Apartment", "House", "Office", "Storage"];
const JOBS_ES = ["Apartamento", "Casa", "Oficina", "Bodega"];

function formatPhone(raw: string) {
  const d = String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length > 0) return `(${d}`;
  return "";
}

function phoneDigits(raw: string) {
  return String(raw || "").replace(/\D/g, "");
}

function Pills({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="glf-pills" role="radiogroup" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={value === opt}
          className={`glf-pill${value === opt ? " on" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

type Props = {
  source?: string;
  defaultService?: string;
  onSuccess?: () => void;
  idPrefix?: string;
};

export function GlobalLeadForm({
  source = "site-modal",
  defaultService = "",
  onSuccess,
  idPrefix = "glf",
}: Props) {
  const { lang } = useLang();
  const es = lang === "es";
  const services = es ? SERVICES_ES : SERVICES_EN;
  const jobs = es ? JOBS_ES : JOBS_EN;

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [serviceType, setServiceType] = useState(
    defaultService || services[0] || "",
  );
  const [jobType, setJobType] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldError, setFieldError] = useState("");
  /** Honeypot — obscure name so password managers do not autofill it. */
  const [hp, setHp] = useState("");
  const startRef = useRef(Date.now());
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const phoneOk = phoneDigits(phone).length === 10;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError("");
    const fd = new FormData(e.currentTarget);

    // Bot honeypot filled → fake success (do not silently no-op).
    if (String(fd.get("toro_hp") || hp || "").trim()) {
      setStatus("sent");
      return;
    }

    const name = String(fd.get("name") || "").trim();
    const digits = phoneDigits(phone);
    const email = String(fd.get("email") || "").trim();
    const moveDate = String(fd.get("moveDate") || "").trim();

    if (!name) {
      setFieldError(es ? "Ingrese su nombre." : "Enter your name.");
      return;
    }
    if (digits.length !== 10) {
      setFieldError(
        es
          ? "Ingrese un teléfono de 10 dígitos."
          : "Enter a 10-digit US phone number.",
      );
      return;
    }
    if (!serviceType) {
      setFieldError(
        es ? "Elija un tipo de servicio." : "Choose a service type.",
      );
      return;
    }

    setStatus("sending");
    const eventId = newEventId();
    const utmSummary = getAttributionSummary();
    const funnel =
      /labor|solo labor/i.test(serviceType) ? "labor" : "full-service";

    try {
      const res = await fetch("/api/crm/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: digits,
          email: email || undefined,
          funnel,
          source,
          serviceType: [serviceType, jobType].filter(Boolean).join(" · "),
          moveDate: moveDate || undefined,
          note: [
            moveDate && `Move date: ${moveDate}`,
            jobType && `Property: ${jobType}`,
            utmSummary && `UTM: ${utmSummary}`,
            `event_id=${eventId}`,
          ]
            .filter(Boolean)
            .join(" — "),
          lang: es ? "es" : "en",
          consentSms: true,
          consentEmail: true,
          landingPage:
            typeof window !== "undefined" ? window.location.pathname : "/",
          hp: "",
          elapsedMs: Math.max(Date.now() - startRef.current, 0),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        spam?: boolean;
        error?: string;
      } | null;

      if (res.status === 429) {
        setFieldError(
          es
            ? "Demasiados intentos. Espera un momento o llámanos."
            : "Too many tries. Wait a moment or call us.",
        );
        setStatus("error");
        return;
      }
      if (!res.ok) {
        throw new Error(data?.error || `status ${res.status}`);
      }
      // spam:true is intentional soft-drop — show success to bots
      try {
        localStorage.setItem("toro-lead-sent", "1");
      } catch {
        /* ignore */
      }
      trackLead(eventId);
      setStatus("sent");
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="glf-success">
        <h3>{es ? "¡Listo! Recibimos tu solicitud." : "You're in — we got it."}</h3>
        <p>
          {es
            ? "Un miembro del equipo te contactará en un par de minutos. ¿Urgente?"
            : "A team member will contact you in a couple minutes. Need us now?"}{" "}
          <a href={PHONE_TEL}>
            {es ? "Llama" : "Call"} {PHONE_DISPLAY}
          </a>
        </p>
        <a className="btn btn-primary glf-call" href={PHONE_TEL}>
          {es ? "Llamar" : "Call"} {PHONE_DISPLAY}
        </a>
      </div>
    );
  }

  return (
    <form className="glf-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot: not named company/email/name — browsers autofill those. */}
      <input
        type="text"
        name="toro_hp"
        tabIndex={-1}
        autoComplete="off"
        className="hp-field"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
      />

      <div className="glf-scroll">
        <label className="glf-field">
          <span>{es ? "Nombre" : "Name"}</span>
          <input
            id={`${idPrefix}-name`}
            name="name"
            required
            autoComplete="name"
            className="glf-input"
          />
        </label>

        <div className="glf-row">
          <label className="glf-field">
            <span>{es ? "Teléfono" : "Phone"}</span>
            <input
              id={`${idPrefix}-phone`}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder={PHONE_DISPLAY}
              className="glf-input"
              aria-invalid={phone.length > 0 && !phoneOk}
            />
          </label>
          <label className="glf-field">
            <span>
              {es ? "Email" : "Email"}{" "}
              <em className="glf-opt">{es ? "(opcional)" : "(optional)"}</em>
            </span>
            <input
              id={`${idPrefix}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="glf-input"
            />
          </label>
        </div>

        <label className="glf-field">
          <span>{es ? "Fecha de mudanza" : "Move date"}</span>
          <input
            id={`${idPrefix}-date`}
            name="moveDate"
            type="date"
            min={today}
            className="glf-input"
          />
        </label>

        <div className="glf-field">
          <span>{es ? "Servicio" : "Service"}</span>
          <Pills
            options={services}
            value={serviceType}
            onChange={setServiceType}
            label={es ? "Servicio" : "Service"}
          />
        </div>

        <div className="glf-field">
          <span>{es ? "Tipo de mudanza" : "Moving"}</span>
          <Pills
            options={jobs}
            value={jobType}
            onChange={setJobType}
            label={es ? "Tipo" : "Moving"}
          />
        </div>

        {(fieldError || status === "error") && (
          <p className="glf-error" role="alert">
            {fieldError || (
              <>
                {es ? "Algo falló. Llama" : "Something went wrong. Call"}{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
              </>
            )}
          </p>
        )}
      </div>

      <div className="glf-sticky">
        <button
          type="submit"
          className="btn btn-primary glf-submit"
          disabled={status === "sending"}
        >
          {status === "sending"
            ? es
              ? "Enviando…"
              : "Sending…"
            : es
              ? "Pedir cotización gratis"
              : "Get my free quote"}
        </button>
        <p className="glf-consent">
          {es
            ? "Al enviar, aceptas que Toro Movers te llame o escriba sobre tu cotización (STOP para salir)."
            : "By submitting, you agree Toro Movers may call or text you about your quote (reply STOP to opt out)."}
        </p>
      </div>
    </form>
  );
}
