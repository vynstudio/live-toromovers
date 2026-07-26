"use client";

/**
 * Deposit-first booking: contact → service → zips → size → pay deposit (Square).
 * After payment, Square redirects to /book/schedule?rid=...
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PHONE_DISPLAY, PHONE_TEL, GOOGLE_RATING } from "@/lib/contact";
import {
  HOME_SIZE_LABELS,
  SERVICE_LABELS,
  type HomeSize,
  type ServiceKind,
} from "@/lib/price-bands";
import { getAttribution } from "@/lib/utm";
import { newEventId, trackFormStart, trackFormSubmit } from "@/lib/track";

type Phase = "capture" | "service" | "fromZip" | "toZip" | "size" | "pay";

const PHASE_ORDER: Phase[] = [
  "capture",
  "service",
  "fromZip",
  "toZip",
  "size",
  "pay",
];

const SIZE_OPTS: { id: Exclude<HomeSize, "">; labelEn: string; labelEs: string }[] =
  [
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

type Props = {
  lang?: "en" | "es";
  depositLabel?: string;
};

export function BookDepositFlow({
  lang = "en",
  depositLabel = "$150",
}: Props) {
  const es = lang === "es";
  const [phase, setPhase] = useState<Phase>("capture");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [smsConsent, setSmsConsent] = useState(true);
  const [service, setService] = useState<ServiceKind | "">("");
  const [fromZip, setFromZip] = useState("");
  const [toZip, setToZip] = useState("");
  const [homeSize, setHomeSize] = useState<HomeSize>("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const [hp, setHp] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const startRef = useRef(Date.now());
  const eventIdRef = useRef(newEventId());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const s = q.get("service")?.toLowerCase();
    if (s === "labor" || s === "labor-only") setService("labor");
    if (s === "full-service" || s === "full") setService("full-service");
  }, []);

  useEffect(() => {
    const sc = document.querySelector(".lca-scroll");
    if (sc) sc.scrollTop = 0;
  }, [phase, animKey]);

  const phoneOk = digits(phone).length === 10;
  const nameOk = name.trim().length >= 2;
  const stepIndex = PHASE_ORDER.indexOf(phase);
  const stepNum = stepIndex + 1;
  const stepTotal = PHASE_ORDER.length;
  const progress = `${Math.round((stepNum / stepTotal) * 100)}%`;

  function begin() {
    if (!started) {
      setStarted(true);
      trackFormStart("book_deposit");
    }
  }

  function goTo(next: Phase) {
    setError("");
    setAnimKey((k) => k + 1);
    setPhase(next);
  }

  async function startCheckout() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/square/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: digits(phone),
          email: email.trim() || undefined,
          service: service || "full-service",
          fromZip,
          toZip,
          homeSize,
          lang: es ? "es" : "en",
          consentSms: smsConsent,
          source: "book-deposit",
          utm: getAttribution(),
          hp,
          elapsedMs: Math.max(Date.now() - startRef.current, 0),
          eventId: eventIdRef.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
        message?: string;
        detail?: string;
      };

      if (!res.ok || !data.url) {
        if (data.error === "square_not_configured") {
          setError(
            es
              ? "Pagos no configurados aún. Llame al " + PHONE_DISPLAY
              : "Payments not set up yet. Please call " + PHONE_DISPLAY,
          );
        } else {
          setError(
            es
              ? `No se pudo iniciar el pago. Llame al ${PHONE_DISPLAY}.`
              : `Couldn't start checkout. Call ${PHONE_DISPLAY}.`,
          );
        }
        return;
      }

      trackFormSubmit("book_deposit_checkout");
      window.location.assign(data.url);
    } catch {
      setError(
        es
          ? `Error de red. Llame al ${PHONE_DISPLAY}.`
          : `Network error. Call ${PHONE_DISPLAY}.`,
      );
    } finally {
      setSending(false);
    }
  }

  function onCapture(e: FormEvent) {
    e.preventDefault();
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
          ? "Acepte contacto para continuar."
          : "Please agree so we can contact you about your move.",
      );
      return;
    }
    goTo("service");
  }

  function back() {
    if (sending) return;
    const i = PHASE_ORDER.indexOf(phase);
    if (i <= 0) return;
    goTo(PHASE_ORDER[i - 1]!);
  }

  return (
    <div className="lca">
      <div className="lca-progress" aria-hidden>
        <span style={{ width: progress }} />
      </div>

      <div className="lca-scroll">
        <p className="lca-step">
          {es ? `Paso ${stepNum} de ${stepTotal}` : `Step ${stepNum} of ${stepTotal}`}
          <span className="lca-step-hint">
            {phase === "pay"
              ? es
                ? " · depósito"
                : " · deposit"
              : es
                ? " · reserva"
                : " · reserve"}
          </span>
        </p>

        {phase === "capture" && (
          <form
            id="book-form"
            key={animKey}
            className="lca-form lca-enter"
            onSubmit={onCapture}
            noValidate
          >
            <h2 className="lca-q">
              {es ? "Reserve su mudanza." : "Reserve your move."}
            </h2>
            <p className="lca-help">
              {es
                ? `Pague un depósito de ${depositLabel} primero, luego elija fecha. El depósito se aplica a su mudanza.`
                : `Pay a ${depositLabel} deposit first, then pick your date. Deposit applies to your move.`}
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
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder={PHONE_DISPLAY}
                required
              />
            </label>

            <label className="lca-field">
              <span>
                {es ? "Email" : "Email"}{" "}
                <span style={{ opacity: 0.55, fontWeight: 400 }}>
                  ({es ? "opcional" : "optional"})
                </span>
              </span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
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

        {phase === "service" && (
          <div key={animKey} className="lca-form lca-enter">
            <h2 className="lca-q">
              {es ? "¿Qué necesitas?" : "What kind of help do you need?"}
            </h2>
            <div className="lca-options" role="radiogroup">
              {(
                [
                  [
                    "full-service",
                    "Full-service",
                    es
                      ? "Camión + cuadrilla"
                      : "Truck + crew · load, move & place",
                  ],
                  [
                    "labor",
                    es ? "Solo labor" : "Labor only",
                    es
                      ? "Tú traes el camión / U-Haul"
                      : "You have a truck, U-Haul, or POD",
                  ],
                  [
                    "not-sure",
                    es ? "No estoy seguro/a" : "Not sure yet",
                    es ? "Te ayudamos a elegir" : "We'll help you pick",
                  ],
                ] as const
              ).map(([id, label, hint]) => (
                <button
                  key={id}
                  type="button"
                  className={`lca-opt${service === id ? " on" : ""}`}
                  onClick={() => {
                    setService(id);
                    goTo("fromZip");
                  }}
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

        {phase === "fromZip" && (
          <form
            id="book-form"
            key={animKey}
            className="lca-form lca-enter"
            onSubmit={(e) => {
              e.preventDefault();
              if (fromZip.length === 5) goTo("toZip");
              else
                setError(
                  es ? "Ingrese un ZIP de 5 dígitos." : "Enter a 5-digit ZIP.",
                );
            }}
          >
            <h2 className="lca-q">
              {es ? "¿Desde qué ZIP?" : "Where are you moving from?"}
            </h2>
            <label className="lca-field">
              <span>{es ? "ZIP de origen" : "Origin ZIP"}</span>
              <input
                className="lca-zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                autoFocus
                value={fromZip}
                onChange={(e) => {
                  const z = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setFromZip(z);
                  setError("");
                  if (z.length === 5) setTimeout(() => goTo("toZip"), 160);
                }}
                placeholder="32801"
              />
            </label>
            {error && <p className="lca-err">{error}</p>}
          </form>
        )}

        {phase === "toZip" && (
          <form
            id="book-form"
            key={animKey}
            className="lca-form lca-enter"
            onSubmit={(e) => {
              e.preventDefault();
              if (toZip.length === 5) goTo("size");
              else
                setError(
                  es ? "Ingrese un ZIP de 5 dígitos." : "Enter a 5-digit ZIP.",
                );
            }}
          >
            <h2 className="lca-q">
              {es ? "¿A qué ZIP?" : "Where are you moving to?"}
            </h2>
            <label className="lca-field">
              <span>{es ? "ZIP de destino" : "Destination ZIP"}</span>
              <input
                className="lca-zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                autoFocus
                value={toZip}
                onChange={(e) => {
                  const z = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setToZip(z);
                  setError("");
                  if (z.length === 5) setTimeout(() => goTo("size"), 160);
                }}
                placeholder="34787"
              />
            </label>
            {error && <p className="lca-err">{error}</p>}
          </form>
        )}

        {phase === "size" && (
          <div key={animKey} className="lca-form lca-enter">
            <h2 className="lca-q">
              {es ? "¿Qué tamaño es?" : "How big is the move?"}
            </h2>
            <div className="lca-options" role="radiogroup">
              {SIZE_OPTS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`lca-opt${homeSize === o.id ? " on" : ""}`}
                  onClick={() => {
                    setHomeSize(o.id);
                    goTo("pay");
                  }}
                >
                  <span className="lca-opt-label">
                    {es ? o.labelEs : o.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "pay" && (
          <div key={animKey} className="lca-form lca-enter">
            <h2 className="lca-q">
              {es ? "Pague el depósito para reservar." : "Pay the deposit to lock it in."}
            </h2>
            <p className="lca-help">
              {es
                ? "Después del pago elige fecha y horario. El depósito se aplica al total de la mudanza."
                : "After payment you'll pick your date and start window. Deposit applies to your move total."}
            </p>

            <div className="lca-biz" style={{ marginBottom: 16 }}>
              <div>
                <strong>
                  {es ? "Resumen" : "Summary"}
                </strong>
                <div className="lca-stars" style={{ display: "block", marginTop: 6 }}>
                  <div>
                    {name.trim()} · {formatPhone(phone)}
                  </div>
                  <div>
                    {SERVICE_LABELS[(service || "full-service") as ServiceKind]}
                  </div>
                  <div>
                    {fromZip} → {toZip}
                    {homeSize
                      ? ` · ${HOME_SIZE_LABELS[homeSize as Exclude<HomeSize, "">] || homeSize}`
                      : ""}
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 700, color: "#0A0A0A" }}>
                    {es ? "Depósito hoy:" : "Deposit due today:"} {depositLabel}
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="lca-err">{error}</p>}
            {sending && (
              <p className="lca-sending">
                {es ? "Abriendo pago seguro…" : "Opening secure checkout…"}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className={`lca-footer${
          phase === "service" || phase === "size" ? " lca-footer--tap" : ""
        }`}
      >
        {phase === "capture" && (
          <button
            type="submit"
            form="book-form"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={!nameOk || !phoneOk || !smsConsent}
          >
            {es ? "Continuar" : "Continue"}
          </button>
        )}
        {(phase === "fromZip" || phase === "toZip") && (
          <button
            type="submit"
            form="book-form"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={
              phase === "fromZip" ? fromZip.length !== 5 : toZip.length !== 5
            }
          >
            {es ? "Continuar" : "Continue"}
          </button>
        )}
        {phase === "pay" && (
          <button
            type="button"
            className="fn-btn fn-btn-primary fn-btn-lg lca-full"
            disabled={sending}
            onClick={() => void startCheckout()}
          >
            {sending
              ? es
                ? "Espere…"
                : "Please wait…"
              : es
                ? `Pagar depósito ${depositLabel}`
                : `Pay ${depositLabel} deposit`}
          </button>
        )}

        <div className="lca-footer-row">
          {phase !== "capture" && (
            <button
              type="button"
              className="lca-back"
              onClick={back}
              disabled={sending}
            >
              {es ? "← Atrás" : "← Back"}
            </button>
          )}
          {phase === "capture" && (
            <a href={PHONE_TEL} className="lca-call-link">
              {es ? "Llamar" : "Call"} {PHONE_DISPLAY}
            </a>
          )}
          {phase === "pay" && (
            <a href="/get-my-price" className="lca-call-link">
              {es ? "Solo cotización" : "Quote only"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
