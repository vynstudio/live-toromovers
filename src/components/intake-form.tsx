"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type TouchEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAddressInput } from "./google-address-input";

type Yn = "yes" | "no" | "";
type ItemCounts = Record<string, number>;

const HOME_TYPES = ["Apartment", "House", "Townhome", "Studio", "Office", "Storage unit"];
const FLOORS = ["Ground floor", "2nd floor", "3rd floor", "4th floor", "5th+ floor"];
const BEDROOMS = ["Studio", "1", "2", "3", "4", "5+"];
const SERVICE_TYPES = [
  { value: "full-service", label: "Full-service move", sub: "We haul everything" },
  { value: "labor-only", label: "Labor only", sub: "You have the truck" },
  { value: "loading-unloading", label: "Load / unload only", sub: "POD, U-Haul, storage" },
  { value: "packing-move", label: "Packing + move", sub: "We pack and haul" },
];
const PACKING_STATUS = [
  { value: "fully-packed", label: "Fully packed", sub: "Ready to load" },
  { value: "mostly-packed", label: "Mostly packed", sub: "A few things left" },
  { value: "partially-packed", label: "Partially packed", sub: "Still working on it" },
  { value: "not-packed", label: "Not packed yet", sub: "Need packing help?" },
];
/** One-tap crew start times (24h values for <input type="time">). */
const TIME_CHIPS = [
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
];
const PARKING_CHIPS = ["Driveway", "Street parking", "Loading dock", "Assigned spot", "Garage"];
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
  "Gun safe",
  "Marble / stone table",
  "Wine fridge / cooler",
  "Arcade machine",
];
const APPLIANCE_OPTS = [
  "Refrigerator",
  "Washer",
  "Dryer",
  "Dishwasher",
  "Stove / oven",
  "Microwave (over-range)",
  "Freezer",
  "Wine fridge",
];

const INVENTORY_GROUPS: { room: string; items: string[] }[] = [
  {
    room: "Living room",
    items: [
      "Sofa / couch",
      "Sectional",
      "Loveseat",
      "Recliner",
      "Coffee table",
      "End / side table",
      "TV (flat screen)",
      "TV stand / media console",
      "Bookshelf",
      "Entertainment center",
      "Floor lamp",
      "Area rug",
    ],
  },
  {
    room: "Bedroom",
    items: [
      "King bed (frame + mattress)",
      "Queen bed (frame + mattress)",
      "Full / double bed",
      "Twin bed",
      "Bunk bed",
      "Dresser",
      "Nightstand",
      "Wardrobe / armoire",
      "Chest of drawers",
      "Vanity",
      "Mirror (wall / freestanding)",
      "Desk (bedroom)",
    ],
  },
  {
    room: "Dining / kitchen",
    items: [
      "Dining table",
      "Dining chairs",
      "Bar stools",
      "China cabinet / hutch",
      "Sideboard / buffet",
      "Kitchen island (movable)",
      "Microwave (countertop)",
      "Small appliances box set",
    ],
  },
  {
    room: "Office / kids / other",
    items: [
      "Office desk",
      "Office chair",
      "Filing cabinet",
      "Bookcase",
      "Crib / toddler bed",
      "Changing table",
      "Toy chest",
      "Futon / daybed",
    ],
  },
  {
    room: "Outdoor / garage",
    items: [
      "Patio table",
      "Patio chairs",
      "Grill / BBQ",
      "Outdoor storage bin",
      "Lawn mower / tools",
      "Bike",
      "Workbench",
      "Shelving unit",
    ],
  },
  {
    room: "Boxes & misc",
    items: [
      "Small boxes",
      "Medium boxes",
      "Large boxes",
      "Wardrobe boxes",
      "Plastic bins",
      "Suitcases / bags",
      "Mirror / picture boxes",
      "Garment bags",
    ],
  },
];

/** One-tap starter inventories (merge into counts — user can tweak). */
const INVENTORY_PRESETS: { id: string; label: string; sub: string; counts: ItemCounts }[] = [
  {
    id: "studio",
    label: "Studio",
    sub: "~15 pieces",
    counts: {
      "Sofa / couch": 1,
      "Coffee table": 1,
      "TV (flat screen)": 1,
      "TV stand / media console": 1,
      "Queen bed (frame + mattress)": 1,
      "Dresser": 1,
      "Nightstand": 1,
      "Medium boxes": 15,
      "Large boxes": 5,
    },
  },
  {
    id: "1br",
    label: "1 bedroom",
    sub: "~25 pieces",
    counts: {
      "Sofa / couch": 1,
      "Coffee table": 1,
      "End / side table": 1,
      "TV (flat screen)": 1,
      "TV stand / media console": 1,
      "Queen bed (frame + mattress)": 1,
      "Dresser": 1,
      "Nightstand": 2,
      "Dining table": 1,
      "Dining chairs": 4,
      "Medium boxes": 20,
      "Large boxes": 8,
      "Wardrobe boxes": 2,
    },
  },
  {
    id: "2br",
    label: "2 bedroom",
    sub: "~40 pieces",
    counts: {
      "Sofa / couch": 1,
      "Sectional": 0,
      "Loveseat": 1,
      "Coffee table": 1,
      "End / side table": 2,
      "TV (flat screen)": 1,
      "TV stand / media console": 1,
      "Bookshelf": 1,
      "Queen bed (frame + mattress)": 1,
      "Full / double bed": 1,
      "Dresser": 2,
      "Nightstand": 3,
      "Dining table": 1,
      "Dining chairs": 4,
      "Medium boxes": 30,
      "Large boxes": 12,
      "Wardrobe boxes": 3,
      "Plastic bins": 4,
    },
  },
  {
    id: "3br",
    label: "3+ bedroom",
    sub: "~55 pieces",
    counts: {
      "Sofa / couch": 1,
      "Sectional": 1,
      "Coffee table": 1,
      "End / side table": 2,
      "TV (flat screen)": 2,
      "TV stand / media console": 1,
      "Bookshelf": 2,
      "King bed (frame + mattress)": 1,
      "Queen bed (frame + mattress)": 1,
      "Twin bed": 1,
      "Dresser": 3,
      "Nightstand": 4,
      "Dining table": 1,
      "Dining chairs": 6,
      "Office desk": 1,
      "Office chair": 1,
      "Medium boxes": 40,
      "Large boxes": 15,
      "Wardrobe boxes": 4,
      "Plastic bins": 6,
    },
  },
];

const STORAGE_KEY = "toro_intake_draft_v3";
const AUTO_ADVANCE_MS = 180;

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
  fromStairs: string;
  fromHoa: Yn;
  fromCoi: Yn;
  fromCoiEmail: string;
  fromParking: string;
  fromGateCode: string;
  fromLongCarry: Yn;
  fromAccess: string;
  toAddress: string;
  toUnit: string;
  toHomeType: string;
  toFloor: string;
  toElevator: Yn;
  toStairs: string;
  toHoa: Yn;
  toCoi: Yn;
  toCoiEmail: string;
  toParking: string;
  toGateCode: string;
  toLongCarry: Yn;
  toAccess: string;
  itemCounts: ItemCounts;
  invOther: string;
  appliances: string[];
  specialItems: string[];
  otherSpecial: string;
  packingStatus: string;
  needPackingHelp: Yn;
  svcDisassembly: Yn;
  svcDisassemblyItems: string;
  svcStorage: Yn;
  svcStorageNotes: string;
  onSitePickupName: string;
  onSitePickupPhone: string;
  onSiteDropoffName: string;
  onSiteDropoffPhone: string;
  altPhone: string;
  petsOnSite: Yn;
  kidsOnSite: Yn;
  specialInstructions: string;
};

const initial: Data = {
  name: "",
  phone: "",
  email: "",
  moveDate: "",
  moveTime: "",
  serviceType: "",
  fromAddress: "",
  fromUnit: "",
  fromHomeType: "",
  bedrooms: "",
  fromFloor: "",
  fromElevator: "",
  fromStairs: "",
  fromHoa: "",
  fromCoi: "",
  fromCoiEmail: "",
  fromParking: "",
  fromGateCode: "",
  fromLongCarry: "",
  fromAccess: "",
  toAddress: "",
  toUnit: "",
  toHomeType: "",
  toFloor: "",
  toElevator: "",
  toStairs: "",
  toHoa: "",
  toCoi: "",
  toCoiEmail: "",
  toParking: "",
  toGateCode: "",
  toLongCarry: "",
  toAccess: "",
  itemCounts: {},
  invOther: "",
  appliances: [],
  specialItems: [],
  otherSpecial: "",
  packingStatus: "",
  needPackingHelp: "",
  svcDisassembly: "",
  svcDisassemblyItems: "",
  svcStorage: "",
  svcStorageNotes: "",
  onSitePickupName: "",
  onSitePickupPhone: "",
  onSiteDropoffName: "",
  onSiteDropoffPhone: "",
  altPhone: "",
  petsOnSite: "",
  kidsOnSite: "",
  specialInstructions: "",
};

const isMultiFloor = (homeType: string) =>
  ["Apartment", "Townhome", "Office"].includes(homeType);
const hasHoa = (homeType: string) =>
  ["Apartment", "Townhome"].includes(homeType);
const hasBedrooms = (homeType: string) =>
  !["Office", "Storage unit"].includes(homeType);

/**
 * Consolidated wizard (~10 screens max instead of ~20).
 * Optional access/extras stay optional so people can fly through.
 */
type StepKey =
  | "contact"
  | "service"
  | "from"
  | "fromAccess"
  | "to"
  | "toAccess"
  | "inventory"
  | "extras"
  | "packing"
  | "dayOf";

const ALL_STEPS: StepKey[] = [
  "contact",
  "service",
  "from",
  "fromAccess",
  "to",
  "toAccess",
  "inventory",
  "extras",
  "packing",
  "dayOf",
];

const STEP_META: Record<StepKey, { section: string; label: string }> = {
  contact: { section: "You", label: "Contact & schedule" },
  service: { section: "You", label: "Service" },
  from: { section: "Pickup", label: "Pickup place" },
  fromAccess: { section: "Pickup", label: "Pickup access" },
  to: { section: "Drop-off", label: "Drop-off place" },
  toAccess: { section: "Drop-off", label: "Drop-off access" },
  inventory: { section: "Stuff", label: "Item checklist" },
  extras: { section: "Stuff", label: "Appliances & specials" },
  packing: { section: "Stuff", label: "Packing & services" },
  dayOf: { section: "Day-of", label: "Who’s on site" },
};

function inventorySelected(counts: ItemCounts): { name: string; qty: number }[] {
  return Object.entries(counts)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function inventoryTotal(counts: ItemCounts): number {
  return Object.values(counts).reduce((sum, n) => sum + (n || 0), 0);
}

function formatScheduleConfirm(date: string, time: string): string {
  try {
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) {
      return `${date} at ${time}`;
    }
    const dt = new Date(y, m - 1, d, hh, mm);
    return dt.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return `${date} at ${time}`;
  }
}

function isFromPlaceValid(d: Data): boolean {
  if (!d.fromAddress.trim() || !d.fromHomeType) return false;
  if (hasBedrooms(d.fromHomeType) && !d.bedrooms) return false;
  if (isMultiFloor(d.fromHomeType) && (!d.fromFloor || !d.fromElevator)) return false;
  return true;
}

function isToPlaceValid(d: Data): boolean {
  if (!d.toAddress.trim() || !d.toHomeType) return false;
  if (isMultiFloor(d.toHomeType) && (!d.toFloor || !d.toElevator)) return false;
  return true;
}

function isFromAccessValid(d: Data): boolean {
  if (hasHoa(d.fromHomeType) && (!d.fromHoa || !d.fromCoi)) return false;
  return true;
}

function isToAccessValid(d: Data): boolean {
  if (hasHoa(d.toHomeType) && (!d.toHoa || !d.toCoi)) return false;
  return true;
}

function isPackingValid(d: Data): boolean {
  if (!d.packingStatus) return false;
  if (!d.svcDisassembly || !d.svcStorage) return false;
  return true;
}

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<Data>(initial);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [openRooms, setOpenRooms] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(INVENTORY_GROUPS.map((g, i) => [g.room, i < 2])),
  );

  const advanceTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const update = useCallback((patch: Partial<Data>) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  // Prefill from URL params (ops can pre-link a customer).
  useEffect(() => {
    const sp = searchParams;
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
  }, [searchParams]);

  // Load draft once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("toro_intake_draft_v2");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Data> & {
          specificTime?: string;
          timeWindow?: string;
        };
        const moveTime =
          parsed.moveTime ||
          parsed.specificTime ||
          (parsed.timeWindow && /^\d{1,2}:\d{2}$/.test(parsed.timeWindow) ? parsed.timeWindow : "") ||
          "";
        setData((d) => ({
          ...d,
          ...parsed,
          moveTime: moveTime || d.moveTime,
          itemCounts: { ...d.itemCounts, ...(parsed.itemCounts || {}) },
          specialItems: parsed.specialItems || d.specialItems,
          appliances: parsed.appliances || d.appliances,
        }));
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced draft save (smoother typing on mobile).
  useEffect(() => {
    const t = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    }, 200);
    return () => window.clearTimeout(t);
  }, [data]);

  const steps = ALL_STEPS;
  const currentKey = steps[Math.min(step, steps.length - 1)];
  const totalSteps = steps.length;
  const isLast = step >= steps.length - 1;
  const meta = STEP_META[currentKey];

  const isStepValid = useCallback((key: StepKey, d: Data = data): boolean => {
    switch (key) {
      case "contact":
        return !!(d.name.trim() && d.phone.trim() && d.email.trim() && d.moveDate.trim() && d.moveTime.trim());
      case "service":
        return !!d.serviceType;
      case "from":
        return isFromPlaceValid(d);
      case "fromAccess":
        return isFromAccessValid(d);
      case "to":
        return isToPlaceValid(d);
      case "toAccess":
        return isToAccessValid(d);
      case "inventory":
      case "extras":
      case "dayOf":
        return true;
      case "packing":
        return isPackingValid(d);
    }
  }, [data]);

  const canAdvance = isStepValid(currentKey);

  const goNext = useCallback(() => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 220);
    setStep((s) => Math.min(s + 1, steps.length - 1));
    // Scroll form top into view on step change (mobile).
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [steps.length]);

  const next = () => {
    if (!canAdvance) return;
    if (isLast) {
      void submit();
      return;
    }
    goNext();
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const scheduleAdvance = useCallback(() => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, ALL_STEPS.length - 1));
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, AUTO_ADVANCE_MS);
  }, []);

  /** Patch + auto-advance when the step becomes valid (single-choice steps). */
  const pickAndAdvance = (patch: Partial<Data>, onlyIf: StepKey[] = ["service"]) => {
    setData((d) => {
      const nextData = { ...d, ...patch };
      if (onlyIf.includes(currentKey) && isStepValid(currentKey, nextData)) {
        // Defer advance so state paints first.
        if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
        advanceTimer.current = window.setTimeout(() => {
          setFlash(true);
          window.setTimeout(() => setFlash(false), 220);
          setStep((s) => Math.min(s + 1, ALL_STEPS.length - 1));
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, AUTO_ADVANCE_MS);
      }
      return nextData;
    });
  };

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const setItemQty = (item: string, qty: number) => {
    const nextQty = Math.max(0, Math.min(99, qty));
    setActivePreset(null);
    setData((d) => {
      const itemCounts = { ...d.itemCounts };
      if (nextQty <= 0) delete itemCounts[item];
      else itemCounts[item] = nextQty;
      return { ...d, itemCounts };
    });
  };

  const applyPreset = (preset: (typeof INVENTORY_PRESETS)[number]) => {
    setActivePreset(preset.id);
    // Drop zero entries from preset counts.
    const cleaned: ItemCounts = {};
    for (const [k, v] of Object.entries(preset.counts)) {
      if (v > 0) cleaned[k] = v;
    }
    setData((d) => ({ ...d, itemCounts: cleaned }));
    // Open rooms that have items in the preset.
    setOpenRooms((rooms) => {
      const next = { ...rooms };
      for (const g of INVENTORY_GROUPS) {
        next[g.room] = g.items.some((i) => (cleaned[i] || 0) > 0);
      }
      return next;
    });
  };

  const clearInventory = () => {
    setActivePreset(null);
    update({ itemCounts: {} });
  };

  const toggleList = (field: "specialItems" | "appliances", opt: string) => {
    setData((d) => {
      const list = d[field];
      const on = list.includes(opt);
      return {
        ...d,
        [field]: on ? list.filter((x) => x !== opt) : [...list, opt],
      };
    });
  };

  const fillImOnSite = () => {
    update({
      onSitePickupName: data.name,
      onSitePickupPhone: data.phone,
      onSiteDropoffName: data.name,
      onSiteDropoffPhone: data.phone,
    });
  };

  const copyPickupToDropoffSite = () => {
    update({
      onSiteDropoffName: data.onSitePickupName || data.name,
      onSiteDropoffPhone: data.onSitePickupPhone || data.phone,
    });
  };

  const sameHomeTypeAsPickup = () => {
    if (!data.fromHomeType) return;
    const patch: Partial<Data> = { toHomeType: data.fromHomeType };
    if (isMultiFloor(data.fromHomeType)) {
      // Don't auto-copy floor — different building — but user can re-pick fast.
    }
    pickAndAdvance(patch, []);
    update(patch);
  };

  // Light swipe navigation (mobile).
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(dx) < 70) return;
    if (dx > 0 && step > 0) back();
    else if (dx < 0 && canAdvance && !isLast) goNext();
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const items = inventorySelected(data.itemCounts);
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
            stairsCount: data.fromStairs,
            parkingNotes: data.fromParking,
            gateCode: data.fromGateCode,
            longCarry: data.fromLongCarry === "yes",
            hoaNotice: data.fromHoa === "yes",
            coiNeeded: data.fromCoi === "yes",
            coiEmail: data.fromCoiEmail,
            accessNotes: data.fromAccess,
          },
          destination: {
            address: data.toAddress,
            unit: data.toUnit,
            homeType: data.toHomeType,
            floor: data.toFloor,
            elevator: data.toElevator,
            stairsCount: data.toStairs,
            parkingNotes: data.toParking,
            gateCode: data.toGateCode,
            longCarry: data.toLongCarry === "yes",
            hoaNotice: data.toHoa === "yes",
            coiNeeded: data.toCoi === "yes",
            coiEmail: data.toCoiEmail,
            accessNotes: data.toAccess,
          },
          inventory: {
            items,
            totalPieces: inventoryTotal(data.itemCounts),
            other: data.invOther,
            appliances: data.appliances,
          },
          specialItems: data.specialItems,
          otherSpecial: data.otherSpecial,
          packing: {
            status: data.packingStatus,
            needHelp: data.needPackingHelp === "yes",
          },
          services: {
            disassembly: data.svcDisassembly === "yes",
            disassemblyItems: data.svcDisassemblyItems,
            storage: data.svcStorage === "yes",
            storageNotes: data.svcStorageNotes,
          },
          contacts: {
            onSitePickupName: data.onSitePickupName,
            onSitePickupPhone: data.onSitePickupPhone,
            onSiteDropoffName: data.onSiteDropoffName,
            onSiteDropoffPhone: data.onSiteDropoffPhone,
            altPhone: data.altPhone,
            petsOnSite:
              data.petsOnSite === "yes" ? true : data.petsOnSite === "no" ? false : null,
            kidsOnSite:
              data.kidsOnSite === "yes" ? true : data.kidsOnSite === "no" ? false : null,
            specialInstructions: data.specialInstructions,
          },
        }),
      });
      if (!res.ok) {
        setError("Couldn't save right now. Please call us at (689) 600-2720.");
        setSubmitting(false);
        return;
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("toro_intake_draft_v2");
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

  const ChipRow = ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[] | string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="iwiz-chips" role="listbox">
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const on = value === v;
        return (
          <button
            key={v}
            type="button"
            role="option"
            aria-selected={on}
            className={`iwiz-chip${on ? " on" : ""}`}
            onClick={() => onChange(v)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  const CheckGrid = ({
    options,
    selected,
    onToggle,
  }: {
    options: string[];
    selected: string[];
    onToggle: (opt: string) => void;
  }) => (
    <div className="iwiz-checks">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            type="button"
            key={opt}
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

  const selectedCount = inventoryTotal(data.itemCounts);
  const today = new Date().toISOString().slice(0, 10);
  const minsLeft = Math.max(1, Math.ceil((totalSteps - step) * 0.45));

  // Auto-advance when service / packing multi-pills complete via storage+disassembly.
  const tryAdvancePacking = (patch: Partial<Data>) => {
    setData((d) => {
      const nextData = { ...d, ...patch };
      if (isPackingValid(nextData) && !nextData.svcDisassemblyItems && !(nextData.svcStorage && nextData.svcStorageNotes)) {
        // If no free-text follow-ups needed, advance.
        const needsText =
          (nextData.svcDisassembly === "yes" && !nextData.svcDisassemblyItems.trim()) ||
          (nextData.svcStorage === "yes" && !nextData.svcStorageNotes.trim());
        if (!needsText && nextData.packingStatus) {
          scheduleAdvance();
        }
      }
      return nextData;
    });
  };

  return (
    <form
      ref={formRef}
      className={`iwiz${flash ? " iwiz-flash" : ""}`}
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        next();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="iwiz-progress" aria-hidden>
        <span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>
      <div className="iwiz-stepbar">
        <div className="iwiz-step">
          {meta.section} · {step + 1}/{totalSteps}
        </div>
        <div className="iwiz-eta">~{minsLeft} min left</div>
      </div>

      <div className="iwiz-stepbody" key={currentKey}>

        {currentKey === "contact" && (
          <>
            <h2 className="iwiz-q">You + move schedule.</h2>
            <p className="iwiz-sub">Exact date &amp; start time — crew shows up then.</p>
            <label className="iwiz-field"><span>Full name</span>
              <input autoFocus required value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="Maria Lopez" autoComplete="name" />
            </label>
            <div className="iwiz-row2">
              <label className="iwiz-field"><span>Phone</span>
                <input required type="tel" value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="(689) 555-0000" autoComplete="tel" />
              </label>
              <label className="iwiz-field"><span>Email</span>
                <input required type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
              </label>
            </div>
            <div className="iwiz-row2">
              <label className="iwiz-field"><span>Move date</span>
                <input required type="date" min={today} value={data.moveDate} onChange={(e) => update({ moveDate: e.target.value })} />
              </label>
              <label className="iwiz-field"><span>Start time</span>
                <input required type="time" step={300} value={data.moveTime} onChange={(e) => update({ moveTime: e.target.value })} />
              </label>
            </div>
            <div className="iwiz-field">
              <span>Quick time</span>
              <ChipRow
                options={TIME_CHIPS}
                value={data.moveTime}
                onChange={(v) => update({ moveTime: v })}
              />
            </div>
            {data.moveDate && data.moveTime && (
              <p className="iwiz-hint iwiz-schedule-confirm" role="status">
                Scheduled for <strong>{formatScheduleConfirm(data.moveDate, data.moveTime)}</strong>
              </p>
            )}
          </>
        )}

        {currentKey === "service" && (
          <>
            <h2 className="iwiz-q">What kind of help?</h2>
            <p className="iwiz-sub">Tap one — we advance automatically.</p>
            <Pills
              options={SERVICE_TYPES}
              value={data.serviceType}
              onChange={(v) => pickAndAdvance({ serviceType: v }, ["service"])}
              columns={1}
            />
          </>
        )}

        {currentKey === "from" && (
          <>
            <h2 className="iwiz-q">Pickup place.</h2>
            <p className="iwiz-sub">Address + what kind of home.</p>
            <label className="iwiz-field"><span>Pickup address</span>
              <GoogleAddressInput
                value={data.fromAddress}
                onChange={(v) => update({ fromAddress: v })}
                placeholder="Street, city, FL"
                ariaLabel="Pickup address"
              />
            </label>
            <label className="iwiz-field"><span>Apt / unit — optional</span>
              <input value={data.fromUnit} onChange={(e) => update({ fromUnit: e.target.value })} placeholder="Apt 204" autoComplete="address-line2" />
            </label>
            <div className="iwiz-field"><span>Home type</span>
              <Pills
                options={HOME_TYPES.map((h) => ({ value: h, label: h }))}
                value={data.fromHomeType}
                onChange={(v) => update({ fromHomeType: v, bedrooms: hasBedrooms(v) ? data.bedrooms : "" })}
                columns={2}
              />
            </div>
            {hasBedrooms(data.fromHomeType) && (
              <div className="iwiz-field"><span>Bedrooms</span>
                <Pills
                  options={BEDROOMS.map((b) => ({ value: b, label: b === "Studio" ? "Studio" : `${b} BR` }))}
                  value={data.bedrooms}
                  onChange={(v) => update({ bedrooms: v })}
                  columns={3}
                />
              </div>
            )}
            {isMultiFloor(data.fromHomeType) && (
              <>
                <div className="iwiz-field"><span>Floor</span>
                  <Pills
                    options={FLOORS.map((f) => ({ value: f, label: f }))}
                    value={data.fromFloor}
                    onChange={(v) => update({ fromFloor: v })}
                    columns={2}
                  />
                </div>
                <div className="iwiz-field"><span>Elevator?</span>
                  <Pills
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                    value={data.fromElevator}
                    onChange={(v) => update({ fromElevator: v as Yn })}
                    columns={2}
                  />
                </div>
                {data.fromElevator === "no" && data.fromFloor !== "Ground floor" && (
                  <label className="iwiz-field"><span>Stairs total</span>
                    <input type="text" inputMode="numeric" value={data.fromStairs} onChange={(e) => update({ fromStairs: e.target.value })} placeholder="e.g. 12" />
                  </label>
                )}
              </>
            )}
          </>
        )}

        {currentKey === "fromAccess" && (
          <>
            <h2 className="iwiz-q">Pickup access.</h2>
            <p className="iwiz-sub">Tap chips for speed — skip free-text if nothing special.</p>
            {hasHoa(data.fromHomeType) && (
              <>
                <div className="iwiz-field"><span>HOA / building notified?</span>
                  <Pills
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Not yet" }]}
                    value={data.fromHoa}
                    onChange={(v) => update({ fromHoa: v as Yn })}
                    columns={2}
                  />
                </div>
                <div className="iwiz-field"><span>COI required?</span>
                  <Pills
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No / not sure" }]}
                    value={data.fromCoi}
                    onChange={(v) => update({ fromCoi: v as Yn })}
                    columns={2}
                  />
                </div>
                {data.fromCoi === "yes" && (
                  <label className="iwiz-field"><span>COI email — optional</span>
                    <input type="email" value={data.fromCoiEmail} onChange={(e) => update({ fromCoiEmail: e.target.value })} placeholder="manager@building.com" />
                  </label>
                )}
              </>
            )}
            <div className="iwiz-field"><span>Truck parking</span>
              <ChipRow
                options={PARKING_CHIPS}
                value={data.fromParking}
                onChange={(v) => update({ fromParking: v })}
              />
              <input
                className="iwiz-inline"
                value={data.fromParking}
                onChange={(e) => update({ fromParking: e.target.value })}
                placeholder="Or type details…"
              />
            </div>
            <label className="iwiz-field"><span>Gate / door code — optional</span>
              <input value={data.fromGateCode} onChange={(e) => update({ fromGateCode: e.target.value })} placeholder="Gate 1234" autoComplete="off" />
            </label>
            <div className="iwiz-field"><span>Long carry?</span>
              <Pills
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                value={data.fromLongCarry}
                onChange={(v) => update({ fromLongCarry: v as Yn })}
                columns={2}
              />
            </div>
            <label className="iwiz-field"><span>Other access notes — optional</span>
              <textarea rows={2} value={data.fromAccess} onChange={(e) => update({ fromAccess: e.target.value })} placeholder="Narrow halls, reserved elevator…" />
            </label>
          </>
        )}

        {currentKey === "to" && (
          <>
            <h2 className="iwiz-q">Drop-off place.</h2>
            <p className="iwiz-sub">Where everything lands.</p>
            {data.fromHomeType && (
              <button type="button" className="iwiz-quick" onClick={sameHomeTypeAsPickup}>
                Same home type as pickup ({data.fromHomeType})
              </button>
            )}
            <label className="iwiz-field"><span>Drop-off address</span>
              <GoogleAddressInput
                value={data.toAddress}
                onChange={(v) => update({ toAddress: v })}
                placeholder="Street, city, FL"
                ariaLabel="Drop-off address"
              />
            </label>
            <label className="iwiz-field"><span>Apt / unit — optional</span>
              <input value={data.toUnit} onChange={(e) => update({ toUnit: e.target.value })} placeholder="Apt 12" autoComplete="address-line2" />
            </label>
            <div className="iwiz-field"><span>Home type</span>
              <Pills
                options={HOME_TYPES.map((h) => ({ value: h, label: h }))}
                value={data.toHomeType}
                onChange={(v) => update({ toHomeType: v })}
                columns={2}
              />
            </div>
            {isMultiFloor(data.toHomeType) && (
              <>
                <div className="iwiz-field"><span>Floor</span>
                  <Pills
                    options={FLOORS.map((f) => ({ value: f, label: f }))}
                    value={data.toFloor}
                    onChange={(v) => update({ toFloor: v })}
                    columns={2}
                  />
                </div>
                <div className="iwiz-field"><span>Elevator?</span>
                  <Pills
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                    value={data.toElevator}
                    onChange={(v) => update({ toElevator: v as Yn })}
                    columns={2}
                  />
                </div>
                {data.toElevator === "no" && data.toFloor !== "Ground floor" && (
                  <label className="iwiz-field"><span>Stairs total</span>
                    <input type="text" inputMode="numeric" value={data.toStairs} onChange={(e) => update({ toStairs: e.target.value })} placeholder="e.g. 12" />
                  </label>
                )}
              </>
            )}
          </>
        )}

        {currentKey === "toAccess" && (
          <>
            <h2 className="iwiz-q">Drop-off access.</h2>
            <p className="iwiz-sub">Same idea — chips first, details only if needed.</p>
            {hasHoa(data.toHomeType) && (
              <>
                <div className="iwiz-field"><span>HOA / building notified?</span>
                  <Pills
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Not yet" }]}
                    value={data.toHoa}
                    onChange={(v) => update({ toHoa: v as Yn })}
                    columns={2}
                  />
                </div>
                <div className="iwiz-field"><span>COI required?</span>
                  <Pills
                    options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No / not sure" }]}
                    value={data.toCoi}
                    onChange={(v) => update({ toCoi: v as Yn })}
                    columns={2}
                  />
                </div>
                {data.toCoi === "yes" && (
                  <label className="iwiz-field"><span>COI email — optional</span>
                    <input type="email" value={data.toCoiEmail} onChange={(e) => update({ toCoiEmail: e.target.value })} placeholder="manager@building.com" />
                  </label>
                )}
              </>
            )}
            <div className="iwiz-field"><span>Truck parking</span>
              <ChipRow
                options={PARKING_CHIPS}
                value={data.toParking}
                onChange={(v) => update({ toParking: v })}
              />
              <input
                className="iwiz-inline"
                value={data.toParking}
                onChange={(e) => update({ toParking: e.target.value })}
                placeholder="Or type details…"
              />
            </div>
            <label className="iwiz-field"><span>Gate / door code — optional</span>
              <input value={data.toGateCode} onChange={(e) => update({ toGateCode: e.target.value })} placeholder="Gate 5678" autoComplete="off" />
            </label>
            <div className="iwiz-field"><span>Long carry?</span>
              <Pills
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                value={data.toLongCarry}
                onChange={(v) => update({ toLongCarry: v as Yn })}
                columns={2}
              />
            </div>
            <label className="iwiz-field"><span>Other access notes — optional</span>
              <textarea rows={2} value={data.toAccess} onChange={(e) => update({ toAccess: e.target.value })} placeholder="Narrow halls, low ceilings…" />
            </label>
          </>
        )}

        {currentKey === "inventory" && (
          <>
            <h2 className="iwiz-q">Item checklist.</h2>
            <p className="iwiz-sub">
              Tap a starter, then tweak. Tap an item name to +1.
              {selectedCount > 0 && (
                <em className="iwiz-count"> · {selectedCount} piece{selectedCount === 1 ? "" : "s"}</em>
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
              {selectedCount > 0 && (
                <button type="button" className="iwiz-preset iwiz-preset-clear" onClick={clearInventory}>
                  <strong>Clear</strong>
                  <span>Start over</span>
                </button>
              )}
            </div>
            <div className="iwiz-inv">
              {INVENTORY_GROUPS.map((group) => {
                const open = openRooms[group.room] ?? false;
                const roomTotal = group.items.reduce((s, item) => s + (data.itemCounts[item] || 0), 0);
                return (
                  <div key={group.room} className={`iwiz-inv-room${open ? " open" : ""}`}>
                    <button
                      type="button"
                      className="iwiz-inv-room-head"
                      onClick={() => setOpenRooms((r) => ({ ...r, [group.room]: !open }))}
                      aria-expanded={open}
                    >
                      <span>{group.room}</span>
                      <span className="iwiz-inv-room-meta">
                        {roomTotal > 0 ? `${roomTotal}` : "—"}
                        <span className="iwiz-inv-chevron" aria-hidden>{open ? "▾" : "▸"}</span>
                      </span>
                    </button>
                    {open && (
                      <ul className="iwiz-inv-list">
                        {group.items.map((item) => {
                          const qty = data.itemCounts[item] || 0;
                          return (
                            <li key={item} className={`iwiz-inv-row${qty > 0 ? " on" : ""}`}>
                              <button
                                type="button"
                                className="iwiz-inv-name"
                                onClick={() => setItemQty(item, qty + 1)}
                                title="Tap to add 1"
                              >
                                {item}
                              </button>
                              <div className="iwiz-qty" role="group" aria-label={`${item} quantity`}>
                                <button
                                  type="button"
                                  className="iwiz-qty-btn"
                                  onClick={() => setItemQty(item, qty - 1)}
                                  disabled={qty <= 0}
                                  aria-label={`Decrease ${item}`}
                                >
                                  −
                                </button>
                                <span className="iwiz-qty-val" aria-live="polite">{qty}</span>
                                <button
                                  type="button"
                                  className="iwiz-qty-btn"
                                  onClick={() => setItemQty(item, qty + 1)}
                                  aria-label={`Increase ${item}`}
                                >
                                  +
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <label className="iwiz-field"><span>Not listed? — optional</span>
              <textarea rows={2} value={data.invOther} onChange={(e) => update({ invOther: e.target.value })} placeholder="Kayak, custom shelves…" />
            </label>
          </>
        )}

        {currentKey === "extras" && (
          <>
            <h2 className="iwiz-q">Appliances &amp; specials.</h2>
            <p className="iwiz-sub">
              Tap any that apply — or skip.
              {(data.appliances.length + data.specialItems.length) > 0 && (
                <em className="iwiz-count"> · {data.appliances.length + data.specialItems.length} flagged</em>
              )}
            </p>
            <div className="iwiz-field"><span>Major appliances</span>
              <CheckGrid
                options={APPLIANCE_OPTS}
                selected={data.appliances}
                onToggle={(opt) => toggleList("appliances", opt)}
              />
            </div>
            <div className="iwiz-field"><span>Special / heavy items</span>
              <CheckGrid
                options={SPECIAL_OPTS}
                selected={data.specialItems}
                onToggle={(opt) => toggleList("specialItems", opt)}
              />
            </div>
            <label className="iwiz-field"><span>Anything else? — optional</span>
              <input value={data.otherSpecial} onChange={(e) => update({ otherSpecial: e.target.value })} placeholder="Custom table, vintage records…" />
            </label>
          </>
        )}

        {currentKey === "packing" && (
          <>
            <h2 className="iwiz-q">Packing &amp; extras.</h2>
            <p className="iwiz-sub">Quick taps — we move on when you&apos;re done.</p>
            <div className="iwiz-field"><span>How packed will things be?</span>
              <Pills
                options={PACKING_STATUS}
                value={data.packingStatus}
                onChange={(v) => tryAdvancePacking({ packingStatus: v })}
                columns={1}
              />
            </div>
            {(data.packingStatus === "not-packed" || data.packingStatus === "partially-packed" || data.packingStatus === "mostly-packed") && (
              <div className="iwiz-field"><span>Need packing help?</span>
                <Pills
                  options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                  value={data.needPackingHelp}
                  onChange={(v) => tryAdvancePacking({ needPackingHelp: v as Yn })}
                  columns={2}
                />
              </div>
            )}
            <div className="iwiz-field"><span>Disassembly / reassembly?</span>
              <Pills
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                value={data.svcDisassembly}
                onChange={(v) => tryAdvancePacking({ svcDisassembly: v as Yn })}
                columns={2}
              />
              {data.svcDisassembly === "yes" && (
                <input
                  className="iwiz-inline"
                  value={data.svcDisassemblyItems}
                  onChange={(e) => update({ svcDisassemblyItems: e.target.value })}
                  placeholder="Which items? (King bed, IKEA…)"
                />
              )}
            </div>
            <div className="iwiz-field"><span>Storage between stops?</span>
              <Pills
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                value={data.svcStorage}
                onChange={(v) => tryAdvancePacking({ svcStorage: v as Yn })}
                columns={2}
              />
              {data.svcStorage === "yes" && (
                <input
                  className="iwiz-inline"
                  value={data.svcStorageNotes}
                  onChange={(e) => update({ svcStorageNotes: e.target.value })}
                  placeholder="How many days?"
                />
              )}
            </div>
          </>
        )}

        {currentKey === "dayOf" && (
          <>
            <h2 className="iwiz-q">Who&apos;s on site?</h2>
            <p className="iwiz-sub">One tap if that&apos;s you both places.</p>
            <div className="iwiz-quick-row">
              <button type="button" className="iwiz-quick" onClick={fillImOnSite}>
                I&apos;m there both places
              </button>
              <button type="button" className="iwiz-quick iwiz-quick-ghost" onClick={copyPickupToDropoffSite}>
                Copy pickup → drop-off
              </button>
            </div>
            <div className="iwiz-row2">
              <label className="iwiz-field"><span>Pickup — name</span>
                <input autoFocus value={data.onSitePickupName} onChange={(e) => update({ onSitePickupName: e.target.value })} placeholder="Name" />
              </label>
              <label className="iwiz-field"><span>Pickup — phone</span>
                <input type="tel" value={data.onSitePickupPhone} onChange={(e) => update({ onSitePickupPhone: e.target.value })} placeholder="Phone" />
              </label>
            </div>
            <div className="iwiz-row2">
              <label className="iwiz-field"><span>Drop-off — name</span>
                <input value={data.onSiteDropoffName} onChange={(e) => update({ onSiteDropoffName: e.target.value })} placeholder="Name" />
              </label>
              <label className="iwiz-field"><span>Drop-off — phone</span>
                <input type="tel" value={data.onSiteDropoffPhone} onChange={(e) => update({ onSiteDropoffPhone: e.target.value })} placeholder="Phone" />
              </label>
            </div>
            <label className="iwiz-field"><span>Alt / emergency phone — optional</span>
              <input type="tel" value={data.altPhone} onChange={(e) => update({ altPhone: e.target.value })} placeholder="(689) 555-0000" />
            </label>
            <div className="iwiz-row2">
              <div className="iwiz-field"><span>Pets on site?</span>
                <Pills
                  options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                  value={data.petsOnSite}
                  onChange={(v) => update({ petsOnSite: v as Yn })}
                  columns={2}
                />
              </div>
              <div className="iwiz-field"><span>Kids on site?</span>
                <Pills
                  options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                  value={data.kidsOnSite}
                  onChange={(v) => update({ kidsOnSite: v as Yn })}
                  columns={2}
                />
              </div>
            </div>
            <label className="iwiz-field"><span>Anything else? — optional</span>
              <textarea
                rows={2}
                value={data.specialInstructions}
                onChange={(e) => update({ specialInstructions: e.target.value })}
                placeholder="Quiet hours, accessibility…"
              />
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

      <p className="iwiz-fine">
        Auto-saves as you go · swipe left/right to navigate
      </p>
    </form>
  );
}
