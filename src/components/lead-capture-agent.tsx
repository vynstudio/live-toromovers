"use client";

/**
 * Mobile-first lead capture agent.
 * Flow: phone first → qualify → price band + call CTAs.
 * Progressive capture: posts soft lead after name+phone, full lead on finish.
 */

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  GOOGLE_RATING,
} from "@/lib/contact";
import { CITIES } from "@/lib/cities";
import {
  estimateBand,
  HOME_SIZE_LABELS,
  SERVICE_LABELS,
  type HomeSize,
  type ServiceKind,
} from "@/lib/price-bands";
import { newEventId, trackFormStart, trackFormSubmit, trackLead } from "@/lib/track";
import { getAttribution, getAttributionSummary } from "@/lib/utm";

const CITY_CHIPS = [
  ...CITIES.slice(0, 8).map((c) => c.name),
  "Other Central FL",
];

const WHEN_CHIPS = [
  { id: "this-week", label: "This week", priority: true },
  { id: "next-2-weeks", label: "Next 2 weeks", priority: false },
  { id: "30-plus", label: "30+ days", priority: false },
  { id: "flexible", label: "Flexible", priority: false },
] as const;

type Phase = "capture" | "qualify" | "service" | "done";

function formatPhone(raw: string) {
  const d = String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length > 0) return `(${d}`;
  return "";
}

function digits(raw: string) {
  return String(raw || "").replace(/\D/g, "");
}

function isUrgentWhen(whenId: string) {
  return whenId === "this-week";
}

async function postLead(payload: Record<string, unknown>) {
  const res = await fetch("/api/crm/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json().catch(() => ({ ok: true }));
}

type Props = {
  /** Prefill from ad URL ?service=labor|full-service */
  defaultService?: ServiceKind | "";
  /** Prefill from ad URL ?city=Orlando */
  defaultCity?: string;
  lang?: "en" | "es";
};

export function LeadCaptureAgent({
  defaultService = "",
  defaultCity = "",
  lang = "en",
}: Props) {
  const es = lang === "es";
  const [phase, setPhase] = useState<Phase>("capture");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(true);
  const [city, setCity] = useState(defaultCity);
  const [whenId, setWhenId] = useState("");
  const [service, setService] = useState<ServiceKind | "">(defaultService);
  const [homeSize, setHomeSize] = useState<HomeSize>("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const [hp, setHp] = useState("");
  const startRef = useRef(Date.now());
  const eventIdRef = useRef(newEventId());
  const softSentRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const s = q.get("service")?.toLowerCase();
    if (s === "labor" || s === "labor-only") setService("labor");
    if (s === "full-service" || s === "full") setService("full-service");
    const c = q.get("city");
    if (c) {
      const match = CITY_CHIPS.find(
        (x) => x.toLowerCase() === c.trim().toLowerCase(),
      );
      if (match) setCity(match);
      else setCity(c.trim());
    }
  }, []);

  const phoneOk = digits(phone).length === 10;
  const nameOk = name.trim().length >= 2;

  const stepNum =
    phase === "capture" ? 1 : phase === "qualify" ? 2 : phase === "service" ? 3 : 3;
  const progress =
    phase === "capture"
      ? "33%"
      : phase === "qualify"
        ? "66%"
        : phase === "service"
          ? "90%"
          : "100%";

  const band = useMemo(() => {
    const svc: ServiceKind =
      service === "labor"
        ? "labor"
        : service === "not-sure"
          ? "full-service"
          : "full-service";
    return estimateBand(svc, homeSize || "2br");
  }, [service, homeSize]);

  const whenLabel =
    WHEN_CHIPS.find((w) => w.id === whenId)?.label || whenId || "";

  function begin() {
    if (!started) {
      setStarted(true);
      trackFormStart("agent");
    }
  }

  function buildNote(kind: "soft" | "full") {
    const priority = isUrgentWhen(whenId)
      ? "🔥 PRIORITY — move THIS WEEK — call ASAP"
      : "";
    return [
      priority,
      kind === "soft" ? "Soft capture (name+phone) — still qualifying" : "Full agent funnel complete",
      service && `Service: ${SERVICE_LABELS[service as ServiceKind] || service}`,
      city && `City: ${city}`,
      whenLabel && `When: ${whenLabel}`,
      homeSize &&
        `Size: ${HOME_SIZE_LABELS[homeSize as Exclude<HomeSize, "">] || homeSize}`,
      band && kind === "full" && `Shown band: ${band.rangeLabel} @ $${band.hourly}/hr`,
      `event_id=${eventIdRef.current}`,
    ]
      .filter(Boolean)
      .join(" — ");
  }

  function funnelOf(): "labor" | "full-service" {
    return service === "labor" ? "labor" : "full-service";
  }

  async function sendSoftLead() {
    if (softSentRef.current) return;
    softSentRef.current = true;
    const eventId = eventIdRef.current;
    await postLead({
      name: name.trim(),
      phone: digits(phone),
      funnel: funnelOf(),
      source: "get-my-price",
      serviceType: service
        ? SERVICE_LABELS[service as ServiceKind]
        : "Pending qualify",
      moveDate: whenLabel || undefined,
      city: city || undefined,
      note: buildNote("soft"),
      lang: es ? "es" : "en",
      consentSms: smsConsent,
      consentEmail: true,
      landingPage:
        typeof window !== "undefined" ? window.location.pathname : "/get-my-price",
      utm: getAttribution(),
      source_detail: getAttributionSummary() || undefined,
      hp: "",
      elapsedMs: Math.max(Date.now() - startRef.current, 0),
      eventId,
    });
    trackLead(eventId);
    trackFormSubmit("agent_soft_capture");
  }

  async function onCaptureContinue(e: FormEvent) {
    e.preventDefault();
    setError("");
    begin();
    if (hp.trim()) {
      setPhase("qualify");
      return;
    }
    if (!nameOk) {
      setError(es ? "Ingrese su nombre." : "Enter your name.");
      return;
    }
    if (!phoneOk) {
      setError(
        es
          ? "Ingrese un teléfono de 10 dígitos."
          : "Enter a 10-digit US phone number.",
      );
      return;
    }
    setSending(true);
    try {
      // Allow spam filter: ensure ≥1.2s elapsed
      const wait = 1200 - (Date.now() - startRef.current);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      await sendSoftLead();
      setPhase("qualify");
    } catch {
      // Still advance — don't block UX if CRM is down; retry on full submit
      softSentRef.current = false;
      setPhase("qualify");
    } finally {
      setSending(false);
    }
  }

  async function onFinish() {
    setError("");
    if (!service) {
      setError(es ? "Elija un tipo de servicio." : "Choose a service type.");
      return;
    }
    if (!homeSize) {
      setError(es ? "Elija el tamaño del hogar." : "Choose your home size.");
      return;
    }
    setSending(true);
    try {
      const eventId = eventIdRef.current;
      await postLead({
        name: name.trim(),
        phone: digits(phone),
        funnel: funnelOf(),
        source: "get-my-price",
        serviceType: [
          SERVICE_LABELS[service as ServiceKind],
          HOME_SIZE_LABELS[homeSize as Exclude<HomeSize, "">],
        ]
          .filter(Boolean)
          .join(" · "),
        moveDate: whenLabel || undefined,
        city: city || undefined,
        note: buildNote("full"),
        lang: es ? "es" : "en",
        // Soft capture already texted; avoid a second SMS on full complete.
        consentSms: softSentRef.current ? false : smsConsent,
        consentEmail: true,
        landingPage:
          typeof window !== "undefined"
            ? window.location.pathname
            : "/get-my-price",
        utm: getAttribution(),
        hp: "",
        elapsedMs: Math.max(Date.now() - startRef.current, 0),
        eventId: `${eventId}-full`,
      });
      trackFormSubmit("agent_full");
      setPhase("done");
    } catch {
      setError(
        es
          ? `No se pudo enviar. Llame al ${PHONE_DISPLAY}.`
          : `Couldn't send. Please call ${PHONE_DISPLAY}.`,
      );
    } finally {
      setSending(false);
    }
  }

  /* ---------- SUCCESS ---------- */
  if (phase === "done") {
    return (
      <div className="lca-done" role="status">
        <div className="lca-done-check" aria-hidden>
          ✓
        </div>
        <p className="lca-done-eyebrow">
          {es ? "Solicitud recibida" : "Request received"}
        </p>
        <h2 className="lca-done-h2">
          {es
            ? `Gracias, ${name.trim().split(/\s+/)[0]} — te contactamos en minutos.`
            : `Thanks, ${name.trim().split(/\s+/)[0]} — we'll contact you in minutes.`}
        </h2>

        <div className="lca-band">
          <p className="lca-band-label">
            {es ? "Rango típico para tu mudanza" : "Typical range for your move"}
          </p>
          <p className="lca-band-price">{band.rangeLabel}</p>
          <p className="lca-band-meta">{band.crewNote}</p>
          <p className="lca-band-hours">
            {es ? "Horas típicas" : "Typical hours"}: {band.typicalHours}
          </p>
          <p className="lca-band-caveat">{band.caveats}</p>
        </div>

        <div className="lca-done-actions">
          <a href={PHONE_TEL} className="fn-btn fn-btn-primary fn-btn-lg lca-full">
            {es ? "Llamar ahora" : "Call now"} — {PHONE_DISPLAY}
          </a>
          <a
            href={`sms:+16896002720?&body=${encodeURIComponent(
              es
                ? `Hola Toro, soy ${name.trim()}. Quiero cotizar mi mudanza (${whenLabel || "fecha flexible"}).`
                : `Hi Toro, this is ${name.trim()}. I'd like to lock in my move quote (${whenLabel || "flexible date"}).`,
            )}`}
            className="fn-btn fn-btn-ghost-light lca-full lca-text-btn"
          >
            {es ? "Escribir por SMS" : "Text us"}
          </a>
        </div>
        <p className="lca-done-fine">
          {es
            ? "Depósito reembolsable pequeño reserva la fecha. Misma cuadrilla que cotiza suele presentarse."
            : "Small refundable deposit locks your date. Same crew that quotes often shows up."}
        </p>
      </div>
    );
  }

  return (
    <div className="lca">
      <div className="lca-progress" aria-hidden>
        <span style={{ width: progress }} />
      </div>
      <p className="lca-step">
        {es ? `Paso ${stepNum} de 3` : `Step ${stepNum} of 3`}
        <span className="lca-step-hint">
          {phase === "capture"
            ? es
              ? " · ~15 seg"
              : " · ~15 sec"
            : phase === "qualify"
              ? es
                ? " · casi listo"
                : " · almost done"
              : es
                ? " · ver precio"
                : " · see price"}
        </span>
      </p>

      {/* STEP 1 — CONTACT FIRST */}
      {phase === "capture" && (
        <form className="lca-form" onSubmit={onCaptureContinue} noValidate>
          <h2 className="lca-q">
            {es
              ? "¿Cómo te contactamos con tu precio?"
              : "How should we reach you with your price?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Sin spam. Respuesta en minutos — o llámanos ya."
              : "No spam. Reply in minutes — or call us now."}
          </p>

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

          <label className="lca-field">
            <span>{es ? "Nombre" : "Name"}</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              enterKeyHint="next"
              autoFocus
              value={name}
              onChange={(e) => {
                begin();
                setName(e.target.value);
              }}
              placeholder={es ? "Tu nombre" : "Your name"}
              required
            />
          </label>

          <label className="lca-field">
            <span>{es ? "Teléfono móvil" : "Mobile phone"}</span>
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="done"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(689) 000-0000"
              required
              aria-invalid={phone.length > 0 && !phoneOk}
            />
          </label>

          <label className="lca-consent">
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
            />
            <span>
              {es
                ? `Acepto SMS de Toro Movers al ${PHONE_DISPLAY} (precio y horarios). STOP para salir.`
                : `I agree to receive texts from Toro Movers at ${PHONE_DISPLAY} about pricing & scheduling. Reply STOP to opt out.`}
            </span>
          </label>

          {error && <p className="lca-err">{error}</p>}

          <button
            type="submit"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={sending}
          >
            {sending
              ? es
                ? "Guardando…"
                : "Saving…"
              : es
                ? "Continuar →"
                : "Continue →"}
          </button>

          <a href={PHONE_TEL} className="lca-call-link">
            {es ? "¿Prefieres llamar?" : "Prefer to call?"} {PHONE_DISPLAY}
          </a>
        </form>
      )}

      {/* STEP 2 — WHEN + WHERE */}
      {phase === "qualify" && (
        <div className="lca-form">
          <h2 className="lca-q">
            {es ? "¿Cuándo y dónde es la mudanza?" : "When and where is the move?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Así priorizamos tu llamada y confirmamos cobertura."
              : "Helps us prioritize your call and confirm we cover your area."}
          </p>

          <p className="lca-label">{es ? "¿Cuándo?" : "When?"}</p>
          <div className="lca-options" role="radiogroup" aria-label="When">
            {WHEN_CHIPS.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`lca-opt${whenId === w.id ? " on" : ""}${w.priority ? " lca-opt-hot" : ""}`}
                onClick={() => setWhenId(w.id)}
              >
                {es
                  ? w.id === "this-week"
                    ? "Esta semana"
                    : w.id === "next-2-weeks"
                      ? "Próximas 2 semanas"
                      : w.id === "30-plus"
                        ? "En 30+ días"
                        : "Flexible"
                  : w.label}
              </button>
            ))}
          </div>

          <p className="lca-label" style={{ marginTop: 18 }}>
            {es ? "Ciudad" : "City"}
          </p>
          <div className="lca-options lca-options-city" role="radiogroup" aria-label="City">
            {CITY_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className={`lca-opt${city === c ? " on" : ""}`}
                onClick={() => setCity(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {error && <p className="lca-err">{error}</p>}

          <div className="lca-actions">
            <button type="button" className="lca-back" onClick={() => setPhase("capture")}>
              {es ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              className="fn-btn fn-btn-primary lca-grow"
              disabled={!whenId || !city}
              onClick={() => {
                if (!whenId || !city) {
                  setError(
                    es
                      ? "Elige cuándo y la ciudad."
                      : "Pick when and your city.",
                  );
                  return;
                }
                setError("");
                setPhase("service");
              }}
            >
              {es ? "Continuar →" : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — SERVICE + SIZE → PRICE */}
      {phase === "service" && (
        <div className="lca-form">
          <h2 className="lca-q">
            {es ? "¿Qué necesitas?" : "What do you need?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Así te mostramos un rango de precio al instante."
              : "So we can show you a price range instantly."}
          </p>

          <div className="lca-options lca-options-stack" role="radiogroup" aria-label="Service">
            {(
              [
                ["full-service", es ? "Full-service (camión + cuadrilla)" : "Full-service (truck + crew)"],
                ["labor", es ? "Solo labor (tú traes el camión)" : "Labor-only (you have a truck)"],
                ["not-sure", es ? "No estoy seguro/a" : "Not sure yet"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`lca-opt lca-opt-wide${service === id ? " on" : ""}`}
                onClick={() => setService(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="lca-label" style={{ marginTop: 18 }}>
            {es ? "Tamaño del hogar" : "Home size"}
          </p>
          <div className="lca-options" role="radiogroup" aria-label="Home size">
            {(
              Object.entries(HOME_SIZE_LABELS) as [
                Exclude<HomeSize, "">,
                string,
              ][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`lca-opt${homeSize === id ? " on" : ""}`}
                onClick={() => setHomeSize(id)}
              >
                {es
                  ? id === "studio-1br"
                    ? "Studio / 1 hab"
                    : id === "2br"
                      ? "2 habitaciones"
                      : id === "3br+"
                        ? "3+ habitaciones"
                        : "Oficina / bodega"
                  : label}
              </button>
            ))}
          </div>

          {error && <p className="lca-err">{error}</p>}

          <div className="lca-actions">
            <button type="button" className="lca-back" onClick={() => setPhase("qualify")}>
              {es ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              className="fn-btn fn-btn-primary lca-grow"
              disabled={sending || !service || !homeSize}
              onClick={onFinish}
            >
              {sending
                ? es
                  ? "Calculando…"
                  : "Getting price…"
                : es
                  ? "Ver mi rango de precio"
                  : "See my price range"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Sticky bar: Call + scroll to agent form */
export function LeadCaptureSticky({ lang = "en" }: { lang?: "en" | "es" }) {
  const es = lang === "es";
  return (
    <div className="lca-sticky">
      <a href={PHONE_TEL} className="lca-sticky-call">
        {es ? "Llamar" : "Call"}
      </a>
      <a href="#get-price" className="lca-sticky-quote">
        {es ? "Ver mi precio" : "Get my price"}
      </a>
    </div>
  );
}
