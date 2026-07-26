export type BookingStatus =
  | "pending_payment"
  | "paid"
  | "scheduled"
  | "cancelled";

export type TimeSlotId = "morning" | "afternoon" | "full-day";

export type BookingRecord = {
  id: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;

  // Customer
  name: string;
  phone: string;
  email?: string;
  lang: "en" | "es";
  consentSms: boolean;

  // Move details
  service: "full-service" | "labor" | "not-sure";
  fromZip: string;
  toZip: string;
  homeSize: string;

  // Payment
  amountCents: number;
  paymentLinkId?: string;
  orderId?: string;
  paidAt?: string;

  // Schedule (after deposit)
  moveDate?: string; // YYYY-MM-DD
  timeSlot?: TimeSlotId;
  scheduledAt?: string;

  // Attribution
  utm?: Record<string, string>;
  source?: string;
};

export const TIME_SLOT_LABELS: Record<
  TimeSlotId,
  { en: string; es: string; hours: string }
> = {
  morning: {
    en: "Morning start",
    es: "Inicio en la mañana",
    hours: "8:00 AM – 12:00 PM",
  },
  afternoon: {
    en: "Afternoon start",
    es: "Inicio en la tarde",
    hours: "12:00 PM – 4:00 PM",
  },
  "full-day": {
    en: "Full day / early start",
    es: "Día completo / temprano",
    hours: "7:00 AM start",
  },
};
