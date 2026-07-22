import type { Metadata } from "next";
import Link from "next/link";
import {
  LeadCaptureAgent,
  LeadCaptureSticky,
} from "@/components/lead-capture-agent";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  GOOGLE_RATING,
  BUSINESS_NAME,
} from "@/lib/contact";
import { PRICING } from "@/lib/pricing";

export const metadata: Metadata = {
  title: { absolute: "Get My Moving Price in 60 Seconds | Toro Movers" },
  description:
    "Up-front hourly moving prices for Central Florida. Name + phone, then see a typical price range. No hidden fees. Family-owned · bilingual.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/get-my-price" },
};

const PROOF = [
  {
    quote:
      "Great experience! The team was on time, professional, and handled everything with care. Very easy to work with and made my move stress-free.",
    name: "Stael G.",
    meta: "Apartment move",
  },
  {
    quote:
      "Very communicative about timing and friendly throughout. So far everything made it to the new place without damage. Highly recommend!",
    name: "Olivia H.",
    meta: "Full-service move",
  },
  {
    quote:
      "The hourly rate was upfront so no shock. Patient crew — nobody complained when plans changed mid-move.",
    name: "Kony C.",
    meta: "Kissimmee → Clermont",
  },
];

export default function GetMyPricePage() {
  const fs = PRICING.fullService;
  const lo = PRICING.laborOnly;

  return (
    <main className="lca-page">
      <header className="lca-top">
        <Link href="/" className="lca-brand" aria-label={BUSINESS_NAME}>
          <span className="lca-brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" width={18} height={18} />
          </span>
          <span>
            TORO<span className="lca-accent">·</span>MOVERS
          </span>
        </Link>
        <a href={PHONE_TEL} className="lca-top-phone">
          {PHONE_DISPLAY}
        </a>
      </header>

      <section className="lca-hero">
        <div className="lca-hero-copy">
          <p className="lca-eyebrow">
            <span className="lca-stars" aria-hidden>
              ★★★★★
            </span>
            {GOOGLE_RATING} on Google · Family-owned · Central Florida
          </p>
          <h1 className="lca-h1">
            Get your move price.
            <em> No hidden fees.</em>
          </h1>
          <p className="lca-lede">
            Up-front hourly rates. Tell us your phone — we show a typical range
            in under a minute, then a real person confirms exact pricing.
          </p>
          <ul className="lca-bullets">
            <li>
              Full-service from ${fs.baseRate}/hr (2 movers + truck, {fs.minimumHours}
              -hr min)
            </li>
            <li>
              Labor-only from ${lo.baseRate}/hr (you bring the truck,{" "}
              {lo.minimumHours}-hr min)
            </li>
            <li>No fuel · no stair fees · bilingual crew · same-week dates</li>
          </ul>
        </div>

        <div className="lca-card" id="get-price">
          <p className="lca-card-kicker">Free price · ~45 seconds</p>
          <LeadCaptureAgent lang="en" />
        </div>
      </section>

      <section className="lca-proof" aria-label="Customer reviews">
        <h2 className="lca-h2">What Central Florida says</h2>
        <div className="lca-reviews">
          {PROOF.map((r) => (
            <figure key={r.name} className="lca-review">
              <div className="lca-stars" aria-hidden>
                ★★★★★
              </div>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>{r.meta}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="lca-why">
        <h2 className="lca-h2">Why people book Toro</h2>
        <div className="lca-why-grid">
          <div>
            <h3>Same crew that quotes</h3>
            <p>No call-center hand-off. Family-owned — owners on the job.</p>
          </div>
          <div>
            <h3>Clock stops when the job ends</h3>
            <p>Hourly pricing from a clear minimum. No surprise add-ons later.</p>
          </div>
          <div>
            <h3>Materials included</h3>
            <p>Shrink wrap, blankets, and basic assembly in the rate — not extras.</p>
          </div>
        </div>
      </section>

      <section className="lca-bottom-cta">
        <h2>Prefer to talk it through?</h2>
        <p>We’re real people in Central Florida — not a franchise desk.</p>
        <div className="lca-bottom-row">
          <a href={PHONE_TEL} className="fn-btn fn-btn-primary fn-btn-lg">
            Call {PHONE_DISPLAY}
          </a>
          <a href="#get-price" className="fn-btn fn-btn-ghost-light">
            Get my price
          </a>
        </div>
      </section>

      <footer className="lca-foot">
        <p>
          © {new Date().getFullYear()} {BUSINESS_NAME} · Orlando &amp; Central
          Florida ·{" "}
          <Link href="/privacy">Privacy</Link> ·{" "}
          <Link href="/es/get-my-price">Español</Link>
        </p>
      </footer>

      <LeadCaptureSticky lang="en" />
    </main>
  );
}
