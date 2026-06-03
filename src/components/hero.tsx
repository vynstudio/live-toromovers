"use client";

import { useEffect, useState } from "react";
import { useLang } from "./lang-provider";
import Link from "next/link";
import { PHONE_TEL } from "@/lib/contact";

// WebP @1440px (q72) — ~60KB each vs ~200KB JPG. Originals kept in
// .image-backups/hero/ (gitignored) if a re-export is ever needed.
const SLIDES = [
  "/hero/slide-01.webp",
  "/hero/slide-02.webp",
  "/hero/slide-03.webp",
  "/hero/slide-04.webp",
  "/hero/slide-05.webp",
  "/hero/slide-06.webp",
  "/hero/slide-07.webp",
  "/hero/slide-08.webp",
  "/hero/slide-09.webp",
  "/hero/slide-10.webp",
  "/hero/slide-11.webp",
  "/hero/slide-12.webp",
  "/hero/slide-13.webp",
];
const SLIDE_INTERVAL = 1500;

export function Hero() {
  const { t, lang } = useLang();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Respect reduced-motion: hold on the first image, no auto-advance.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero hero--media hero--home">
      <div className="hero-slides" aria-hidden>
        {SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`hero-slide${i === index ? " is-active" : ""}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
      <div className="hero-overlay" aria-hidden />

      <div className="hero-inner">
        <div className="hero-badge reveal">
          <span className="stars" aria-hidden>★★★★★</span>
          {t.hero.badge}
        </div>
        <h1 className="reveal reveal-d1">
          {t.hero.h1Line1}
          <br />
          {t.hero.h1Line2}
          <span className="accent">{t.hero.h1Line3}</span>
        </h1>
        <div className="hero-cta-row reveal reveal-d2">
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
    </section>
  );
}
