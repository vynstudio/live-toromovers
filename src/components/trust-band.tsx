"use client";

import { useLang } from "./lang-provider";

export function TrustBand() {
  const { t } = useLang();
  return (
    <div className="trust-band" aria-label="Trust signals">
      <div className="trust-band-inner">
        {t.trust.map((item) => (
          <span key={item} className="trust-item">{item}</span>
        ))}
      </div>
    </div>
  );
}
