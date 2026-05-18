"use client";

import { useBooking } from "./booking-provider";
import { useLang } from "./lang-provider";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/contact";

export function StickyCta() {
  const { setOpen } = useBooking();
  const { t } = useLang();
  return (
    <div className="sticky-cta" role="region" aria-label="Quick contact">
      <a href={PHONE_TEL} className="call-cta" aria-label={`Call ${PHONE_DISPLAY}`}>
        📞 {t.nav.callNow}
      </a>
      <button
        type="button"
        className="quote-cta"
        onClick={() => setOpen(true)}
      >
        {t.nav.quote} →
      </button>
    </div>
  );
}
