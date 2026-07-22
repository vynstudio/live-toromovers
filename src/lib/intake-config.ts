// ===========================================================================
// Toro Movers — UNIFIED INTAKE CONTRACT (single source of truth)
// ---------------------------------------------------------------------------
// Both entry points — the homepage lead form (/quote) and the paid-traffic ad
// funnel (/get-quote) — render the SAME engine (<IntakeWizard/>) from this
// config and submit the SAME payload through the SAME stable route
// (/api/ad-funnel → HubSpot "Mudanzas" + Telegram + SMS + Resend + Meta CAPI).
//
// To rename / remap a CRM field, edit ONLY `mapIntakeToCrm` below — the form,
// the steps and the engine never need to change. That is the "CRM mapping
// layer" decoupling the unified payload from the route's field names.
// ===========================================================================

export type Lang = "en" | "es";
export type ServiceType = "labor_only" | "labor_with_truck";
export type JobType =
  | "apartment"
  | "house"
  | "storage"
  | "load_uhaul"
  | "unload_uhaul"
  | "load_unload_uhaul"
  | "load_pod"
  | "unload_pod"
  | "load_unload_pod";

/** The unified payload the wizard holds and emits. Identical for both entry
 *  points. Attribution fields are carried from the URL, never typed. */
export type IntakeData = {
  language: Lang;
  service_type: ServiceType | "";
  job_type: JobType | "";
  from_zip: string;
  to_location: string;
  full_name: string;
  phone: string;
  email: string;
  // Attribution (captured from URL + first-touch, not asked):
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  fbclid?: string;
  // Context / dedup:
  entry?: "home" | "ad";
  submitted_at?: string;
  event_id?: string;
};

export const EMPTY_INTAKE: IntakeData = {
  language: "en",
  service_type: "",
  job_type: "",
  from_zip: "",
  to_location: "",
  full_name: "",
  phone: "",
  email: "",
};

type T = Record<Lang, string>;
type Opt<V extends string> = { value: V; label: T };

export const LANG_OPTIONS: Opt<Lang>[] = [
  { value: "en", label: { en: "English", es: "English" } },
  { value: "es", label: { en: "Español", es: "Español" } },
];

export const SERVICE_OPTIONS: Opt<ServiceType>[] = [
  {
    value: "labor_with_truck",
    label: {
      en: "Full-service moving — with truck",
      es: "Mudanza completa — con Truck",
    },
  },
  {
    value: "labor_only",
    label: {
      en: "Labor-only moving — no truck",
      es: "Mudanza solo mano de obra — sin Truck",
    },
  },
];

// Job/size options branch on service type (labor-only adds the U-Haul/POD jobs).
export const JOB_OPTIONS: Record<ServiceType, Opt<JobType>[]> = {
  labor_with_truck: [
    { value: "apartment", label: { en: "Apartment", es: "Apartamento" } },
    { value: "house", label: { en: "House", es: "Casa" } },
    { value: "storage", label: { en: "Storage unit", es: "Bodega / Storage" } },
  ],
  labor_only: [
    { value: "apartment", label: { en: "Apartment", es: "Apartamento" } },
    { value: "house", label: { en: "House", es: "Casa" } },
    { value: "storage", label: { en: "Storage unit", es: "Bodega / Storage" } },
    {
      value: "load_unload_uhaul",
      label: { en: "Load + Unload U-Haul", es: "Cargar + Descargar U-Haul" },
    },
    { value: "load_uhaul", label: { en: "Load U-Haul", es: "Cargar U-Haul" } },
    {
      value: "unload_uhaul",
      label: { en: "Unload U-Haul", es: "Descargar U-Haul" },
    },
    {
      value: "load_unload_pod",
      label: { en: "Load + Unload POD", es: "Cargar + Descargar POD" },
    },
    { value: "load_pod", label: { en: "Load POD", es: "Cargar POD" } },
    { value: "unload_pod", label: { en: "Unload POD", es: "Descargar POD" } },
  ],
};

export const JOB_LABEL: Record<JobType, T> = {
  apartment: { en: "Apartment", es: "Apartamento" },
  house: { en: "House", es: "Casa" },
  storage: { en: "Storage unit", es: "Bodega / Storage" },
  load_uhaul: { en: "Load U-Haul", es: "Cargar U-Haul" },
  unload_uhaul: { en: "Unload U-Haul", es: "Descargar U-Haul" },
  load_unload_uhaul: { en: "Load + Unload U-Haul", es: "Cargar + Descargar U-Haul" },
  load_pod: { en: "Load POD", es: "Cargar POD" },
  unload_pod: { en: "Unload POD", es: "Descargar POD" },
  load_unload_pod: { en: "Load + Unload POD", es: "Cargar + Descargar POD" },
};

// Single-location jobs (load-only / unload-only of a container) → skip the
// destination step to keep the wizard under ~30s.
export const SINGLE_LOCATION_JOBS: JobType[] = [
  "load_uhaul",
  "unload_uhaul",
  "load_pod",
  "unload_pod",
];

export const SERVICE_LABEL: Record<ServiceType, T> = {
  labor_only: { en: "Labor only", es: "Solo mano de obra" },
  labor_with_truck: { en: "Labor + Truck", es: "Mano de obra + Camión" },
};

// Bilingual UI copy.
export const COPY = {
  langQ: { en: "Choose your language", es: "Elige tu idioma" },
  serviceQ: {
    en: "What kind of moving service?",
    es: "¿Qué tipo de servicio de mudanza?",
  },
  jobQ: { en: "What are we moving?", es: "¿Qué vamos a mover?" },
  fromQ: { en: "Moving from — ZIP code", es: "Mudanza desde — código ZIP" },
  toQ: { en: "Moving to — ZIP or city", es: "Mudanza hacia — ZIP o ciudad" },
  nameQ: { en: "Your full name", es: "Tu nombre completo" },
  phoneQ: { en: "Best phone number", es: "Mejor número de teléfono" },
  emailQ: { en: "Your email", es: "Tu correo electrónico" },
  fromPh: { en: "e.g. 32801", es: "ej. 32801" },
  toPh: { en: "e.g. 32789 or Winter Park", es: "ej. 32789 o Winter Park" },
  namePh: { en: "First and last name", es: "Nombre y apellido" },
  phonePh: { en: "(689) 600-2720", es: "(689) 600-2720" },
  emailPh: { en: "you@email.com", es: "tu@correo.com" },
  back: { en: "Back", es: "Atrás" },
  continue: { en: "Continue", es: "Continuar" },
  submit: { en: "Get my quote", es: "Ver mi precio" },
  sending: { en: "Sending…", es: "Enviando…" },
  badZip: { en: "Enter a 5-digit ZIP", es: "Ingresa un ZIP de 5 dígitos" },
  badTo: { en: "Add a ZIP or city", es: "Agrega un ZIP o ciudad" },
  badName: { en: "Enter your name", es: "Ingresa tu nombre" },
  badPhone: { en: "Enter a valid phone", es: "Ingresa un teléfono válido" },
  badEmail: { en: "Enter a valid email", es: "Ingresa un correo válido" },
  doneTitle: { en: "You're all set!", es: "¡Listo!" },
  doneBody: {
    en: "A team member will contact you in a couple minutes with your quote.",
    es: "Un miembro del equipo te contactará en un par de minutos con tu cotización.",
  },
  trust: {
    en: "★ 4.9 Google · Family-owned · No hidden fees",
    es: "★ 4.9 Google · Familiar · Sin costos ocultos",
  },
  stepOf: { en: "Step", es: "Paso" },
  stepOfMid: { en: "of", es: "de" },
  phoneHint: {
    en: "We'll only use this to confirm your quote and scheduling — no spam.",
    es: "Solo lo usamos para confirmar tu cotización y agenda — sin spam.",
  },
  emailHint: {
    en: "Your quote and next steps land here. No spam, ever.",
    es: "Tu cotización y los próximos pasos llegan aquí. Sin spam.",
  },
  panelKicker: { en: "Why Toro Movers", es: "Por qué Toro Movers" },
  panelHeadline: {
    en: "Fast, accurate moving quotes from a local team you can trust.",
    es: "Cotizaciones rápidas y precisas de un equipo local de confianza.",
  },
  panelBullets: {
    en: [
      "Local Central Florida movers",
      "Upfront pricing — no hidden fees",
      "4.9★ rated, family-owned",
      "We call you fast to confirm details",
    ],
    es: [
      "Mudanceros locales en Florida Central",
      "Precios claros — sin costos ocultos",
      "Calificación 4.9★, empresa familiar",
      "Te llamamos rápido para confirmar detalles",
    ],
  },
  nextTitle: { en: "What happens next", es: "Qué sigue" },
  nextSteps: {
    en: [
      "Enter your contact details",
      "Confirm your move info",
      "Get your quote & next steps",
    ],
    es: [
      "Ingresa tus datos de contacto",
      "Confirma los datos de tu mudanza",
      "Recibe tu precio y los siguientes pasos",
    ],
  },
  reviewQuote: {
    en: "“On time, professional, and careful with everything. Made my move completely stress-free.”",
    es: "“Puntuales, profesionales y cuidadosos con todo. Hicieron mi mudanza sin estrés.”",
  },
  reviewAuthor: { en: "Stael G. · Google review", es: "Stael G. · reseña de Google" },
  ratingLine: {
    en: "4.9 ★ on Google · 100+ Central Florida moves",
    es: "4.9 ★ en Google · 100+ mudanzas en Florida Central",
  },
} as const;

// ---------------------------------------------------------------------------
// CRM MAPPING LAYER — the ONLY place that knows the route's field names.
// Maps the unified IntakeData → the existing /api/ad-funnel payload shape, so
// every lead (home or ad) lands identically in HubSpot/Telegram/CAPI. Change
// the right-hand side here to remap to a different CRM field without touching
// the form or the engine.
// ---------------------------------------------------------------------------
const SERVICE_TO_FUNNEL: Record<ServiceType, string> = {
  labor_only: "labor-only",
  labor_with_truck: "labor-truck",
};

export function mapIntakeToCrm(d: IntakeData): Record<string, string> {
  const jobLabelEn = d.job_type ? JOB_LABEL[d.job_type].en : "";
  const out: Record<string, string> = {
    // identity
    name: d.full_name,
    email: d.email,
    phone: d.phone,
    // route + locations
    pickup: d.from_zip,
    dropoff: d.to_location,
    city: d.from_zip,
    // service + job (route prints these as "Service" / "Home/job")
    servicetype: d.service_type ? SERVICE_TO_FUNNEL[d.service_type] : "",
    hometype: jobLabelEn,
    language: d.language,
    notes: jobLabelEn ? `Job: ${jobLabelEn}` : "",
    consent: "yes",
    // attribution — same param names, passed straight through
    utm_source: d.utm_source || "",
    utm_medium: d.utm_medium || "",
    utm_campaign: d.utm_campaign || "",
    utm_term: d.utm_term || "",
    utm_content: d.utm_content || "",
    campaign_id: d.campaign_id || "",
    adset_id: d.adset_id || "",
    ad_id: d.ad_id || "",
    fbclid: d.fbclid || "",
    // context + dedup
    submitted_at: d.submitted_at || "",
    eventId: d.event_id || "",
    entry: d.entry || "",
  };
  return out;
}

// ---------------------------------------------------------------------------
// Attribution capture (first-touch). Mirrors the prior funnel: read UTM/click
// ids from the URL, persist in localStorage so they survive navigation, and
// return them to merge into IntakeData. Never overwrites a stored paid touch.
// ---------------------------------------------------------------------------
const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "campaign_id",
  "adset_id",
  "ad_id",
  "fbclid",
] as const;
const ATTR_STORE = "toro_intake_attr_v1";

export function captureAttribution(): Partial<IntakeData> {
  if (typeof window === "undefined") return {};
  try {
    const qs = new URLSearchParams(window.location.search);
    let stored: Record<string, string> = {};
    try {
      stored = JSON.parse(localStorage.getItem(ATTR_STORE) || "{}");
    } catch {
      stored = {};
    }
    const out: Record<string, string> = {};
    for (const k of ATTR_KEYS) {
      const v = qs.get(k) || stored[k] || "";
      if (v) out[k] = v;
    }
    if (Object.keys(out).length) {
      try {
        localStorage.setItem(ATTR_STORE, JSON.stringify(out));
      } catch {
        /* storage blocked — ignore */
      }
    }
    return out as Partial<IntakeData>;
  } catch {
    return {};
  }
}

/** Service preset from ?servicetype= on ad URLs (labor-only / full-service /
 *  labor-truck …) → the unified service_type, so ads still pre-select. */
export function serviceFromUrl(): ServiceType | "" {
  if (typeof window === "undefined") return "";
  const v = (new URLSearchParams(window.location.search).get("servicetype") || "")
    .toLowerCase();
  if (v === "labor-only" || v === "labor") return "labor_only";
  if (v === "labor-truck" || v === "full-service" || v === "full")
    return "labor_with_truck";
  return "";
}
