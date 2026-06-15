"use client";

import Link from "next/link";
import { useLang } from "./lang-provider";
import { TextCta } from "./funnel-tracking";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/contact";

export function StickyCta() {
  const { t } = useLang();
  return (
    <div className="sticky-cta" role="region" aria-label="Quick contact">
      <a href={PHONE_TEL} className="call-cta" aria-label={`Call ${PHONE_DISPLAY}`}>
        📞 {t.nav.callNow}
      </a>
      <Link href="/quote" className="quote-cta">
        {t.nav.quote} →
      </Link>
      <TextCta className="text-cta">💬 {t.nav.textUs}</TextCta>
    </div>
  );
}
