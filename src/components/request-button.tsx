"use client";

import { openQuote } from "@/lib/open-quote";

type Props = {
  label?: string;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
  /** Prefill service pill in the popup */
  serviceType?: string;
  source?: string;
};

// Global quote CTA — opens the same lead form popup used on toromoveit.com / go.toromovers.net.
export function RequestButton({
  label,
  variant = "primary",
  fullWidth = false,
  className = "",
  serviceType,
  source = "site-cta",
}: Props) {
  const variantClass = `btn-${variant}`;
  return (
    <button
      type="button"
      data-open-quote
      data-source={source}
      data-service={serviceType || undefined}
      className={`btn ${variantClass} ${className}`.trim()}
      style={fullWidth ? { width: "100%" } : undefined}
      onClick={() => openQuote({ serviceType, source })}
    >
      {label ?? "Get free quote"}
      <span className="arrow" aria-hidden />
    </button>
  );
}
