// Toro Movers — centralized business details.
// Keep raw values OUT of components; pull from here.

export const BUSINESS_NAME = "Toro Movers";
export const LEGAL_NAME = "Toro Movers LLC";
export const SLOGAN = "Moving People Forward";

export const PHONE_DISPLAY = "(689) 600-2720";
export const PHONE_TEL = "tel:+16896002720";

export const EMAIL = "hello@toromovers.net";
export const EMAIL_HREF = "mailto:hello@toromovers.net";

export const HOURS_LABEL = "Mon–Sat · 7:00 AM – 7:00 PM";
export const HOURS_LABEL_ES = "Lun–Sáb · 7:00 AM – 7:00 PM";
export const HOURS_NOTE = "Sunday on request";
export const HOURS_NOTE_ES = "Domingos bajo solicitud";

export const GOOGLE_RATING = "4.9";
export const GOOGLE_RATING_LABEL = "on Google";
export const MOVES_DONE = "100+";

// Real Google review total — used in the homepage AggregateRating schema (not
// shown visibly on the site). Owner-confirmed from Google Business Profile.
// Update if the real count changes.
export const REVIEW_COUNT = "36";

// schema.org `sameAs` — profile URLs that unambiguously identify Toro Movers,
// so Google reconciles this site with the same business entity across the web
// (strengthens the local/citation signal). Only add REAL, resolvable profile
// URLs here — a wrong URL hurts. Facebook page is the live ad-account page.
// Google Business Profile (Maps place URL) added — the stable CID is encoded as
// ...!1s0x…:0xef948707b4ba0a80; tracking params (?entry/g_ep) trimmed off so the
// URL doesn't rot. TODO (owner): add Instagram + Yelp/BBB once those listings exist.
export const SOCIAL_PROFILES = [
  "https://www.facebook.com/722514634274519",
  "https://www.google.com/maps/place/Toro+Movers/@27.5242113,-82.9347487,8z/data=!4m10!1m2!2m1!1storo+movers!3m6!1s0xaab4eea8998e0b43:0xef948707b4ba0a80!8m2!3d28.5187116!4d-81.5872639!15sCgt0b3JvIG1vdmVyc1oNIgt0b3JvIG1vdmVyc5IBDm1vdmluZ19jb21wYW554AEA!16s%2Fg%2F11xmqc_lk7",
];

export const SERVICE_BASE_CITY = "Orlando, FL";
// Schema address — real business base. Owner-confirmed public ZIP; no public
// street address exists, so streetAddress is intentionally omitted.
export const SERVICE_BASE_LOCALITY = "Orlando";
export const POSTAL_CODE = "32789";
export const SERVICE_REGION = "Central Florida";
