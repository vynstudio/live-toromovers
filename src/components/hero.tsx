"use client";

import { useEffect, useState } from "react";
import { useLang } from "./lang-provider";
import { RequestButton } from "./request-button";
import { PHONE_TEL } from "@/lib/contact";

export function Hero() {
  const { t } = useLang();
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Tablet + desktop only — mobile keeps the still image to save data.
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setShowVideo(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section className="hero hero--media">
      <div
        className="hero-bg-image"
        style={{ backgroundImage: "url(/hero-poster.jpg)" }}
        aria-hidden
      />
      {showVideo && (
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}
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
  );
}
