"use client";

/**
 * Global quote entry router.
 * Intercepts openQuote(), #quote, a[href="#quote"], data-open-quote and
 * a[href="/quote"] → sends everyone to /get-my-price (the lead funnel).
 * No popup form anymore.
 */

import { useEffect } from "react";
import {
  QUOTE_EVENT,
  openQuote,
  type QuoteOpenDetail,
} from "@/lib/open-quote";

function detailFromEl(el: HTMLElement): QuoteOpenDetail {
  return {
    serviceType: el.getAttribute("data-service") || undefined,
    source: el.getAttribute("data-source") || "site-cta",
  };
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

    // #quote hash
    if (window.location.hash === "#quote") {
      go({ source: "site-hash" });
    }
    const onHash = () => {
      if (window.location.hash === "#quote") go({ source: "site-hash" });
    };
    window.addEventListener("hashchange", onHash);

    // Clicks: #quote, data-open-quote, /quote links
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.(
        [
          'a[href="#quote"]',
          'a[href$="#quote"]',
          "a[data-open-quote]",
          "button[data-open-quote]",
          'a[href="/quote"]',
          'a[href^="/quote?"]',
          'a[href="/get-quote"]',
          'a[href^="/get-quote?"]',
          'a[href="/es/get-my-price"]',
        ].join(", "),
      ) as HTMLElement | null;
      if (!a) return;
      // Escape hatch for rare deep-booking tools
      if (a.getAttribute("data-full-quote") === "1") return;
      // Already on the funnel — don't re-navigate loops on sticky "get quote"
      if (
        window.location.pathname === "/get-my-price" ||
        window.location.pathname === "/es/get-my-price"
      ) {
        const href = a.getAttribute("href") || "";
        if (href === "#get-price" || href.startsWith("#")) return;
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
