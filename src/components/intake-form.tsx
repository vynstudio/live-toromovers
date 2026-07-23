"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAddressInput } from "./google-address-input";

const HOME_TYPES = ["Apartment", "House", "Townhome", "Studio", "Office", "Storage unit"];
const FLOORS = ["Ground floor", "2nd floor", "3rd floor", "4th floor", "5th+ floor"];
const BEDROOMS = ["Studio", "1", "2", "3", "4", "5+"];
const SPECIAL_OPTS = [
  "Piano",
  "Safe (>200 lb)",
  "Pool table",
  "Hot tub",
  "Fish tank / aquarium",
  "Large mirrors / glass",
  "Antiques",
  "Artwork",
  "Gym equipment / treadmill",
  "Grandfather clock",
];

const STORAGE_KEY = "toro_intake_draft";

type Data = {
  // basics
  name: string; phone: string; email: string; moveDate: string;
  // origin
  fromAddress: string; fromHomeType: string; bedrooms: string;
  fromFloor: string; fromElevator: "yes" | "no" | ""; fromStairs: string;
  fromHoa: "yes" | "no" | ""; fromCoi: "yes" | "no" | "";
  fromParking: string; fromAccess: string;
  // destination
  toAddress: string; toHomeType: string;
  toFloor: string; toElevator: "yes" | "no" | ""; toStairs: string;
  toHoa: "yes" | "no" | ""; toCoi: "yes" | "no" | "";
  toParking: string; toAccess: string;
  // inventory
  invBoxes: string; invLarge: string; invAwkward: string;
  // special
  specialItems: string[]; otherSpecial: string;
  // services
  svcDisassembly: "yes" | "no" | ""; svcDisassemblyItems: string;
  svcStorage: "yes" | "no" | ""; svcStorageNotes: string;
  // day-of
  altPhone: string; specialInstructions: string;
};

const initial: Data = {
  name: "", phone: "", email: "", moveDate: "",
  fromAddress: "", fromHomeType: "", bedrooms: "", fromFloor: "", fromElevator: "", fromStairs: "",
  fromHoa: "", fromCoi: "", fromParking: "", fromAccess: "",
  toAddress: "", toHomeType: "", toFloor: "", toElevator: "", toStairs: "",
  toHoa: "", toCoi: "", toParking: "", toAccess: "",
  invBoxes: "", invLarge: "", invAwkward: "",
  specialItems: [], otherSpecial: "",
  svcDisassembly: "", svcDisassemblyItems: "",
  svcStorage: "", svcStorageNotes: "",
  altPhone: "", specialInstructions: "",
};

// Multi-floor home types: ask floor + elevator. Single-level skips that.
const isMultiFloor = (homeType: string) =>
  ["Apartment", "Townhome", "Office"].includes(homeType);
// HOA / COI questions only matter for apartments + townhomes (buildings).
const hasHoa = (homeType: string) =>
  ["Apartment", "Townhome"].includes(homeType);
// Bedrooms applies to anything you live in; skip for office / storage.
const hasBedrooms = (homeType: string) =>
  !["Office", "Storage unit"].includes(homeType);

// Step keys, evaluated against data to skip irrelevant ones.
type StepKey =
  | "basics"
  | "fromAddress" | "fromHomeType" | "size" | "fromFloor" | "fromHoa" | "fromParking"
  | "toAddress" | "toHomeType" | "toFloor" | "toHoa" | "toParking"
  | "inventory" | "special" | "services" | "dayOf";

const ALL_STEPS: StepKey[] = [
  "basics",
  "fromAddress", "fromHomeType", "size", "fromFloor", "fromHoa", "fromParking",
  "toAddress", "toHomeType", "toFloor", "toHoa", "toParking",
  "inventory", "special", "services", "dayOf",
];

function visibleSteps(d: Data): StepKey[] {
  return ALL_STEPS.filter((k) => {
    if (k === "size") return hasBedrooms(d.fromHomeType);
    if (k === "fromFloor") return isMultiFloor(d.fromHomeType);
    if (k === "fromHoa") return hasHoa(d.fromHomeType);
    if (k === "toFloor") return isMultiFloor(d.toHomeType);
    if (k === "toHoa") return hasHoa(d.toHomeType);
    return true;
  });
}

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<Data>(initial);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<Data>) => setData((d) => ({ ...d, ...patch }));

  // Prefill from URL params (Diler can pre-link a customer).
  useEffect(() => {
    const sp = searchParams;
    const patch: Partial<Data> = {};
    const n = sp.get("name"); if (n) patch.name = n;
    const p = sp.get("phone"); if (p) patch.phone = p;
    const e = sp.get("email"); if (e) patch.email = e;
    const dd = sp.get("date"); if (dd) patch.moveDate = dd;
    const f = sp.get("from"); if (f) patch.fromAddress = f;
    const t = sp.get("to"); if (t) patch.toAddress = t;
    if (Object.keys(patch).length) setData((d) => ({ ...d, ...patch }));
  }, [searchParams]);

  // Load draft once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Data>;
        setData((d) => ({ ...d, ...parsed }));
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft on every change.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const steps = useMemo(() => visibleSteps(data), [data]);
  const currentKey = steps[Math.min(step, steps.length - 1)];
  const totalSteps = steps.length;
  const isLast = step >= steps.length - 1;

  const isStepValid = (key: StepKey): boolean => {
    switch (key) {
      case "basics":
        return !!(data.name.trim() && data.phone.trim() && data.email.trim());
      case "fromAddress": return !!data.fromAddress.trim();
      case "fromHomeType": return !!data.fromHomeType;
      case "size": return !!data.bedrooms;
      case "fromFloor": return !!data.fromFloor && !!data.fromElevator;
      case "fromHoa": return !!data.fromHoa && !!data.fromCoi;
      case "fromParking": return true; // optional
      case "toAddress": return !!data.toAddress.trim();
      case "toHomeType": return !!data.toHomeType;
      case "toFloor": return !!data.toFloor && !!data.toElevator;
      case "toHoa": return !!data.toHoa && !!data.toCoi;
      case "toParking": return true;
      case "inventory": return true; // optional rough numbers
      case "special": return true;
      case "services":
        return !!data.svcDisassembly && !!data.svcStorage;
      case "dayOf": return true;
    }
  };

  const canAdvance = isStepValid(currentKey);

  const next = () => {
    if (!canAdvance) return;
    if (isLast) {
      submit();
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Auto-advance after a single-choice tap on these one-question steps —
  // saves the customer the extra "Continue" tap. Small delay shows the
  // selected state before sliding to the next screen.
  const AUTO_ADVANCE: Partial<Record<StepKey, true>> = {
    fromHomeType: true,
    toHomeType: true,
    size: true,
  };
  const advanceTimer = useRef<number | null>(null);
  const pickAndAdvance = (patch: Partial<Data>) => {
    update(patch);
    if (AUTO_ADVANCE[currentKey]) {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        setStep((s) => Math.min(s + 1, steps.length - 1));
      }, 260);
    }
  };
  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name, phone: data.phone, email: data.email, moveDate: data.moveDate,
          origin: {
            address: data.fromAddress, homeType: data.fromHomeType, bedrooms: data.bedrooms,
            floor: data.fromFloor, elevator: data.fromElevator, stairsCount: data.fromStairs,
            parkingNotes: data.fromParking,
            hoaNotice: data.fromHoa === "yes",
            coiNeeded: data.fromCoi === "yes",
            accessNotes: data.fromAccess,
          },
          destination: {
            address: data.toAddress, homeType: data.toHomeType,
            floor: data.toFloor, elevator: data.toElevator, stairsCount: data.toStairs,
            parkingNotes: data.toParking,
            hoaNotice: data.toHoa === "yes",
            coiNeeded: data.toCoi === "yes",
            accessNotes: data.toAccess,
          },
          inventory: { boxes: data.invBoxes, largeItems: data.invLarge, awkward: data.invAwkward },
          specialItems: data.specialItems, otherSpecial: data.otherSpecial,
          services: {
            disassembly: data.svcDisassembly === "yes", disassemblyItems: data.svcDisassemblyItems,
            storage: data.svcStorage === "yes", storageNotes: data.svcStorageNotes,
          },
          contacts: { altPhone: data.altPhone, specialInstructions: data.specialInstructions },
        }),
      });
      if (!res.ok) {
        setError("Couldn't save right now. Please call us at (689) 600-2720.");
        setSubmitting(false);
        return;
      }
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      // Funnel naturally into the prep checklist with a confirmation banner.
      router.push("/checklist?intake=done");
    } catch {
      setError("Network error. Try again or call us.");
      setSubmitting(false);
    }
  };

  // Generic pill picker (used for many one-question screens).
  const Pills = ({
    options, value, onChange, columns = 2,
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

  return (
    <form
      className="iwiz"
      onSubmit={(e: FormEvent) => { e.preventDefault(); next(); }}
    >
      <div className="iwiz-progress" aria-hidden>
        <span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>
      <div className="iwiz-step">Step {step + 1} of {totalSteps}</div>

      {/* keyed wrapper → React remounts on step change, replays the slide-in anim */}
      <div className="iwiz-stepbody" key={currentKey}>

      {currentKey === "basics" && (
        <>
          <h2 className="iwiz-q">Let's start with your info.</h2>
          <p className="iwiz-sub">So the right person reaches you on move day.</p>
          <label className="iwiz-field"><span>Full name</span>
            <input autoFocus required value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="Maria Lopez" />
          </label>
          <label className="iwiz-field"><span>Phone</span>
            <input required type="tel" value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="(689) 555-0000" />
          </label>
          <label className="iwiz-field"><span>Email</span>
            <input required type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@email.com" />
          </label>
          <label className="iwiz-field"><span>Move date</span>
            <input type="date" value={data.moveDate} onChange={(e) => update({ moveDate: e.target.value })} />
          </label>
        </>
      )}

      {currentKey === "fromAddress" && (
        <>
          <h2 className="iwiz-q">Where are we picking up from?</h2>
          <label className="iwiz-field"><span>Pickup address</span>
            <GoogleAddressInput
              value={data.fromAddress}
              onChange={(v) => update({ fromAddress: v })}
              placeholder="Street, city, FL"
              ariaLabel="Pickup address"
            />
          </label>
        </>
      )}

      {currentKey === "fromHomeType" && (
        <>
          <h2 className="iwiz-q">What kind of home are we picking up from?</h2>
          <Pills
            options={HOME_TYPES.map((h) => ({ value: h, label: h }))}
            value={data.fromHomeType}
            onChange={(v) => pickAndAdvance({ fromHomeType: v })}
            columns={2}
          />
        </>
      )}

      {currentKey === "size" && (
        <>
          <h2 className="iwiz-q">How many bedrooms?</h2>
          <p className="iwiz-sub">Helps us size the crew and the truck.</p>
          <Pills
            options={BEDROOMS.map((b) => ({ value: b, label: b === "Studio" ? "Studio" : `${b} BR` }))}
            value={data.bedrooms}
            onChange={(v) => pickAndAdvance({ bedrooms: v })}
            columns={3}
          />
        </>
      )}

      {currentKey === "fromFloor" && (
        <>
          <h2 className="iwiz-q">Floor + access at pickup.</h2>
          <p className="iwiz-sub">{data.fromHomeType}.</p>
          <div className="iwiz-field"><span>Which floor</span>
            <Pills
              options={FLOORS.map((f) => ({ value: f, label: f }))}
              value={data.fromFloor}
              onChange={(v) => update({ fromFloor: v })}
              columns={2}
            />
          </div>
          <div className="iwiz-field"><span>Elevator available?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.fromElevator}
              onChange={(v) => update({ fromElevator: v as "yes" | "no" })}
              columns={2}
            />
          </div>
          {data.fromElevator === "no" && data.fromFloor !== "Ground floor" && (
            <label className="iwiz-field"><span>How many stairs total?</span>
              <input type="text" inputMode="numeric" value={data.fromStairs} onChange={(e) => update({ fromStairs: e.target.value })} placeholder="e.g. 12" />
            </label>
          )}
        </>
      )}

      {currentKey === "fromHoa" && (
        <>
          <h2 className="iwiz-q">Building requirements at pickup.</h2>
          <div className="iwiz-field"><span>HOA / building notified about the move?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Not yet" }]}
              value={data.fromHoa}
              onChange={(v) => update({ fromHoa: v as "yes" | "no" })}
              columns={2}
            />
          </div>
          <div className="iwiz-field"><span>Does the building require a Certificate of Insurance (COI) from us?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No / not sure" }]}
              value={data.fromCoi}
              onChange={(v) => update({ fromCoi: v as "yes" | "no" })}
              columns={2}
            />
          </div>
        </>
      )}

      {currentKey === "fromParking" && (
        <>
          <h2 className="iwiz-q">Truck access at pickup.</h2>
          <label className="iwiz-field"><span>Where can the truck park?</span>
            <input autoFocus value={data.fromParking} onChange={(e) => update({ fromParking: e.target.value })} placeholder="Loading dock around back · street parking · driveway" />
          </label>
          <label className="iwiz-field"><span>Anything else? (gate codes, narrow halls, low ceilings) — optional</span>
            <textarea rows={2} value={data.fromAccess} onChange={(e) => update({ fromAccess: e.target.value })} placeholder="Gate code 1234. Hallway 36 in." />
          </label>
        </>
      )}

      {currentKey === "toAddress" && (
        <>
          <h2 className="iwiz-q">Where are we dropping off?</h2>
          <label className="iwiz-field"><span>Drop-off address</span>
            <GoogleAddressInput
              value={data.toAddress}
              onChange={(v) => update({ toAddress: v })}
              placeholder="Street, city, FL"
              ariaLabel="Drop-off address"
            />
          </label>
        </>
      )}

      {currentKey === "toHomeType" && (
        <>
          <h2 className="iwiz-q">What kind of home are we dropping off at?</h2>
          <Pills
            options={HOME_TYPES.map((h) => ({ value: h, label: h }))}
            value={data.toHomeType}
            onChange={(v) => pickAndAdvance({ toHomeType: v })}
            columns={2}
          />
        </>
      )}

      {currentKey === "toFloor" && (
        <>
          <h2 className="iwiz-q">Floor + access at drop-off.</h2>
          <p className="iwiz-sub">{data.toHomeType}.</p>
          <div className="iwiz-field"><span>Which floor</span>
            <Pills
              options={FLOORS.map((f) => ({ value: f, label: f }))}
              value={data.toFloor}
              onChange={(v) => update({ toFloor: v })}
              columns={2}
            />
          </div>
          <div className="iwiz-field"><span>Elevator available?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.toElevator}
              onChange={(v) => update({ toElevator: v as "yes" | "no" })}
              columns={2}
            />
          </div>
          {data.toElevator === "no" && data.toFloor !== "Ground floor" && (
            <label className="iwiz-field"><span>How many stairs total?</span>
              <input type="text" inputMode="numeric" value={data.toStairs} onChange={(e) => update({ toStairs: e.target.value })} placeholder="e.g. 12" />
            </label>
          )}
        </>
      )}

      {currentKey === "toHoa" && (
        <>
          <h2 className="iwiz-q">Building requirements at drop-off.</h2>
          <div className="iwiz-field"><span>HOA / building notified about the move?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Not yet" }]}
              value={data.toHoa}
              onChange={(v) => update({ toHoa: v as "yes" | "no" })}
              columns={2}
            />
          </div>
          <div className="iwiz-field"><span>Building requires a COI from us?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No / not sure" }]}
              value={data.toCoi}
              onChange={(v) => update({ toCoi: v as "yes" | "no" })}
              columns={2}
            />
          </div>
        </>
      )}

      {currentKey === "toParking" && (
        <>
          <h2 className="iwiz-q">Truck access at drop-off.</h2>
          <label className="iwiz-field"><span>Where can the truck park?</span>
            <input autoFocus value={data.toParking} onChange={(e) => update({ toParking: e.target.value })} placeholder="Loading zone · driveway · street" />
          </label>
          <label className="iwiz-field"><span>Anything else? — optional</span>
            <textarea rows={2} value={data.toAccess} onChange={(e) => update({ toAccess: e.target.value })} placeholder="Gate code, narrow halls, low ceilings…" />
          </label>
        </>
      )}

      {currentKey === "inventory" && (
        <>
          <h2 className="iwiz-q">Rough inventory.</h2>
          <p className="iwiz-sub">Estimates are fine — we just want to size the truck right.</p>
          <label className="iwiz-field"><span>Estimated # of boxes</span>
            <input type="text" inputMode="numeric" value={data.invBoxes} onChange={(e) => update({ invBoxes: e.target.value })} placeholder="e.g. 25" />
          </label>
          <label className="iwiz-field"><span>Estimated # of large furniture pieces</span>
            <input type="text" inputMode="numeric" value={data.invLarge} onChange={(e) => update({ invLarge: e.target.value })} placeholder="couch, beds, dressers… ~10" />
          </label>
          <label className="iwiz-field"><span>Tall, heavy, or awkward stuff? — optional</span>
            <textarea rows={2} value={data.invAwkward} onChange={(e) => update({ invAwkward: e.target.value })} placeholder="Sectional sofa, oversized armoire, treadmill…" />
          </label>
        </>
      )}

      {currentKey === "special" && (
        <>
          <h2 className="iwiz-q">Any special items?</h2>
          <p className="iwiz-sub">
            Tap any that apply — these need extra prep.
            {data.specialItems.length > 0 && (
              <em className="iwiz-count"> · {data.specialItems.length} selected</em>
            )}
          </p>
          <div className="iwiz-checks">
            {SPECIAL_OPTS.map((opt) => {
              const on = data.specialItems.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  className={`iwiz-check${on ? " on" : ""}`}
                  onClick={() => update({
                    specialItems: on
                      ? data.specialItems.filter((x) => x !== opt)
                      : [...data.specialItems, opt],
                  })}
                  aria-pressed={on}
                >
                  <span className="iwiz-check-tick" aria-hidden>{on ? "✓" : ""}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          <label className="iwiz-field"><span>Anything else worth flagging? — optional</span>
            <input value={data.otherSpecial} onChange={(e) => update({ otherSpecial: e.target.value })} placeholder="Custom-built table, vintage records…" />
          </label>
        </>
      )}

      {currentKey === "services" && (
        <>
          <h2 className="iwiz-q">Services you need.</h2>
          <p className="iwiz-sub">Tap yes or no for each.</p>

          <div className="iwiz-field"><span>Disassembly / reassembly help?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.svcDisassembly}
              onChange={(v) => update({ svcDisassembly: v as "yes" | "no" })}
              columns={2}
            />
            {data.svcDisassembly === "yes" && (
              <input
                className="iwiz-inline" value={data.svcDisassemblyItems}
                onChange={(e) => update({ svcDisassemblyItems: e.target.value })}
                placeholder="Which items? (King bed, IKEA wardrobe…)"
              />
            )}
          </div>

          <div className="iwiz-field"><span>Storage between pickup and drop-off?</span>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.svcStorage}
              onChange={(v) => update({ svcStorage: v as "yes" | "no" })}
              columns={2}
            />
            {data.svcStorage === "yes" && (
              <input
                className="iwiz-inline" value={data.svcStorageNotes}
                onChange={(e) => update({ svcStorageNotes: e.target.value })}
                placeholder="How many days? Climate-controlled?"
              />
            )}
          </div>
        </>
      )}

      {currentKey === "dayOf" && (
        <>
          <h2 className="iwiz-q">Last thing — day-of contact.</h2>
          <label className="iwiz-field"><span>Alternate contact phone (someone reachable that day) — optional</span>
            <input type="tel" value={data.altPhone} onChange={(e) => update({ altPhone: e.target.value })} placeholder="(689) 555-0000" />
          </label>
          <label className="iwiz-field"><span>Anything special the crew should know? — optional</span>
            <textarea rows={3} value={data.specialInstructions} onChange={(e) => update({ specialInstructions: e.target.value })} placeholder="Kids · pets · accessibility · neighbors · quiet hours…" />
          </label>
        </>
      )}

      </div>

      {error && <div className="iwiz-error">⚠ {error}</div>}

      <div className="iwiz-actions">
        {step > 0 && (
          <button type="button" className="btn btn-outline" onClick={back} disabled={submitting}>Back</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={!canAdvance || submitting}>
          {submitting ? "…" : isLast ? "Send my move details" : "Continue"}
          <span className="arrow" aria-hidden />
        </button>
      </div>

      <p className="iwiz-fine">We save what you've typed so you can come back later.</p>
    </form>
  );
}
