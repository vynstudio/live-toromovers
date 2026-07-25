import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export function QuoteFormCard({
  title = "Get your free moving estimate",
  lead = "Tell us where you’re moving. We’ll send your hourly rate and crew size — no spam, no hidden fees.",
  ctaLabel = "Get Your Moving Quote",
  ctaHref = "/get-my-price",
  source = "city-quote-card",
}: {
  title?: string;
  lead?: string;
  ctaLabel?: string;
  ctaHref?: string;
  source?: string;
}) {
  return (
    <div className="city-quote-card">
      <h2>{title}</h2>
      <p className="city-quote-lead">{lead}</p>
      <a
        href={ctaHref}
        data-open-quote
        data-source={source}
        className="btn btn-primary"
      >
        {ctaLabel}
        <span className="arrow" aria-hidden />
      </a>
      <p className="city-quote-reassure">
        No spam, no hidden fees. We&rsquo;ll confirm your hourly rate and crew size
        before move day — often the same day you reach out.
      </p>
      <p className="city-quote-phone">
        Prefer to talk?{" "}
        <a href={PHONE_TEL}>Call {PHONE_DISPLAY}</a>
      </p>
    </div>
  );
}
