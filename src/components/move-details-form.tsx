"use client";

/**
 * Phone-first move details form (v2 test).
 * Single scroll page — no long wizard. Posts to /api/intake → Telegram.
 */

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GoogleAddressInput } from "./google-address-input";

type Yn = "yes" | "no" | "";
type ItemCounts = Record<string, number>;

const HOME = ["Apartment", "House", "Townhome", "Studio", "Office", "Storage"];
const FLOORS = ["Ground", "2nd", "3rd", "4th", "5th+"];
const BEDS = ["Studio", "1", "2", "3", "4", "5+"];
const SERVICES = [
  { v: "full-service", l: "Full-service" },
  { v: "labor-only", l: "Labor only" },
  { v: "loading-unloading", l: "Load / unload" },
  { v: "packing-move", l: "Pack + move" },
];
const PARK = ["Driveway", "Street", "Loading dock", "Garage", "Not sure"];
const PACK = [
  { v: "fully-packed", l: "Fully packed" },
  { v: "mostly-packed", l: "Mostly" },
  { v: "partially-packed", l: "Partial" },
  { v: "not-packed", l: "Not packed" },
];
const TIMES = Array.from({ length: 11 }, (_, i) => {
  const h = 7 + i;
  return {
    v: `${String(h).padStart(2, "0")}:00`,
    l: h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`,
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

const KEY = "toro_move_details_v1";

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
  svcStorage: Yn;
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
  packingStatus: "", needPackingHelp: "", svcDisassembly: "", svcStorage: "",
  onSiteMe: "", petsOnSite: "", kidsOnSite: "", notes: "",
};

const multi = (t: string) => ["Apartment", "Townhome", "Office"].includes(t);
const beds = (t: string) => !["Office", "Storage"].includes(t);

function Chip({
  on, children, onClick,
}: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className={`mdf-chip${on ? " on" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function MoveDetailsForm() {
  const router = useRouter();
  const [d, setD] = useState<D>(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [today, setToday] = useState("");

  const set = (p: Partial<D>) => setD((x) => ({ ...x, ...p }));

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<D>;
        setD((x) => ({
          ...x, ...p,
          itemCounts: { ...x.itemCounts, ...(p.itemCounts || {}) },
          appliances: p.appliances || x.appliances,
          specialItems: p.specialItems || x.specialItems,
        }));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
    }, 250);
    return () => window.clearTimeout(t);
  }, [d]);

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

  const valid =
    d.name.trim() &&
    d.phone.trim() &&
    d.email.trim() &&
    d.moveDate &&
    d.moveTime &&
    d.serviceType &&
    d.fromAddress.trim() &&
    d.fromHomeType &&
    d.fromParking &&
    d.fromLongCarry &&
    d.toAddress.trim() &&
    d.toHomeType &&
    d.toParking &&
    d.toLongCarry &&
    d.packingStatus &&
    d.svcDisassembly &&
    d.svcStorage &&
    d.onSiteMe &&
    d.petsOnSite &&
    d.kidsOnSite &&
    (!beds(d.fromHomeType) || d.bedrooms) &&
    (!multi(d.fromHomeType) || (d.fromFloor && d.fromElevator)) &&
    (!multi(d.toHomeType) || (d.toFloor && d.toElevator));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
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
            floor: d.fromFloor ? (d.fromFloor === "Ground" ? "Ground floor" : `${d.fromFloor} floor`) : "",
            elevator: d.fromElevator,
            parkingNotes: d.fromParking,
            longCarry: d.fromLongCarry === "yes",
          },
          destination: {
            address: d.toAddress,
            unit: d.toUnit,
            homeType: d.toHomeType === "Storage" ? "Storage unit" : d.toHomeType,
            floor: d.toFloor ? (d.toFloor === "Ground" ? "Ground floor" : `${d.toFloor} floor`) : "",
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
            storage: d.svcStorage === "yes",
          },
          contacts: {
            onSitePickupName: me ? d.name : "",
            onSitePickupPhone: me ? d.phone : d.phone,
            onSiteDropoffName: me ? d.name : "",
            onSiteDropoffPhone: me ? d.phone : d.phone,
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
      try { localStorage.removeItem(KEY); } catch {}
      router.push("/checklist?intake=done");
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  };

  const Place = ({ side }: { side: "from" | "to" }) => {
    const f = side === "from";
    const type = f ? d.fromHomeType : d.toHomeType;
    return (
      <div className="mdf-block">
        <h3 className="mdf-h3">{f ? "Pickup" : "Drop-off"}</h3>
        <label className="mdf-field">
          <span>Address</span>
          <GoogleAddressInput
            value={f ? d.fromAddress : d.toAddress}
            onChange={(v) => set(f ? { fromAddress: v } : { toAddress: v })}
            placeholder="Street, city, FL"
            ariaLabel={f ? "Pickup" : "Drop-off"}
          />
        </label>
        <label className="mdf-field">
          <span>Unit (optional)</span>
          <input
            value={f ? d.fromUnit : d.toUnit}
            onChange={(e) => set(f ? { fromUnit: e.target.value } : { toUnit: e.target.value })}
            placeholder="Apt #"
          />
        </label>
        <div className="mdf-field">
          <span>Type</span>
          <div className="mdf-chips">
            {HOME.map((h) => (
              <Chip
                key={h}
                on={type === h}
                onClick={() =>
                  set(
                    f
                      ? { fromHomeType: h, bedrooms: beds(h) ? d.bedrooms : "" }
                      : { toHomeType: h },
                  )
                }
              >
                {h}
              </Chip>
            ))}
          </div>
        </div>
        {f && beds(type) && (
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
          <span>Parking</span>
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
      </div>
    );
  };

  return (
    <form className="mdf" onSubmit={submit}>
      <section className="mdf-sec">
        <h2 className="mdf-h2">1 · Contact</h2>
        <label className="mdf-field">
          <span>Name</span>
          <input required value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="Full name" autoComplete="name" />
        </label>
        <label className="mdf-field">
          <span>Phone</span>
          <input required type="tel" value={d.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="(689) 555-0000" autoComplete="tel" />
        </label>
        <label className="mdf-field">
          <span>Email</span>
          <input required type="email" value={d.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
        </label>
      </section>

      <section className="mdf-sec">
        <h2 className="mdf-h2">2 · When</h2>
        <label className="mdf-field">
          <span>Date</span>
          <input required type="date" min={today || undefined} value={d.moveDate} onChange={(e) => set({ moveDate: e.target.value })} />
        </label>
        <div className="mdf-field">
          <span>Start time (7a–5p)</span>
          <div className="mdf-chips">
            {TIMES.map((t) => (
              <Chip key={t.v} on={d.moveTime === t.v} onClick={() => set({ moveTime: t.v })}>
                {t.l}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mdf-field">
          <span>Service</span>
          <div className="mdf-chips">
            {SERVICES.map((s) => (
              <Chip key={s.v} on={d.serviceType === s.v} onClick={() => set({ serviceType: s.v })}>
                {s.l}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      <section className="mdf-sec">
        <h2 className="mdf-h2">3 · Places</h2>
        <Place side="from" />
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
          Copy pickup type → drop-off
        </button>
        <Place side="to" />
      </section>

      <section className="mdf-sec">
        <h2 className="mdf-h2">4 · Stuff</h2>
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
          <textarea rows={2} value={d.invOther} onChange={(e) => set({ invOther: e.target.value })} placeholder="Anything not listed" />
        </label>
      </section>

      <section className="mdf-sec">
        <h2 className="mdf-h2">5 · Day of</h2>
        <div className="mdf-field">
          <span>Packing</span>
          <div className="mdf-chips">
            {PACK.map((p) => (
              <Chip key={p.v} on={d.packingStatus === p.v} onClick={() => set({ packingStatus: p.v })}>
                {p.l}
              </Chip>
            ))}
          </div>
        </div>
        {(d.packingStatus === "not-packed" || d.packingStatus === "partially-packed" || d.packingStatus === "mostly-packed") && (
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
          <span>Storage between stops?</span>
          <div className="mdf-chips">
            {(["yes", "no"] as const).map((v) => (
              <Chip key={v} on={d.svcStorage === v} onClick={() => set({ svcStorage: v })}>
                {v === "yes" ? "Yes" : "No"}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mdf-field">
          <span>I&apos;ll be on site for the crew</span>
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
          <textarea rows={2} value={d.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Codes, access, anything else" />
        </label>
      </section>

      {err && <div className="mdf-err">{err}</div>}

      <div className="mdf-bar">
        <button type="submit" className="mdf-submit" disabled={!valid || busy}>
          {busy ? "Sending…" : "Send to crew"}
        </button>
      </div>
    </form>
  );
}
