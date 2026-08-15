"use client";

/**
 * Get-my-price sales funnel — mirrors toro-sales-funnel.
 * 1) Name + phone → SAVE soft lead immediately (capture)
 * 2) Qualify: service → ZIPs → size → when → full lead update
 * Compact mobile-first steps; never show rates on-site.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { PHONE_DISPLAY, PHONE_TEL, GOOGLE_RATING } from "@/lib/contact";
import {
  HOME_SIZE_LABELS,
  SERVICE_LABELS,
  type HomeSize,
  type ServiceKind,
} from "@/lib/price-bands";
import {
  newEventId,
  trackFormStart,
  trackFormSubmit,
  trackInitiateCheckout,
  trackLead,
} from "@/lib/track";
import { getAttribution, getAttributionSummary } from "@/lib/utm";

type Phase =
  | "capture"
  | "service"
  | "fromZip"
  | "toZip"
  | "size"
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
  "when",
];

const ADVANCE_MS = 200;

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

async function postLead(payload: Record<string, unknown>) {
  const res = await fetch("/api/crm/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json().catch(() => ({ ok: true }));
}

/** sessionStorage key holding the event id shared by every pixel event in this
 *  browser session. A component ref alone resets on reload, which let the same
 *  visitor fire a second conversion under a fresh id. */
const EVENT_ID_KEY = "tm_gmp_event_id";

/** Run `fn` at most once per browser session. Survives reload and back-nav,
 *  unlike a ref. If storage is unavailable (private mode) we fire anyway —
 *  losing an event is worse than a rare duplicate. */
function oncePerSession(key: string, fn: () => void) {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* storage blocked — fall through and fire */
  }
  fn();
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
  const [smsConsent, setSmsConsent] = useState(true);
  const [service, setService] = useState<ServiceKind | "">(defaultService);
  const [fromZip, setFromZip] = useState("");
  const [toZip, setToZip] = useState("");
  const [homeSize, setHomeSize] = useState<HomeSize>("");
  const [whenId, setWhenId] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const [hp, setHp] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const [redirectIn, setRedirectIn] = useState(0);
  /** Soft lead landed in CRM after name+phone (qualify steps follow). */
  const [captured, setCaptured] = useState(false);
  const startRef = useRef(Date.now());
  const eventIdRef = useRef(newEventId());
  const softSentRef = useRef(false);
  const prefillService = useRef(defaultService);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Reuse one event id for the whole browser session. Without this a reload
    // mints a fresh id, and the dedupe guards below would let the same visitor
    // report a second conversion. Also the id a future CAPI call must reuse.
    try {
      const saved = window.sessionStorage.getItem(EVENT_ID_KEY);
      if (saved) eventIdRef.current = saved;
      else window.sessionStorage.setItem(EVENT_ID_KEY, eventIdRef.current);
    } catch {
      /* storage blocked — keep the per-mount id */
    }

    const q = new URLSearchParams(window.location.search);
    // Meta ad URLs historically send `servicetype`; `/get-quote` redirects keep it.
    const s = (q.get("service") ?? q.get("servicetype"))?.toLowerCase();
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

  // Pure mobile funnel — no dock chrome; scroll step body to top on advance.
  useEffect(() => {
    if (typeof document === "undefined") return;
    delete document.documentElement.dataset.lcaDock;
    const sc = document.querySelector(".lca-scroll");
    if (sc) sc.scrollTop = 0;
    // Keep focused field visible above sticky footer / keyboard
    window.setTimeout(() => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 80);
  }, [phase, animKey]);

  function funnelOf(svc: ServiceKind | ""): "labor" | "full-service" {
    return svc === "labor" ? "labor" : "full-service";
  }

  async function sendSoftLead() {
    if (softSentRef.current) return true;
    softSentRef.current = true;
    const eventId = eventIdRef.current;
    try {
      await postLead({
        name: name.trim(),
        phone: digits(phone),
        funnel: funnelOf(service || prefillService.current),
        source: "get-my-price",
        serviceType: "Pending qualify",
        note: [
          "Soft capture (contact first · name + phone) — still qualifying",
          "lead_stage=soft",
          `event_id=${eventId}`,
        ].join(" — "),
        lang: es ? "es" : "en",
        consentSms: smsConsent,
        consentEmail: false,
        landingPage:
          typeof window !== "undefined" ? window.location.pathname : "/get-my-price",
        utm: getAttribution(),
        source_detail: getAttributionSummary() || undefined,
        hp: "",
        elapsedMs: Math.max(Date.now() - startRef.current, 0),
        eventId,
      });
      // Early intent only — the visitor still has 5 steps to abandon. Firing
      // the standard Lead here taught Meta to optimize for form starters.
      oncePerSession(`tm_ic_${eventId}`, trackInitiateCheckout);
      trackFormSubmit("agent_soft_capture");
      setCaptured(true);
      return true;
    } catch {
      softSentRef.current = false;
      setCaptured(false);
      return false;
    }
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

        await postLead({
          name: name.trim(),
          phone: digits(phone),
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
            "lead_stage=complete",
            SERVICE_LABELS[resolvedSvc] && `Service: ${SERVICE_LABELS[resolvedSvc]}`,
            fromZip && `From ZIP: ${fromZip}`,
            toZip && `To ZIP: ${toZip}`,
            sizeLabel && `Size: ${sizeLabel}`,
            whenLbl && `When: ${whenLbl}`,
            `event_id=${eventId}`,
          ]
            .filter(Boolean)
            .join(" — "),
          lang: es ? "es" : "en",
          consentSms: softSentRef.current ? false : smsConsent,
          consentEmail: false,
          landingPage:
            typeof window !== "undefined"
              ? window.location.pathname
              : "/get-my-price",
          utm: getAttribution(),
          hp: "",
          elapsedMs: Math.max(Date.now() - startRef.current, 0),
          eventId: `${eventId}-full`,
        });
        // Only here is the lead deliverable: the CRM accepted the full record
        // and the team can follow up. eventID stays wired for CAPI dedupe.
        oncePerSession(`tm_lead_${eventId}`, () => trackLead(eventId));
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
    [name, phone, fromZip, toZip, es, smsConsent],
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
      // Minimum hold so bots fail speed trap + user sees "Saving…"
      const wait = 800 - (Date.now() - startRef.current);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      // Capture first — always advance to qualify even if CRM is slow/down
      // (softSentRef only stays true on success so we can retry on full submit path)
      await sendSoftLead();
    } finally {
      setSending(false);
    }
    // Qualify next: service (or skip if prefilled) → zips → size → when
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

  const stepHint =
    phase === "capture"
      ? es
        ? " · contacto"
        : " · contact"
      : phase === "done"
        ? ""
        : es
          ? " · toca una opción"
          : " · tap one";

  /* ---------- SUCCESS ---------- */
  if (phase === "done") {
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
              <a href="/" className="fn-btn fn-btn-ghost-light lca-full lca-text-btn">
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
        </div>
      </div>
    );
  }

  const showFooterPrimary =
    phase === "capture" || phase === "fromZip" || phase === "toZip";

  const showFooterBack = phase !== "capture";

  return (
    <div className="lca">
      <div className="lca-progress" aria-hidden>
        <span style={{ width: progress }} />
      </div>

      <div className="lca-scroll">
        <p className="lca-step">
          {es ? `Paso ${stepNum} de ${stepTotal}` : `Step ${stepNum} of ${stepTotal}`}
          <span className="lca-step-hint">{stepHint}</span>
        </p>

        {/* 1. CONTACT */}
        {phase === "capture" && (
          <form
            id="lca-form"
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
                ? "Nombre y teléfono primero — guardamos su contacto, luego unas preguntas rápidas."
                : "Name and phone first — we save your contact, then a few quick questions."}
            </p>

            <div className="lca-biz">
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
                onFocus={(e) =>
                  e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })
                }
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
                onFocus={(e) =>
                  e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })
                }
                placeholder={PHONE_DISPLAY}
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
                  ? `Acepto SMS y llamadas de Toro Movers al ${PHONE_DISPLAY}. STOP para salir.`
                  : `I agree to texts & calls from Toro Movers at ${PHONE_DISPLAY}. Reply STOP to opt out.`}
              </span>
            </label>

            {error && <p className="lca-err">{error}</p>}
          </form>
        )}

        {/* 2. SERVICE (qualify — contact already saved) */}
        {phase === "service" && (
          <div key={animKey} className="lca-form lca-enter">
            {captured && (
              <p className="lca-saved" role="status">
                {es
                  ? "✓ Contacto guardado — unas preguntas más"
                  : "✓ Contact saved — a few more questions"}
              </p>
            )}
            <h2 className="lca-q">
              {es ? "¿Qué necesitas?" : "What kind of help do you need?"}
            </h2>
            <p className="lca-help">
              {es ? "Toca una opción para continuar." : "Tap one to continue."}
            </p>
            <div className="lca-options" role="radiogroup">
              {(
                [
                  [
                    "full-service",
                    "Full-service",
                    es
                      ? "Camión + cuadrilla · carga, mudanza y colocación"
                      : "Truck + crew · load, move & place",
                  ],
                  [
                    "labor",
                    es ? "Solo labor" : "Labor only",
                    es
                      ? "Tú traes el camión, U-Haul o POD"
                      : "You have a truck, U-Haul, or POD",
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
                  className={`lca-opt${service === id ? " on" : ""}`}
                  aria-checked={service === id}
                  disabled={advancing || sending}
                  onClick={() => pickAndAdvance(() => setService(id), "fromZip")}
                >
                  <span className="lca-opt-label">
                    {label}
                    <span className="lca-opt-hint">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. FROM ZIP */}
        {phase === "fromZip" && (
          <form
            id="lca-form"
            key={animKey}
            className="lca-form lca-enter"
            onSubmit={(e) => {
              e.preventDefault();
              if (fromZip.length === 5) goTo("toZip");
              else
                setError(
                  es ? "Ingrese un ZIP de 5 dígitos." : "Enter a 5-digit ZIP code.",
                );
            }}
          >
            {captured && (
              <p className="lca-saved" role="status">
                {es
                  ? "✓ Contacto guardado — unas preguntas más"
                  : "✓ Contact saved — a few more questions"}
              </p>
            )}
            <h2 className="lca-q">
              {es ? "¿Desde qué ZIP?" : "Where are you moving from?"}
            </h2>
            <p className="lca-help">
              {es
                ? "Solo el código postal de 5 dígitos — cualquier ciudad está bien."
                : "Just the 5-digit ZIP — any city is fine."}
            </p>
            <label className="lca-field">
              <span>{es ? "ZIP de origen" : "Origin ZIP"}</span>
              <input
                className="lca-zip"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="postal-code"
                maxLength={5}
                autoFocus
                value={fromZip}
                onChange={(e) => {
                  const z = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setFromZip(z);
                  setError("");
                  if (z.length === 5) {
                    // Auto-advance feels snappy on mobile
                    window.setTimeout(() => goTo("toZip"), 180);
                  }
                }}
                onFocus={(e) =>
                  e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })
                }
                placeholder="32801"
              />
            </label>
            {error && <p className="lca-err">{error}</p>}
          </form>
        )}

        {/* 4. TO ZIP */}
        {phase === "toZip" && (
          <form
            id="lca-form"
            key={animKey}
            className="lca-form lca-enter"
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
              {es
                ? "Solo el código postal de 5 dígitos."
                : "Just the 5-digit ZIP."}
            </p>
            <label className="lca-field">
              <span>{es ? "ZIP de destino" : "Destination ZIP"}</span>
              <input
                className="lca-zip"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="postal-code"
                maxLength={5}
                autoFocus
                value={toZip}
                onChange={(e) => {
                  const z = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setToZip(z);
                  setError("");
                  if (z.length === 5) {
                    window.setTimeout(() => goTo("size"), 180);
                  }
                }}
                onFocus={(e) =>
                  e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })
                }
                placeholder="34787"
              />
            </label>
            {error && <p className="lca-err">{error}</p>}
          </form>
        )}

        {/* 5. SIZE */}
        {phase === "size" && (
          <div key={animKey} className="lca-form lca-enter">
            <h2 className="lca-q">
              {es ? "¿Qué tamaño es?" : "How big is the move?"}
            </h2>
            <p className="lca-help">
              {es ? "Toca una opción para continuar." : "Tap one to continue."}
            </p>
            <div className="lca-options" role="radiogroup">
              {SIZE_OPTS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`lca-opt${homeSize === o.id ? " on" : ""}`}
                  aria-checked={homeSize === o.id}
                  disabled={advancing || sending}
                  onClick={() =>
                    pickAndAdvance(() => setHomeSize(o.id), "when")
                  }
                >
                  <span className="lca-opt-label">
                    {es ? o.labelEs : o.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. WHEN → submit */}
        {phase === "when" && (
          <div key={animKey} className="lca-form lca-enter">
            <h2 className="lca-q">
              {es ? "¿Cuándo nos necesitas?" : "When do you need us?"}
            </h2>
            <p className="lca-help">
              {es
                ? "Última pregunta — te contactamos al instante."
                : "Last question — we contact you right away."}
            </p>
            <div className="lca-options" role="radiogroup">
              {WHEN_OPTS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`lca-opt${whenId === w.id ? " on" : ""}${w.hot ? " lca-opt-hot" : ""}`}
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
                  <span className="lca-opt-label">
                    {es ? w.labelEs : w.labelEn}
                  </span>
                </button>
              ))}
            </div>
            {sending && (
              <p className="lca-sending">{es ? "Enviando…" : "Sending…"}</p>
            )}
            {error && <p className="lca-err">{error}</p>}
          </div>
        )}
      </div>

      {/* Sticky thumb-zone footer */}
      <div
        className={`lca-footer${
          phase === "service" || phase === "size" || phase === "when"
            ? " lca-footer--tap"
            : ""
        }`}
      >
        {showFooterPrimary && phase === "capture" && (
          <button
            type="submit"
            form="lca-form"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={sending || !nameOk || !phoneOk || !smsConsent}
          >
            {sending
              ? es
                ? "Guardando…"
                : "Saving…"
              : es
                ? "Guardar y continuar"
                : "Save & continue"}
          </button>
        )}
        {showFooterPrimary && phase === "fromZip" && (
          <button
            type="submit"
            form="lca-form"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={fromZip.length !== 5}
          >
            {es ? "Continuar" : "Continue"}
          </button>
        )}
        {showFooterPrimary && phase === "toZip" && (
          <button
            type="submit"
            form="lca-form"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={toZip.length !== 5}
          >
            {es ? "Continuar" : "Continue"}
          </button>
        )}

        <div className="lca-footer-row">
          {showFooterBack && (
            <button
              type="button"
              className="lca-back"
              onClick={() => backFrom(phase as ActivePhase)}
              disabled={sending || advancing}
            >
              {es ? "← Atrás" : "← Back"}
            </button>
          )}
          {phase === "capture" && (
            <a href={PHONE_TEL} className="lca-call-link">
              {es ? "Llamar" : "Call"} {PHONE_DISPLAY}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

