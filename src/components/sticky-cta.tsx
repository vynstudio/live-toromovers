"use client";

/**
 * Mobile sticky bar: Call now + Get Quote.
 * Hidden at top of page; appears when the user scrolls (nav hides at the same time).
 */

import { useEffect, useState } from "react";
import { useLang } from "./lang-provider";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/contact";
import { openQuote } from "@/lib/open-quote";

const SHOW_AFTER_PX = 72;

export function StickyCta() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        data-open-quote
        data-source="sticky-cta"
        tabIndex={visible ? 0 : -1}
        onClick={() => openQuote({ source: "sticky-cta" })}
      >
        {t.nav.quote} →
      </button>
    </div>
  );
}
