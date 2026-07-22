// Global quote modal open — same pattern as toro-ads-landing (toromoveit.com / go.toromovers.net).

export const QUOTE_EVENT = "toro-open-quote";

export type QuoteOpenDetail = {
  serviceType?: string;
  source?: string;
};

/** Open the global lead form popup. */
export function openQuote(detail?: QuoteOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(QUOTE_EVENT, { detail: detail || {} }),
  );
}
