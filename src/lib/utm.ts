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

// Classify a referrer into a readable source when there are no UTMs, so even
// organic/direct leads carry an attribution instead of an empty source.
function classifySource(referrer: string): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("toromovers.net")) return "internal";
    if (/(google|bing|yahoo|duckduckgo|ecosia|brave)\./.test(host))
      return `organic:${host}`;
    if (/(facebook|instagram|fb\.|t\.co|twitter|x\.com|linkedin|tiktok|youtube)/.test(host))
      return `social:${host}`;
    return `referral:${host}`;
  } catch {
    return "referral";
  }
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const p of PARAMS) {
      const v = sp.get(p);
      if (v) found[p] = v;
    }
    const hasUtm = Object.keys(found).length > 0;
    const stored = sessionStorage.getItem(KEY);
    let storedHasUtm = false;
    if (stored) {
      try {
        const s = JSON.parse(stored) as Record<string, string>;
        storedHasUtm = PARAMS.some((p) => s[p]);
      } catch {
        /* corrupt — treat as absent */
      }
    }
    // First-touch: write when nothing is stored yet, OR upgrade an organic-only
    // record once real campaign params show up (paid attribution wins). This
    // means organic/direct visits now also get a captured source.
    if (!stored || (hasUtm && !storedHasUtm)) {
      found.landing = window.location.pathname;
      if (document.referrer) found.referrer = document.referrer;
      if (!hasUtm) found.source_type = classifySource(document.referrer);
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
    if (!raw) return "direct";
    const a = JSON.parse(raw) as Record<string, string>;
    const order = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
      "source_type",
      "landing",
      "referrer",
    ];
    const summary = order
      .filter((k) => a[k])
      .map((k) => `${k}=${a[k]}`)
      .join(" · ");
    return summary || "direct";
  } catch {
    return "";
  }
}
