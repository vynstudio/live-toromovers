import { z } from "zod";

// Shared schema for the two high-intent lead funnels (labor-only + full-service).
// One step-form component and one API route serve both; the `funnel` field
// drives HubSpot routing, CAPI content_name, and the nurture sequence.

export const FunnelType = z.enum(["labor", "full-service"]);
export type FunnelType = z.infer<typeof FunnelType>;

export const FUNNEL_LABEL: Record<FunnelType, string> = {
  labor: "Labor-only move",
  "full-service": "Full-service move",
};

// Labor step-3 options ("What do you need?")
export const LABOR_HELP_OPTIONS = [
  "Loading help",
  "Unloading help",
  "Both",
  "Stairs help",
] as const;

// Full-service step-3 property types
export const PROPERTY_TYPE_OPTIONS = ["Apartment", "House", "Office"] as const;

// Move-date quick chips (a specific date can also be picked)
export const MOVE_DATE_CHIPS = ["This week", "This month", "Just exploring"] as const;

export const FunnelLeadSchema = z.object({
  funnel: FunnelType,
  firstName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(25),
  // A chip label ("This week") or an ISO date — either satisfies it.
  moveDate: z.string().min(1).max(40),
  city: z.string().min(2).max(80),
  // Labor: which help (multi). Full-service: property type.
  helpNeeded: z.array(z.string().max(40)).max(6).optional().default([]),
  propertyType: z.string().max(40).optional().or(z.literal("")),
  packingHelp: z.boolean().optional().default(false), // legacy; always false
  // TCPA consent for the SMS nurture sequence.
  smsConsent: z.boolean().optional().default(false),
  // Attribution + page context for HubSpot.
  source: z.string().max(500).optional(),
  landingPage: z.string().max(120).optional(),
  // Structured first-touch UTMs (utm_source/medium/campaign/content/…), so n8n
  // can map them to HubSpot properties. Mirrors `source` in structured form.
  utm: z.record(z.string(), z.string()).optional(),
  lang: z.enum(["en", "es"]).optional(),
  // Shared id so the browser Pixel Lead and the server CAPI Lead deduplicate.
  eventId: z.string().max(100).optional(),
  // Anti-spam (mirrors /api/booking): honeypot + time-to-submit.
  hp: z.string().optional(),
  elapsedMs: z.number().optional(),
});
export type FunnelLeadInput = z.infer<typeof FunnelLeadSchema>;
