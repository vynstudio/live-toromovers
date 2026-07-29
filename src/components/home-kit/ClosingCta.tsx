import { closing } from "@/lib/home-kit-content";
import { IconArrow } from "./icons";
import {
  GOOGLE_RATING,
  HOURS_LABEL,
  PHONE_DISPLAY,
  PHONE_TEL,
  REVIEW_COUNT,
  SERVICE_REGION,
} from "@/lib/contact";

/**
 * Two-section close:
 * 1) Hero conversion message + Call / Request quote (opens lead popup)
 * 2) Trust / contact strip (no form — form is modal)
 */
export function ClosingCta() {
  return (
    <>
      {/* Section 1 — primary conversion */}
      <section
        id="quote"
        className="closing-cta full-bleed w-full px-[var(--container-pad)]"
        aria-labelledby="closing-heading"
      >
        <div className="site-container-narrow text-center">
          <h2
            id="closing-heading"
            className="fluid-display whitespace-pre-line text-foreground"
          >
            {closing.title}
          </h2>
          <p className="aeo-answer fluid-lede mx-auto mt-4 max-w-prose text-muted sm:mt-5">
            {closing.body}
          </p>

          <div className="tap-stack mt-8 justify-center sm:mt-10">
            <a
              href={PHONE_TEL}
              data-cta="closing-phone"
              className="btn-primary btn-fluid tap-target inline-flex w-full sm:w-auto"
            >
              Call {PHONE_DISPLAY}
            </a>
            <button
              type="button"
              data-open-quote
              data-source="closing-cta"
              data-cta="closing-form"
              className="btn-outline btn-fluid tap-target inline-flex w-full sm:w-auto"
            >
              Request a quote
              <IconArrow />
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-muted">{HOURS_LABEL}</p>
        </div>
      </section>

      {/* Section 2 — trust / next step (no form) */}
      <section
        className="closing-secondary full-bleed w-full px-[var(--container-pad)]"
        aria-label="Why book with Toro"
      >
        <div className="site-container grid max-w-4xl gap-8 text-center sm:grid-cols-3 sm:gap-6 sm:text-left">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {GOOGLE_RATING}★
            </p>
            <p className="mt-1 text-sm text-muted">
              Google rating · {REVIEW_COUNT}+ reviews
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {SERVICE_REGION}
            </p>
            <p className="mt-1 text-sm text-muted">
              Local crews · same-week when available
            </p>
          </div>
          <div className="sm:text-right">
            <button
              type="button"
              data-open-quote
              data-source="closing-secondary"
              className="btn-primary tap-target inline-flex w-full sm:w-auto"
            >
              Get my free quote
              <IconArrow />
            </button>
            <p className="mt-2 text-xs text-muted">
              Name &amp; phone first · ~60 seconds
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
