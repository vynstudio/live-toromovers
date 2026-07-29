import {
  GOOGLE_RATING,
  GOOGLE_MAPS_REVIEWS_URL,
  HOURS_LABEL,
  MOVES_DONE,
  PHONE_DISPLAY,
  PHONE_TEL,
  REVIEW_COUNT,
  SERVICE_REGION,
} from "@/lib/contact";

/** High-priority trust + contact strip under hero. */
export function TrustBar() {
  return (
    <section
      className="full-bleed w-full border-b border-border bg-white py-3 sm:py-4"
      aria-label="Trust signals"
    >
      <div className="site-container flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0">
          <span className="trust-chip px-1 py-2">
            <strong>{GOOGLE_RATING}★</strong> Google
          </span>
          <a
            href={GOOGLE_MAPS_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="trust-chip"
          >
            <strong>{REVIEW_COUNT}+</strong> reviews
          </a>
          <span className="trust-chip px-1 py-2">
            <strong>{MOVES_DONE}</strong> moves
          </span>
          <span className="trust-chip hidden px-1 py-2 sm:inline-flex">
            <strong>{SERVICE_REGION}</strong>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href={PHONE_TEL}
            data-cta="trust-phone"
            className="tap-target font-semibold text-foreground underline underline-offset-2"
          >
            {PHONE_DISPLAY}
          </a>
          <span className="text-xs text-muted sm:text-sm">{HOURS_LABEL}</span>
        </div>
      </div>
    </section>
  );
}
