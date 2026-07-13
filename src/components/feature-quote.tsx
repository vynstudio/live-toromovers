"use client";

import { useLang } from "./lang-provider";
import { REVIEWS } from "@/lib/content";
import { GOOGLE_RATING, SOCIAL_PROFILES } from "@/lib/contact";

const GOOGLE_REVIEWS_URL =
  SOCIAL_PROFILES.find((u) => u.includes("google.com/maps")) ?? SOCIAL_PROFILES[1];

export function FeatureQuote() {
  const { t, lang } = useLang();
  return (
    <section className="block reviews" id="reviews">
      <div className="block-inner">
        <div className="reviews-head">
          <div className="block-eyebrow">{t.reviews.eyebrow}</div>
          <h2 className="block-h2">
            {t.reviews.head} <em>{t.reviews.headItalic}</em>
          </h2>
          <div className="reviews-rating">
            <span className="stars" aria-hidden>
              ★★★★★
            </span>
            <span>
              {GOOGLE_RATING}★{" "}
              {lang === "es" ? "en Google ·" : "on Google ·"}{" "}
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                {lang === "es" ? "ver reseñas" : "read reviews"}
              </a>
            </span>
          </div>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((r, i) => (
            <article
              key={r.name}
              className={`review-card reveal${i % 3 === 1 ? " reveal-d1" : i % 3 === 2 ? " reveal-d2" : ""}`}
            >
              <div className="review-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <p className="review-body">&ldquo;{r.body}&rdquo;</p>
              <div className="review-attr">
                <div className="review-avatar" aria-hidden>
                  {r.name.charAt(0)}
                </div>
                <span className="review-name">{r.name}</span>
                <span className="review-meta">{r.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
