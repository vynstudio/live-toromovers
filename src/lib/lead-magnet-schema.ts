import { z } from "zod";

// Lead-magnet capture (the Central Florida Moving Checklist funnel). Lighter
// than the quote BookingSchema — we only need enough to deliver the checklist
// and start nurture: name, email, optional phone, city, move type.

export const MoveType = z.enum(["apartment", "residential", "commercial"]);
export type MoveType = z.infer<typeof MoveType>;

export const MOVE_TYPE_LABEL: Record<MoveType, string> = {
  apartment: "Apartment move",
  residential: "Residential / house move",
  commercial: "Commercial / office move",
};

// Cities we actively serve (mirrors lib/cities.ts) — drives the LP dropdown and
// keeps the captured city clean for HubSpot segmentation. "Other" lets people
// outside the named list still convert.
export const SERVICE_CITY_OPTIONS = [
  "Orlando",
  "Winter Park",
  "Lake Mary",
  "Kissimmee",
  "Sanford",
  "Clermont",
  "Oviedo",
  "Winter Garden",
  "Altamonte Springs",
  "Apopka",
  "St. Cloud",
  "Windermere",
  "Maitland",
  "Davenport",
  "Other Central Florida city",
] as const;

export const LeadMagnetSchema = z.object({
  firstName: z.string().min(1).max(80),
  email: z.string().email(),
  // Phone is optional on this funnel (lower friction than the quote form). When
  // present we validate loosely and let the SMS opt-in decide if we text them.
  phone: z.string().min(7).max(25).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  moveType: MoveType,
  // Optional target move date (ISO yyyy-mm-dd from a native date input) — helps
  // us prioritize and time the follow-up. Empty string allowed.
  moveDate: z.string().max(40).optional().or(z.literal("")),
  // Customer asked to also receive the checklist by SMS (only honored if a
  // phone was given).
  smsOptIn: z.boolean().optional().default(false),
  // Marketing attribution (UTMs / click ids) — informational only.
  source: z.string().max(500).optional(),
  // Structured first-touch UTMs, so n8n can map them to HubSpot properties.
  utm: z.record(z.string(), z.string()).optional(),
  // Landing page the lead came in on (for HubSpot landing_page field).
  landingPage: z.string().max(120).optional(),
  // Page language at submit — drives follow-up message language.
  lang: z.enum(["en", "es"]).optional(),
  // Shared id so the browser Pixel Lead and the server CAPI Lead deduplicate.
  eventId: z.string().max(100).optional(),
  // Anti-spam (mirrors /api/booking): honeypot + time-to-submit.
  hp: z.string().optional(),
  elapsedMs: z.number().optional(),
});
export type LeadMagnetInput = z.infer<typeof LeadMagnetSchema>;
