/** Admin-editable quote form copy and options. No licensing/insurance claims. */

export const QUOTE_FORM_VERSION = "2026-08-20.a";
export const QUOTE_FORM_NAME = "universal_quote";

/**
 * Must never appear in quote UI, API payloads, HubSpot, Telegram, Resend,
 * OpenPhone/SMS, Meta events, thank-you, or related copy.
 * Toro Movers is not licensed or insured.
 */
export const CLAIMS_FORBIDDEN = [
  "licensed",
  "insured",
  "bonded",
  "certified",
  "authorized",
  "registered",
  "dot-approved",
  "dot approved",
  "fmcsa-approved",
  "fmcsa approved",
  "fully protected",
  "fully covered",
  "cargo protection",
  "guaranteed protection",
  "moving insurance",
  "insurance included",
] as const;

export const QUOTE_COPY = {
  trustLine: "Ready to help you plan your move.",
  headline: "Request a Moving Quote",
  subheadline:
    "Tell us where and when you’re moving. A Toro Movers team member will contact you shortly.",
  trustPoints: [
    "Free, no-obligation request",
    "Fast response from our team",
    "Flexible scheduling options",
    "Clear communication",
  ],
  primaryCta: "Request My Quote",
  sendingCta: "Sending Request…",
  consentContact:
    "I agree that Toro Movers may contact me about my request by phone, email, or text message.",
  consentMarketing:
    "Yes, send me updates, promotions, and moving tips from Toro Movers.",
  consentVersion: "2026-08-20.1",
} as const;

/**
 * Step 2 “type of help” list. Toggle `enabled` or change `label` / `order`
 * without rewriting the form. Owner-approved 2026-08-20.
 * Claims-safe labels only — no licensed/insured language.
 */
export const REQUEST_TYPES = [
  { id: "moving_help", label: "Moving help", enabled: true, order: 1 },
  { id: "local_move", label: "Local move", enabled: true, order: 2 },
  { id: "long_distance", label: "Long-distance move", enabled: true, order: 3 },
  { id: "apartment_move", label: "Apartment move", enabled: true, order: 4 },
  { id: "commercial_move", label: "Commercial move", enabled: true, order: 5 },
  { id: "packing_help", label: "Packing help", enabled: true, order: 6 },
  { id: "storage", label: "Storage", enabled: true, order: 7 },
  { id: "other", label: "Other", enabled: true, order: 8 },
  { id: "not_sure", label: "Not sure yet", enabled: true, order: 9 },
] as const;

export const MOVE_SIZES = [
  { id: "studio", label: "Studio" },
  { id: "1br", label: "1 bedroom" },
  { id: "2br", label: "2 bedrooms" },
  { id: "3br", label: "3 bedrooms" },
  { id: "4br", label: "4+ bedrooms" },
  { id: "office", label: "Office / commercial" },
  { id: "storage", label: "Storage unit" },
  { id: "other", label: "Other" },
  { id: "not_sure", label: "Not sure" },
] as const;

export const DATE_FLEX = [
  { id: "exact", label: "I have an exact date" },
  { id: "flexible", label: "My date is flexible" },
  { id: "unknown", label: "I do not know my date yet" },
] as const;

export const CONTACT_METHODS = [
  { id: "call", label: "Phone call" },
  { id: "text", label: "Text message" },
  { id: "email", label: "Email" },
] as const;

export const PROPERTY_TYPES = [
  { id: "house", label: "House" },
  { id: "apartment", label: "Apartment / condo" },
  { id: "townhouse", label: "Townhouse" },
  { id: "office", label: "Office" },
  { id: "storage", label: "Storage unit" },
  { id: "other", label: "Other" },
  { id: "not_sure", label: "Not sure" },
] as const;

export const ACCESS_TYPES = [
  { id: "ground", label: "Ground floor" },
  { id: "stairs", label: "Stairs" },
  { id: "elevator", label: "Elevator" },
  { id: "not_sure", label: "Not sure" },
] as const;

export const YES_NO_UNSURE = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "not_sure", label: "Not sure" },
] as const;

export const SPECIAL_ITEMS = [
  { id: "piano", label: "Piano" },
  { id: "safe", label: "Safe" },
  { id: "large_furniture", label: "Large furniture" },
  { id: "artwork", label: "Artwork / antiques" },
  { id: "gym", label: "Gym equipment" },
  { id: "appliances", label: "Appliances" },
  { id: "other", label: "Other" },
] as const;
