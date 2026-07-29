"use client";

import { useLang } from "./lang-provider";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/contact";
import { openQuote } from "@/lib/open-quote";

// Real team photo (converted from HEIC → WebP). New filename busts CDN/browser cache.
const HERO_IMAGE = "/hero/home-team.webp";

export function Hero() {
  const { t, lang } = useLang();

  return (
    <section className="hero hero--split hero--redesign" id="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="stars" aria-hidden>
              ★★★★★
            </span>
            {t.hero.badge}
          </div>
          <h1>
            {t.hero.h1Line1}
            {t.hero.h1Line2 ? (
              <>
                <br />
                {t.hero.h1Line2}
              </>
            ) : null}
            {t.hero.h1Line3 ? (
              <>
                <br />
                <span className="accent">{t.hero.h1Line3}</span>
              </>
            ) : null}
          </h1>
          <p className="hero-lede">{t.hero.lede}</p>
          <div className="hero-cta-row">
            <button
              type="button"
              className="btn btn-primary"
              data-open-quote
              data-source="hero"
              onClick={() => openQuote({ source: "hero" })}
            >
              {t.hero.ctaPrimary}
              <span className="arrow" aria-hidden />
            </button>
            <a href={PHONE_TEL} className="btn btn-outline">
              {lang === "es" ? `Llamar ${PHONE_DISPLAY}` : `Call ${PHONE_DISPLAY}`}
            </a>
          </div>
          <div className="hero-note">{t.hero.note}</div>
        </div>

        <div className="hero-media">
          <img
            src={HERO_IMAGE}
            srcSet="/hero/home-team-760.webp 760w, /hero/home-team-1140.webp 1140w, /hero/home-team.webp 1440w"
            sizes="(min-width: 980px) 560px, 100vw"
            width={1440}
            height={960}
            alt="Toro Movers team with a happy customer after a local move in Central Florida"
            title="Trusted Orlando & Central Florida movers — Toro Movers"
            className="hero-media-img"
            fetchPriority="high"
            decoding="async"
          />
          <span className="hero-media-scrim" aria-hidden />
        </div>
      </div>
    </section>
  );
}
