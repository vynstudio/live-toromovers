"use client";

import { useLang } from "./lang-provider";
import { REVIEWS } from "@/lib/content";
import {
  GOOGLE_RATING,
  REVIEW_COUNT,
  GOOGLE_MAPS_REVIEWS_URL,
} from "@/lib/contact";

export function FeatureQuote() {
  const { t, lang } = useLang();
  const es = lang === "es";

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
              {es
                ? `en Google · ${REVIEW_COUNT} reseñas`
                : `on Google · ${REVIEW_COUNT} reviews`}
            </span>
          </div>
          <p className="reviews-sub">
            {es
              ? "Reseñas reales de clientes en Google Business Profile."
              : "Real customer reviews from our Google Business Profile."}{" "}
            <a
              href={GOOGLE_MAPS_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="reviews-google-link"
            >
              {es ? "Ver todas en Google" : "See all on Google"}
            </a>
          </p>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((r, i) => (
            <article
              key={`${r.name}-${i}`}
              className={`review-card reveal${i % 3 === 1 ? " reveal-d1" : i % 3 === 2 ? " reveal-d2" : ""}`}
            >
              <div className="review-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <p className="review-body">&ldquo;{r.body}&rdquo;</p>
              <div className="review-attr">
                <span className="review-name">{r.name}</span>
                <span className="review-meta">{r.meta}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="reviews-footer">
          <a
            href={GOOGLE_MAPS_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            {es
              ? `Ver las ${REVIEW_COUNT} reseñas en Google`
              : `See all ${REVIEW_COUNT} reviews on Google`}
            <span className="arrow" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
