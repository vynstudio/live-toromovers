"use client";

/**
 * Get-my-price sales funnel — mirrors toro-sales-funnel.
 * Contact first (name + phone + email) → soft lead → service → ZIPs → size
 * → optional specials/details → when → full lead.
 * NEVER shows rates or hour estimates — owner quotes on the call.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { PHONE_DISPLAY, PHONE_TEL, GOOGLE_RATING } from "@/lib/contact";
import {
  HOME_SIZE_LABELS,
  SERVICE_LABELS,
  type HomeSize,
  type ServiceKind,
} from "@/lib/price-bands";
import { newEventId, trackFormStart, trackFormSubmit, trackLead } from "@/lib/track";
import { getAttribution, getAttributionSummary } from "@/lib/utm";

type Phase =
  | "capture"
  | "service"
  | "fromZip"
  | "toZip"
  | "size"
  | "specials"
  | "details"
  | "when"
  | "done";

/** Phases the user can navigate (excludes terminal success). */
type ActivePhase = Exclude<Phase, "done">;

const PHASE_ORDER: ActivePhase[] = [
  "capture",
  "service",
  "fromZip",
  "toZip",
  "size",
  "specials",
  "details",
  "when",
];

const ADVANCE_MS = 200;

const SPECIALS = [
  { id: "art", labelEn: "Fine art or antiques", labelEs: "Arte o antigüedades" },
  { id: "theater", labelEn: "Home theater", labelEs: "Cine en casa" },
  { id: "appliances", labelEn: "Large appliances", labelEs: "Electrodomésticos" },
  { id: "piano", labelEn: "Piano", labelEs: "Piano" },
  { id: "pool-table", labelEn: "Pool table", labelEs: "Mesa de billar" },
  { id: "vehicle", labelEn: "Vehicle", labelEs: "Vehículo" },
  { id: "other", labelEn: "Other", labelEs: "Otro" },
] as const;

const WHEN_OPTS = [
  { id: "asap", labelEn: "As soon as possible", labelEs: "Lo antes posible", hot: true },
  { id: "this-week", labelEn: "This week", labelEs: "Esta semana", hot: true },
  { id: "next-2-weeks", labelEn: "Next 2 weeks", labelEs: "Próximas 2 semanas", hot: false },
  { id: "flexible", labelEn: "I'm flexible", labelEs: "Soy flexible", hot: false },
] as const;

const SIZE_OPTS: { id: Exclude<HomeSize, "">; labelEn: string; labelEs: string }[] = [
  { id: "studio-1br", labelEn: "Studio / 1 bedroom", labelEs: "Studio / 1 hab" },
  { id: "2br", labelEn: "2 bedrooms", labelEs: "2 habitaciones" },
  { id: "3br+", labelEn: "3+ bedrooms", labelEs: "3+ habitaciones" },
  { id: "office", labelEn: "Office / storage", labelEs: "Oficina / bodega" },
];

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

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
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
  defaultService?: ServiceKind | "";
  /** @deprecated city chips removed — ZIP only */
  defaultCity?: string;
  lang?: "en" | "es";
};

export function LeadCaptureAgent({
  defaultService = "",
  lang = "en",
}: Props) {
  const es = lang === "es";
  const [phase, setPhase] = useState<Phase>("capture");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [smsConsent, setSmsConsent] = useState(true);
  const [service, setService] = useState<ServiceKind | "">(defaultService);
  const [fromZip, setFromZip] = useState("");
  const [toZip, setToZip] = useState("");
  const [homeSize, setHomeSize] = useState<HomeSize>("");
  const [specials, setSpecials] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [whenId, setWhenId] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const [hp, setHp] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const [redirectIn, setRedirectIn] = useState(0);
  const startRef = useRef(Date.now());
  const eventIdRef = useRef(newEventId());
  const softSentRef = useRef(false);
  const prefillService = useRef(defaultService);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const s = q.get("service")?.toLowerCase();
    if (s === "labor" || s === "labor-only") {
      setService("labor");
      prefillService.current = "labor";
    }
    if (s === "full-service" || s === "full") {
      setService("full-service");
      prefillService.current = "full-service";
    }
  }, []);

  // After full lead: always send visitor home in 3 seconds.
  useEffect(() => {
    if (phase !== "done") return;
    setRedirectIn(3);
    const tick = window.setInterval(() => {
      setRedirectIn((n) => {
        if (n <= 1) {
          window.clearInterval(tick);
          window.location.assign("/");
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [phase]);

  const phoneOk = digits(phone).length === 10;
  const nameOk = name.trim().length >= 2;
  const emailOkVal = emailOk(email);

  const stepTotal = PHASE_ORDER.length;
  const stepIndex =
    phase === "done"
      ? stepTotal - 1
      : Math.max(0, PHASE_ORDER.indexOf(phase as ActivePhase));
  const stepNum =
    phase === "done" ? stepTotal : Math.min(stepIndex + 1, stepTotal);
  const progress =
    phase === "done"
      ? "100%"
      : `${Math.round((stepNum / stepTotal) * 100)}%`;

  function begin() {
    if (!started) {
      setStarted(true);
      trackFormStart("agent");
    }
  }

  function goTo(next: Phase) {
    setError("");
    setAnimKey((k) => k + 1);
    setPhase(next);
  }

  // Pure mobile funnel — no dock/pin chrome (matches toro-sales-funnel).
  useEffect(() => {
    if (typeof document === "undefined") return;
    delete document.documentElement.dataset.lcaDock;
  }, [phase]);

  function funnelOf(svc: ServiceKind | ""): "labor" | "full-service" {
    return svc === "labor" ? "labor" : "full-service";
  }

  async function sendSoftLead() {
    if (softSentRef.current) return;
    softSentRef.current = true;
    const eventId = eventIdRef.current;
    await postLead({
      name: name.trim(),
      phone: digits(phone),
      email: email.trim(),
      funnel: funnelOf(service || prefillService.current),
      source: "get-my-price",
      serviceType: "Pending qualify",
      note: "Soft capture (contact first) — still qualifying",
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

  const submitFull = useCallback(
    async (when: string, size: HomeSize, svc: ServiceKind | "") => {
      setSending(true);
      setError("");
      try {
        const eventId = eventIdRef.current;
        const resolvedSvc = (svc || prefillService.current || "full-service") as ServiceKind;
        const sizeLabel =
          size && HOME_SIZE_LABELS[size as Exclude<HomeSize, "">]
            ? HOME_SIZE_LABELS[size as Exclude<HomeSize, "">]
            : "";
        const whenLbl =
          WHEN_OPTS.find((w) => w.id === when)?.labelEn || when || "";
        const specialsLabel = specials
          .map((id) => SPECIALS.find((s) => s.id === id)?.labelEn || id)
          .join(", ");

        await postLead({
          name: name.trim(),
          phone: digits(phone),
          email: email.trim(),
          funnel: funnelOf(resolvedSvc),
          source: "get-my-price",
          serviceType: [
            SERVICE_LABELS[resolvedSvc] || resolvedSvc,
            sizeLabel,
            fromZip && `from ${fromZip}`,
            toZip && `to ${toZip}`,
            whenLbl,
          ]
            .filter(Boolean)
            .join(" · "),
          moveDate: whenLbl || undefined,
          city: fromZip || undefined,
          note: [
            when === "this-week" || when === "asap"
              ? "🔥 PRIORITY — move soon — call ASAP"
              : "",
            "Full agent funnel complete",
            SERVICE_LABELS[resolvedSvc] && `Service: ${SERVICE_LABELS[resolvedSvc]}`,
            fromZip && `From ZIP: ${fromZip}`,
            toZip && `To ZIP: ${toZip}`,
            sizeLabel && `Size: ${sizeLabel}`,
            whenLbl && `When: ${whenLbl}`,
            specialsLabel && `Specials: ${specialsLabel}`,
            details.trim() && `Notes: ${details.trim()}`,
            `event_id=${eventId}`,
          ]
            .filter(Boolean)
            .join(" — "),
          lang: es ? "es" : "en",
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
        goTo("done");
      } catch {
        setError(
          es
            ? `No se pudo enviar. Llame al ${PHONE_DISPLAY}.`
            : `Couldn't send. Please call ${PHONE_DISPLAY}.`,
        );
      } finally {
        setSending(false);
        setAdvancing(false);
      }
    },
    [
      name,
      phone,
      email,
      fromZip,
      toZip,
      specials,
      details,
      es,
      smsConsent,
    ],
  );

  function pickAndAdvance(apply: () => void, next: ActivePhase | "done" | "finish") {
    if (advancing || sending) return;
    setAdvancing(true);
    apply();
    window.setTimeout(() => {
      if (next === "finish") {
        const svc = service || prefillService.current || "full-service";
        void submitFull(whenId || "flexible", homeSize, svc as ServiceKind);
        return;
      }
      goTo(next);
      setAdvancing(false);
    }, ADVANCE_MS);
  }

  async function onCaptureContinue(e: FormEvent) {
    e.preventDefault();
    setError("");
    begin();
    if (hp.trim()) {
      goTo("service");
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
    if (!emailOkVal) {
      setError(es ? "Ingrese un email válido." : "Enter a valid email.");
      return;
    }
    if (!smsConsent) {
      setError(
        es
          ? "Acepte el contacto para continuar."
          : "Please agree so we can contact you about your quote.",
      );
      return;
    }
    setSending(true);
    try {
      const wait = 800 - (Date.now() - startRef.current);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      await sendSoftLead();
    } catch {
      softSentRef.current = false;
    } finally {
      setSending(false);
    }
    goTo(prefillService.current ? "fromZip" : "service");
  }

  function backFrom(current: ActivePhase) {
    if (advancing || sending) return;
    const i = PHASE_ORDER.indexOf(current);
    if (i <= 0) return;
    let prev: ActivePhase = PHASE_ORDER[i - 1]!;
    // Skip service if prefilled
    if (prev === "service" && prefillService.current) {
      prev = "capture";
    }
    goTo(prev);
  }

  function toggleSpecial(id: string) {
    setSpecials((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  /* ---------- SUCCESS ---------- */
  if (phase === "done") {
    return (
      <div className="lca-done lca-enter" role="status">
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
        <p className="lca-done-lede">
          {es
            ? "Un miembro del equipo te llama o escribe pronto con disponibilidad y un precio claro. Sin tarifas ocultas."
            : "A team member will call or text shortly with availability and a clear price. No hidden fees."}
        </p>
        <div className="lca-done-actions">
          <a href={PHONE_TEL} className="fn-btn fn-btn-primary fn-btn-lg lca-full">
            {es ? "Llamar ahora" : "Call now"} — {PHONE_DISPLAY}
          </a>
          <a
            href="/"
            className="fn-btn fn-btn-ghost-light lca-full lca-text-btn"
          >
            {es ? "Volver al inicio" : "Back to home"}
            {redirectIn > 0 ? ` (${redirectIn})` : ""}
          </a>
        </div>
        <p className="lca-done-fine">
          {es
            ? "Te llevamos al inicio en 3 segundos."
            : "Taking you to the home page in 3 seconds."}
        </p>
      </div>
    );
  }

  const stepHint =
    phase === "capture"
      ? es
        ? " · contacto"
        : " · contact"
      : phase === "specials" || phase === "details"
        ? es
          ? " · opcional"
          : " · optional"
        : es
          ? " · toca una opción"
          : " · tap one";

  return (
    <div className="lca">
      <div className="lca-progress" aria-hidden>
        <span style={{ width: progress }} />
      </div>
      <p className="lca-step">
        {es ? `Paso ${stepNum} de ${stepTotal}` : `Step ${stepNum} of ${stepTotal}`}
        <span className="lca-step-hint">{stepHint}</span>
      </p>

      {/* 1. CONTACT */}
      {phase === "capture" && (
        <form
          key={animKey}
          className="lca-form lca-enter"
          onSubmit={onCaptureContinue}
          noValidate
        >
          <h2 className="lca-q">
            {es ? "Cotización gratis." : "Get your free quote."}
          </h2>
          <p className="lca-help">
            {es
              ? "Nombre, teléfono y email primero — luego unas preguntas rápidas."
              : "Name, phone, and email first — then a few quick questions about your move."}
          </p>

          <div className="lca-biz" aria-hidden={false}>
            <div className="lca-biz-thumb">
              <img src="/bull.svg" alt="" width={28} height={28} />
            </div>
            <div>
              <strong>Toro Movers</strong>
              <div className="lca-stars">
                ★★★★★
                <span>
                  {GOOGLE_RATING} · {es ? "Florida Central" : "Central Florida"}
                </span>
              </div>
            </div>
          </div>

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
            <span>{es ? "Nombre" : "Full name"}</span>
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
              enterKeyHint="next"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder={PHONE_DISPLAY}
              required
              aria-invalid={phone.length > 0 && !phoneOk}
            />
          </label>

          <label className="lca-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="done"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              aria-invalid={email.length > 0 && !emailOkVal}
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
                ? `Acepto SMS y llamadas de Toro Movers al ${PHONE_DISPLAY}. STOP para salir.`
                : `I agree to texts & calls from Toro Movers at ${PHONE_DISPLAY}. Reply STOP to opt out.`}
            </span>
          </label>

          {error && <p className="lca-err">{error}</p>}

          <button
            type="submit"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={
              sending || !nameOk || !phoneOk || !emailOkVal || !smsConsent
            }
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

      {/* 2. SERVICE */}
      {phase === "service" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Qué necesitas?" : "What kind of help do you need?"}
          </h2>
          <div
            className="lca-options lca-options-focus lca-options-stack"
            role="radiogroup"
          >
            {(
              [
                [
                  "full-service",
                  es ? "Full-service" : "Full-service",
                  es ? "Camión + cuadrilla · carga, mudanza y colocación" : "Truck + crew · load, move & place",
                ],
                [
                  "labor",
                  es ? "Solo labor" : "Labor only",
                  es ? "Tú traes el camión, U-Haul o POD" : "You have a truck, U-Haul, or POD",
                ],
                [
                  "not-sure",
                  es ? "No estoy seguro/a" : "Not sure yet",
                  es ? "Te ayudamos a elegir" : "We'll help you pick the right option",
                ],
              ] as const
            ).map(([id, label, hint]) => (
              <button
                key={id}
                type="button"
                className={`lca-opt lca-opt-focus lca-opt-wide${service === id ? " on" : ""}`}
                aria-checked={service === id}
                disabled={advancing || sending}
                onClick={() =>
                  pickAndAdvance(() => setService(id), "fromZip")
                }
              >
                <span className="lca-opt-label">
                  {label}
                  <span className="lca-opt-hint">{hint}</span>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("service")}
          >
            {es ? "← Atrás" : "← Back"}
          </button>
        </div>
      )}

      {/* 3. FROM ZIP */}
      {phase === "fromZip" && (
        <form
          key={animKey}
          className="lca-form lca-enter lca-focus"
          onSubmit={(e) => {
            e.preventDefault();
            if (fromZip.length === 5) goTo("toZip");
            else
              setError(
                es ? "Ingrese un ZIP de 5 dígitos." : "Enter a 5-digit ZIP code.",
              );
          }}
        >
          <h2 className="lca-q">
            {es ? "¿Desde qué ZIP?" : "Where are you moving from?"}
          </h2>
          <p className="lca-help">
            {es ? "Solo el código postal de 5 dígitos." : "Just the 5-digit ZIP."}
          </p>
          <label className="lca-field">
            <span>{es ? "ZIP de origen" : "Origin ZIP"}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              autoFocus
              value={fromZip}
              onChange={(e) => {
                setFromZip(e.target.value.replace(/\D/g, "").slice(0, 5));
                setError("");
              }}
              placeholder="e.g. 32801"
            />
          </label>
          {error && <p className="lca-err">{error}</p>}
          <button
            type="submit"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={fromZip.length !== 5}
          >
            {es ? "Continuar →" : "Continue →"}
          </button>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("fromZip")}
          >
            {es ? "← Atrás" : "← Back"}
          </button>
        </form>
      )}

      {/* 4. TO ZIP */}
      {phase === "toZip" && (
        <form
          key={animKey}
          className="lca-form lca-enter lca-focus"
          onSubmit={(e) => {
            e.preventDefault();
            if (toZip.length === 5) goTo("size");
            else
              setError(
                es ? "Ingrese un ZIP de 5 dígitos." : "Enter a 5-digit ZIP code.",
              );
          }}
        >
          <h2 className="lca-q">
            {es ? "¿A qué ZIP?" : "Where are you moving to?"}
          </h2>
          <p className="lca-help">
            {es ? "Solo el código postal de 5 dígitos." : "Just the 5-digit ZIP."}
          </p>
          <label className="lca-field">
            <span>{es ? "ZIP de destino" : "Destination ZIP"}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              autoFocus
              value={toZip}
              onChange={(e) => {
                setToZip(e.target.value.replace(/\D/g, "").slice(0, 5));
                setError("");
              }}
              placeholder="e.g. 34787"
            />
          </label>
          {error && <p className="lca-err">{error}</p>}
          <button
            type="submit"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={toZip.length !== 5}
          >
            {es ? "Continuar →" : "Continue →"}
          </button>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("toZip")}
          >
            {es ? "← Atrás" : "← Back"}
          </button>
        </form>
      )}

      {/* 5. SIZE */}
      {phase === "size" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Qué tamaño es?" : "How big is the move?"}
          </h2>
          <div className="lca-options lca-options-focus" role="radiogroup">
            {SIZE_OPTS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`lca-opt lca-opt-focus${homeSize === o.id ? " on" : ""}`}
                aria-checked={homeSize === o.id}
                disabled={advancing || sending}
                onClick={() =>
                  pickAndAdvance(() => setHomeSize(o.id), "specials")
                }
              >
                <span className="lca-opt-label">{es ? o.labelEs : o.labelEn}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("size")}
          >
            {es ? "← Atrás" : "← Back"}
          </button>
        </div>
      )}

      {/* 6. SPECIALS (optional) */}
      {phase === "specials" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Artículos especiales?" : "Any special items?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Opcional — elige lo que aplique o continúa."
              : "Optional — select any that apply, or continue."}
          </p>
          <div className="lca-options lca-options-focus" role="group">
            {SPECIALS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`lca-opt lca-opt-focus${specials.includes(o.id) ? " on" : ""}`}
                aria-checked={specials.includes(o.id)}
                onClick={() => toggleSpecial(o.id)}
              >
                <span className="lca-opt-label">{es ? o.labelEs : o.labelEn}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            style={{ marginTop: 14 }}
            onClick={() => goTo("details")}
          >
            {es ? "Continuar →" : "Continue →"}
          </button>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => goTo("details")}
          >
            {es ? "Saltar" : "Skip"}
          </button>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("specials")}
          >
            {es ? "← Atrás" : "← Back"}
          </button>
        </div>
      )}

      {/* 7. DETAILS (optional) */}
      {phase === "details" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Algo más?" : "Extra details"}
          </h2>
          <p className="lca-help">
            {es
              ? "Opcional — códigos, estacionamiento, horarios…"
              : "Optional — gate codes, parking, preferred time…"}
          </p>
          <label className="lca-field">
            <span>{es ? "Notas" : "Notes"}</span>
            <textarea
              className="lca-textarea"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                es
                  ? "Códigos, escaleras, horario preferido…"
                  : "Gate codes, stairs, preferred time…"
              }
            />
          </label>
          <button
            type="button"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            onClick={() => goTo("when")}
          >
            {es ? "Continuar →" : "Continue →"}
          </button>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => goTo("when")}
          >
            {es ? "Saltar" : "Skip"}
          </button>
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("details")}
          >
            {es ? "← Atrás" : "← Back"}
          </button>
        </div>
      )}

      {/* 8. WHEN → submit */}
      {phase === "when" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Cuándo nos necesitas?" : "When do you need us?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Última pregunta — te contactamos al instante."
              : "Last question — we contact you right away."}
          </p>
          <div className="lca-options lca-options-focus" role="radiogroup">
            {WHEN_OPTS.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`lca-opt lca-opt-focus${whenId === w.id ? " on" : ""}${w.hot ? " lca-opt-hot" : ""}${sending ? " lca-opt-busy" : ""}`}
                aria-checked={whenId === w.id}
                disabled={advancing || sending}
                onClick={() => {
                  setWhenId(w.id);
                  setAdvancing(true);
                  window.setTimeout(() => {
                    const svc =
                      service || prefillService.current || "full-service";
                    void submitFull(w.id, homeSize, svc as ServiceKind);
                  }, ADVANCE_MS);
                }}
              >
                <span className="lca-opt-label">{es ? w.labelEs : w.labelEn}</span>
              </button>
            ))}
          </div>
          {sending && (
            <p className="lca-help" style={{ marginTop: 14, textAlign: "center" }}>
              {es ? "Enviando…" : "Sending…"}
            </p>
          )}
          {error && <p className="lca-err">{error}</p>}
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("when")}
            disabled={sending}
          >
            {es ? "← Atrás" : "← Back"}
          </button>
        </div>
      )}
    </div>
  );
}

export function LeadCaptureSticky({ lang = "en" }: { lang?: "en" | "es" }) {
  const es = lang === "es";
  return (
    <div className="lca-sticky">
      <a href={PHONE_TEL} className="lca-sticky-call">
        {es ? "Llamar" : "Call"}
      </a>
      <a href="#get-price" className="lca-sticky-quote">
        {es ? "Cotizar" : "Get my quote"}
      </a>
    </div>
  );
}
