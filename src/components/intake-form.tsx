"use client";

/**
 * Moving-day checklist — short flow (6 screens).
 * Typing: name, phone, email, addresses, optional notes.
 * Everything else: taps. Full payload still hits Telegram.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoogleAddressInput } from "./google-address-input";
import {
  PHONE_DISPLAY,
} from "@/lib/contact";

type Yn = "yes" | "no" | "";
type ItemCounts = Record<string, number>;

const HOME_TYPES = ["Apartment", "House", "Townhome", "Studio", "Office", "Storage unit"];
const FLOORS = ["Ground floor", "2nd floor", "3rd floor", "4th floor", "5th+ floor"];
const BEDROOMS = ["Studio", "1", "2", "3", "4", "5+"];
const SERVICE_TYPES = [
  { value: "full-service", label: "Full-service", sub: "We haul everything" },
  { value: "labor-only", label: "Labor only", sub: "You have the truck" },
  { value: "loading-unloading", label: "Load / unload", sub: "POD or U-Haul" },
  { value: "packing-move", label: "Pack + move", sub: "We pack and haul" },
];
const PARKING_OPTS = [
  { value: "Driveway", label: "Driveway" },
  { value: "Street parking", label: "Street" },
  { value: "Loading dock", label: "Dock" },
  { value: "Assigned spot", label: "Assigned" },
  { value: "Garage", label: "Garage" },
  { value: "Not sure", label: "Not sure" },
];
const PACKING_OPTS = [
  { value: "fully-packed", label: "Fully packed" },
  { value: "mostly-packed", label: "Mostly packed" },
  { value: "partially-packed", label: "Partially packed" },
  { value: "not-packed", label: "Not packed" },
];
const ONSITE_OPTS = [
  { value: "me-both", label: "I'll be both places" },
  { value: "me-pickup", label: "Me at pickup only" },
  { value: "me-dropoff", label: "Me at drop-off only" },
  { value: "other", label: "Someone else meets crew" },
];
const MOVE_TIME_MIN = "07:00";
const MOVE_TIME_MAX = "17:00";
const TIME_OPTS = Array.from({ length: 11 }, (_, i) => {
  const h = 7 + i;
  const value = `${String(h).padStart(2, "0")}:00`;
  const label = h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`;
  return { value, label };
});
const SPECIAL_OPTS = [
  "Piano", "Safe", "Pool table", "Hot tub", "Aquarium",
  "Large glass / mirrors", "Antiques", "Artwork", "Gym equipment", "Other heavy",
];
const APPLIANCE_OPTS = [
  "Refrigerator", "Washer", "Dryer", "Dishwasher", "Stove / oven", "Freezer",
];
const INVENTORY_PRESETS: { id: string; label: string; sub: string; counts: ItemCounts }[] = [
  {
    id: "studio",
    label: "Studio",
    sub: "~15 pieces",
    counts: {
      "Sofa / couch": 1, "TV (flat screen)": 1, "Queen bed (frame + mattress)": 1,
      "Dresser": 1, "Medium boxes": 15, "Large boxes": 5,
    },
  },
  {
    id: "1br",
    label: "1 BR",
    sub: "~25 pieces",
    counts: {
      "Sofa / couch": 1, "Coffee table": 1, "TV (flat screen)": 1,
      "Queen bed (frame + mattress)": 1, "Dresser": 1, "Nightstand": 2,
      "Dining table": 1, "Dining chairs": 4, "Medium boxes": 20, "Large boxes": 8,
    },
  },
  {
    id: "2br",
    label: "2 BR",
    sub: "~40 pieces",
    counts: {
      "Sofa / couch": 1, "Loveseat": 1, "TV (flat screen)": 1,
      "Queen bed (frame + mattress)": 1, "Full / double bed": 1, "Dresser": 2,
      "Nightstand": 3, "Dining table": 1, "Dining chairs": 4,
      "Medium boxes": 30, "Large boxes": 12, "Wardrobe boxes": 3,
    },
  },
  {
    id: "3br",
    label: "3+ BR",
    sub: "~55 pieces",
    counts: {
      "Sofa / couch": 1, "Sectional": 1, "TV (flat screen)": 2,
      "King bed (frame + mattress)": 1, "Queen bed (frame + mattress)": 1,
      "Twin bed": 1, "Dresser": 3, "Dining table": 1, "Dining chairs": 6,
      "Office desk": 1, "Medium boxes": 40, "Large boxes": 15, "Wardrobe boxes": 4,
    },
  },
];

const STORAGE_KEY = "toro_intake_draft_v5";

type Data = {
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
  onSiteMode: string;
  petsOnSite: Yn;
  kidsOnSite: Yn;
  specialInstructions: string;
};

const initial: Data = {
  name: "", phone: "", email: "",
  moveDate: "", moveTime: "", serviceType: "",
  fromAddress: "", fromUnit: "", fromHomeType: "", bedrooms: "",
  fromFloor: "", fromElevator: "", fromParking: "", fromLongCarry: "",
  toAddress: "", toUnit: "", toHomeType: "",
  toFloor: "", toElevator: "", toParking: "", toLongCarry: "",
  itemCounts: {}, invOther: "", appliances: [], specialItems: [],
  packingStatus: "", needPackingHelp: "", svcDisassembly: "", svcStorage: "",
  onSiteMode: "", petsOnSite: "", kidsOnSite: "", specialInstructions: "",
};

const isMultiFloor = (t: string) => ["Apartment", "Townhome", "Office"].includes(t);
const hasBedrooms = (t: string) => !["Office", "Storage unit"].includes(t);

/** 6 short screens only. */
type StepKey = "you" | "when" | "pickup" | "dropoff" | "stuff" | "dayof";

const STEPS: StepKey[] = ["you", "when", "pickup", "dropoff", "stuff", "dayof"];
const LABELS: Record<StepKey, string> = {
  you: "You",
  when: "When",
  pickup: "Pickup",
  dropoff: "Drop-off",
  stuff: "Your stuff",
  dayof: "Day of",
};

function inventorySelected(counts: ItemCounts) {
  return Object.entries(counts)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
function inventoryTotal(counts: ItemCounts) {
  return Object.values(counts).reduce((s, n) => s + (n || 0), 0);
}
function isAllowedMoveTime(time: string) {
  return /^\d{1,2}:\d{2}$/.test(time.trim()) && time >= MOVE_TIME_MIN && time <= MOVE_TIME_MAX;
}
function yn3(v: Yn): boolean | undefined {
  if (v === "yes") return true;
  if (v === "no") return false;
  return undefined;
}
function resolveOnSite(d: Data) {
  const me = { name: d.name, phone: d.phone };
  switch (d.onSiteMode) {
    case "me-both":
      return {
        onSitePickupName: me.name, onSitePickupPhone: me.phone,
        onSiteDropoffName: me.name, onSiteDropoffPhone: me.phone,
      };
    case "me-pickup":
      return {
        onSitePickupName: me.name, onSitePickupPhone: me.phone,
        onSiteDropoffName: "", onSiteDropoffPhone: "",
      };
    case "me-dropoff":
      return {
        onSitePickupName: "", onSitePickupPhone: "",
        onSiteDropoffName: me.name, onSiteDropoffPhone: me.phone,
      };
    default:
      return {
        onSitePickupName: "", onSitePickupPhone: d.phone,
        onSiteDropoffName: "", onSiteDropoffPhone: d.phone,
      };
  }
}

export function IntakeForm() {
  const router = useRouter();
  const [data, setData] = useState<Data>(initial);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const update = useCallback((patch: Partial<Data>) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const sp = new URLSearchParams(window.location.search);
      const patch: Partial<Data> = {};
      const n = sp.get("name"); if (n) patch.name = n;
      const p = sp.get("phone"); if (p) patch.phone = p;
      const e = sp.get("email"); if (e) patch.email = e;
      const dd = sp.get("date"); if (dd) patch.moveDate = dd;
      const tm = sp.get("time"); if (tm) patch.moveTime = tm;
      const f = sp.get("from"); if (f) patch.fromAddress = f;
      const t = sp.get("to"); if (t) patch.toAddress = t;
      const svc = sp.get("service"); if (svc) patch.serviceType = svc;
      if (Object.keys(patch).length) setData((d) => ({ ...d, ...patch }));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("toro_intake_draft_v4") ||
        localStorage.getItem("toro_intake_draft_v3");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Data>;
      setData((d) => ({
        ...d,
        ...parsed,
        itemCounts: { ...d.itemCounts, ...(parsed.itemCounts || {}) },
        specialItems: parsed.specialItems || d.specialItems,
        appliances: parsed.appliances || d.appliances,
      }));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    }, 200);
    return () => window.clearTimeout(t);
  }, [data]);

  const key = STEPS[step];
  const isLast = step >= STEPS.length - 1;
  const today = mounted ? new Date().toISOString().slice(0, 10) : undefined;

  const pickupOk = () => {
    if (!data.fromAddress.trim() || !data.fromHomeType || !data.fromParking || !data.fromLongCarry) return false;
    if (hasBedrooms(data.fromHomeType) && !data.bedrooms) return false;
    if (isMultiFloor(data.fromHomeType) && (!data.fromFloor || !data.fromElevator)) return false;
    return true;
  };
  const dropoffOk = () => {
    if (!data.toAddress.trim() || !data.toHomeType || !data.toParking || !data.toLongCarry) return false;
    if (isMultiFloor(data.toHomeType) && (!data.toFloor || !data.toElevator)) return false;
    return true;
  };
  const dayofOk = () =>
    !!(data.packingStatus && data.svcDisassembly && data.svcStorage && data.onSiteMode && data.petsOnSite && data.kidsOnSite);

  const canAdvance = (() => {
    switch (key) {
      case "you":
        return !!(data.name.trim() && data.phone.trim() && data.email.trim());
      case "when":
        return !!(data.moveDate && isAllowedMoveTime(data.moveTime) && data.serviceType);
      case "pickup":
        return pickupOk();
      case "dropoff":
        return dropoffOk();
      case "stuff":
        return true;
      case "dayof":
        return dayofOk();
    }
  })();

  const next = () => {
    if (!canAdvance) return;
    if (isLast) {
      void submit();
      return;
    }
    setStep((s) => s + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyPreset = (p: (typeof INVENTORY_PRESETS)[number]) => {
    setActivePreset(p.id);
    const cleaned: ItemCounts = {};
    for (const [k, v] of Object.entries(p.counts)) if (v > 0) cleaned[k] = v;
    update({ itemCounts: cleaned });
  };

  const toggleList = (field: "specialItems" | "appliances", opt: string) => {
    setData((d) => {
      const list = d[field];
      const on = list.includes(opt);
      return { ...d, [field]: on ? list.filter((x) => x !== opt) : [...list, opt] };
    });
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    const contacts = resolveOnSite(data);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          moveDate: data.moveDate,
          moveTime: data.moveTime,
          serviceType: data.serviceType,
          origin: {
            address: data.fromAddress,
            unit: data.fromUnit,
            homeType: data.fromHomeType,
            bedrooms: data.bedrooms,
            floor: data.fromFloor,
            elevator: data.fromElevator,
            stairsCount: "",
            parkingNotes: data.fromParking,
            gateCode: "",
            longCarry: yn3(data.fromLongCarry),
            accessNotes: "",
          },
          destination: {
            address: data.toAddress,
            unit: data.toUnit,
            homeType: data.toHomeType,
            floor: data.toFloor,
            elevator: data.toElevator,
            stairsCount: "",
            parkingNotes: data.toParking,
            gateCode: "",
            longCarry: yn3(data.toLongCarry),
            accessNotes: "",
          },
          inventory: {
            items: inventorySelected(data.itemCounts),
            totalPieces: inventoryTotal(data.itemCounts),
            other: data.invOther,
            appliances: data.appliances,
          },
          specialItems: data.specialItems,
          otherSpecial: "",
          packing: {
            status: data.packingStatus,
            needHelp: data.needPackingHelp === "yes",
          },
          services: {
            disassembly: data.svcDisassembly === "yes",
            disassemblyItems: "",
            storage: data.svcStorage === "yes",
            storageNotes: "",
          },
          contacts: {
            ...contacts,
            altPhone: "",
            petsOnSite: yn3(data.petsOnSite) ?? null,
            kidsOnSite: yn3(data.kidsOnSite) ?? null,
            specialInstructions: data.specialInstructions,
          },
        }),
      });
      if (!res.ok) {
        setError(`Couldn't save. Call us at ${PHONE_DISPLAY}.`);
        setSubmitting(false);
        return;
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("toro_intake_draft_v4");
        localStorage.removeItem("toro_intake_draft_v3");
      } catch {}
      router.push("/checklist?intake=done");
    } catch {
      setError("Network error. Try again or call us.");
      setSubmitting(false);
    }
  };

  const Pills = ({
    options,
    value,
    onChange,
    columns = 2,
  }: {
    options: { value: string; label: string; sub?: string }[];
    value: string;
    onChange: (v: string) => void;
    columns?: number;
  }) => (
    <div className={`iwiz-pills cols-${columns}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`iwiz-pill${value === o.value ? " on" : ""}`}
          onClick={() => onChange(o.value)}
        >
          <strong>{o.label}</strong>
          {o.sub && <span>{o.sub}</span>}
        </button>
      ))}
    </div>
  );

  const Yn = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: Yn) => void;
  }) => (
    <Pills
      options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
      value={value}
      onChange={(v) => onChange(v as Yn)}
      columns={2}
    />
  );

  const CheckGrid = ({
    options,
    selected,
    onToggle,
  }: {
    options: string[];
    selected: string[];
    onToggle: (o: string) => void;
  }) => (
    <div className="iwiz-checks">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            className={`iwiz-check${on ? " on" : ""}`}
            onClick={() => onToggle(opt)}
            aria-pressed={on}
          >
            <span className="iwiz-check-tick" aria-hidden>{on ? "✓" : ""}</span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );

  const PlaceBlock = ({
    side,
  }: {
    side: "from" | "to";
  }) => {
    const isFrom = side === "from";
    const address = isFrom ? data.fromAddress : data.toAddress;
    const unit = isFrom ? data.fromUnit : data.toUnit;
    const homeType = isFrom ? data.fromHomeType : data.toHomeType;
    const floor = isFrom ? data.fromFloor : data.toFloor;
    const elevator = isFrom ? data.fromElevator : data.toElevator;
    const parking = isFrom ? data.fromParking : data.toParking;
    const longCarry = isFrom ? data.fromLongCarry : data.toLongCarry;

    return (
      <>
        <label className="iwiz-field">
          <span>Address</span>
          <GoogleAddressInput
            value={address}
            onChange={(v) => update(isFrom ? { fromAddress: v } : { toAddress: v })}
            placeholder="Street, city, FL"
            ariaLabel={isFrom ? "Pickup address" : "Drop-off address"}
          />
        </label>
        <label className="iwiz-field">
          <span>Apt / unit (optional)</span>
          <input
            value={unit}
            onChange={(e) => update(isFrom ? { fromUnit: e.target.value } : { toUnit: e.target.value })}
            placeholder="Apt 204"
            autoComplete="address-line2"
          />
        </label>

        <div className="iwiz-field">
          <span>Home type</span>
          <Pills
            options={HOME_TYPES.map((h) => ({ value: h, label: h }))}
            value={homeType}
            onChange={(v) =>
              update(
                isFrom
                  ? { fromHomeType: v, bedrooms: hasBedrooms(v) ? data.bedrooms : "" }
                  : { toHomeType: v },
              )
            }
            columns={2}
          />
        </div>

        {isFrom && hasBedrooms(homeType) && (
          <div className="iwiz-field">
            <span>Bedrooms</span>
            <Pills
              options={BEDROOMS.map((b) => ({
                value: b,
                label: b === "Studio" ? "Studio" : `${b} BR`,
              }))}
              value={data.bedrooms}
              onChange={(v) => update({ bedrooms: v })}
              columns={3}
            />
          </div>
        )}

        {isMultiFloor(homeType) && (
          <>
            <div className="iwiz-field">
              <span>Floor</span>
              <Pills
                options={FLOORS.map((f) => ({ value: f, label: f }))}
                value={floor}
                onChange={(v) => update(isFrom ? { fromFloor: v } : { toFloor: v })}
                columns={2}
              />
            </div>
            <div className="iwiz-field">
              <span>Elevator?</span>
              <Yn
                value={elevator}
                onChange={(v) => update(isFrom ? { fromElevator: v } : { toElevator: v })}
              />
            </div>
          </>
        )}

        <div className="iwiz-field">
          <span>Truck parking</span>
          <Pills
            options={PARKING_OPTS}
            value={parking}
            onChange={(v) => update(isFrom ? { fromParking: v } : { toParking: v })}
            columns={3}
          />
        </div>

        <div className="iwiz-field">
          <span>Long carry? (truck far from door)</span>
          <Yn
            value={longCarry}
            onChange={(v) => update(isFrom ? { fromLongCarry: v } : { toLongCarry: v })}
          />
        </div>
      </>
    );
  };

  return (
    <form
      ref={formRef}
      className="iwiz"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        next();
      }}
    >
      <div className="iwiz-progress" aria-hidden>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Segment strip — shows short flow at a glance */}
      <div className="iwiz-segs" aria-hidden>
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`iwiz-seg${i === step ? " on" : ""}${i < step ? " done" : ""}`}
          >
            {LABELS[s]}
          </span>
        ))}
      </div>

      <div className="iwiz-stepbody" key={key}>
        {key === "you" && (
          <>
            <h2 className="iwiz-q">Your contact info</h2>
            <p className="iwiz-sub">So we can reach you about the move.</p>
            <label className="iwiz-field">
              <span>Full name</span>
              <input
                autoFocus
                required
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Maria Lopez"
                autoComplete="name"
              />
            </label>
            <label className="iwiz-field">
              <span>Phone</span>
              <input
                required
                type="tel"
                value={data.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder={PHONE_DISPLAY}
                autoComplete="tel"
              />
            </label>
            <label className="iwiz-field">
              <span>Email</span>
              <input
                required
                type="email"
                value={data.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </label>
          </>
        )}

        {key === "when" && (
          <>
            <h2 className="iwiz-q">When and what kind of help?</h2>
            <p className="iwiz-sub">Date, start time (7 AM–5 PM), and service type.</p>
            <label className="iwiz-field">
              <span>Move date</span>
              <input
                required
                type="date"
                {...(today ? { min: today } : {})}
                value={data.moveDate}
                onChange={(e) => update({ moveDate: e.target.value })}
              />
            </label>
            <div className="iwiz-field">
              <span>Start time</span>
              <Pills
                options={TIME_OPTS}
                value={data.moveTime}
                onChange={(v) => update({ moveTime: v })}
                columns={3}
              />
            </div>
            <div className="iwiz-field">
              <span>Service</span>
              <Pills
                options={SERVICE_TYPES}
                value={data.serviceType}
                onChange={(v) => update({ serviceType: v })}
                columns={1}
              />
            </div>
          </>
        )}

        {key === "pickup" && (
          <>
            <h2 className="iwiz-q">Pickup</h2>
            <p className="iwiz-sub">Where we load, and how we get in.</p>
            <PlaceBlock side="from" />
          </>
        )}

        {key === "dropoff" && (
          <>
            <h2 className="iwiz-q">Drop-off</h2>
            <p className="iwiz-sub">Where everything lands.</p>
            {data.fromHomeType && (
              <button
                type="button"
                className="iwiz-quick"
                onClick={() =>
                  update({
                    toHomeType: data.fromHomeType,
                    toFloor: data.fromFloor,
                    toElevator: data.fromElevator,
                    toParking: data.fromParking,
                    toLongCarry: data.fromLongCarry,
                  })
                }
              >
                Copy pickup details
              </button>
            )}
            <PlaceBlock side="to" />
          </>
        )}

        {key === "stuff" && (
          <>
            <h2 className="iwiz-q">What are you moving?</h2>
            <p className="iwiz-sub">
              Tap a size — adjust later if needed.
              {inventoryTotal(data.itemCounts) > 0 && (
                <em className="iwiz-count"> · {inventoryTotal(data.itemCounts)} pieces</em>
              )}
            </p>
            <div className="iwiz-presets">
              {INVENTORY_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`iwiz-preset${activePreset === p.id ? " on" : ""}`}
                  onClick={() => applyPreset(p)}
                >
                  <strong>{p.label}</strong>
                  <span>{p.sub}</span>
                </button>
              ))}
            </div>

            <div className="iwiz-field">
              <span>Appliances (tap any)</span>
              <CheckGrid
                options={APPLIANCE_OPTS}
                selected={data.appliances}
                onToggle={(o) => toggleList("appliances", o)}
              />
            </div>
            <div className="iwiz-field">
              <span>Special / heavy (tap any)</span>
              <CheckGrid
                options={SPECIAL_OPTS}
                selected={data.specialItems}
                onToggle={(o) => toggleList("specialItems", o)}
              />
            </div>
            <label className="iwiz-field">
              <span>Anything not listed? (optional)</span>
              <textarea
                rows={2}
                value={data.invOther}
                onChange={(e) => update({ invOther: e.target.value })}
                placeholder="Kayak, custom shelves…"
              />
            </label>
          </>
        )}

        {key === "dayof" && (
          <>
            <h2 className="iwiz-q">Day-of details</h2>
            <p className="iwiz-sub">Packing, services, and who meets the crew.</p>

            <div className="iwiz-field">
              <span>How packed will things be?</span>
              <Pills
                options={PACKING_OPTS}
                value={data.packingStatus}
                onChange={(v) => update({ packingStatus: v })}
                columns={2}
              />
            </div>

            {(data.packingStatus === "not-packed" ||
              data.packingStatus === "partially-packed" ||
              data.packingStatus === "mostly-packed") && (
              <div className="iwiz-field">
                <span>Need packing help?</span>
                <Yn value={data.needPackingHelp} onChange={(v) => update({ needPackingHelp: v })} />
              </div>
            )}

            <div className="iwiz-field">
              <span>Disassembly / reassembly?</span>
              <Yn value={data.svcDisassembly} onChange={(v) => update({ svcDisassembly: v })} />
            </div>
            <div className="iwiz-field">
              <span>Storage between stops?</span>
              <Yn value={data.svcStorage} onChange={(v) => update({ svcStorage: v })} />
            </div>

            <div className="iwiz-field">
              <span>Who meets the crew?</span>
              <Pills
                options={ONSITE_OPTS}
                value={data.onSiteMode}
                onChange={(v) => update({ onSiteMode: v })}
                columns={1}
              />
            </div>

            <div className="iwiz-field">
              <span>Pets on site?</span>
              <Yn value={data.petsOnSite} onChange={(v) => update({ petsOnSite: v })} />
            </div>
            <div className="iwiz-field">
              <span>Kids on site?</span>
              <Yn value={data.kidsOnSite} onChange={(v) => update({ kidsOnSite: v })} />
            </div>

            <label className="iwiz-field">
              <span>Gate codes, access notes (optional)</span>
              <textarea
                rows={3}
                value={data.specialInstructions}
                onChange={(e) => update({ specialInstructions: e.target.value })}
                placeholder="Gate code, reserved elevator, quiet hours…"
              />
            </label>
          </>
        )}
      </div>

      {error && <div className="iwiz-error">⚠ {error}</div>}

      <div className="iwiz-actions">
        {step > 0 && (
          <button type="button" className="btn btn-outline" onClick={back} disabled={submitting}>
            Back
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={!canAdvance || submitting}>
          {submitting ? "…" : isLast ? "Send details" : "Continue"}
        </button>
      </div>
    </form>
  );
}
