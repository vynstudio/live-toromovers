"use client";

import { useBooking } from "./booking-provider";

export function RequestButton({ label = "Request service" }: { label?: string }) {
  const { setOpen } = useBooking();
  return (
    <button className="btn btn-primary" onClick={() => setOpen(true)}>
      {label}
      <span className="arrow" />
    </button>
  );
}
