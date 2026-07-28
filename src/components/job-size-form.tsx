"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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

/** 7 AM – 7 PM, hourly */
const TIMES = Array.from({ length: 13 }, (_, i) => {
  const h = 7 + i;
  const v = `${String(h).padStart(2, "0")}:00`;
  const l =
    h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`;
  return { v, l };
});

type InventoryKey =
  | "boxes"
  | "beds"
  | "mattresses"
  | "sofas"
  | "tvs"
  | "dressers"
  | "diningTables"
  | "chairs"
  | "appliances"
  | "otherFurniture";

const INVENTORY_ITEMS: { key: InventoryKey; label: string; step?: number }[] = [
  { key: "boxes", label: "Boxes (estimate)", step: 5 },
  { key: "beds", label: "Beds (frames)" },
  { key: "mattresses", label: "Mattresses" },
  { key: "sofas", label: "Sofas / couches" },
  { key: "tvs", label: "TVs" },
  { key: "dressers", label: "Dressers / chests" },
  { key: "diningTables", label: "Dining tables" },
  { key: "chairs", label: "Chairs" },
  { key: "appliances", label: "Appliances (fridge, washer…)" },
  { key: "otherFurniture", label: "Other furniture pieces" },
];

const emptyInventory = (): Record<InventoryKey, number> => ({
  boxes: 0,
  beds: 0,
  mattresses: 0,
  sofas: 0,
  tvs: 0,
  dressers: 0,
  diningTables: 0,
  chairs: 0,
  appliances: 0,
  otherFurniture: 0,
});

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

function QtyRow({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="jsf-qty">
      <span className="jsf-qty-label">{label}</span>
      <div className="jsf-qty-controls">
        <button
          type="button"
          className="jsf-qty-btn"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - step))}
        >
          −
        </button>
        <span className="jsf-qty-val" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className="jsf-qty-btn"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function JobSizeForm() {
  const [started] = useState(() => Date.now());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [moveTime, setMoveTime] = useState("");
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
  const [inventory, setInventory] = useState(emptyInventory);
  const [inventoryNotes, setInventoryNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [hp, setHp] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const errRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.jsf = "1";
    return () => {
      delete document.documentElement.dataset.jsf;
    };
  }, []);

  useEffect(() => {
    if (err && errRef.current) {
      errRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [err]);

  function setQty(key: InventoryKey, n: number) {
    setInventory((prev) => ({ ...prev, [key]: Math.max(0, n) }));
  }

  function inventoryTotal(): number {
    return Object.values(inventory).reduce((a, b) => a + b, 0);
  }

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
    if (!moveTime) {
      setErr("Please pick the start time for your move.");
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
      setErr("Please answer size, packing, access, and specials.");
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
    if (inventoryTotal() === 0 && !inventoryNotes.trim()) {
      setErr(
        "Add counts for items to move (boxes, beds, TVs…) or describe them below.",
      );
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
          moveTime,
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
          inventory,
          inventoryNotes: inventoryNotes.trim(),
          notes: notes.trim(),
          hp,
          elapsedMs: Date.now() - started,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        spam?: boolean;
        error?: string;
        emailed?: boolean;
      };

      if (data.spam) {
        setErr("Please wait a moment and try Send again.");
        setSending(false);
        return;
      }

      if (!res.ok || !data.ok) {
        const map: Record<string, string> = {
          rate_limited:
            "Too many tries. Wait a minute or call (689) 600-2720.",
          email_failed:
            "Could not deliver to our inbox. Call or text (689) 600-2720.",
          delivery_failed:
            "Could not send your details. Call or text (689) 600-2720.",
          name_phone_required: "Name and phone are required.",
          move_date_required: "Please pick your move date.",
          move_time_required: "Please pick a start time.",
          addresses_required: "Full pickup and drop-off addresses are required.",
          answers_required: "Please complete all required questions.",
          inventory_required: "Add item counts or describe what you’re moving.",
        };
        setErr(
          (data.error && map[data.error]) ||
            "Could not send. Call or text (689) 600-2720 — or try again.",
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
      setErr("Network error. Check your connection or call (689) 600-2720.");
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="jsf-done">
        <h2>Got it. Thank you.</h2>
        <p>
          We received your move details and will set the right crew. If we need
          anything else, we’ll text or call.
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
        name="company_website"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {err ? (
        <div className="jsf-err" ref={errRef} role="alert">
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
          Email <span className="jsf-opt">(optional)</span>
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
        <p className="jsf-q">Start time</p>
        <p className="jsf-hint">Exact hour the crew should arrive</p>
        <div className="jsf-chips jsf-chips-time" role="group" aria-label="Start time">
          {TIMES.map((o) => (
            <Chip
              key={o.v}
              on={moveTime === o.v}
              onClick={() => setMoveTime(o.v)}
            >
              {o.l}
            </Chip>
          ))}
        </div>
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
        <p className="jsf-q">How big is the move?</p>
        <div className="jsf-chips" role="group" aria-label="Move size">
          {SIZES.map((o) => (
            <Chip key={o.v} on={size === o.v} onClick={() => setSize(o.v)}>
              {o.l}
            </Chip>
          ))}
        </div>
      </div>

      <div className="jsf-field">
        <p className="jsf-q">How packed will you be?</p>
        <div className="jsf-chips" role="group" aria-label="Packing status">
          {PACKED.map((o) => (
            <Chip key={o.v} on={packed === o.v} onClick={() => setPacked(o.v)}>
              {o.l}
            </Chip>
          ))}
        </div>
      </div>

      <div className="jsf-field">
        <p className="jsf-q">Pickup access</p>
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
        <p className="jsf-q">What needs to be moved?</p>
        <p className="jsf-hint">
          Tap + / − for each item. Rough counts are fine.
        </p>
        <div className="jsf-inventory">
          {INVENTORY_ITEMS.map((item) => (
            <QtyRow
              key={item.key}
              label={item.label}
              value={inventory[item.key]}
              step={item.step ?? 1}
              onChange={(n) => setQty(item.key, n)}
            />
          ))}
        </div>
        <div className="jsf-unit">
          <label className="jsf-label" htmlFor="jsf-inv-notes">
            Other items to move <span className="jsf-opt">(optional)</span>
          </label>
          <textarea
            id="jsf-inv-notes"
            placeholder="Desks, gym gear, plants, bins, garage items…"
            value={inventoryNotes}
            onChange={(e) => setInventoryNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="jsf-field">
        <p className="jsf-q">Heavy or special items?</p>
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
              placeholder="Piano, safe, hot tub, glass table, gun safe…"
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
