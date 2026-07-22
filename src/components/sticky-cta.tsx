"use client";

import { useLang } from "./lang-provider";
import { TextCta } from "./funnel-tracking";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/contact";
import { openQuote } from "@/lib/open-quote";

export function StickyCta() {
  const { t } = useLang();
  return (
    <div className="sticky-cta" role="region" aria-label="Quick contact">
      <a href={PHONE_TEL} className="call-cta" aria-label={`Call ${PHONE_DISPLAY}`}>
        📞 {t.nav.callNow}
      </a>
      <button
        type="button"
        className="quote-cta"
        data-open-quote
        data-source="sticky-cta"
        onClick={() => openQuote({ source: "sticky-cta" })}
      >
        {t.nav.quote} →
      </button>
      <TextCta className="text-cta">💬 {t.nav.textUs}</TextCta>
    </div>
  );
}
