"use client";

import Link from "next/link";
import { useLang } from "./lang-provider";
import { GOOGLE_RATING, SOCIAL_PROFILES } from "@/lib/contact";

const GOOGLE_REVIEWS_URL =
  SOCIAL_PROFILES.find((u) => u.includes("google.com/maps")) ?? SOCIAL_PROFILES[1];

const CARDS = [
  {
    tagEn: "Real reviews",
    tagEs: "Reseñas reales",
    titleEn: `${GOOGLE_RATING}★ on Google`,
    titleEs: `${GOOGLE_RATING}★ en Google`,
    bodyKey: 0 as const,
    ctaEn: "Read reviews",
    ctaEs: "Ver reseñas",
    href: GOOGLE_REVIEWS_URL,
    external: true,
    image: "/images/env-family.webp",
    imageAlt: "Smiling family gathered around a moving box in their new home",
  },
  {
    tagEn: "Up-front pricing",
    tagEs: "Precios claros",
    titleEn: "No hidden fees",
    titleEs: "Sin tarifas ocultas",
    bodyKey: 1 as const,
    ctaEn: "Get my price",
    ctaEs: "Ver mi precio",
    href: "/quote",
    external: false,
    image: "/images/env-included.webp",
    imageAlt: "Family next to a neat stack of packed moving boxes",
  },
  {
    tagEn: "Local crew",
    tagEs: "Cuadrilla local",
    titleEn: "Central Florida born",
    titleEs: "Nacidos en Florida Central",
    bodyKey: "bullets" as const,
    ctaEn: "See coverage",
    ctaEs: "Ver cobertura",
    href: "/central-florida-movers",
    external: false,
    image: "/images/env-range.webp",
    imageAlt: "Excited girl in a moving box outside her family's new house",
  },
] as const;

export function EditorialQuote() {
  const { t, lang } = useLang();
  const isEs = lang === "es";

  return (
    <section className="block about" id="about">
      <div className="block-inner">
        <div className="block-eyebrow reveal">{t.about.eyebrow}</div>
        <h2 className="block-h2 reveal reveal-d1">
          {t.about.head} <em>{t.about.headItalic}</em>
        </h2>

        <div className="about-grid">
          {CARDS.map((card, i) => {
            const body =
              card.bodyKey === "bullets"
                ? t.about.bullets.join(" · ")
                : t.about.body[card.bodyKey];
            const title = isEs ? card.titleEs : card.titleEn;
            const tag = isEs ? card.tagEs : card.tagEn;
            const cta = isEs ? card.ctaEs : card.ctaEn;
            const linkProps = card.external
              ? { target: "_blank" as const, rel: "noopener noreferrer" }
              : {};

            return (
              <article key={card.tagEn} className={`about-card reveal reveal-d${(i + 1) as 1 | 2 | 3}`}>
                <div className="about-card-body">
                  <p className="about-card-tag">{tag}</p>
                  <h3 className="about-card-title">{title}</h3>
                  <p>{body}</p>
                  <div style={{ marginTop: "1.25rem" }}>
                    {card.external ? (
                      <a href={card.href} className="btn btn-link" {...linkProps}>
                        {cta} <span className="chev" aria-hidden>→</span>
                      </a>
                    ) : (
                      <Link href={card.href} className="btn btn-link">
                        {cta} <span className="chev" aria-hidden>→</span>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="about-card-media">
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    width={900}
                    height={675}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
