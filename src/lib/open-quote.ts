// Canonical quote entry — every "Get a quote" CTA goes to /get-my-price.
// After the sales funnel completes, the visitor is redirected home (/) in 3s.

export const QUOTE_EVENT = "toro-open-quote";
export const FUNNEL_PATH = "/get-my-price";
export const FUNNEL_PATH_ES = "/es/get-my-price";
export const RETURN_STORAGE_KEY = "toro-quote-return";

export type QuoteOpenDetail = {
  serviceType?: string;
  source?: string;
  /** Optional city prefill */
  city?: string;
  /** Override return path (defaults to current page) */
  returnTo?: string;
};

/** Safe same-site return path only. Never open redirects. */
export function sanitizeReturnPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      if (
        trimmed === FUNNEL_PATH ||
        trimmed.startsWith(`${FUNNEL_PATH}?`) ||
        trimmed === FUNNEL_PATH_ES ||
        trimmed.startsWith(`${FUNNEL_PATH_ES}?`)
      ) {
        return "/";
      }
      return trimmed;
    }
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "toromovers.net" || host === "localhost" || host.endsWith(".netlify.app")) {
      const path = u.pathname + u.search;
      return sanitizeReturnPath(path || "/");
    }
  } catch {
    /* ignore */
  }
  return "/";
}

function mapService(serviceType?: string): string | undefined {
  if (!serviceType) return undefined;
  const s = serviceType.toLowerCase();
  if (s.includes("labor") || s.includes("solo labor") || s.includes("u-haul") || s.includes("uhaul")) {
    return "labor";
  }
  if (s.includes("full") || s.includes("pack")) {
    return "full-service";
  }
  return undefined;
}

function funnelBasePath(): string {
  if (typeof window === "undefined") return FUNNEL_PATH;
  if (window.location.pathname.startsWith("/es")) return FUNNEL_PATH_ES;
  return FUNNEL_PATH;
}

/** Build /get-my-price?... for navigation or hrefs. */
export function quoteFunnelUrl(detail?: QuoteOpenDetail): string {
  const params = new URLSearchParams();
  const svc = mapService(detail?.serviceType);
  if (svc) params.set("service", svc);
  if (detail?.source) params.set("source", detail.source);
  if (detail?.city) params.set("city", detail.city);

  let returnTo = detail?.returnTo;
  if (!returnTo && typeof window !== "undefined") {
    const path = window.location.pathname + window.location.search;
    if (path && !path.startsWith(FUNNEL_PATH) && !path.startsWith(FUNNEL_PATH_ES)) {
      returnTo = path;
    }
  }
  if (returnTo) {
    params.set("return", sanitizeReturnPath(returnTo));
  }

  const base = funnelBasePath();
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

/** Persist return path so multi-step funnel doesn't lose it. */
export function rememberReturnPath(path?: string | null) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RETURN_STORAGE_KEY, sanitizeReturnPath(path));
  } catch {
    /* private mode */
  }
}

export function readRememberedReturnPath(): string {
  if (typeof window === "undefined") return "/";
  try {
    return sanitizeReturnPath(sessionStorage.getItem(RETURN_STORAGE_KEY));
  } catch {
    return "/";
  }
}

/**
 * Open the quote funnel (replaces the old modal).
 * Every CTA site-wide should call this or link to quoteFunnelUrl().
 */
export function openQuote(detail?: QuoteOpenDetail) {
  if (typeof window === "undefined") return;
  const url = quoteFunnelUrl(detail);
  const ret = new URL(url, window.location.origin).searchParams.get("return");
  if (ret) rememberReturnPath(ret);
  window.location.assign(url);
}
