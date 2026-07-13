"use client";

import { useLang } from "./lang-provider";
import Link from "next/link";
import { PHONE_TEL, PHONE_DISPLAY, GOOGLE_RATING, SOCIAL_PROFILES } from "@/lib/contact";

const GOOGLE_REVIEWS_URL =
  SOCIAL_PROFILES.find((u) => u.includes("google.com/maps")) ?? SOCIAL_PROFILES[1];

// Prefer Relume env hero when present; fall back to existing optimized set.
const HERO_IMAGE = "/images/env-hero.webp";

export function Hero() {
  const { t, lang } = useLang();

  return (
    <section className="hero hero--split">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-badge">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="stars" aria-hidden>
                ★★★★★
              </span>
              {GOOGLE_RATING}★{" "}
              {lang === "es" ? "en Google" : "on Google"}
            </a>
            {" · "}
            {lang === "es" ? "Familiares · Florida Central" : "Family-owned · Central Florida"}
          </p>
          <h1>
            {t.hero.h1Line1}
            {t.hero.h1Line2 ? (
              <>
                <br />
                {t.hero.h1Line2}
              </>
            ) : null}{" "}
            <span className="accent">{t.hero.h1Line3}</span>
          </h1>
          <p className="hero-lede">
            {lang === "es" ? (
              t.hero.lede
            ) : (
              <>
                Our bilingual, family-owned crew serves Orlando and Central
                Florida with honest hourly pricing for{" "}
                <Link href="/apartment-movers-orlando-fl">apartment</Link>, home,
                and office moves.
              </>
            )}
          </p>
          <p className="hero-cities">
            {lang === "es"
              ? "Orlando · Kissimmee · Clermont · Davenport · Lakeland · Winter Haven — y todo el área metropolitana"
              : "Orlando · Kissimmee · Clermont · Davenport · Lakeland · Winter Haven — and everywhere in between"}
          </p>
          <div className="hero-cta-row">
            <Link href="/quote" className="btn btn-primary">
              {t.hero.ctaPrimary}
            </Link>
            <a href={PHONE_TEL} className="btn btn-outline">
              {lang === "es" ? "Llamar" : "Call"} {PHONE_DISPLAY}
            </a>
          </div>
          <div className="hero-note">{t.hero.note}</div>
        </div>

        <div className="hero-media">
          <img
            src={HERO_IMAGE}
            width={1600}
            height={1000}
            alt="Couple relaxing among moving boxes after their Central Florida move with Toro Movers"
            title="Toro Movers — Orlando & Central Florida Apartment and Home Movers"
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
