import type { Metadata } from "next";
import Link from "next/link";
import { StepFunnelForm } from "@/components/step-funnel-form";
import { FunnelView, CallCta, TextCta } from "@/components/funnel-tracking";
import { FaqSection } from "@/components/faq-section";
import { REVIEWS } from "@/lib/content";
import { CITIES } from "@/lib/cities";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
  GOOGLE_RATING,
  SERVICE_REGION,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";
const HREF = "/labor-only-moving";

// CHANGE 1 (meta description updated to match new H1 keyword focus)
// Secondary service page — title ≤60, description ≤155.
const DESCRIPTION =
  "Labor-only movers in Orlando — load/unload U-Haul, PODS & trucks by the hour. Secondary to our full-service moves. Family-owned. Quote today.";

export const metadata: Metadata = {
  title: { absolute: "Labor-Only Movers Orlando | Toro Movers" },
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: "Labor-Only Movers Orlando | Toro Movers",
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const BULLETS = [
  "Loading & unloading by a careful local crew",
  "Truck, POD, U-Haul & storage loading help",
  "Up-front hourly rate — you keep your own truck",
];

const VALUE = [
  { h: "By the hour, up front", p: "Honest hourly pricing quoted before we start. No surprise add-ons, ever." },
  { h: "Just the muscle", p: "Already have a truck or POD? We bring the crew, the care, and the Tetris skills." },
  { h: "Fast to book", p: "Local Central Florida crews mean we can often fit you in this week." },
];

const PROOF = REVIEWS.filter((r) =>
  ["Labor only", "Short notice · disassembly", "Same-week storage move", "Apartment move"].includes(r.meta),
).slice(0, 3);

// CHANGE 3 (new FAQ entry targeting U-Haul / loading help queries)
const FAQS = [
  {
    q: "What is labor-only moving?",
    a: "You provide the truck, POD, or storage unit — we provide the crew. Toro Movers loads, unloads, and carefully handles your belongings by the hour, including stairs and heavy items.",
  },
  {
    q: "Can you help load or unload a U-Haul, PODS, or rental truck in Orlando?",
    a: "Yes — loading and unloading a U-Haul, PODS, rental truck, or storage container is exactly what labor-only moving is. You keep the truck; we load it tight so nothing shifts on the road, or unload and carry everything in. Billed by the hour, two-hour minimum, across Orlando and Central Florida.",
  },
  {
    q: "How much does labor-only cost?",
    a: "Labor-only is billed up front by the hour — a two-mover crew with a two-hour minimum, and you can add movers for bigger jobs. Shrink wrap, furniture blankets, and assembly/disassembly are included; no fuel surcharge, no stair fee. Send your move details and you'll get your exact rate in about 60 seconds — confirmed before we start, with no surprise line items.",
  },
  {
    q: "Do you only work in Central Florida?",
    a: "Yes. We're a local Central Florida moving company based in the Orlando metro and we keep it local — that's what lets us schedule fast and price honestly.",
  },
  {
    q: "Can you help on short notice?",
    a: "Often, yes. Call us to check availability for your date and we'll tell you right away what we can do.",
  },
];

// CHANGE 2 (service area data for the new section)
const SERVICE_AREAS = [
  {
    city: "Orlando",
    href: "/orlando-movers",
    note: "Our home base — crews available most days including weekends.",
  },
  {
    city: "Kissimmee",
    href: "/kissimmee-movers",
    note: "Frequent jobs near the 192 corridor and Osceola County.",
  },
  {
    city: "Sanford",
    href: "/sanford-movers",
    note: "Seminole County loading and unloading help, same crew, same rates.",
  },
  {
    city: "Altamonte Springs",
    href: "/altamonte-springs-movers",
    note: "Quick dispatch from I-4 — apartment and condo moves welcome.",
  },
  {
    city: "Winter Park",
    href: "/winter-park-movers",
    note: "Local crew familiar with the area's older homes and tight driveways.",
  },
  {
    city: "Apopka",
    href: "/apopka-movers",
    note: "Northwest Orange County covered at the same hourly rate.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      serviceType: "Labor-only moving help",
      // CHANGE 1 cont. (schema name aligned with new keyword focus)
      name: "Labor-only movers in Orlando & Central Florida",
      description: DESCRIPTION,
      areaServed: { "@type": "AdministrativeArea", name: SERVICE_REGION },
      provider: {
        "@type": "MovingCompany",
        name: BUSINESS_NAME,
        "@id": `${SITE_URL}/#movingcompany`,
        telephone: "+16896002720",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}${HREF}#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Labor-Only Movers Orlando", item: `${SITE_URL}${HREF}` },
      ],
    },
  ],
};

export default function LaborOnlyMovingPage() {
  return (
    <main className="fn-page">
      <FunnelView funnel="labor" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* DARK HERO */}
      <section className="fn-hero">
        <header className="fn-head">
          <Link href="/" className="fn-brand" aria-label={`${BUSINESS_NAME} — Home`}>
            {/* CHANGE 4 (logo alt + title added, matches footer.tsx fix in PR #62) */}
            <span className="fn-brand-mark" aria-hidden>
              <img
                src="/bull.svg"
                alt="Toro Movers logo"
                title="Toro Movers — Orlando Labor-Only Movers"
              />
            </span>
            <span className="fn-brand-name">TORO<span className="fn-accent">·</span>MOVERS</span>
          </Link>
          <a href={PHONE_TEL} className="fn-head-phone">{PHONE_DISPLAY}</a>
        </header>

        <div className="fn-hero-grid">
          <div className="fn-hero-copy">
            {/* CHANGE 1 (eyebrow and H1 updated to target "movers" keyword) */}
            <p className="fn-eyebrow">Labor-only movers · Orlando &amp; Central Florida</p>
            <h1 className="fn-h1">Labor-Only Movers in Orlando &amp; Central Florida</h1>
            <div className="fn-rule" aria-hidden />
            <p className="fn-sub">Get loading, unloading, stair help, and hourly labor from Toro Movers.</p>
            <ul className="fn-bullets">
              {BULLETS.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div className="fn-trust">
              <span className="fn-stars" aria-hidden>★★★★★</span>
              <span>{GOOGLE_RATING} on Google · Family-owned · Bilingual</span>
            </div>
            <div className="fn-hero-cta">
              <a href="#quote" data-open-quote data-source="funnel-labor-hero" data-service="Labor only" className="fn-btn fn-btn-primary fn-btn-lg">Get My Hourly Quote</a>
              <div className="fn-hero-cta-row">
                <CallCta>Call Now</CallCta>
                <TextCta>Text Us</TextCta>
              </div>
            </div>
          </div>

          <div className="fn-card" id="lead-form">
            <p className="fn-card-kicker">Free quote · ~30 seconds</p>
            <StepFunnelForm funnel="labor" />
          </div>
        </div>
      </section>

      {/* VALUE BULLETS */}
      <section className="fn-section">
        <h2 className="fn-h2">Built for labor-only moves</h2>
        <div className="fn-value">
          {VALUE.map((v) => (
            <div key={v.h} className="fn-value-item">
              <h3>{v.h}</h3>
              <p>{v.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="fn-section fn-section-soft">
        <h2 className="fn-h2">What Central Florida says</h2>
        <div className="fn-reviews">
          {PROOF.map((r) => (
            <figure key={r.name} className="fn-review">
              <span className="fn-stars" aria-hidden>★★★★★</span>
              <blockquote>{r.body}</blockquote>
              <figcaption><strong>{r.name}</strong><span>{r.meta}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CHANGE 2 — SERVICE AREA SECTION (geo-specific content, fills biggest content gap) */}
      <section className="fn-section">
        <h2 className="fn-h2">Labor-only movers across Central Florida</h2>
        <p className="fn-section-intro">
          We dispatch from the Orlando metro and cover the surrounding area at the same
          up-front hourly rate. No travel surcharges within our service zone.
        </p>
        <div className="fn-area-grid">
          {SERVICE_AREAS.map((area) => (
            <div key={area.city} className="fn-area-card">
              <h3>
                <Link href={area.href}>{area.city}</Link>
              </h3>
              <p>{area.note}</p>
            </div>
          ))}
        </div>
        <p className="fn-area-note">
          Need loading help without a full-service move?{" "}
          <Link href="/apartment-movers-orlando-fl">Apartment movers</Link> and labor-only
          service use the same crew — just let us know what you need when you book.
        </p>
      </section>

      <FaqSection items={FAQS} heading="Labor-only moving — common questions." />

      {/* DARK CTA BAND */}
      <section className="fn-cta-band">
        <h2 className="fn-cta-h2">Need a crew this week?</h2>
        <p>Get your up-front hourly quote in about 30 seconds.</p>
        <div className="fn-cta-band-row">
          <a href="#quote" data-open-quote data-source="funnel-labor-band" data-service="Labor only" className="fn-btn fn-btn-primary fn-btn-lg">Get Labor Help Now</a>
          <CallCta className="fn-btn fn-btn-ghost-light">Call Now — {PHONE_DISPLAY}</CallCta>
        </div>
      </section>

      {/* LOCAL PROOF / SERVICE AREA + SLIM FOOTER */}
      <footer className="fn-footer">
        <p className="fn-footer-eyebrow">Serving the Orlando metro</p>
        <nav className="fn-area" aria-label="Service areas">
          {CITIES.map((c) => (
            <Link key={c.slug} href={c.href}>{c.name}</Link>
          ))}
        </nav>
        <div className="fn-footer-bottom">
          <span>{BUSINESS_NAME} · Family-owned · Bilingual</span>
          <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
        </div>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="fn-sticky" role="region" aria-label="Quick contact">
        <CallCta className="fn-sticky-call">📞 Call</CallCta>
        <a href="#quote" data-open-quote data-source="funnel-labor-sticky" data-service="Labor only" className="fn-sticky-quote">Check Availability</a>
      </div>
    </main>
  );
}
