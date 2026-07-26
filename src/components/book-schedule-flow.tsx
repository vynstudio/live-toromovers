"use client";

/**
 * Post-deposit scheduling: verify payment → pick date → pick window → confirm.
 */

import { useCallback, useEffect, useState } from "react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import {
  TIME_SLOT_LABELS,
  type TimeSlotId,
} from "@/lib/bookings/types";
import { trackFormSubmit } from "@/lib/track";

type Day = {
  date: string;
  label: string;
  open: boolean;
  remaining: number;
  slots: TimeSlotId[];
};

type Status = {
  ok?: boolean;
  status?: string;
  name?: string;
  amountLabel?: string;
  canSchedule?: boolean;
  scheduled?: boolean;
  moveDate?: string;
  timeSlot?: string;
  error?: string;
};

type Props = {
  rid: string;
  orderId?: string;
  lang?: "en" | "es";
};

export function BookScheduleFlow({ rid, orderId, lang = "en" }: Props) {
  const es = lang === "es";
  const [status, setStatus] = useState<Status | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [moveDate, setMoveDate] = useState("");
  const [timeSlot, setTimeSlot] = useState<TimeSlotId | "">("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const refreshStatus = useCallback(async () => {
    const q = new URLSearchParams({ rid });
    if (orderId) q.set("orderId", orderId);
    const res = await fetch(`/api/bookings/status?${q}`);
    const data = (await res.json()) as Status;
    setStatus(data);
    if (data.scheduled) {
      setDone(true);
      setMoveDate(data.moveDate || "");
      setTimeSlot((data.timeSlot as TimeSlotId) || "");
    }
    return data;
  }, [rid, orderId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const st = await refreshStatus();
        if (cancelled) return;
        if (st.error === "not_found") {
          setError(
            es
              ? "No encontramos esta reserva."
              : "We couldn't find this reservation.",
          );
          setLoading(false);
          return;
        }
        // Poll a few times if still pending (webhook / order lag)
        if (st.status === "pending_payment") {
          for (let i = 0; i < 5; i++) {
            await new Promise((r) => setTimeout(r, 1200));
            if (cancelled) return;
            const again = await refreshStatus();
            if (again.canSchedule || again.scheduled) break;
          }
        }
        const slotsRes = await fetch("/api/bookings/slots");
        const slotsJson = (await slotsRes.json()) as { days?: Day[] };
        if (!cancelled) setDays(slotsJson.days || []);
      } catch {
        if (!cancelled) {
          setError(
            es
              ? `Error de red. Llame al ${PHONE_DISPLAY}.`
              : `Network error. Call ${PHONE_DISPLAY}.`,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshStatus, es]);

  async function confirm() {
    if (!moveDate || !timeSlot) return;
    setConfirming(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rid, moveDate, timeSlot }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setError(
          data.message ||
            (es
              ? "No se pudo confirmar. Pruebe otra fecha o llámenos."
              : "Couldn't confirm. Try another day or call us."),
        );
        return;
      }
      trackFormSubmit("book_schedule_confirm");
      setDone(true);
    } catch {
      setError(
        es
          ? `Error de red. Llame al ${PHONE_DISPLAY}.`
          : `Network error. Call ${PHONE_DISPLAY}.`,
      );
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="lca">
        <div className="lca-scroll lca-scroll--done">
          <div className="lca-done">
            <p className="lca-done-eyebrow">
              {es ? "Verificando pago…" : "Checking payment…"}
            </p>
            <h2 className="lca-done-h2">
              {es ? "Un momento" : "One moment"}
            </h2>
            <p className="lca-done-lede">
              {es
                ? "Confirmamos su depósito con Square."
                : "We're confirming your deposit with Square."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const slot = timeSlot ? TIME_SLOT_LABELS[timeSlot as TimeSlotId] : null;
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
              {es ? "Mudanza reservada" : "Move reserved"}
            </p>
            <h2 className="lca-done-h2">
              {es
                ? `¡Listo${status?.name ? `, ${status.name.split(/\s+/)[0]}` : ""}!`
                : `You're set${status?.name ? `, ${status.name.split(/\s+/)[0]}` : ""}!`}
            </h2>
            <p className="lca-done-lede">
              {moveDate && (
                <>
                  <strong>{moveDate}</strong>
                  {slot ? ` · ${es ? slot.es : slot.en} (${slot.hours})` : ""}
                  <br />
                </>
              )}
              {es
                ? "Depósito recibido. Te contactamos para confirmar detalles del equipo y el total estimado."
                : "Deposit received. We'll contact you to confirm crew details and the estimated total."}
            </p>
            <div className="lca-done-actions">
              <a href={PHONE_TEL} className="fn-btn fn-btn-primary fn-btn-lg lca-full">
                {es ? "Llamar ahora" : "Call now"} — {PHONE_DISPLAY}
              </a>
              <a href="/" className="fn-btn fn-btn-ghost-light lca-full lca-text-btn">
                {es ? "Volver al inicio" : "Back to home"}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status?.status === "pending_payment" || !status?.canSchedule) {
    return (
      <div className="lca">
        <div className="lca-scroll lca-scroll--done">
          <div className="lca-done lca-enter">
            <p className="lca-done-eyebrow">
              {es ? "Depósito pendiente" : "Deposit pending"}
            </p>
            <h2 className="lca-done-h2">
              {es
                ? "Complete el pago para elegir fecha"
                : "Complete payment to pick a date"}
            </h2>
            <p className="lca-done-lede">
              {es
                ? "Si ya pagó, espere unos segundos y actualice. Si no, vuelva a reservar."
                : "If you already paid, wait a few seconds and refresh. Otherwise start a new reservation."}
            </p>
            {error && <p className="lca-err">{error}</p>}
            <div className="lca-done-actions">
              <button
                type="button"
                className="fn-btn fn-btn-primary fn-btn-lg lca-full"
                onClick={() => window.location.reload()}
              >
                {es ? "Actualizar" : "Refresh"}
              </button>
              <a href="/book" className="fn-btn fn-btn-ghost-light lca-full lca-text-btn">
                {es ? "Volver a pagar depósito" : "Back to deposit"}
              </a>
              <a href={PHONE_TEL} className="lca-call-link">
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstName = status?.name?.split(/\s+/)[0] || "";

  return (
    <div className="lca">
      <div className="lca-progress" aria-hidden>
        <span style={{ width: moveDate && timeSlot ? "90%" : "70%" }} />
      </div>
      <div className="lca-scroll">
        <p className="lca-step">
          {es ? "Último paso" : "Last step"}
          <span className="lca-step-hint">
            {es ? " · elija fecha" : " · pick a date"}
          </span>
        </p>

        <div className="lca-form lca-enter">
          <h2 className="lca-q">
            {es
              ? `${firstName ? firstName + ", " : ""}¿qué día nos necesitas?`
              : `${firstName ? firstName + ", " : ""}when do you need us?`}
          </h2>
          <p className="lca-help">
            {es
              ? `Depósito ${status?.amountLabel || ""} recibido. Elija un día (lun–sáb) y una ventana de inicio.`
              : `Deposit ${status?.amountLabel || ""} received. Choose a day (Mon–Sat) and a start window.`}
          </p>

          <div className="lca-options" role="listbox" aria-label="Move date">
            {days.map((d) => (
              <button
                key={d.date}
                type="button"
                className={`lca-opt${moveDate === d.date ? " on" : ""}`}
                onClick={() => {
                  setMoveDate(d.date);
                  setTimeSlot("");
                  setError("");
                }}
              >
                <span className="lca-opt-label">
                  {d.label}
                  <span className="lca-opt-hint">
                    {es
                      ? `${d.remaining} cupo${d.remaining === 1 ? "" : "s"}`
                      : `${d.remaining} slot${d.remaining === 1 ? "" : "s"} left`}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {days.length === 0 && (
            <p className="lca-help">
              {es
                ? "No hay fechas abiertas en línea — llámenos para agendar."
                : "No open dates online — call us to schedule."}
            </p>
          )}

          {moveDate && (
            <>
              <h2 className="lca-q" style={{ marginTop: 28 }}>
                {es ? "Ventana de inicio" : "Start window"}
              </h2>
              <div className="lca-options" role="radiogroup">
                {(Object.keys(TIME_SLOT_LABELS) as TimeSlotId[]).map((id) => {
                  const s = TIME_SLOT_LABELS[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`lca-opt${timeSlot === id ? " on" : ""}`}
                      onClick={() => setTimeSlot(id)}
                    >
                      <span className="lca-opt-label">
                        {es ? s.es : s.en}
                        <span className="lca-opt-hint">{s.hours}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {error && <p className="lca-err">{error}</p>}
        </div>
      </div>

      <div className="lca-footer">
        <button
          type="button"
          className="fn-btn fn-btn-primary fn-btn-lg lca-full"
          disabled={!moveDate || !timeSlot || confirming}
          onClick={() => void confirm()}
        >
          {confirming
            ? es
              ? "Confirmando…"
              : "Confirming…"
            : es
              ? "Confirmar mudanza"
              : "Confirm my move"}
        </button>
        <div className="lca-footer-row">
          <a href={PHONE_TEL} className="lca-call-link">
            {es ? "¿Dudas? Llame" : "Questions? Call"} {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
}
