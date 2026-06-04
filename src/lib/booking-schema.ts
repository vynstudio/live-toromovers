import { z } from "zod";

// Quote-request flow (NOT a deposit booking — movers quote first, charge later)
export const HelpType = z.enum(["labor", "labor-truck", "hauling"]);
export type HelpType = z.infer<typeof HelpType>;

export const MoveSize = z.enum([
  "studio",
  "one-br",
  "two-br",
  "three-br",
  "four-plus",
  "office",
  "partial",
]);
export type MoveSize = z.infer<typeof MoveSize>;

// Residence type at each endpoint — affects access / stairs / pricing
export const ResidenceType = z.enum([
  "house",
  "apartment",
  "townhome",
  "storage",
]);
export type ResidenceType = z.infer<typeof ResidenceType>;

// Floor only relevant for apartments — captured as a chip selection
export const ApartmentFloor = z.enum(["1", "2", "3", "4", "5+"]);
export type ApartmentFloor = z.infer<typeof ApartmentFloor>;

export const QuoteSchema = z.object({
  helpType: HelpType,

  // FROM
  fromAddress: z.string().min(2),
  fromResidence: ResidenceType.optional(),
  fromFloor: ApartmentFloor.optional(),

  // TO
  toAddress: z.string().min(2),
  toResidence: ResidenceType.optional(),
  toFloor: ApartmentFloor.optional(),

  // Size kept optional for backward-compat with /api/booking; no longer
  // asked in the form because the residence type + special items already
  // give us what we need to quote.
  size: MoveSize.optional(),
  date: z.string().min(1).optional(),
  specialItems: z.string().max(500).optional().default(""),
  firstName: z.string().min(1),
  lastName: z.string().optional().default(""),
  email: z.string().email(),
  phone: z.string().min(7),
  // Marketing attribution (UTMs / click ids) — informational only.
  source: z.string().max(500).optional(),
  // Page language at submit ("en" | "es") — drives follow-up message language.
  lang: z.enum(["en", "es"]).optional(),
});
export type QuoteInput = z.infer<typeof QuoteSchema>;

export const HELP_LABEL: Record<HelpType, { en: string; es: string }> = {
  labor: {
    en: "Labor only · I have a truck or POD",
    es: "Solo mano de obra · Tengo camión o POD",
  },
  "labor-truck": {
    en: "Labor + Truck · Full-service move",
    es: "Mano de obra + Camión · Mudanza completa",
  },
  hauling: {
    en: "Hauling / Junk removal",
    es: "Acarreo / Retiro de basura",
  },
};

export const SIZE_LABEL: Record<MoveSize, { en: string; es: string }> = {
  studio: { en: "Studio", es: "Estudio" },
  "one-br": { en: "1 Bedroom", es: "1 Habitación" },
  "two-br": { en: "2 Bedrooms", es: "2 Habitaciones" },
  "three-br": { en: "3 Bedrooms", es: "3 Habitaciones" },
  "four-plus": { en: "4+ Bedrooms", es: "4+ Habitaciones" },
  office: { en: "Office / Commercial", es: "Oficina / Comercial" },
  partial: { en: "Partial / a few items", es: "Parcial / pocos artículos" },
};

export const RESIDENCE_LABEL: Record<ResidenceType, { en: string; es: string }> = {
  house: { en: "House", es: "Casa" },
  apartment: { en: "Apartment", es: "Apartamento" },
  townhome: { en: "Townhome", es: "Townhome" },
  storage: { en: "Storage unit", es: "Bodega / Storage" },
};

export const FLOOR_LABEL: Record<ApartmentFloor, { en: string; es: string }> = {
  "1": { en: "1st floor", es: "Piso 1" },
  "2": { en: "2nd floor", es: "Piso 2" },
  "3": { en: "3rd floor", es: "Piso 3" },
  "4": { en: "4th floor", es: "Piso 4" },
  "5+": { en: "5+ (has elevator?)", es: "5+ (¿hay ascensor?)" },
};

// Compat aliases so any older imports don't break.
export const SERVICE_LABEL: Record<HelpType, string> = {
  labor: "Labor only",
  "labor-truck": "Labor + Truck",
  hauling: "Hauling",
};
export const ServiceType = HelpType;
export type ServiceType = HelpType;
export const BookingSchema = QuoteSchema;
export type BookingInput = QuoteInput;
