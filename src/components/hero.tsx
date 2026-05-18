"use client";

import { useLang } from "./lang-provider";
import { RequestButton } from "./request-button";
import { PHONE_TEL } from "@/lib/contact";

export function Hero() {
  const { t } = useLang();
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-badge">
          <span className="stars" aria-hidden>★★★★★</span>
          {t.hero.badge}
        </div>
        <h1>
          {t.hero.h1Line1}
          <br />
          {t.hero.h1Line2}
          <span className="accent">{t.hero.h1Line3}</span>
        </h1>
        <p className="hero-lede">{t.hero.lede}</p>
        <div className="hero-cta-row">
          <RequestButton label={t.hero.ctaPrimary} />
          <a href={PHONE_TEL} className="btn btn-outline">
            {t.hero.ctaSecondary}
          </a>
        </div>
        <div className="hero-note">{t.hero.note}</div>
      </div>
    </section>
  );
}
