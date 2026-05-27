"use client";

import { useLang } from "./lang-provider";
import { RequestButton } from "./request-button";
import { LangToggle } from "./lang-toggle";
import { TrustBand } from "./trust-band";
import { Services } from "./services";
import { FeatureQuote } from "./feature-quote";
import { Faq } from "./faq";
import { ClosingCta } from "./closing-cta";
import { Footer } from "./footer";
import { StickyCta } from "./sticky-cta";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

// Focused paid-traffic landing page. Mounted at /ads/meta-orlando-movers and
// /es/ads/meta-orlando-movers — the routes the Meta ads target. Minimal header
// (no section nav) keeps the page conversion-focused; the quote modal is the
// single primary action.
export function AdLanding() {
  const { t } = useLang();

  return (
    <>
      <nav className="top scrolled">
        <span className="brand" aria-label="Toro Movers">
          <span className="brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" />
          </span>
          <span className="brand-name">
            TORO<span className="accent">·</span>MOVERS
          </span>
        </span>
        <div className="nav-right">
          <a href={PHONE_TEL} className="nav-phone">
            <span className="nav-phone-dot" aria-hidden />
            {PHONE_DISPLAY}
          </a>
          <LangToggle />
          <RequestButton label={t.nav.quote} />
        </div>
      </nav>

      <section className="hero hero--media">
        <div className="hero-slides" aria-hidden>
          {/* Single static frame — no slideshow on the LP, keep it fast. */}
          <img
            src="/hero/slide-02.jpg"
            alt=""
            className="hero-slide is-active"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="hero-overlay" aria-hidden />

        <div className="hero-inner">
          <div className="hero-badge reveal">
            <span className="stars" aria-hidden>
              ★★★★★
            </span>
            {t.hero.badge}
          </div>
          <h1 className="reveal reveal-d1">
            {t.hero.h1Line1}
            <br />
            {t.hero.h1Line2}
            <span className="accent">{t.hero.h1Line3}</span>
          </h1>
          <p className="hero-lede reveal reveal-d2">{t.hero.lede}</p>
          <div className="hero-cta-row reveal reveal-d3">
            <RequestButton label={t.hero.ctaPrimary} />
            <a href={PHONE_TEL} className="btn btn-outline">
              {t.hero.ctaSecondary}
            </a>
          </div>
          <div className="hero-note">{t.hero.note}</div>
        </div>
      </section>

      <TrustBand />
      <Services />
      <FeatureQuote />
      <Faq />
      <ClosingCta />
      <Footer />
      <StickyCta />
    </>
  );
}
