// Client-side conversion tracking helpers. Safe no-ops if the pixel/gtag
// scripts haven't loaded (or are blocked by an ad blocker).

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Generate an event id shared between the browser pixel and server CAPI so
 *  Meta can deduplicate the two Lead events. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Fire a Lead conversion on the browser side (Meta Pixel + GA4). */
export function trackLead(eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", "Lead", {}, eventId ? { eventID: eventId } : undefined);
  } catch {
    /* pixel not loaded */
  }
  try {
    window.gtag?.("event", "generate_lead");
  } catch {
    /* gtag not loaded */
  }
}

export {};
