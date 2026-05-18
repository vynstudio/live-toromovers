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

export const QuoteSchema = z.object({
  helpType: HelpType,
  fromZip: z.string().min(4).max(5),
  toZip: z.string().min(4).max(5),
  size: MoveSize,
  date: z.string().min(1),
  specialItems: z.string().max(500).optional().default(""),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
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

// Compat alias so existing template booking-modal imports don't break during transition.
export const SERVICE_LABEL: Record<HelpType, string> = {
  labor: "Labor only",
  "labor-truck": "Labor + Truck",
  hauling: "Hauling",
};
export const ServiceType = HelpType;
export type ServiceType = HelpType;
export const BookingSchema = QuoteSchema;
export type BookingInput = QuoteInput;
