export const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Condo",
  "Storage unit",
  "Office/commercial",
  "Other",
] as const;

export const FLOORS = [
  "Ground floor",
  "Basement",
  "2nd floor",
  "3rd floor or higher",
] as const;

export const STAIR_FLIGHTS = [
  "1 flight",
  "2 flights",
  "3 or more flights",
  "Not sure",
] as const;

export const YES_NO = ["Yes", "No"] as const;
export const YES_NO_UNSURE = ["Yes", "No", "Not sure"] as const;

export const PARKING = [
  "Driveway",
  "Street parking",
  "Loading dock",
  "Parking garage",
  "I am not sure",
] as const;

export const CARRY = [
  "Less than 50 feet",
  "50–100 feet",
  "More than 100 feet",
  "Not sure",
] as const;

export const STOP_KIND = ["Picked up", "Dropped off", "Both"] as const;

export const CHANGE_OPTIONS = [
  "No changes",
  "I added items",
  "I removed items",
  "I need packing help",
  "I need an additional stop",
  "I have specialty or oversized items",
  "Other change",
] as const;

export const SPECIALTY_ITEMS = [
  "Piano",
  "Safe",
  "Pool table",
  "Treadmill or gym equipment",
  "Large sectional sofa",
  "Sleeper sofa",
  "Large refrigerator",
  "Washer/dryer",
  "Large TV",
  "Antique or high-value item",
  "Glass, marble, or stone furniture",
  "Aquarium",
  "Other specialty item",
] as const;

export const PACKING_READY = [
  "Yes",
  "No",
  "I need packing assistance",
  "Not sure yet",
] as const;

export const SERVICES = [
  "Packing",
  "Unpacking",
  "Furniture disassembly",
  "Furniture reassembly",
  "Storage pickup or delivery",
  "Junk removal/disposal",
  "Other service request",
] as const;

export const PHOTO_SLOTS = [
  "Parking area",
  "Stairs",
  "Elevator",
  "Entryway",
  "Narrow hallway",
  "Difficult access area",
] as const;

export const ACKS = [
  {
    id: "infoAccurate",
    label: "I confirm that my pickup and delivery information is accurate.",
  },
  {
    id: "accessDisclosed",
    label:
      "I have disclosed all stairs, elevators, parking restrictions, long carries, building requirements, and access limitations.",
  },
  {
    id: "inventoryDisclosed",
    label:
      "I have disclosed inventory changes, specialty items, additional stops, and requested services.",
  },
  {
    id: "costMayChange",
    label:
      "I understand that added items, additional stops, stairs, long carries, waiting time, parking limitations, building requirements, and additional services may affect the final move time and cost.",
  },
  {
    id: "willNotify",
    label:
      "I will notify Toro Movers immediately if any move details change before move day.",
  },
] as const;

export type AccessSite = {
  propertyType: string;
  floor: string;
  stairs: string;
  stairFlights: string;
  elevator: string;
  elevatorReserved: string;
  freightElevator: string;
  parking: string;
  carry: string;
  restrictions: string;
  restrictionNotes: string;
  coi: string;
  coiManagerName: string;
  coiManagerEmail: string;
  coiManagerPhone: string;
  photos: Record<string, UploadedRef[]>;
};

export type UploadedRef = {
  key: string;
  filename: string;
  contentType: string;
  size: number;
};

export type MoveChecklistPayload = {
  fullName: string;
  email: string;
  phone: string;
  moveDate: string;
  pickupAddress: string;
  pickupUnit: string;
  deliveryAddress: string;
  deliveryUnit: string;
  presentPickup: string;
  pickupContactName: string;
  pickupContactPhone: string;
  presentDelivery: string;
  deliveryContactName: string;
  deliveryContactPhone: string;
  additionalStop: string;
  extraStopAddress: string;
  extraStopKind: string;
  extraStopAccess: string;
  extraStopPhotos: UploadedRef[];
  pickup: AccessSite;
  delivery: AccessSite;
  changes: string[];
  changeNotes: string;
  changePhotos: UploadedRef[];
  specialtyItems: string[];
  specialtyDescription: string;
  specialtyPhotos: UploadedRef[];
  specialtyAccessConcern: string;
  specialtyAccessNotes: string;
  packingReady: string;
  services: string[];
  acks: Record<string, boolean>;
  typedName: string;
  hp: string;
  elapsedMs: number;
};

export function emptyAccess(): AccessSite {
  return {
    propertyType: "",
    floor: "",
    stairs: "",
    stairFlights: "",
    elevator: "",
    elevatorReserved: "",
    freightElevator: "",
    parking: "",
    carry: "",
    restrictions: "",
    restrictionNotes: "",
    coi: "",
    coiManagerName: "",
    coiManagerEmail: "",
    coiManagerPhone: "",
    photos: {},
  };
}

export function emptyPayload(): MoveChecklistPayload {
  return {
    fullName: "",
    email: "",
    phone: "",
    moveDate: "",
    pickupAddress: "",
    pickupUnit: "",
    deliveryAddress: "",
    deliveryUnit: "",
    presentPickup: "",
    pickupContactName: "",
    pickupContactPhone: "",
    presentDelivery: "",
    deliveryContactName: "",
    deliveryContactPhone: "",
    additionalStop: "",
    extraStopAddress: "",
    extraStopKind: "",
    extraStopAccess: "",
    extraStopPhotos: [],
    pickup: emptyAccess(),
    delivery: emptyAccess(),
    changes: [],
    changeNotes: "",
    changePhotos: [],
    specialtyItems: [],
    specialtyDescription: "",
    specialtyPhotos: [],
    specialtyAccessConcern: "",
    specialtyAccessNotes: "",
    packingReady: "",
    services: [],
    acks: Object.fromEntries(ACKS.map((a) => [a.id, false])),
    typedName: "",
    hp: "",
    elapsedMs: 0,
  };
}

export function needsReviewReasons(p: MoveChecklistPayload): string[] {
  const r: string[] = [];
  const sites: [string, AccessSite][] = [
    ["pickup", p.pickup],
    ["delivery", p.delivery],
  ];
  for (const [label, a] of sites) {
    if (a.stairs === "Yes") r.push(`Stairs at ${label}`);
    if (a.elevator === "Yes") r.push(`Elevator required at ${label}`);
    if (a.elevator === "Yes" && a.elevatorReserved !== "Yes") {
      r.push(`Elevator not reserved at ${label}`);
    }
    if (a.coi === "Yes" || a.coi === "Not sure") {
      r.push(`COI ${a.coi === "Yes" ? "required" : "unknown"} at ${label}`);
    }
    if (a.carry === "More than 100 feet") r.push(`Long carry at ${label}`);
    if (a.restrictions === "Yes") r.push(`Parking/access restrictions at ${label}`);
    if (a.parking === "I am not sure" || a.carry === "Not sure" || a.stairFlights === "Not sure") {
      r.push(`Unsure about access at ${label}`);
    }
  }
  if (p.additionalStop === "Yes") r.push("Additional stop");
  if (p.changes.some((c) => c && c !== "No changes")) r.push("Inventory changes");
  if (p.specialtyItems.length) r.push("Specialty item");
  if (
    p.packingReady === "No" ||
    p.packingReady === "I need packing assistance" ||
    p.packingReady === "Not sure yet"
  ) {
    r.push("Incomplete packing / packing help");
  }
  return [...new Set(r)];
}

export function validateStep(step: 1 | 2 | 3 | 4, p: MoveChecklistPayload): string | null {
  if (step === 1) {
    if (!p.fullName.trim()) return "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) return "Enter a valid email.";
    if (p.phone.replace(/\D/g, "").length < 10) return "Enter a valid mobile number.";
    if (!p.moveDate) return "Pick your scheduled move date.";
    if (p.pickupAddress.trim().length < 8) return "Pickup address is required.";
    if (p.deliveryAddress.trim().length < 8) return "Delivery address is required.";
    if (!p.presentPickup) return "Will you be present at pickup?";
    if (p.presentPickup === "No") {
      if (!p.pickupContactName.trim() || p.pickupContactPhone.replace(/\D/g, "").length < 10) {
        return "Pickup contact name and phone are required.";
      }
    }
    if (!p.presentDelivery) return "Will you be present at delivery?";
    if (p.presentDelivery === "No") {
      if (
        !p.deliveryContactName.trim() ||
        p.deliveryContactPhone.replace(/\D/g, "").length < 10
      ) {
        return "Delivery contact name and phone are required.";
      }
    }
    if (!p.additionalStop) return "Is there an additional stop?";
    if (p.additionalStop === "Yes") {
      if (p.extraStopAddress.trim().length < 8) return "Additional-stop address is required.";
      if (!p.extraStopKind) return "Say whether items are picked up or dropped off.";
    }
  }
  if (step === 2) return validateAccess("pickup", p.pickup);
  if (step === 3) return validateAccess("delivery", p.delivery);
  if (step === 4) {
    if (!p.changes.length) return "Tell us if anything changed since the quote.";
    if (p.changes.some((c) => c !== "No changes") && !p.changeNotes.trim()) {
      return "Please describe the change.";
    }
    if (p.specialtyItems.length) {
      if (!p.specialtyDescription.trim()) return "Describe the specialty item(s).";
      if (p.specialtyPhotos.length < 1) return "Upload 1–3 photos of the specialty item(s).";
      if (!p.specialtyAccessConcern) {
        return "Are there access concerns for the specialty item?";
      }
      if (p.specialtyAccessConcern === "Yes" && !p.specialtyAccessNotes.trim()) {
        return "Describe the specialty-item access concerns.";
      }
    }
    if (!p.packingReady) return "Will boxes be packed, sealed, and labeled?";
    for (const a of ACKS) {
      if (!p.acks[a.id]) return "Please check every acknowledgment.";
    }
    if (!p.typedName.trim()) return "Type your full name as acknowledgment.";
  }
  return null;
}

function validateAccess(label: string, a: AccessSite): string | null {
  if (!a.propertyType) return `Select the ${label} property type.`;
  if (!a.floor) return `Select the ${label} floor.`;
  if (!a.stairs) return `Are stairs required at ${label}?`;
  if (a.stairs === "Yes" && !a.stairFlights) return `How many flights at ${label}?`;
  if (!a.elevator) return `Is an elevator required at ${label}?`;
  if (a.elevator === "Yes") {
    if (!a.elevatorReserved) return `Has the ${label} elevator been reserved?`;
    if (!a.freightElevator) return `Is the ${label} elevator a freight elevator?`;
  }
  if (!a.parking) return `Select truck parking at ${label}.`;
  if (!a.carry) return `Select carry distance at ${label}.`;
  if (!a.restrictions) return `Any parking, gate, HOA, or access restrictions at ${label}?`;
  if (a.restrictions === "Yes" && !a.restrictionNotes.trim()) {
    return `Describe the ${label} access restrictions.`;
  }
  if (!a.coi) return `Does the ${label} building require a COI?`;
  if (a.coi === "Yes" || a.coi === "Not sure") {
    if (!a.coiManagerName.trim() || !a.coiManagerEmail.trim() || !a.coiManagerPhone.trim()) {
      return `Building/property manager name, email, and phone are required for ${label}.`;
    }
  }
  return null;
}
