"use client";

import { useEffect } from "react";

// Delegated click tracking for the two highest-intent micro-conversions:
// phone-number clicks and quote-button clicks. Fires GA4 + Meta events when
// those tags are present (no-ops otherwise). Capture-phase so it still records
// even when the link does its own navigation.
export function ClickTracking() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";

      if (href.startsWith("tel:")) {
        window.gtag?.("event", "phone_click", { transport_type: "beacon" });
        window.fbq?.("trackCustom", "PhoneClick");
      } else if (href === "/quote" || href.startsWith("/quote?")) {
        window.gtag?.("event", "quote_click");
        window.fbq?.("trackCustom", "QuoteClick");
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
