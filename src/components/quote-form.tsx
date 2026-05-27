"use client";

import { useState, type FormEvent } from "react";
import { useLang } from "./lang-provider";
import { GoogleAddressInput } from "./google-address-input";
import { RouteMap } from "./route-map";
import { type HelpType, type MoveSize } from "@/lib/booking-schema";
import { newEventId, trackLead } from "@/lib/track";
import { PHONE_DISPLAY } from "@/lib/contact";

const STEPS = 4;
const ROOMS = ["Studio", "1", "2", "3", "4", "5+"];
const MOVING_TYPES_EN = ["Apartment", "House", "Studio", "Office", "Storage unit"];
const MOVING_TYPES_ES = ["Apartamento", "Casa", "Estudio", "Oficina", "Trastero"];
const FLOORS_EN = ["Ground floor", "2nd floor", "3rd floor", "4th+ floor"];
const FLOORS_ES = ["Planta baja", "2.º piso", "3.º piso", "4.º+ piso"];

// Map a room count to our MoveSize enum (best-effort).
const SIZE_BY_ROOMS: Record<string, MoveSize> = {
  Studio: "studio",
  "1": "one-br",
  "2": "two-br",
  "3": "three-br",
  "4": "four-plus",
  "5+": "four-plus",
};

// GoFlex-style multi-step quote with a persistent route map.
export function QuoteForm() {
  const { t, lang } = useLang();
  const es = lang === "es";
  const movingTypes = es ? MOVING_TYPES_ES : MOVING_TYPES_EN;
  const floorOptions = es ? FLOORS_ES : FLOORS_EN;

  const [step, setStep] = useState(1);
  const [from, setFrom] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [to, setTo] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [typeIdx, setTypeIdx] = useState(0);
  const [rooms, setRooms] = useState("2");
  const [floorIdx, setFloorIdx] = useState(0);
  const [access, setAccess] = useState<"stairs" | "elevator">("stairs");
  const [arrival, setArrival] = useState<"morning" | "afternoon">("morning");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const valid =
    step === 1
      ? from.trim() !== "" && to.trim() !== ""
      : step === 4
        ? name.trim() !== "" && email.trim() !== "" && phone.trim() !== ""
        : true;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS) {
      if (valid) setStep((s) => s + 1);
      return;
    }
    if (!valid) return;
    setSubmitting(true);
    const eventId = newEventId();
    const parts = name.trim().split(/\s+/);
    const firstName = parts.shift() || name.trim();
    const lastName = parts.join(" ");
    const helpType: HelpType = "labor-truck";
    const arrivalLabel = arrival === "morning" ? "Morning (8AM–12PM)" : "Afternoon (12PM–4PM)";
    const accessLabel = access === "elevator" ? "Elevator" : "Stairs";
    const specialItems =
      `Type: ${MOVING_TYPES_EN[typeIdx]}. ` +
      `Rooms: ${rooms}. ` +
      `Floor: ${FLOORS_EN[floorIdx]}. ` +
      `Access: ${accessLabel}. ` +
      `Arrival: ${arrivalLabel}.`;
    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helpType,
          fromAddress: fromUnit ? `${from}, ${fromUnit}` : from,
          toAddress: toUnit ? `${to}, ${toUnit}` : to,
          size: SIZE_BY_ROOMS[rooms],
          date: date || undefined,
          specialItems,
          firstName,
          lastName,
          email,
          phone,
          eventId,
        }),
      });
      trackLead(eventId);
    } catch {
      /* never block the customer */
    }
    setSubmitting(false);
    setDone(true);
  };

  return (
    <div className="quote-grid">
      <div className="quote-pane">
        {done ? (
          <div className="quote-card quote-done">
            <div className="quote-check" aria-hidden>✓</div>
            <h1>{t.quote.successTitle}</h1>
            <p className="quote-sub">{t.quote.successBody}</p>
            <a href="/" className="btn btn-outline">{es ? "Volver al inicio" : "Back to home"}</a>
          </div>
        ) : (
          <form className="quote-card" onSubmit={submit}>
            <div className="quote-progress" aria-hidden>
              <span style={{ width: `${(step / STEPS) * 100}%` }} />
            </div>

            {step === 1 && (
              <>
                <h1>{es ? "Planifiquemos tu mudanza" : "Let’s plan your move"}</h1>
                <p className="quote-sub">{es ? "Tu dirección de origen y destino." : "Your starting address and destination."}</p>
                <label className="quote-field">
                  <span>{es ? "Desde — dirección completa" : "Moving from — full address"}</span>
                  <GoogleAddressInput value={from} onChange={setFrom} placeholder={es ? "Calle, ciudad, FL" : "Street, city, FL"} ariaLabel={es ? "Origen" : "Pickup"} />
                </label>
                <input className="quote-unit" placeholder={es ? "Apto, suite o unidad" : "Apartment, suite, or unit"} value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} />
                <label className="quote-field">
                  <span>{es ? "Hasta — dirección completa" : "Moving to — full address"}</span>
                  <GoogleAddressInput value={to} onChange={setTo} placeholder={es ? "Calle, ciudad, FL" : "Street, city, FL"} ariaLabel={es ? "Destino" : "Drop-off"} />
                </label>
                <input className="quote-unit" placeholder={es ? "Apto, suite o unidad" : "Apartment, suite, or unit"} value={toUnit} onChange={(e) => setToUnit(e.target.value)} />
              </>
            )}

            {step === 2 && (
              <>
                <h1>{es ? "Cuéntanos de tu mudanza" : "Tell us about your move"}</h1>
                <p className="quote-sub">{es ? "Tipo, tamaño y acceso." : "Type, size, and access."}</p>
                <div className="quote-row">
                  <label className="quote-field"><span>{es ? "Tipo de mudanza" : "Moving type"}</span>
                    <select value={typeIdx} onChange={(e) => setTypeIdx(Number(e.target.value))}>{movingTypes.map((tp, i) => <option key={tp} value={i}>{tp}</option>)}</select>
                  </label>
                  <label className="quote-field"><span>{es ? "Habitaciones" : "Rooms"}</span>
                    <select value={rooms} onChange={(e) => setRooms(e.target.value)}>{ROOMS.map((r) => <option key={r}>{r}</option>)}</select>
                  </label>
                </div>
                <label className="quote-field"><span>{es ? "Piso" : "Floor"}</span>
                  <select value={floorIdx} onChange={(e) => setFloorIdx(Number(e.target.value))}>{floorOptions.map((f, i) => <option key={f} value={i}>{f}</option>)}</select>
                </label>
                <div className="quote-windows">
                  {(["stairs", "elevator"] as const).map((a) => (
                    <button type="button" key={a} className={`quote-window${access === a ? " on" : ""}`} onClick={() => setAccess(a)}>
                      <strong>{a === "stairs" ? (es ? "Escaleras" : "Stairs") : (es ? "Ascensor" : "Elevator")}</strong>
                      <span>{a === "stairs" ? (es ? "Sin ascensor" : "Walk-up access") : (es ? "Hay ascensor" : "Elevator available")}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1>{es ? "Agenda tu mudanza" : "Schedule your move"}</h1>
                <p className="quote-sub">{es ? "Elige el día y la ventana de llegada." : "Pick a day and arrival window."}</p>
                <label className="quote-field"><span>{es ? "Fecha preferida" : "Preferred date"}</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <div className="quote-windows">
                  {(["morning", "afternoon"] as const).map((w) => (
                    <button type="button" key={w} className={`quote-window${arrival === w ? " on" : ""}`} onClick={() => setArrival(w)}>
                      <strong>{w === "morning" ? (es ? "Llegada mañana" : "Morning arrival") : (es ? "Llegada tarde" : "Afternoon arrival")}</strong>
                      <span>{w === "morning" ? "8:00 AM – 12:00 PM" : "12:00 PM – 4:00 PM"}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1>{es ? "Ya casi" : "You’re almost there"}</h1>
                <p className="quote-sub">{es ? "Tus datos para enviarte el precio." : "A few details for your estimate."}</p>
                <label className="quote-field"><span>{es ? "Nombre completo" : "Full name"}</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={es ? "Nombre y apellido" : "First and last name"} />
                </label>
                <label className="quote-field"><span>{t.quote.email}</span>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </label>
                <label className="quote-field"><span>{t.quote.phone}</span>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={PHONE_DISPLAY} />
                </label>
              </>
            )}

            <div className="quote-actions">
              {step > 1 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>{t.quote.back}</button>
              )}
              <button className="btn btn-primary" type="submit" disabled={!valid || submitting}>
                {submitting ? "…" : step < STEPS ? t.quote.next : es ? "Ver mi precio" : "Get my price"}
                <span className="arrow" aria-hidden />
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="quote-map">
        <RouteMap from={from} to={to} />
      </div>
    </div>
  );
}
