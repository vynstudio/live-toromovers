"use client";

/**
 * Mobile-first lead capture agent.
 * Contact first → then ONE question at a time with auto-advance on tap.
 * Progressive CRM: soft lead after name+phone, full lead after last answer.
 * NEVER shows rates or hour estimates — owner quotes on the call.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import { CITIES } from "@/lib/cities";
import {
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
  { id: "this-week", labelEn: "This week", labelEs: "Esta semana", priority: true },
  {
    id: "next-2-weeks",
    labelEn: "Next 2 weeks",
    labelEs: "Próximas 2 semanas",
    priority: false,
  },
  { id: "30-plus", labelEn: "30+ days", labelEs: "En 30+ días", priority: false },
  { id: "flexible", labelEn: "Flexible", labelEs: "Flexible", priority: false },
] as const;

/** After contact: one screen = one question. */
type Phase = "capture" | "when" | "city" | "service" | "size" | "done";

const PHASE_ORDER: Phase[] = ["capture", "when", "city", "service", "size", "done"];

/** Brief highlight before advancing so the tap feels intentional. */
const ADVANCE_MS = 180;

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
  defaultService?: ServiceKind | "";
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
  const [animKey, setAnimKey] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const startRef = useRef(Date.now());
  const eventIdRef = useRef(newEventId());
  const softSentRef = useRef(false);
  const prefillService = useRef(defaultService);
  const prefillCity = useRef(defaultCity);

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
    const c = q.get("city");
    if (c) {
      const match = CITY_CHIPS.find(
        (x) => x.toLowerCase() === c.trim().toLowerCase(),
      );
      const val = match || c.trim();
      setCity(val);
      prefillCity.current = val;
    }
  }, []);

  const phoneOk = digits(phone).length === 10;
  const nameOk = name.trim().length >= 2;

  const stepIndex = Math.max(0, PHASE_ORDER.indexOf(phase));
  const stepTotal = 5; // capture + 4 questions (done excluded)
  const stepNum = phase === "done" ? stepTotal : Math.min(stepIndex + 1, stepTotal);
  const progress =
    phase === "done"
      ? "100%"
      : `${Math.round((stepNum / stepTotal) * 100)}%`;

  const whenLabel =
    WHEN_CHIPS.find((w) => w.id === whenId)?.labelEn || whenId || "";

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

  function buildNote(kind: "soft" | "full") {
    const priority = isUrgentWhen(whenId)
      ? "🔥 PRIORITY — move THIS WEEK — call ASAP"
      : "";
    return [
      priority,
      kind === "soft"
        ? "Soft capture (name+phone) — still qualifying"
        : "Full agent funnel complete",
      service && `Service: ${SERVICE_LABELS[service as ServiceKind] || service}`,
      city && `City: ${city}`,
      whenLabel && `When: ${whenLabel}`,
      homeSize &&
        `Size: ${HOME_SIZE_LABELS[homeSize as Exclude<HomeSize, "">] || homeSize}`,
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

  const submitFull = useCallback(
    async (size: HomeSize, svc: ServiceKind | "") => {
      setSending(true);
      setError("");
      try {
        const eventId = eventIdRef.current;
        const sizeLabel =
          size && HOME_SIZE_LABELS[size as Exclude<HomeSize, "">]
            ? HOME_SIZE_LABELS[size as Exclude<HomeSize, "">]
            : "";
        await postLead({
          name: name.trim(),
          phone: digits(phone),
          funnel: svc === "labor" ? "labor" : "full-service",
          source: "get-my-price",
          serviceType: [
            svc ? SERVICE_LABELS[svc as ServiceKind] : "",
            sizeLabel,
          ]
            .filter(Boolean)
            .join(" · "),
          moveDate: whenLabel || undefined,
          city: city || undefined,
          note: [
            isUrgentWhen(whenId)
              ? "🔥 PRIORITY — move THIS WEEK — call ASAP"
              : "",
            "Full agent funnel complete",
            svc && `Service: ${SERVICE_LABELS[svc as ServiceKind]}`,
            city && `City: ${city}`,
            whenLabel && `When: ${whenLabel}`,
            sizeLabel && `Size: ${sizeLabel}`,
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
    [name, phone, whenLabel, city, whenId, es, smsConsent],
  );

  /** Pick option → flash selected → auto-advance (or finish). */
  function pickAndAdvance(
    apply: () => void,
    next: Phase | "finish",
    finishArgs?: { size: HomeSize; svc: ServiceKind | "" },
  ) {
    if (advancing || sending) return;
    setAdvancing(true);
    apply();
    window.setTimeout(() => {
      if (next === "finish" && finishArgs) {
        void submitFull(finishArgs.size, finishArgs.svc);
        return;
      }
      if (next !== "finish") {
        goTo(next);
        setAdvancing(false);
      }
    }, ADVANCE_MS);
  }

  async function onCaptureContinue(e: FormEvent) {
    e.preventDefault();
    setError("");
    begin();
    if (hp.trim()) {
      goTo("when");
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
      const wait = 1200 - (Date.now() - startRef.current);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      await sendSoftLead();
    } catch {
      softSentRef.current = false;
    } finally {
      setSending(false);
    }
    // After contact: one question at a time. Skip prefilled fields.
    if (prefillCity.current && prefillService.current) {
      goTo("when");
    } else if (prefillCity.current) {
      goTo("when");
    } else {
      goTo("when");
    }
  }

  function backFrom(current: Phase) {
    if (advancing || sending) return;
    if (current === "when") goTo("capture");
    else if (current === "city") goTo("when");
    else if (current === "service") goTo(prefillCity.current ? "when" : "city");
    else if (current === "size") {
      if (prefillService.current) {
        goTo(prefillCity.current ? "when" : "city");
      } else {
        goTo("service");
      }
    }
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

  const stepHint =
    phase === "capture"
      ? es
        ? " · datos de contacto"
        : " · contact"
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

      {/* ── 1. CONTACT (name + phone) ── */}
      {phase === "capture" && (
        <form
          key={animKey}
          className="lca-form lca-enter"
          onSubmit={onCaptureContinue}
          noValidate
        >
          <h2 className="lca-q">
            {es ? "¿Cómo te contactamos?" : "How should we reach you?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Sin spam. Te llamamos o escribimos en minutos."
              : "No spam. We’ll call or text in minutes."}
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
                ? `Acepto SMS de Toro Movers al ${PHONE_DISPLAY}. STOP para salir.`
                : `I agree to texts from Toro Movers at ${PHONE_DISPLAY}. Reply STOP to opt out.`}
            </span>
          </label>

          {error && <p className="lca-err">{error}</p>}

          <button
            type="submit"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={sending || !nameOk || !phoneOk}
          >
            {sending
              ? es
                ? "Un momento…"
                : "One moment…"
              : es
                ? "Continuar →"
                : "Continue →"}
          </button>

          <a href={PHONE_TEL} className="lca-call-link">
            {es ? "¿Prefieres llamar?" : "Prefer to call?"} {PHONE_DISPLAY}
          </a>
        </form>
      )}

      {/* ── 2. WHEN (auto-advance) ── */}
      {phase === "when" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Cuándo te mudas?" : "When are you moving?"}
          </h2>
          <p className="lca-help">
            {es ? "Toca una opción para seguir." : "Tap one to continue."}
          </p>
          <div className="lca-options lca-options-focus" role="radiogroup" aria-label="When">
            {WHEN_CHIPS.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`lca-opt lca-opt-focus${whenId === w.id ? " on" : ""}${w.priority ? " lca-opt-hot" : ""}`}
                disabled={advancing || sending}
                onClick={() =>
                  pickAndAdvance(
                    () => setWhenId(w.id),
                    prefillCity.current ? "service" : "city",
                  )
                }
              >
                {es ? w.labelEs : w.labelEn}
              </button>
            ))}
          </div>
          <button type="button" className="lca-back lca-back-solo" onClick={() => backFrom("when")}>
            {es ? "← Atrás" : "← Back"}
          </button>
        </div>
      )}

      {/* ── 3. CITY (auto-advance) ── */}
      {phase === "city" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿En qué ciudad?" : "Which city?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Confirmamos que cubrimos tu zona."
              : "We confirm we serve your area."}
          </p>
          <div
            className="lca-options lca-options-focus lca-options-city"
            role="radiogroup"
            aria-label="City"
          >
            {CITY_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className={`lca-opt lca-opt-focus${city === c ? " on" : ""}`}
                disabled={advancing || sending}
                onClick={() =>
                  pickAndAdvance(
                    () => setCity(c),
                    prefillService.current ? "size" : "service",
                  )
                }
              >
                {c}
              </button>
            ))}
          </div>
          <button type="button" className="lca-back lca-back-solo" onClick={() => backFrom("city")}>
            {es ? "← Atrás" : "← Back"}
          </button>
        </div>
      )}

      {/* ── 4. SERVICE (auto-advance) ── */}
      {phase === "service" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Qué necesitas?" : "What do you need?"}
          </h2>
          <p className="lca-help">
            {es ? "Toca una opción para seguir." : "Tap one to continue."}
          </p>
          <div
            className="lca-options lca-options-focus lca-options-stack"
            role="radiogroup"
            aria-label="Service"
          >
            {(
              [
                [
                  "full-service",
                  es
                    ? "Full-service (camión + cuadrilla)"
                    : "Full-service (truck + crew)",
                ],
                [
                  "labor",
                  es
                    ? "Solo labor (tú traes el camión)"
                    : "Labor-only (you have a truck)",
                ],
                ["not-sure", es ? "No estoy seguro/a" : "Not sure yet"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`lca-opt lca-opt-focus lca-opt-wide${service === id ? " on" : ""}`}
                disabled={advancing || sending}
                onClick={() =>
                  pickAndAdvance(() => setService(id), "size")
                }
              >
                {label}
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

      {/* ── 5. HOME SIZE (auto-advance → submit) ── */}
      {phase === "size" && (
        <div key={animKey} className="lca-form lca-enter lca-focus">
          <h2 className="lca-q">
            {es ? "¿Qué tamaño es el hogar?" : "How big is the home?"}
          </h2>
          <p className="lca-help">
            {es
              ? "Última pregunta — te contactamos al instante."
              : "Last question — we contact you right away."}
          </p>
          <div
            className="lca-options lca-options-focus"
            role="radiogroup"
            aria-label="Home size"
          >
            {(
              Object.entries(HOME_SIZE_LABELS) as [
                Exclude<HomeSize, "">,
                string,
              ][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`lca-opt lca-opt-focus${homeSize === id ? " on" : ""}${sending ? " lca-opt-busy" : ""}`}
                disabled={advancing || sending}
                onClick={() => {
                  const svc = service || prefillService.current || "full-service";
                  pickAndAdvance(
                    () => setHomeSize(id),
                    "finish",
                    { size: id, svc: svc as ServiceKind },
                  );
                }}
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
          {sending && (
            <p className="lca-help" style={{ marginTop: 14, textAlign: "center" }}>
              {es ? "Enviando…" : "Sending…"}
            </p>
          )}
          {error && <p className="lca-err">{error}</p>}
          <button
            type="button"
            className="lca-back lca-back-solo"
            onClick={() => backFrom("size")}
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
