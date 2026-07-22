// Instant price bands shown after lead capture — ranges from real hourly rates
// in pricing.ts. Not a formal quote; used to reduce "black box" anxiety.

import { PRICING } from "./pricing";

export type ServiceKind = "full-service" | "labor" | "not-sure";
export type HomeSize = "studio-1br" | "2br" | "3br+" | "office" | "";

export type PriceBand = {
  hourly: number;
  minHours: number;
  typicalHours: string;
  rangeLabel: string;
  crewNote: string;
  caveats: string;
};

const FS = PRICING.fullService;
const LO = PRICING.laborOnly;

/** Typical hour ranges by home size (full-service, 2 movers + truck). */
const FS_HOURS: Record<Exclude<HomeSize, "">, [number, number]> = {
  "studio-1br": [3, 5],
  "2br": [4, 7],
  "3br+": [6, 10],
  office: [3, 6],
};

/** Typical hour ranges for labor-only (2 movers, customer truck). */
const LO_HOURS: Record<Exclude<HomeSize, "">, [number, number]> = {
  "studio-1br": [2, 3],
  "2br": [2, 4],
  "3br+": [3, 6],
  office: [2, 4],
};

function money(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function estimateBand(
  service: ServiceKind,
  size: HomeSize,
): PriceBand {
  const isLabor = service === "labor";
  const hourly = isLabor ? LO.baseRate : FS.baseRate;
  const minHours = isLabor ? LO.minimumHours : FS.minimumHours;
  const sizeKey = size || "2br";
  const [loH, hiH] = (isLabor ? LO_HOURS : FS_HOURS)[sizeKey as Exclude<HomeSize, "">] ??
    (isLabor ? [2, 4] : [4, 7]);
  const low = hourly * Math.max(loH, minHours);
  const high = hourly * hiH;

  return {
    hourly,
    minHours,
    typicalHours: `${loH}–${hiH} hrs`,
    rangeLabel: `${money(low)}–${money(high)}`,
    crewNote: isLabor
      ? `2 movers · $${hourly}/hr · ${minHours}-hr min · you bring the truck`
      : `2 movers + truck · $${hourly}/hr · ${minHours}-hr min · wrap & assembly included`,
    caveats:
      "Ballpark only — exact price confirmed on a quick call. No fuel, stair, or weekend surcharges.",
  };
}

export const HOME_SIZE_LABELS: Record<Exclude<HomeSize, "">, string> = {
  "studio-1br": "Studio / 1BR",
  "2br": "2 bedrooms",
  "3br+": "3+ bedrooms",
  office: "Office / storage",
};

export const SERVICE_LABELS: Record<ServiceKind, string> = {
  "full-service": "Full-service (truck + crew)",
  labor: "Labor-only (you have a truck)",
  "not-sure": "Not sure yet",
};
