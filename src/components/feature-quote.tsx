"use client";

import { useLang } from "./lang-provider";
import { REVIEWS } from "@/lib/content";

export function FeatureQuote() {
  const { t } = useLang();
  return (
    <section className="block reviews" id="reviews">
      <div className="block-inner">
        <div className="reviews-head">
          <div className="block-eyebrow">{t.reviews.eyebrow}</div>
          <h2 className="block-h2">
            {t.reviews.head} <em>{t.reviews.headItalic}</em>
          </h2>
          <div className="reviews-rating">
            <span className="stars" aria-hidden>★★★★★</span>
            <span>{t.reviews.rating}</span>
          </div>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <article key={r.name} className="review-card">
              <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
              <p className="review-body">&ldquo;{r.body}&rdquo;</p>
              <div className="review-attr">
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
