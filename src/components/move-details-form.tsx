"use client";

/**
 * Phone-first move details — short steps + auto-advance on taps.
 * Typing only for contact, addresses, optional notes.
 * Posts full payload to /api/intake → Telegram.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { GoogleAddressInput } from "./google-address-input";

type Yn = "yes" | "no" | "";
type ItemCounts = Record<string, number>;

const HOME = ["Apartment", "House", "Townhome", "Studio", "Office", "Storage"];
const FLOORS = ["Ground", "2nd", "3rd", "4th", "5th+"];
const BEDS = ["Studio", "1", "2", "3", "4", "5+"];
const SERVICES = [
  { v: "full-service", l: "Full moving service", sub: "With truck + crew" },
  { v: "labor-only", l: "Labor only", sub: "You have the truck" },
];
const PARK = ["Driveway", "Street", "Loading dock", "Garage", "Not sure"];
const PACK = [
  { v: "fully-packed", l: "Fully packed" },
  { v: "mostly-packed", l: "Mostly packed" },
  { v: "partially-packed", l: "Partially packed" },
  { v: "not-packed", l: "Not packed" },
];
const TIMES = Array.from({ length: 11 }, (_, i) => {
  const h = 7 + i;
  return {
    v: `${String(h).padStart(2, "0")}:00`,
    l: h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`,
  };
});
const SPECIALS = [
  "Piano", "Safe", "Pool table", "Hot tub", "Glass / mirrors",
  "Antiques", "Artwork", "Gym gear", "Other heavy",
];
const APPLIANCES = ["Fridge", "Washer", "Dryer", "Dishwasher", "Stove", "Freezer"];
const PRESETS: { id: string; l: string; counts: ItemCounts }[] = [
  {
    id: "studio",
    l: "Studio",
    counts: {
      "Sofa / couch": 1, "Queen bed (frame + mattress)": 1,
      "TV (flat screen)": 1, "Medium boxes": 15, "Large boxes": 5,
    },
  },
  {
    id: "1br",
    l: "1 BR",
    counts: {
      "Sofa / couch": 1, "Queen bed (frame + mattress)": 1, "Dresser": 1,
      "Dining table": 1, "Dining chairs": 4, "Medium boxes": 20, "Large boxes": 8,
    },
  },
  {
    id: "2br",
    l: "2 BR",
    counts: {
      "Sofa / couch": 1, "Loveseat": 1, "Queen bed (frame + mattress)": 1,
      "Full / double bed": 1, "Dresser": 2, "Dining table": 1, "Dining chairs": 4,
      "Medium boxes": 30, "Large boxes": 12,
    },
  },
  {
    id: "3br",
    l: "3+ BR",
    counts: {
      "Sofa / couch": 1, "Sectional": 1, "King bed (frame + mattress)": 1,
      "Queen bed (frame + mattress)": 1, "Twin bed": 1, "Dresser": 3,
      "Dining table": 1, "Dining chairs": 6, "Medium boxes": 40, "Large boxes": 15,
    },
  },
];

const KEY = "toro_move_details_v2";
const ADVANCE_MS = 220;

type Step =
  | "contact"
  | "date"
  | "time"
  | "service"
  | "from"
  | "to"
  | "stuff"
  | "dayof";

const STEPS: Step[] = [
  "contact", "date", "time", "service", "from", "to", "stuff", "dayof",
];

const LABELS: Record<Step, string> = {
  contact: "Contact",
  date: "Date",
  time: "Time",
  service: "Service",
  from: "Pickup",
  to: "Drop-off",
  stuff: "Stuff",
  dayof: "Day of",
};

type D = {
  name: string;
  phone: string;
  email: string;
  moveDate: string;
  moveTime: string;
  serviceType: string;
  fromAddress: string;
  fromUnit: string;
  fromHomeType: string;
  bedrooms: string;
  fromFloor: string;
  fromElevator: Yn;
  fromParking: string;
  fromLongCarry: Yn;
  toAddress: string;
  toUnit: string;
  toHomeType: string;
  toFloor: string;
  toElevator: Yn;
  toParking: string;
  toLongCarry: Yn;
  itemCounts: ItemCounts;
  invOther: string;
  appliances: string[];
  specialItems: string[];
  packingStatus: string;
  needPackingHelp: Yn;
  svcDisassembly: Yn;
  onSiteMe: Yn;
  petsOnSite: Yn;
  kidsOnSite: Yn;
  notes: string;
};

const empty: D = {
  name: "", phone: "", email: "",
  moveDate: "", moveTime: "", serviceType: "",
  fromAddress: "", fromUnit: "", fromHomeType: "", bedrooms: "",
  fromFloor: "", fromElevator: "", fromParking: "", fromLongCarry: "",
  toAddress: "", toUnit: "", toHomeType: "",
  toFloor: "", toElevator: "", toParking: "", toLongCarry: "",
  itemCounts: {}, invOther: "", appliances: [], specialItems: [],
  packingStatus: "", needPackingHelp: "", svcDisassembly: "",
  onSiteMe: "", petsOnSite: "", kidsOnSite: "", notes: "",
};

const multi = (t: string) => ["Apartment", "Townhome", "Office"].includes(t);
const needsBeds = (t: string) => !["Office", "Storage"].includes(t);

function Chip({
  on, children, onClick,
}: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className={`mdf-chip${on ? " on" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function floorLabel(f: string) {
  if (!f) return "";
  if (f === "Ground") return "Ground floor";
  return `${f} floor`;
}

export function MoveDetailsForm() {
  const router = useRouter();
  const [d, setD] = useState<D>(empty);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [today, setToday] = useState("");
  const advRef = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const set = useCallback((p: Partial<D>) => {
    setD((x) => ({ ...x, ...p }));
  }, []);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = () => {
    if (advRef.current) window.clearTimeout(advRef.current);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Patch state and auto-advance after a short beat (for taps). */
  const pick = useCallback((p: Partial<D>, advance = true) => {
    setD((x) => ({ ...x, ...p }));
    if (!advance) return;
    if (advRef.current) window.clearTimeout(advRef.current);
    advRef.current = window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, ADVANCE_MS);
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem("toro_move_details_v1");
      if (raw) {
        const p = JSON.parse(raw) as Partial<D>;
        setD((x) => ({
          ...x,
          ...p,
          itemCounts: { ...x.itemCounts, ...(p.itemCounts || {}) },
          appliances: p.appliances || x.appliances,
          specialItems: p.specialItems || x.specialItems,
        }));
      }
    } catch { /* ignore */ }
    return () => {
      if (advRef.current) window.clearTimeout(advRef.current);
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
    }, 250);
    return () => window.clearTimeout(t);
  }, [d]);

  // Keep fixed bar clear of keyboard on iOS
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--mdf-kb", `${offset}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      document.documentElement.style.removeProperty("--mdf-kb");
    };
  }, []);

  const key = STEPS[step];
  const isLast = step >= STEPS.length - 1;

  const placeOk = (side: "from" | "to") => {
    const f = side === "from";
    const addr = f ? d.fromAddress : d.toAddress;
    const type = f ? d.fromHomeType : d.toHomeType;
    const parking = f ? d.fromParking : d.toParking;
    const long = f ? d.fromLongCarry : d.toLongCarry;
    const floor = f ? d.fromFloor : d.toFloor;
    const elev = f ? d.fromElevator : d.toElevator;
    if (!addr.trim() || !type || !parking || !long) return false;
    if (f && needsBeds(type) && !d.bedrooms) return false;
    if (multi(type) && (!floor || !elev)) return false;
    return true;
  };

  const dayOk = () =>
    !!(
      d.packingStatus &&
      d.svcDisassembly &&
      d.onSiteMe &&
      d.petsOnSite &&
      d.kidsOnSite &&
      (d.packingStatus === "fully-packed" || d.needPackingHelp)
    );

  const canContinue = (() => {
    switch (key) {
      case "contact":
        return !!(d.name.trim() && d.phone.trim() && d.email.trim());
      case "date":
        return !!d.moveDate;
      case "time":
        return !!d.moveTime;
      case "service":
        return !!d.serviceType;
      case "from":
        return placeOk("from");
      case "to":
        return placeOk("to");
      case "stuff":
        return true;
      case "dayof":
        return dayOk();
    }
  })();

  // Pure-tap steps hide Continue (auto-advance)
  const tapOnly = key === "time" || key === "service";

  const pickPreset = (p: (typeof PRESETS)[number]) => {
    setPreset(p.id);
    const counts: ItemCounts = {};
    for (const [k, v] of Object.entries(p.counts)) if (v > 0) counts[k] = v;
    set({ itemCounts: counts });
  };

  const toggle = (field: "appliances" | "specialItems", opt: string) => {
    setD((x) => {
      const list = x[field];
      const on = list.includes(opt);
      return { ...x, [field]: on ? list.filter((i) => i !== opt) : [...list, opt] };
    });
  };

  const submit = async () => {
    setErr(null);
    setBusy(true);
    const me = d.onSiteMe === "yes";
    const items = Object.entries(d.itemCounts)
      .filter(([, q]) => q > 0)
      .map(([name, qty]) => ({ name, qty }));
    const total = items.reduce((s, i) => s + i.qty, 0);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          phone: d.phone,
          email: d.email,
          moveDate: d.moveDate,
          moveTime: d.moveTime,
          serviceType: d.serviceType,
          origin: {
            address: d.fromAddress,
            unit: d.fromUnit,
            homeType: d.fromHomeType === "Storage" ? "Storage unit" : d.fromHomeType,
            bedrooms: d.bedrooms,
            floor: floorLabel(d.fromFloor),
            elevator: d.fromElevator,
            parkingNotes: d.fromParking,
            longCarry: d.fromLongCarry === "yes",
          },
          destination: {
            address: d.toAddress,
            unit: d.toUnit,
            homeType: d.toHomeType === "Storage" ? "Storage unit" : d.toHomeType,
            floor: floorLabel(d.toFloor),
            elevator: d.toElevator,
            parkingNotes: d.toParking,
            longCarry: d.toLongCarry === "yes",
          },
          inventory: {
            items,
            totalPieces: total,
            other: d.invOther,
            appliances: d.appliances,
          },
          specialItems: d.specialItems,
          packing: {
            status: d.packingStatus,
            needHelp: d.needPackingHelp === "yes",
          },
          services: {
            disassembly: d.svcDisassembly === "yes",
            storage: false,
          },
          contacts: {
            onSitePickupName: me ? d.name : "",
            onSitePickupPhone: d.phone,
            onSiteDropoffName: me ? d.name : "",
            onSiteDropoffPhone: d.phone,
            petsOnSite: d.petsOnSite === "yes",
            kidsOnSite: d.kidsOnSite === "yes",
            specialInstructions: d.notes,
          },
        }),
      });
      if (!res.ok) {
        setErr("Couldn't send. Call (689) 600-2720.");
        setBusy(false);
        return;
      }
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem("toro_move_details_v1");
      } catch {}
      router.push("/checklist?intake=done");
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue || busy) return;
    if (isLast) void submit();
    else goNext();
  };

  const Place = ({ side }: { side: "from" | "to" }) => {
    const f = side === "from";
    const type = f ? d.fromHomeType : d.toHomeType;
    return (
      <>
        <label className="mdf-field">
          <span>Address</span>
          <GoogleAddressInput
            value={f ? d.fromAddress : d.toAddress}
            onChange={(v) => set(f ? { fromAddress: v } : { toAddress: v })}
            placeholder="Start typing street…"
            ariaLabel={f ? "Pickup address" : "Drop-off address"}
          />
        </label>
        <label className="mdf-field">
          <span>Unit (optional)</span>
          <input
            value={f ? d.fromUnit : d.toUnit}
            onChange={(e) => set(f ? { fromUnit: e.target.value } : { toUnit: e.target.value })}
            placeholder="Apt #"
            inputMode="text"
            autoComplete="address-line2"
          />
        </label>
        <div className="mdf-field">
          <span>Home type</span>
          <div className="mdf-chips">
            {HOME.map((h) => (
              <Chip
                key={h}
                on={type === h}
                onClick={() =>
                  set(
                    f
                      ? { fromHomeType: h, bedrooms: needsBeds(h) ? d.bedrooms : "" }
                      : { toHomeType: h },
                  )
                }
              >
                {h}
              </Chip>
            ))}
          </div>
        </div>
        {f && needsBeds(type) && (
          <div className="mdf-field">
            <span>Bedrooms</span>
            <div className="mdf-chips">
              {BEDS.map((b) => (
                <Chip key={b} on={d.bedrooms === b} onClick={() => set({ bedrooms: b })}>
                  {b === "Studio" ? "Studio" : `${b} BR`}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {multi(type) && (
          <>
            <div className="mdf-field">
              <span>Floor</span>
              <div className="mdf-chips">
                {FLOORS.map((fl) => (
                  <Chip
                    key={fl}
                    on={(f ? d.fromFloor : d.toFloor) === fl}
                    onClick={() => set(f ? { fromFloor: fl } : { toFloor: fl })}
                  >
                    {fl}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mdf-field">
              <span>Elevator</span>
              <div className="mdf-chips">
                {(["yes", "no"] as const).map((v) => (
                  <Chip
                    key={v}
                    on={(f ? d.fromElevator : d.toElevator) === v}
                    onClick={() => set(f ? { fromElevator: v } : { toElevator: v })}
                  >
                    {v === "yes" ? "Yes" : "No"}
                  </Chip>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="mdf-field">
          <span>Truck parking</span>
          <div className="mdf-chips">
            {PARK.map((p) => (
              <Chip
                key={p}
                on={(f ? d.fromParking : d.toParking) === p}
                onClick={() => set(f ? { fromParking: p } : { toParking: p })}
              >
                {p}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mdf-field">
          <span>Long carry</span>
          <div className="mdf-chips">
            {(["yes", "no"] as const).map((v) => (
              <Chip
                key={v}
                on={(f ? d.fromLongCarry : d.toLongCarry) === v}
                onClick={() => set(f ? { fromLongCarry: v } : { toLongCarry: v })}
              >
                {v === "yes" ? "Yes" : "No"}
              </Chip>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <form ref={formRef} className="mdf" onSubmit={onSubmit}>
      <div className="mdf-progress" aria-hidden>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <div className="mdf-step-label">{LABELS[key]}</div>

      <div className="mdf-body" key={key}>
        {key === "contact" && (
          <>
            <h2 className="mdf-q">Your contact</h2>
            <p className="mdf-sub">Name, phone, and email.</p>
            <label className="mdf-field">
              <span>Full name</span>
              <input
                autoFocus
                required
                name="name"
                value={d.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Maria Lopez"
                autoComplete="name"
                enterKeyHint="next"
              />
            </label>
            <label className="mdf-field">
              <span>Phone</span>
              <input
                required
                name="phone"
                type="tel"
                inputMode="tel"
                value={d.phone}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder="(689) 555-0000"
                autoComplete="tel"
                enterKeyHint="next"
              />
            </label>
            <label className="mdf-field">
              <span>Email</span>
              <input
                required
                name="email"
                type="email"
                inputMode="email"
                value={d.email}
                onChange={(e) => set({ email: e.target.value })}
                placeholder="you@email.com"
                autoComplete="email"
                enterKeyHint="done"
              />
            </label>
          </>
        )}

        {key === "date" && (
          <>
            <h2 className="mdf-q">Move date</h2>
            <p className="mdf-sub">What day is the move?</p>
            <label className="mdf-field">
              <span>Date</span>
              <input
                autoFocus
                required
                type="date"
                name="moveDate"
                min={today || undefined}
                value={d.moveDate}
                onChange={(e) => set({ moveDate: e.target.value })}
              />
            </label>
          </>
        )}

        {key === "time" && (
          <>
            <h2 className="mdf-q">Start time</h2>
            <p className="mdf-sub">Tap one — 7 AM to 5 PM.</p>
            <div className="mdf-chips mdf-chips-grid">
              {TIMES.map((t) => (
                <Chip key={t.v} on={d.moveTime === t.v} onClick={() => pick({ moveTime: t.v })}>
                  {t.l}
                </Chip>
              ))}
            </div>
          </>
        )}

        {key === "service" && (
          <>
            <h2 className="mdf-q">What kind of help?</h2>
            <p className="mdf-sub">Tap one to continue.</p>
            <div className="mdf-chips mdf-chips-stack">
              {SERVICES.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  className={`mdf-chip mdf-chip-card${d.serviceType === s.v ? " on" : ""}`}
                  onClick={() => pick({ serviceType: s.v })}
                >
                  <strong>{s.l}</strong>
                  <span>{s.sub}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {key === "from" && (
          <>
            <h2 className="mdf-q">Pickup</h2>
            <p className="mdf-sub">Where we load.</p>
            <Place side="from" />
          </>
        )}

        {key === "to" && (
          <>
            <h2 className="mdf-q">Drop-off</h2>
            <p className="mdf-sub">Where everything lands.</p>
            {d.fromHomeType && (
              <button
                type="button"
                className="mdf-copy"
                onClick={() =>
                  set({
                    toHomeType: d.fromHomeType,
                    toFloor: d.fromFloor,
                    toElevator: d.fromElevator,
                    toParking: d.fromParking,
                    toLongCarry: d.fromLongCarry,
                  })
                }
              >
                Copy type from pickup
              </button>
            )}
            <Place side="to" />
          </>
        )}

        {key === "stuff" && (
          <>
            <h2 className="mdf-q">What are you moving?</h2>
            <p className="mdf-sub">Tap a size, then any appliances or specials.</p>
            <div className="mdf-field">
              <span>Home size</span>
              <div className="mdf-chips">
                {PRESETS.map((p) => (
                  <Chip key={p.id} on={preset === p.id} onClick={() => pickPreset(p)}>
                    {p.l}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mdf-field">
              <span>Appliances</span>
              <div className="mdf-chips">
                {APPLIANCES.map((a) => (
                  <Chip key={a} on={d.appliances.includes(a)} onClick={() => toggle("appliances", a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mdf-field">
              <span>Special / heavy</span>
              <div className="mdf-chips">
                {SPECIALS.map((s) => (
                  <Chip key={s} on={d.specialItems.includes(s)} onClick={() => toggle("specialItems", s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
            <label className="mdf-field">
              <span>Other items (optional)</span>
              <textarea
                rows={2}
                value={d.invOther}
                onChange={(e) => set({ invOther: e.target.value })}
                placeholder="Anything not listed"
                enterKeyHint="done"
              />
            </label>
          </>
        )}

        {key === "dayof" && (
          <>
            <h2 className="mdf-q">Day-of details</h2>
            <p className="mdf-sub">Packing, services, and who&apos;s there.</p>
            <div className="mdf-field">
              <span>How packed?</span>
              <div className="mdf-chips">
                {PACK.map((p) => (
                  <Chip
                    key={p.v}
                    on={d.packingStatus === p.v}
                    onClick={() => set({ packingStatus: p.v, needPackingHelp: p.v === "fully-packed" ? "no" : d.needPackingHelp })}
                  >
                    {p.l}
                  </Chip>
                ))}
              </div>
            </div>
            {d.packingStatus && d.packingStatus !== "fully-packed" && (
              <div className="mdf-field">
                <span>Need packing help?</span>
                <div className="mdf-chips">
                  {(["yes", "no"] as const).map((v) => (
                    <Chip key={v} on={d.needPackingHelp === v} onClick={() => set({ needPackingHelp: v })}>
                      {v === "yes" ? "Yes" : "No"}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            <div className="mdf-field">
              <span>Disassembly help?</span>
              <div className="mdf-chips">
                {(["yes", "no"] as const).map((v) => (
                  <Chip key={v} on={d.svcDisassembly === v} onClick={() => set({ svcDisassembly: v })}>
                    {v === "yes" ? "Yes" : "No"}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mdf-field">
              <span>I&apos;ll meet the crew on site</span>
              <div className="mdf-chips">
                {(["yes", "no"] as const).map((v) => (
                  <Chip key={v} on={d.onSiteMe === v} onClick={() => set({ onSiteMe: v })}>
                    {v === "yes" ? "Yes" : "No"}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mdf-field">
              <span>Pets on site?</span>
              <div className="mdf-chips">
                {(["yes", "no"] as const).map((v) => (
                  <Chip key={v} on={d.petsOnSite === v} onClick={() => set({ petsOnSite: v })}>
                    {v === "yes" ? "Yes" : "No"}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mdf-field">
              <span>Kids on site?</span>
              <div className="mdf-chips">
                {(["yes", "no"] as const).map((v) => (
                  <Chip key={v} on={d.kidsOnSite === v} onClick={() => set({ kidsOnSite: v })}>
                    {v === "yes" ? "Yes" : "No"}
                  </Chip>
                ))}
              </div>
            </div>
            <label className="mdf-field">
              <span>Gate codes / notes (optional)</span>
              <textarea
                rows={3}
                value={d.notes}
                onChange={(e) => set({ notes: e.target.value })}
                placeholder="Codes, access, anything else"
                enterKeyHint="done"
              />
            </label>
          </>
        )}
      </div>

      {err && <div className="mdf-err">{err}</div>}

      <div className="mdf-bar">
        {step > 0 && (
          <button type="button" className="mdf-back" onClick={goBack} disabled={busy}>
            Back
          </button>
        )}
        {(!tapOnly || isLast) && (
          <button type="submit" className="mdf-submit" disabled={!canContinue || busy}>
            {busy ? "Sending…" : isLast ? "Send to crew" : "Continue"}
          </button>
        )}
        {tapOnly && !isLast && (
          <p className="mdf-hint">Tap an option</p>
        )}
      </div>
    </form>
  );
}
