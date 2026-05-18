"use client";

import { useBooking } from "./booking-provider";

type Props = {
  label?: string;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
};

export function RequestButton({
  label,
  variant = "primary",
  fullWidth = false,
  className = "",
}: Props) {
  const { setOpen } = useBooking();
  const variantClass = `btn-${variant}`;
  return (
    <button
      type="button"
      className={`btn ${variantClass} ${className}`.trim()}
      onClick={() => setOpen(true)}
      style={fullWidth ? { width: "100%" } : undefined}
    >
      {label ?? "Get free quote"}
      <span className="arrow" aria-hidden />
    </button>
  );
}
