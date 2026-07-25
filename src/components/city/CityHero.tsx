import { PHONE_DISPLAY, PHONE_TEL, GOOGLE_RATING } from "@/lib/contact";
import { CityImage } from "./CityImage";

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export type CityHeroProps = {
  cityName: string;
  h1: string;
  subhead: string;
  /** SEO-named path under /public/city/… */
  imageSrc?: string;
  imageAlt?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function CityHero({
  cityName,
  h1,
  subhead,
  imageSrc = "/city/orlando-movers-hero.webp",
  imageAlt = "Toro Movers crew preparing a local move in Central Florida",
  ctaHref = "/get-my-price",
  ctaLabel = "Get Your Moving Quote",
}: CityHeroProps) {
  return (
    <section className="city-hero-v2">
      <div className="city-container">
        <div className="city-hero-v2-grid">
          {/* Text + CTA first in DOM for mobile: scannable before image */}
          <div>
            <div className="city-badge">
              <PinIcon />
              {cityName}, FL Movers
            </div>
            <h1 className="city-h1-v2">{h1}</h1>
            <p className="city-sub-v2">{subhead}</p>
            <div className="city-hero-actions">
              <a
                href={ctaHref}
                data-open-quote
                data-source="city-hero-v2"
                className="btn btn-primary"
              >
                {ctaLabel}
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="city-hero-call">
                Or call {PHONE_DISPLAY}
              </a>
            </div>
            <div className="city-trust-row" aria-label="Trust signals">
              <span className="city-trust-pill">
                <strong>{GOOGLE_RATING}★</strong> on Google
              </span>
              <span className="city-trust-pill">Family-owned</span>
              <span className="city-trust-pill">Fully insured crew</span>
              <span className="city-trust-pill">Bilingual · Hablamos español</span>
              <span className="city-trust-pill">No hidden fees</span>
            </div>
          </div>

          <CityImage
            src={imageSrc}
            alt={imageAlt}
            priority
            aspect="hero"
            width={1200}
            height={900}
            sizes="(min-width: 980px) 480px, 100vw"
            className="city-hero-media-wrap"
          />
        </div>
      </div>
    </section>
  );
}

/** Compact trust pills used under hero or mid-page */
export function TrustBadges({ items }: { items: string[] }) {
  return (
    <div className="city-trust-row" aria-label="Why customers trust Toro">
      {items.map((t) => (
        <span key={t} className="city-trust-pill">
          {t}
        </span>
      ))}
    </div>
  );
}
