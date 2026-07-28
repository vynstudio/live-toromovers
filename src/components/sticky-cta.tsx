"use client";

/**
 * Mobile sticky bar: Call now + Get Quote.
 * Hidden at top of page; appears when the user scrolls (nav hides at the same time).
 * Suppressed on moving-day checklist so it doesn't cover wizard actions.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./lang-provider";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/contact";
import { openQuote } from "@/lib/open-quote";

const SHOW_AFTER_PX = 72;

export function StickyCta() {
  const { t } = useLang();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const hide =
    pathname === "/intake" ||
    !!pathname?.startsWith("/intake/") ||
    pathname === "/movingday-checklist" ||
    !!pathname?.startsWith("/movingday-checklist/") ||
    pathname === "/move-details" ||
    !!pathname?.startsWith("/move-details/") ||
    pathname === "/job-size" ||
    !!pathname?.startsWith("/job-size/");

  useEffect(() => {
    if (hide) return;
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hide]);

  if (hide) return null;

  return (
    <div
      className={`sticky-cta${visible ? " is-visible" : ""}`}
      role="region"
      aria-label="Quick contact"
      aria-hidden={!visible}
    >
      <a
        href={PHONE_TEL}
        className="call-cta"
        aria-label={`Call ${PHONE_DISPLAY}`}
        tabIndex={visible ? 0 : -1}
      >
        📞 {t.nav.callNow}
      </a>
      <button
        type="button"
        className="quote-cta"
        data-open-quote="true"
        data-source="sticky-cta"
        tabIndex={visible ? 0 : -1}
        onClick={() => openQuote({ source: "sticky-cta" })}
      >
        {t.nav.quote} →
      </button>
    </div>
  );
}
