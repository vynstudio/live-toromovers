"use client";

import { useLang } from "./lang-provider";
import Link from "next/link";
import { PHONE_TEL } from "@/lib/contact";

// Single static hero image (WebP @1440px). Originals kept in
// .image-backups/hero/ (gitignored) if a re-export is ever needed.
const HERO_IMAGE = "/hero/slide-01.webp";

export function Hero() {
  const { t, lang } = useLang();

  return (
    <section className="hero hero--split">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="stars" aria-hidden>★★★★★</span>
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
            <span className="accent">{t.hero.h1Line3}</span>
          </h1>
          <p className="hero-lede">{t.hero.lede}</p>
          <div className="hero-cta-row">
            <Link href="/quote" className="btn btn-primary">
              {lang === "es" ? "Ver mi precio" : "Get my price"}
              <span className="arrow" aria-hidden />
            </Link>
            <a href={PHONE_TEL} className="btn btn-outline">
              {t.hero.ctaSecondary}
            </a>
          </div>
          <div className="hero-note">{t.hero.note}</div>
        </div>

        <div className="hero-media">
          <img
            src={HERO_IMAGE}
            srcSet="/hero/slide-01-760.webp 760w, /hero/slide-01-1140.webp 1140w, /hero/slide-01.webp 1440w"
            sizes="(min-width: 980px) 560px, 100vw"
            width={1440}
            height={960}
            alt="Couple relaxing among moving boxes after their Central Florida move with Toro Movers"
            title="Toro Movers — Orlando apartment and home moving services"
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
