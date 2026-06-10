// Marketing attribution. Captures UTMs / click ids on the first page the
// visitor lands on and keeps them (sessionStorage) so we can attach the source
// to a lead even when they navigate to /quote before submitting.

const KEY = "toro_attr";
const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const p of PARAMS) {
      const v = sp.get(p);
      if (v) found[p] = v;
    }
    // First-touch: only write when we have real params and nothing stored yet,
    // so the original ad source survives later navigation.
    if (Object.keys(found).length && !sessionStorage.getItem(KEY)) {
      found.landing = window.location.pathname;
      if (document.referrer) found.referrer = document.referrer;
      sessionStorage.setItem(KEY, JSON.stringify(found));
    }
  } catch {
    /* storage blocked — ignore */
  }
}

/** Structured first-touch attribution — the raw captured params. Used to send
 *  utm_source/medium/campaign/content to n8n → HubSpot (the summary string is
 *  for human-readable notes; this is for field mapping). Empty object if none. */
export function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function getAttributionSummary(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return "";
    const a = JSON.parse(raw) as Record<string, string>;
    const order = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
      "landing",
      "referrer",
    ];
    return order
      .filter((k) => a[k])
      .map((k) => `${k}=${a[k]}`)
      .join(" · ");
  } catch {
    return "";
  }
}
