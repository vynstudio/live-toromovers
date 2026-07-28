"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { GoogleAddressInput } from "./google-address-input";

type Yn = "" | "No" | "Yes";

const SIZES = [
  { v: "Studio / few items", l: "Studio / few items" },
  { v: "1 bedroom", l: "1 BR" },
  { v: "2 bedrooms", l: "2 BR" },
  { v: "3 bedrooms", l: "3 BR" },
  { v: "4+ bedrooms", l: "4+ BR" },
];
const PACKED = [
  { v: "Ready (boxed)", l: "Ready (boxed)" },
  { v: "Halfway", l: "Halfway" },
  { v: "Still packing", l: "Still packing" },
];
const ACCESS = [
  { v: "Ground / easy parking", l: "Ground / easy" },
  { v: "Elevator", l: "Elevator" },
  { v: "Stairs", l: "Stairs" },
];

function Chip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`jsf-chip${on ? " on" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function JobSizeForm() {
  const [started] = useState(() => Date.now());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [size, setSize] = useState("");
  const [packed, setPacked] = useState("");
  const [access, setAccess] = useState("");
  const [floor, setFloor] = useState("");
  const [specials, setSpecials] = useState<Yn>("");
  const [specialsWhat, setSpecialsWhat] = useState("");
  const [notes, setNotes] = useState("");
  const [hp, setHp] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");

    if (!name.trim() || !phone.trim()) {
      setErr("Name and phone are required.");
      return;
    }
    if (!moveDate) {
      setErr("Please pick your move date.");
      return;
    }
    if (fromAddress.trim().length < 8) {
      setErr("Pickup address is required (full street, city, ZIP).");
      return;
    }
    if (toAddress.trim().length < 8) {
      setErr("Drop-off address is required (full street, city, ZIP).");
      return;
    }
    if (!size || !packed || !access || !specials) {
      setErr("Please answer all 4 questions (tap the options).");
      return;
    }
    if (access === "Stairs" && !floor.trim()) {
      setErr("Which floor for stairs?");
      return;
    }
    if (specials === "Yes" && !specialsWhat.trim()) {
      setErr("What heavy or special items?");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/job-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          moveDate,
          fromAddress: fromAddress.trim(),
          fromUnit: fromUnit.trim(),
          toAddress: toAddress.trim(),
          toUnit: toUnit.trim(),
          size,
          packed,
          access,
          floor: floor.trim(),
          specials,
          specialsWhat: specialsWhat.trim(),
          notes: notes.trim(),
          hp,
          elapsedMs: Date.now() - started,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setErr(
          data.error === "rate_limited"
            ? "Too many tries. Wait a minute or call (689) 600-2720."
            : "Could not send. Call or text (689) 600-2720 — or try again.",
        );
        setSending(false);
        return;
      }
      setDone(true);
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        /* ignore */
      }
    } catch {
      setErr("Could not send. Call or text (689) 600-2720 — or try again.");
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="jsf-done">
        <h2>Got it. Thank you.</h2>
        <p>
          We’ll use this to set your crew. If we need anything else, we’ll text
          or call.
        </p>
        <p>
          <a href="tel:+16896002720">(689) 600-2720</a>
        </p>
      </div>
    );
  }

  return (
    <form className="jsf-form" onSubmit={onSubmit} noValidate>
      <input
        className="jsf-hp"
        type="text"
        name="hp"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {err ? (
        <div className="jsf-err" role="alert">
          {err}
        </div>
      ) : null}

      <div className="jsf-field">
        <label className="jsf-label" htmlFor="jsf-name">
          Full name
        </label>
        <input
          id="jsf-name"
          type="text"
          autoComplete="name"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="jsf-field">
        <label className="jsf-label" htmlFor="jsf-phone">
          Phone
        </label>
        <input
          id="jsf-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          placeholder="(689) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="jsf-field">
        <label className="jsf-label" htmlFor="jsf-email">
          Email{" "}
          <span className="jsf-opt">(optional)</span>
        </label>
        <input
          id="jsf-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="jsf-field">
        <label className="jsf-label" htmlFor="jsf-date">
          Move date
        </label>
        <input
          id="jsf-date"
          type="date"
          required
          value={moveDate}
          onChange={(e) => setMoveDate(e.target.value)}
        />
      </div>

      <div className="jsf-field">
        <p className="jsf-q">Pickup address</p>
        <label className="jsf-label" htmlFor="jsf-from">
          Full street address
        </label>
        <GoogleAddressInput
          id="jsf-from"
          name="fromAddress"
          value={fromAddress}
          onChange={setFromAddress}
          placeholder="Start typing street…"
          ariaLabel="Pickup address"
        />
        <div className="jsf-unit">
          <label className="jsf-label" htmlFor="jsf-from-unit">
            Apt / unit <span className="jsf-opt">(optional)</span>
          </label>
          <input
            id="jsf-from-unit"
            type="text"
            autoComplete="address-line2"
            placeholder="Apt 2B"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
          />
        </div>
      </div>

      <div className="jsf-field">
        <p className="jsf-q">Drop-off address</p>
        <label className="jsf-label" htmlFor="jsf-to">
          Full street address
        </label>
        <GoogleAddressInput
          id="jsf-to"
          name="toAddress"
          value={toAddress}
          onChange={setToAddress}
          placeholder="Start typing street…"
          ariaLabel="Drop-off address"
        />
        <div className="jsf-unit">
          <label className="jsf-label" htmlFor="jsf-to-unit">
            Apt / unit <span className="jsf-opt">(optional)</span>
          </label>
          <input
            id="jsf-to-unit"
            type="text"
            autoComplete="off"
            placeholder="Unit 5"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
          />
        </div>
      </div>

      <div className="jsf-field">
        <p className="jsf-q">1. How big is the move?</p>
        <div className="jsf-chips" role="group" aria-label="Move size">
          {SIZES.map((o) => (
            <Chip key={o.v} on={size === o.v} onClick={() => setSize(o.v)}>
              {o.l}
            </Chip>
          ))}
        </div>
      </div>

      <div className="jsf-field">
        <p className="jsf-q">2. How packed will you be?</p>
        <div className="jsf-chips" role="group" aria-label="Packing status">
          {PACKED.map((o) => (
            <Chip key={o.v} on={packed === o.v} onClick={() => setPacked(o.v)}>
              {o.l}
            </Chip>
          ))}
        </div>
      </div>

      <div className="jsf-field">
        <p className="jsf-q">3. Pickup access</p>
        <div className="jsf-chips" role="group" aria-label="Pickup access">
          {ACCESS.map((o) => (
            <Chip key={o.v} on={access === o.v} onClick={() => setAccess(o.v)}>
              {o.l}
            </Chip>
          ))}
        </div>
        {access === "Stairs" ? (
          <div className="jsf-unit">
            <label className="jsf-label" htmlFor="jsf-floor">
              Which floor?
            </label>
            <input
              id="jsf-floor"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="jsf-field">
        <p className="jsf-q">4. Heavy or special items?</p>
        <div className="jsf-chips" role="group" aria-label="Special items">
          <Chip on={specials === "No"} onClick={() => setSpecials("No")}>
            No
          </Chip>
          <Chip on={specials === "Yes"} onClick={() => setSpecials("Yes")}>
            Yes
          </Chip>
        </div>
        {specials === "Yes" ? (
          <div className="jsf-unit">
            <label className="jsf-label" htmlFor="jsf-specials">
              What?
            </label>
            <textarea
              id="jsf-specials"
              placeholder="Piano, safe, fridge, hot tub…"
              value={specialsWhat}
              onChange={(e) => setSpecialsWhat(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="jsf-field">
        <label className="jsf-label" htmlFor="jsf-notes">
          Anything else? <span className="jsf-opt">(optional)</span>
        </label>
        <textarea
          id="jsf-notes"
          placeholder="Gate code, elevator reserved, parking notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit" className="jsf-submit" disabled={sending}>
        {sending ? "Sending…" : "Send details"}
      </button>
      <p className="jsf-fine">
        Goes to Toro only · (689) 600-2720 · Hablamos español
      </p>
    </form>
  );
}
