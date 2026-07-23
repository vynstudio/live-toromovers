"use client";

/**
 * Global quote entry router.
 * Intercepts every "get quote" CTA site-wide and sends visitors to
 * /get-my-price (the sales funnel). No popup form.
 *
 * Matches:
 *  - openQuote() custom event
 *  - #quote hash
 *  - a[href="#quote"], data-open-quote buttons/links
 *  - legacy /quote, /get-quote paths
 *  - plain /get-my-price links that carry data-source / data-service
 */

import { useEffect } from "react";
import {
  QUOTE_EVENT,
  FUNNEL_PATH,
  FUNNEL_PATH_ES,
  openQuote,
  type QuoteOpenDetail,
} from "@/lib/open-quote";

function detailFromEl(el: HTMLElement): QuoteOpenDetail {
  // Prefer data-* attrs; fall back to query params already on the href
  // so progressive-enhancement links keep service/source when intercepted.
  let hrefSvc: string | undefined;
  let hrefSource: string | undefined;
  let hrefCity: string | undefined;
  const href = el.getAttribute("href") || "";
  if (href.includes("?")) {
    try {
      const u = new URL(href, "https://toromovers.net");
      hrefSvc = u.searchParams.get("service") || undefined;
      hrefSource = u.searchParams.get("source") || undefined;
      hrefCity = u.searchParams.get("city") || undefined;
    } catch {
      /* ignore */
    }
  }
  return {
    serviceType:
      el.getAttribute("data-service") ||
      el.getAttribute("data-service-type") ||
      hrefSvc ||
      undefined,
    source:
      el.getAttribute("data-source") || hrefSource || "site-cta",
    city: el.getAttribute("data-city") || hrefCity || undefined,
  };
}

function isFunnelPath(pathname: string) {
  return pathname === FUNNEL_PATH || pathname === FUNNEL_PATH_ES;
}

export function QuoteModal() {
  useEffect(() => {
    const go = (detail?: QuoteOpenDetail) => {
      openQuote(detail);
    };

    const onEvent = (e: Event) => {
      const ce = e as CustomEvent<QuoteOpenDetail>;
      go(ce.detail || { source: "site-event" });
    };
    window.addEventListener(QUOTE_EVENT, onEvent);

    // #quote hash (legacy anchors)
    if (window.location.hash === "#quote") {
      go({ source: "site-hash" });
    }
    const onHash = () => {
      if (window.location.hash === "#quote") go({ source: "site-hash" });
    };
    window.addEventListener("hashchange", onHash);

    const onClick = (e: MouseEvent) => {
      // Ignore modified clicks (new tab, etc.)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const t = e.target as HTMLElement | null;
      const a = t?.closest?.(
        [
          'a[href="#quote"]',
          'a[href$="#quote"]',
          "a[data-open-quote]",
          "button[data-open-quote]",
          "[data-open-quote]",
          'a[href="/quote"]',
          'a[href^="/quote?"]',
          'a[href="/get-quote"]',
          'a[href^="/get-quote?"]',
          `a[href="${FUNNEL_PATH}"]`,
          `a[href^="${FUNNEL_PATH}?"]`,
          `a[href="${FUNNEL_PATH_ES}"]`,
          `a[href^="${FUNNEL_PATH_ES}?"]`,
        ].join(", "),
      ) as HTMLElement | null;
      if (!a) return;

      // Escape hatch for rare deep-booking tools
      if (a.getAttribute("data-full-quote") === "1") return;

      // Already on the funnel — don't re-navigate loops on sticky "get quote"
      if (isFunnelPath(window.location.pathname)) {
        const href = a.getAttribute("href") || "";
        if (href === "#get-price" || href.startsWith("#")) return;
        // In-funnel sticky should scroll, not restart
        if (href === FUNNEL_PATH || href === FUNNEL_PATH_ES || href.startsWith(`${FUNNEL_PATH}?`) || href.startsWith(`${FUNNEL_PATH_ES}?`)) {
          return;
        }
      }

      e.preventDefault();
      go(detailFromEl(a));
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener(QUOTE_EVENT, onEvent);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // No UI — navigation only
  return null;
}
