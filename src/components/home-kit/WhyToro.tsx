import { whyToro } from "@/lib/home-kit-content";
import { FeatureIcon, IconArrow } from "./icons";
import {
  GOOGLE_MAPS_REVIEWS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/lib/contact";

/**
 * Concrete “why us” — monochrome cards + proof stats + thin conversion bar.
 * Replaces stacked full-bleed lifestyle photo banners.
 */
export function WhyToro() {
  return (
    <section
      id="why"
      className="full-bleed section-pad w-full bg-white"
      aria-labelledby="why-heading"
    >
      <div className="site-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="why-heading" className="fluid-h2 text-foreground">
            {whyToro.title}
          </h2>
          <p className="aeo-answer fluid-lede mt-3 text-muted sm:mt-4">
            {whyToro.lede}
          </p>
        </div>

        <div className="why-grid mt-10 sm:mt-12">
          {whyToro.items.map((item) => (
            <article
              key={item.title}
              className="why-card flex w-full flex-col items-start text-left"
            >
              <div className="icon-circle mb-3" aria-hidden>
                <FeatureIcon name={item.icon} />
              </div>
              <h3 className="fluid-h3 text-foreground">{item.title}</h3>
              <p className="aeo-answer mt-2 text-[var(--text-body)] leading-relaxed text-muted">
                {item.body}
              </p>
            </article>
          ))}
        </div>

        {/* Proof strip */}
        <ul className="why-stats mt-12 sm:mt-14" aria-label="Trust signals">
          {whyToro.stats.map((s) => (
            <li key={s.label} className="why-stat">
              <span className="why-stat-value">{s.value}</span>
              <span className="why-stat-label">{s.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-sm text-muted">
          Real reviews on Google.{" "}
          <a
            href={GOOGLE_MAPS_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
            data-cta="why-google-reviews"
          >
            See all reviews
          </a>
        </p>

        {/* Thin conversion bar */}
        <div className="why-cta-bar mt-10 sm:mt-12">
          <a
            href={PHONE_TEL}
            data-cta="why-call"
            className="btn-primary btn-fluid tap-target inline-flex w-full sm:w-auto"
          >
            {whyToro.ctaPhone}
            <span className="hidden sm:inline"> · {PHONE_DISPLAY}</span>
          </a>
          <button
            type="button"
            data-open-quote
            data-source="why-quote"
            data-cta="why-quote"
            className="btn-outline btn-fluid tap-target inline-flex w-full sm:w-auto"
          >
            {whyToro.ctaQuote}
            <IconArrow />
          </button>
        </div>
      </div>
    </section>
  );
}
