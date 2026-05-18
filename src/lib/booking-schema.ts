import { z } from "zod";

export const ServiceType = z.enum(["deep", "recurring", "movein"]);
export type ServiceType = z.infer<typeof ServiceType>;

export const BookingSchema = z.object({
  zip: z.string().min(5).max(5),
  beds: z.string(),
  baths: z.string(),
  sqft: z.string(),
  service: ServiceType,
  date: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
});
export type BookingInput = z.infer<typeof BookingSchema>;

export const SERVICE_LABEL: Record<ServiceType, string> = {
  deep: "Initial Deep Reset",
  recurring: "Deep Reset + Recurring",
  movein: "Transition Care",
};
