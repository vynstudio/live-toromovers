"use client";

/**
 * Move-day intake — one question at a time.
 * Typing: name, phone, email, addresses (autocomplete), optional extras.
 * Everything else: single-tap choices that auto-advance.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import { GoogleAddressInput } from "./google-address-input";

type Yn = "yes" | "no" | "";
type ItemCounts = Record<string, number>;

const HOME_TYPES = ["Apartment", "House", "Townhome", "Studio", "Office", "Storage unit"];
const FLOORS = ["Ground floor", "2nd floor", "3rd floor", "4th floor", "5th+ floor"];
const BEDROOMS = ["Studio", "1", "2", "3", "4", "5+"];
const STAIR_OPTS = [
  { value: "1 flight", label: "1 flight" },
  { value: "2 flights", label: "2 flights" },
  { value: "3+ flights", label: "3+ flights" },
];
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
const PARKING_OPTS = [
  { value: "Driveway", label: "Driveway" },
  { value: "Street parking", label: "Street parking" },
  { value: "Loading dock", label: "Loading dock" },
  { value: "Assigned spot", label: "Assigned spot" },
  { value: "Garage", label: "Garage" },
  { value: "Not sure", label: "Not sure yet" },
];
const STORAGE_DURATION = [
  { value: "1–3 days", label: "1–3 days" },
  { value: "About 1 week", label: "About 1 week" },
  { value: "2–4 weeks", label: "2–4 weeks" },
  { value: "1+ month", label: "1+ month" },
];
const ONSITE_OPTS = [
  { value: "me-both", label: "I'll be there both places", sub: "Use my contact info" },
  { value: "me-pickup", label: "Me at pickup only", sub: "Drop-off is different" },
  { value: "me-dropoff", label: "Me at drop-off only", sub: "Pickup is different" },
  { value: "other", label: "Someone else meets the crew", sub: "We'll use my phone as backup" },
];

/** Hourly start times 7:00 AM – 5:00 PM. */
const MOVE_TIME_MIN = "07:00";
const MOVE_TIME_MAX = "17:00";
const TIME_OPTS = Array.from({ length: 11 }, (_, i) => {
  const h = 7 + i;
  const value = `${String(h).padStart(2, "0")}:00`;
  const label =
    h === 12 ? "12:00 PM" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
  return { value, label };
});

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
      "Sofa / couch", "Sectional", "Loveseat", "Recliner", "Coffee table",
      "End / side table", "TV (flat screen)", "TV stand / media console",
      "Bookshelf", "Entertainment center", "Floor lamp", "Area rug",
    ],
  },
  {
    room: "Bedroom",
    items: [
      "King bed (frame + mattress)", "Queen bed (frame + mattress)",
      "Full / double bed", "Twin bed", "Bunk bed", "Dresser", "Nightstand",
      "Wardrobe / armoire", "Chest of drawers", "Vanity",
      "Mirror (wall / freestanding)", "Desk (bedroom)",
    ],
  },
  {
    room: "Dining / kitchen",
    items: [
      "Dining table", "Dining chairs", "Bar stools", "China cabinet / hutch",
      "Sideboard / buffet", "Kitchen island (movable)", "Microwave (countertop)",
      "Small appliances box set",
    ],
  },
  {
    room: "Office / kids / other",
    items: [
      "Office desk", "Office chair", "Filing cabinet", "Bookcase",
      "Crib / toddler bed", "Changing table", "Toy chest", "Futon / daybed",
    ],
  },
  {
    room: "Outdoor / garage",
    items: [
      "Patio table", "Patio chairs", "Grill / BBQ", "Outdoor storage bin",
      "Lawn mower / tools", "Bike", "Workbench", "Shelving unit",
    ],
  },
  {
    room: "Boxes & misc",
    items: [
      "Small boxes", "Medium boxes", "Large boxes", "Wardrobe boxes",
      "Plastic bins", "Suitcases / bags", "Mirror / picture boxes", "Garment bags",
    ],
  },
];

const INVENTORY_PRESETS: { id: string; label: string; sub: string; counts: ItemCounts }[] = [
  {
    id: "studio",
    label: "Studio",
    sub: "Typical starter list",
    counts: {
      "Sofa / couch": 1, "Coffee table": 1, "TV (flat screen)": 1,
      "TV stand / media console": 1, "Queen bed (frame + mattress)": 1,
      "Dresser": 1, "Nightstand": 1, "Medium boxes": 15, "Large boxes": 5,
    },
  },
  {
    id: "1br",
    label: "1 bedroom",
    sub: "Typical starter list",
    counts: {
      "Sofa / couch": 1, "Coffee table": 1, "End / side table": 1,
      "TV (flat screen)": 1, "TV stand / media console": 1,
      "Queen bed (frame + mattress)": 1, "Dresser": 1, "Nightstand": 2,
      "Dining table": 1, "Dining chairs": 4, "Medium boxes": 20,
      "Large boxes": 8, "Wardrobe boxes": 2,
    },
  },
  {
    id: "2br",
    label: "2 bedroom",
    sub: "Typical starter list",
    counts: {
      "Sofa / couch": 1, "Loveseat": 1, "Coffee table": 1, "End / side table": 2,
      "TV (flat screen)": 1, "TV stand / media console": 1, "Bookshelf": 1,
      "Queen bed (frame + mattress)": 1, "Full / double bed": 1, "Dresser": 2,
      "Nightstand": 3, "Dining table": 1, "Dining chairs": 4,
      "Medium boxes": 30, "Large boxes": 12, "Wardrobe boxes": 3, "Plastic bins": 4,
    },
  },
  {
    id: "3br",
    label: "3+ bedroom",
    sub: "Typical starter list",
    counts: {
      "Sofa / couch": 1, "Sectional": 1, "Coffee table": 1, "End / side table": 2,
      "TV (flat screen)": 2, "TV stand / media console": 1, "Bookshelf": 2,
      "King bed (frame + mattress)": 1, "Queen bed (frame + mattress)": 1,
      "Twin bed": 1, "Dresser": 3, "Nightstand": 4, "Dining table": 1,
      "Dining chairs": 6, "Office desk": 1, "Office chair": 1,
      "Medium boxes": 40, "Large boxes": 15, "Wardrobe boxes": 4, "Plastic bins": 6,
    },
  },
];

const STORAGE_KEY = "toro_intake_draft_v4";
const AUTO_ADVANCE_MS = 200;

type Data = {
  name: string;
  phone: string;
  email: string;
  moveDate: string;
  moveTime: string;
  serviceType: string;
  fromAddress: string;
  fromUnit: string;
  fromHasUnit: Yn;
  fromHomeType: string;
  bedrooms: string;
  fromFloor: string;
  fromElevator: Yn;
  fromStairs: string;
  fromHoa: Yn;
  fromCoi: Yn;
  fromParking: string;
  fromLongCarry: Yn;
  toAddress: string;
  toUnit: string;
  toHasUnit: Yn;
  toHomeType: string;
  toFloor: string;
  toElevator: Yn;
  toStairs: string;
  toHoa: Yn;
  toCoi: Yn;
  toParking: string;
  toLongCarry: Yn;
  itemCounts: ItemCounts;
  invOther: string;
  appliances: string[];
  specialItems: string[];
  otherSpecial: string;
  packingStatus: string;
  needPackingHelp: Yn;
  svcDisassembly: Yn;
  svcStorage: Yn;
  svcStorageNotes: string;
  onSiteMode: string;
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
  fromHasUnit: "",
  fromHomeType: "",
  bedrooms: "",
  fromFloor: "",
  fromElevator: "",
  fromStairs: "",
  fromHoa: "",
  fromCoi: "",
  fromParking: "",
  fromLongCarry: "",
  toAddress: "",
  toUnit: "",
  toHasUnit: "",
  toHomeType: "",
  toFloor: "",
  toElevator: "",
  toStairs: "",
  toHoa: "",
  toCoi: "",
  toParking: "",
  toLongCarry: "",
  itemCounts: {},
  invOther: "",
  appliances: [],
  specialItems: [],
  otherSpecial: "",
  packingStatus: "",
  needPackingHelp: "",
  svcDisassembly: "",
  svcStorage: "",
  svcStorageNotes: "",
  onSiteMode: "",
  petsOnSite: "",
  kidsOnSite: "",
  specialInstructions: "",
};

const isMultiFloor = (t: string) => ["Apartment", "Townhome", "Office"].includes(t);
const hasHoa = (t: string) => ["Apartment", "Townhome"].includes(t);
const hasBedrooms = (t: string) => !["Office", "Storage unit"].includes(t);

/** One question per screen — order is filtered by answers. */
type StepKey =
  | "contact"
  | "date"
  | "time"
  | "service"
  | "fromAddress"
  | "fromUnit"
  | "fromHomeType"
  | "bedrooms"
  | "fromFloor"
  | "fromElevator"
  | "fromStairs"
  | "fromHoa"
  | "fromCoi"
  | "fromParking"
  | "fromLongCarry"
  | "toAddress"
  | "toUnit"
  | "toHomeType"
  | "toFloor"
  | "toElevator"
  | "toStairs"
  | "toHoa"
  | "toCoi"
  | "toParking"
  | "toLongCarry"
  | "inventory"
  | "appliances"
  | "special"
  | "packing"
  | "needPacking"
  | "disassembly"
  | "storage"
  | "storageDays"
  | "onSite"
  | "pets"
  | "kids"
  | "notes";

const ALL_STEPS: StepKey[] = [
  "contact", "date", "time", "service",
  "fromAddress", "fromUnit", "fromHomeType", "bedrooms",
  "fromFloor", "fromElevator", "fromStairs", "fromHoa", "fromCoi",
  "fromParking", "fromLongCarry",
  "toAddress", "toUnit", "toHomeType",
  "toFloor", "toElevator", "toStairs", "toHoa", "toCoi",
  "toParking", "toLongCarry",
  "inventory", "appliances", "special",
  "packing", "needPacking", "disassembly", "storage", "storageDays",
  "onSite", "pets", "kids", "notes",
];

const STEP_LABEL: Record<StepKey, string> = {
  contact: "Your contact info",
  date: "Move date",
  time: "Start time",
  service: "Type of help",
  fromAddress: "Pickup address",
  fromUnit: "Pickup unit",
  fromHomeType: "Pickup home type",
  bedrooms: "Bedrooms",
  fromFloor: "Pickup floor",
  fromElevator: "Pickup elevator",
  fromStairs: "Pickup stairs",
  fromHoa: "Pickup HOA notice",
  fromCoi: "Pickup COI",
  fromParking: "Pickup parking",
  fromLongCarry: "Pickup long carry",
  toAddress: "Drop-off address",
  toUnit: "Drop-off unit",
  toHomeType: "Drop-off home type",
  toFloor: "Drop-off floor",
  toElevator: "Drop-off elevator",
  toStairs: "Drop-off stairs",
  toHoa: "Drop-off HOA notice",
  toCoi: "Drop-off COI",
  toParking: "Drop-off parking",
  toLongCarry: "Drop-off long carry",
  inventory: "What you're moving",
  appliances: "Appliances",
  special: "Special items",
  packing: "Packing status",
  needPacking: "Packing help",
  disassembly: "Disassembly",
  storage: "Storage",
  storageDays: "Storage length",
  onSite: "Who meets the crew",
  pets: "Pets on site",
  kids: "Kids on site",
  notes: "Anything else",
};

function visibleSteps(d: Data): StepKey[] {
  return ALL_STEPS.filter((k) => {
    if (k === "bedrooms") return hasBedrooms(d.fromHomeType);
    if (k === "fromFloor" || k === "fromElevator") return isMultiFloor(d.fromHomeType);
    if (k === "fromStairs") {
      return isMultiFloor(d.fromHomeType) && d.fromElevator === "no" && d.fromFloor !== "Ground floor";
    }
    if (k === "fromHoa" || k === "fromCoi") return hasHoa(d.fromHomeType);
    if (k === "fromUnit") return true; // always ask yes/no then optional
    if (k === "toFloor" || k === "toElevator") return isMultiFloor(d.toHomeType);
    if (k === "toStairs") {
      return isMultiFloor(d.toHomeType) && d.toElevator === "no" && d.toFloor !== "Ground floor";
    }
    if (k === "toHoa" || k === "toCoi") return hasHoa(d.toHomeType);
    if (k === "needPacking") {
      return ["not-packed", "partially-packed", "mostly-packed"].includes(d.packingStatus);
    }
    if (k === "storageDays") return d.svcStorage === "yes";
    return true;
  });
}

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
    if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return `${date} at ${time}`;
    return new Date(y, m - 1, d, hh, mm).toLocaleString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return `${date} at ${time}`;
  }
}

function isAllowedMoveTime(time: string): boolean {
  if (!/^\d{1,2}:\d{2}$/.test(time.trim())) return false;
  return time >= MOVE_TIME_MIN && time <= MOVE_TIME_MAX;
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
  const [flash, setFlash] = useState(false);
  const [openRooms, setOpenRooms] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(INVENTORY_GROUPS.map((g, i) => [g.room, i < 2])),
  );
  const [mounted, setMounted] = useState(false);

  const advanceTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  // Track step index by key when conditional steps change.
  const stepKeyRef = useRef<StepKey>("contact");

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
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("toro_intake_draft_v3");
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

  const steps = visibleSteps(data);
  // Keep current question when list length changes.
  useEffect(() => {
    const idx = steps.indexOf(stepKeyRef.current);
    if (idx >= 0 && idx !== step) setStep(idx);
    else if (idx < 0) setStep((s) => Math.min(s, Math.max(0, steps.length - 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.join("|")]);

  const currentKey = steps[Math.min(step, steps.length - 1)] ?? "contact";
  stepKeyRef.current = currentKey;
  const totalSteps = steps.length;
  const isLast = step >= steps.length - 1;

  const isStepValid = (key: StepKey, d: Data = data): boolean => {
    switch (key) {
      case "contact":
        return !!(d.name.trim() && d.phone.trim() && d.email.trim());
      case "date":
        return !!d.moveDate.trim();
      case "time":
        return isAllowedMoveTime(d.moveTime);
      case "service":
        return !!d.serviceType;
      case "fromAddress":
        return !!d.fromAddress.trim();
      case "fromUnit":
        return d.fromHasUnit === "no" || (d.fromHasUnit === "yes" && !!d.fromUnit.trim());
      case "fromHomeType":
        return !!d.fromHomeType;
      case "bedrooms":
        return !!d.bedrooms;
      case "fromFloor":
        return !!d.fromFloor;
      case "fromElevator":
        return !!d.fromElevator;
      case "fromStairs":
        return !!d.fromStairs;
      case "fromHoa":
        return !!d.fromHoa;
      case "fromCoi":
        return !!d.fromCoi;
      case "fromParking":
        return !!d.fromParking;
      case "fromLongCarry":
        return !!d.fromLongCarry;
      case "toAddress":
        return !!d.toAddress.trim();
      case "toUnit":
        return d.toHasUnit === "no" || (d.toHasUnit === "yes" && !!d.toUnit.trim());
      case "toHomeType":
        return !!d.toHomeType;
      case "toFloor":
        return !!d.toFloor;
      case "toElevator":
        return !!d.toElevator;
      case "toStairs":
        return !!d.toStairs;
      case "toHoa":
        return !!d.toHoa;
      case "toCoi":
        return !!d.toCoi;
      case "toParking":
        return !!d.toParking;
      case "toLongCarry":
        return !!d.toLongCarry;
      case "inventory":
      case "appliances":
      case "special":
      case "notes":
        return true;
      case "packing":
        return !!d.packingStatus;
      case "needPacking":
        return !!d.needPackingHelp;
      case "disassembly":
        return !!d.svcDisassembly;
      case "storage":
        return !!d.svcStorage;
      case "storageDays":
        return !!d.svcStorageNotes;
      case "onSite":
        return !!d.onSiteMode;
      case "pets":
        return !!d.petsOnSite;
      case "kids":
        return !!d.kidsOnSite;
    }
  };

  // fromUnit: allow "no unit" without text
  const canAdvance = (() => {
    if (currentKey === "fromUnit") {
      if (data.fromHasUnit === "no") return true;
      if (data.fromHasUnit === "yes") return !!data.fromUnit.trim();
      return false;
    }
    if (currentKey === "toUnit") {
      if (data.toHasUnit === "no") return true;
      if (data.toHasUnit === "yes") return !!data.toUnit.trim();
      return false;
    }
    return isStepValid(currentKey);
  })();

  const goNext = useCallback(() => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 220);
    setStep((s) => Math.min(s + 1, steps.length - 1));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [steps.length]);

  // Reliable auto-advance: patch then advance within the updated visible step list.
  const pick = (patch: Partial<Data>, auto = true) => {
    setData((d) => {
      const nextData = { ...d, ...patch };
      if (auto) {
        if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
        advanceTimer.current = window.setTimeout(() => {
          setFlash(true);
          window.setTimeout(() => setFlash(false), 220);
          setStep((s) => {
            const list = visibleSteps(nextData);
            const cur = stepKeyRef.current;
            const idx = list.indexOf(cur);
            if (idx < 0) return Math.min(s + 1, Math.max(0, list.length - 1));
            return Math.min(idx + 1, list.length - 1);
          });
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, AUTO_ADVANCE_MS);
      }
      return nextData;
    });
  };

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const next = () => {
    if (!canAdvance) return;
    if (isLast) {
      void submit();
      return;
    }
    goNext();
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

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
    const cleaned: ItemCounts = {};
    for (const [k, v] of Object.entries(preset.counts)) {
      if (v > 0) cleaned[k] = v;
    }
    setData((d) => ({ ...d, itemCounts: cleaned }));
    setOpenRooms((rooms) => {
      const nextRooms = { ...rooms };
      for (const g of INVENTORY_GROUPS) {
        nextRooms[g.room] = g.items.some((i) => (cleaned[i] || 0) > 0);
      }
      return nextRooms;
    });
  };

  const toggleList = (field: "specialItems" | "appliances", opt: string) => {
    setData((d) => {
      const list = d[field];
      const on = list.includes(opt);
      return { ...d, [field]: on ? list.filter((x) => x !== opt) : [...list, opt] };
    });
  };

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
    const contacts = resolveOnSite(data);
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
            unit: data.fromHasUnit === "yes" ? data.fromUnit : "",
            homeType: data.fromHomeType,
            bedrooms: data.bedrooms,
            floor: data.fromFloor,
            elevator: data.fromElevator,
            stairsCount: data.fromStairs,
            parkingNotes: data.fromParking,
            gateCode: "",
            longCarry:
              data.fromLongCarry === "yes" ? true : data.fromLongCarry === "no" ? false : undefined,
            hoaNotice:
              data.fromHoa === "yes" ? true : data.fromHoa === "no" ? false : undefined,
            coiNeeded:
              data.fromCoi === "yes" ? true : data.fromCoi === "no" ? false : undefined,
            coiEmail: "",
            accessNotes: "",
          },
          destination: {
            address: data.toAddress,
            unit: data.toHasUnit === "yes" ? data.toUnit : "",
            homeType: data.toHomeType,
            floor: data.toFloor,
            elevator: data.toElevator,
            stairsCount: data.toStairs,
            parkingNotes: data.toParking,
            gateCode: "",
            longCarry:
              data.toLongCarry === "yes" ? true : data.toLongCarry === "no" ? false : undefined,
            hoaNotice:
              data.toHoa === "yes" ? true : data.toHoa === "no" ? false : undefined,
            coiNeeded:
              data.toCoi === "yes" ? true : data.toCoi === "no" ? false : undefined,
            coiEmail: "",
            accessNotes: "",
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
            disassemblyItems: "",
            storage: data.svcStorage === "yes",
            storageNotes: data.svcStorageNotes,
          },
          contacts: {
            ...contacts,
            altPhone: "",
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
    columns = 1,
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
  const today = mounted ? new Date().toISOString().slice(0, 10) : undefined;
  const hideContinue =
    // pure single-choice screens auto-advance — hide Continue to reduce noise
    ![
      "contact", "date", "fromAddress", "fromUnit", "toAddress", "toUnit",
      "inventory", "appliances", "special", "notes",
    ].includes(currentKey) && !isLast;

  // Clamp step if overshoot after auto-advance with changing list
  useEffect(() => {
    if (step > steps.length - 1) setStep(Math.max(0, steps.length - 1));
  }, [step, steps.length]);

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
        <span style={{ width: `${((step + 1) / Math.max(totalSteps, 1)) * 100}%` }} />
      </div>
      <div className="iwiz-stepbar">
        <div className="iwiz-step">{STEP_LABEL[currentKey]}</div>
      </div>

      <div className="iwiz-stepbody" key={currentKey}>

        {currentKey === "contact" && (
          <>
            <h2 className="iwiz-q">Who should we reach?</h2>
            <p className="iwiz-sub">We only ask you to type here.</p>
            <label className="iwiz-field"><span>Full name</span>
              <input autoFocus required value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="Maria Lopez" autoComplete="name" />
            </label>
            <label className="iwiz-field"><span>Phone</span>
              <input required type="tel" value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="(689) 555-0000" autoComplete="tel" />
            </label>
            <label className="iwiz-field"><span>Email</span>
              <input required type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
            </label>
          </>
        )}

        {currentKey === "date" && (
          <>
            <h2 className="iwiz-q">What day is the move?</h2>
            <p className="iwiz-sub">Pick the exact date.</p>
            <label className="iwiz-field"><span>Move date</span>
              <input
                autoFocus
                required
                type="date"
                {...(today ? { min: today } : {})}
                value={data.moveDate}
                onChange={(e) => update({ moveDate: e.target.value })}
              />
            </label>
          </>
        )}

        {currentKey === "time" && (
          <>
            <h2 className="iwiz-q">What time should we start?</h2>
            <p className="iwiz-sub">7:00 AM – 5:00 PM. Tap one.</p>
            <Pills
              options={TIME_OPTS}
              value={data.moveTime}
              onChange={(v) => pick({ moveTime: v })}
              columns={2}
            />
            {data.moveDate && isAllowedMoveTime(data.moveTime) && (
              <p className="iwiz-hint iwiz-schedule-confirm" role="status">
                <strong>{formatScheduleConfirm(data.moveDate, data.moveTime)}</strong>
              </p>
            )}
          </>
        )}

        {currentKey === "service" && (
          <>
            <h2 className="iwiz-q">What kind of help do you need?</h2>
            <p className="iwiz-sub">Tap one.</p>
            <Pills
              options={SERVICE_TYPES}
              value={data.serviceType}
              onChange={(v) => pick({ serviceType: v })}
              columns={1}
            />
          </>
        )}

        {currentKey === "fromAddress" && (
          <>
            <h2 className="iwiz-q">Where are we picking up?</h2>
            <p className="iwiz-sub">Start typing — pick the address from the list.</p>
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

        {currentKey === "fromUnit" && (
          <>
            <h2 className="iwiz-q">Is there an apt / unit number?</h2>
            <Pills
              options={[
                { value: "no", label: "No unit" },
                { value: "yes", label: "Yes" },
              ]}
              value={data.fromHasUnit}
              onChange={(v) => {
                if (v === "no") pick({ fromHasUnit: "no", fromUnit: "" });
                else update({ fromHasUnit: "yes" });
              }}
              columns={2}
            />
            {data.fromHasUnit === "yes" && (
              <label className="iwiz-field"><span>Unit / apt</span>
                <input
                  autoFocus
                  value={data.fromUnit}
                  onChange={(e) => update({ fromUnit: e.target.value })}
                  placeholder="Apt 204"
                  autoComplete="address-line2"
                />
              </label>
            )}
          </>
        )}

        {currentKey === "fromHomeType" && (
          <>
            <h2 className="iwiz-q">What kind of place is pickup?</h2>
            <Pills
              options={HOME_TYPES.map((h) => ({ value: h, label: h }))}
              value={data.fromHomeType}
              onChange={(v) => pick({ fromHomeType: v, bedrooms: hasBedrooms(v) ? data.bedrooms : "" })}
              columns={2}
            />
          </>
        )}

        {currentKey === "bedrooms" && (
          <>
            <h2 className="iwiz-q">How many bedrooms?</h2>
            <Pills
              options={BEDROOMS.map((b) => ({ value: b, label: b === "Studio" ? "Studio" : `${b} BR` }))}
              value={data.bedrooms}
              onChange={(v) => pick({ bedrooms: v })}
              columns={3}
            />
          </>
        )}

        {currentKey === "fromFloor" && (
          <>
            <h2 className="iwiz-q">Which floor at pickup?</h2>
            <Pills
              options={FLOORS.map((f) => ({ value: f, label: f }))}
              value={data.fromFloor}
              onChange={(v) => pick({ fromFloor: v })}
              columns={2}
            />
          </>
        )}

        {currentKey === "fromElevator" && (
          <>
            <h2 className="iwiz-q">Elevator at pickup?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.fromElevator}
              onChange={(v) => pick({ fromElevator: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "fromStairs" && (
          <>
            <h2 className="iwiz-q">How many stairs at pickup?</h2>
            <Pills
              options={STAIR_OPTS}
              value={data.fromStairs}
              onChange={(v) => pick({ fromStairs: v })}
              columns={1}
            />
          </>
        )}

        {currentKey === "fromHoa" && (
          <>
            <h2 className="iwiz-q">Is the HOA / building notified?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Not yet" }]}
              value={data.fromHoa}
              onChange={(v) => pick({ fromHoa: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "fromCoi" && (
          <>
            <h2 className="iwiz-q">Does pickup need a COI from us?</h2>
            <p className="iwiz-sub">Certificate of Insurance for the building.</p>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No / not sure" }]}
              value={data.fromCoi}
              onChange={(v) => pick({ fromCoi: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "fromParking" && (
          <>
            <h2 className="iwiz-q">Where can the truck park at pickup?</h2>
            <Pills
              options={PARKING_OPTS}
              value={data.fromParking}
              onChange={(v) => pick({ fromParking: v })}
              columns={2}
            />
          </>
        )}

        {currentKey === "fromLongCarry" && (
          <>
            <h2 className="iwiz-q">Long carry at pickup?</h2>
            <p className="iwiz-sub">Truck parks far from the door.</p>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.fromLongCarry}
              onChange={(v) => pick({ fromLongCarry: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "toAddress" && (
          <>
            <h2 className="iwiz-q">Where are we dropping off?</h2>
            <p className="iwiz-sub">Start typing — pick the address from the list.</p>
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

        {currentKey === "toUnit" && (
          <>
            <h2 className="iwiz-q">Drop-off apt / unit?</h2>
            <Pills
              options={[
                { value: "no", label: "No unit" },
                { value: "yes", label: "Yes" },
              ]}
              value={data.toHasUnit}
              onChange={(v) => {
                if (v === "no") pick({ toHasUnit: "no", toUnit: "" });
                else update({ toHasUnit: "yes" });
              }}
              columns={2}
            />
            {data.toHasUnit === "yes" && (
              <label className="iwiz-field"><span>Unit / apt</span>
                <input
                  autoFocus
                  value={data.toUnit}
                  onChange={(e) => update({ toUnit: e.target.value })}
                  placeholder="Apt 12"
                  autoComplete="address-line2"
                />
              </label>
            )}
          </>
        )}

        {currentKey === "toHomeType" && (
          <>
            <h2 className="iwiz-q">What kind of place is drop-off?</h2>
            {data.fromHomeType && (
              <button
                type="button"
                className="iwiz-quick"
                onClick={() => pick({ toHomeType: data.fromHomeType })}
              >
                Same as pickup ({data.fromHomeType})
              </button>
            )}
            <Pills
              options={HOME_TYPES.map((h) => ({ value: h, label: h }))}
              value={data.toHomeType}
              onChange={(v) => pick({ toHomeType: v })}
              columns={2}
            />
          </>
        )}

        {currentKey === "toFloor" && (
          <>
            <h2 className="iwiz-q">Which floor at drop-off?</h2>
            <Pills
              options={FLOORS.map((f) => ({ value: f, label: f }))}
              value={data.toFloor}
              onChange={(v) => pick({ toFloor: v })}
              columns={2}
            />
          </>
        )}

        {currentKey === "toElevator" && (
          <>
            <h2 className="iwiz-q">Elevator at drop-off?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.toElevator}
              onChange={(v) => pick({ toElevator: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "toStairs" && (
          <>
            <h2 className="iwiz-q">How many stairs at drop-off?</h2>
            <Pills
              options={STAIR_OPTS}
              value={data.toStairs}
              onChange={(v) => pick({ toStairs: v })}
              columns={1}
            />
          </>
        )}

        {currentKey === "toHoa" && (
          <>
            <h2 className="iwiz-q">Is the drop-off building notified?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Not yet" }]}
              value={data.toHoa}
              onChange={(v) => pick({ toHoa: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "toCoi" && (
          <>
            <h2 className="iwiz-q">Does drop-off need a COI from us?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No / not sure" }]}
              value={data.toCoi}
              onChange={(v) => pick({ toCoi: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "toParking" && (
          <>
            <h2 className="iwiz-q">Where can the truck park at drop-off?</h2>
            <Pills
              options={PARKING_OPTS}
              value={data.toParking}
              onChange={(v) => pick({ toParking: v })}
              columns={2}
            />
          </>
        )}

        {currentKey === "toLongCarry" && (
          <>
            <h2 className="iwiz-q">Long carry at drop-off?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.toLongCarry}
              onChange={(v) => pick({ toLongCarry: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "inventory" && (
          <>
            <h2 className="iwiz-q">What are you moving?</h2>
            <p className="iwiz-sub">
              Tap a starter size, then adjust with + / −.
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
                <button
                  type="button"
                  className="iwiz-preset iwiz-preset-clear"
                  onClick={() => { setActivePreset(null); update({ itemCounts: {} }); }}
                >
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
                              >
                                {item}
                              </button>
                              <div className="iwiz-qty" role="group" aria-label={`${item} quantity`}>
                                <button type="button" className="iwiz-qty-btn" onClick={() => setItemQty(item, qty - 1)} disabled={qty <= 0} aria-label={`Decrease ${item}`}>−</button>
                                <span className="iwiz-qty-val">{qty}</span>
                                <button type="button" className="iwiz-qty-btn" onClick={() => setItemQty(item, qty + 1)} aria-label={`Increase ${item}`}>+</button>
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
            <label className="iwiz-field"><span>Extra items not listed — optional</span>
              <textarea rows={2} value={data.invOther} onChange={(e) => update({ invOther: e.target.value })} placeholder="Kayak, custom shelves…" />
            </label>
          </>
        )}

        {currentKey === "appliances" && (
          <>
            <h2 className="iwiz-q">Any major appliances?</h2>
            <p className="iwiz-sub">Tap all that apply, then continue. Or skip.</p>
            <CheckGrid
              options={APPLIANCE_OPTS}
              selected={data.appliances}
              onToggle={(opt) => toggleList("appliances", opt)}
            />
          </>
        )}

        {currentKey === "special" && (
          <>
            <h2 className="iwiz-q">Any special / heavy items?</h2>
            <p className="iwiz-sub">Tap all that apply, then continue. Or skip.</p>
            <CheckGrid
              options={SPECIAL_OPTS}
              selected={data.specialItems}
              onToggle={(opt) => toggleList("specialItems", opt)}
            />
            <label className="iwiz-field"><span>Anything else special? — optional</span>
              <input value={data.otherSpecial} onChange={(e) => update({ otherSpecial: e.target.value })} placeholder="Custom table, vintage records…" />
            </label>
          </>
        )}

        {currentKey === "packing" && (
          <>
            <h2 className="iwiz-q">How packed will things be?</h2>
            <Pills
              options={PACKING_STATUS}
              value={data.packingStatus}
              onChange={(v) => pick({ packingStatus: v })}
              columns={1}
            />
          </>
        )}

        {currentKey === "needPacking" && (
          <>
            <h2 className="iwiz-q">Need packing help from us?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.needPackingHelp}
              onChange={(v) => pick({ needPackingHelp: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "disassembly" && (
          <>
            <h2 className="iwiz-q">Need disassembly / reassembly?</h2>
            <p className="iwiz-sub">Beds, wardrobes, big furniture.</p>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.svcDisassembly}
              onChange={(v) => pick({ svcDisassembly: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "storage" && (
          <>
            <h2 className="iwiz-q">Need storage between stops?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.svcStorage}
              onChange={(v) => pick({ svcStorage: v as Yn, svcStorageNotes: v === "no" ? "" : data.svcStorageNotes })}
              columns={2}
            />
          </>
        )}

        {currentKey === "storageDays" && (
          <>
            <h2 className="iwiz-q">About how long in storage?</h2>
            <Pills
              options={STORAGE_DURATION}
              value={data.svcStorageNotes}
              onChange={(v) => pick({ svcStorageNotes: v })}
              columns={1}
            />
          </>
        )}

        {currentKey === "onSite" && (
          <>
            <h2 className="iwiz-q">Who meets the crew?</h2>
            <p className="iwiz-sub">So we know who to call on arrival.</p>
            <Pills
              options={ONSITE_OPTS}
              value={data.onSiteMode}
              onChange={(v) => pick({ onSiteMode: v })}
              columns={1}
            />
          </>
        )}

        {currentKey === "pets" && (
          <>
            <h2 className="iwiz-q">Pets on site during the move?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.petsOnSite}
              onChange={(v) => pick({ petsOnSite: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "kids" && (
          <>
            <h2 className="iwiz-q">Kids on site during the move?</h2>
            <Pills
              options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
              value={data.kidsOnSite}
              onChange={(v) => pick({ kidsOnSite: v as Yn })}
              columns={2}
            />
          </>
        )}

        {currentKey === "notes" && (
          <>
            <h2 className="iwiz-q">Anything else we should know?</h2>
            <p className="iwiz-sub">Gate codes, quiet hours, access notes — optional.</p>
            <label className="iwiz-field"><span>Extra details</span>
              <textarea
                autoFocus
                rows={4}
                value={data.specialInstructions}
                onChange={(e) => update({ specialInstructions: e.target.value })}
                placeholder="Gate code, reserved elevator, narrow halls…"
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
        {(!hideContinue || isLast) && (
          <button type="submit" className="btn btn-primary" disabled={!canAdvance || submitting}>
            {submitting ? "…" : isLast ? "Send my move details" : "Continue"}
            <span className="arrow" aria-hidden />
          </button>
        )}
        {hideContinue && !isLast && (
          <p className="iwiz-fine" style={{ flex: 1, margin: 0, textAlign: "right" }}>Tap an option to continue</p>
        )}
      </div>

      {!hideContinue && (
        <p className="iwiz-fine">Your answers save automatically.</p>
      )}
    </form>
  );
}
