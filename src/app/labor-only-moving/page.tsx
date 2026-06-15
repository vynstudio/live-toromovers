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

const DESCRIPTION =
  "Labor-only moving help in Central Florida — loading, unloading & stair help by the hour. Family-owned, insured, bilingual. Get a quote today.";

export const metadata: Metadata = {
  title: { absolute: "Labor-Only Moving Help | Toro Movers" },
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: "Labor-Only Moving Help | Toro Movers",
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

const BULLETS = [
  "Loading & unloading by an insured local crew",
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

const FAQS = [
  {
    q: "What is labor-only moving?",
    a: "You provide the truck, POD, or storage unit — we provide the crew. Toro Movers loads, unloads, and carefully handles your belongings by the hour, including stairs and heavy items.",
  },
  {
    q: "How much does labor-only cost?",
    a: "It's billed up front by the hour. The rate depends on how many movers you need and roughly how long the job takes. We confirm the rate before we start — no surprise line items.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      serviceType: "Labor-only moving help",
      name: "Labor-only moving help in Central Florida",
      description: DESCRIPTION,
      areaServed: { "@type": "AdministrativeArea", name: `${SERVICE_REGION}, FL` },
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
        { "@type": "ListItem", position: 2, name: "Labor-Only Moving Help", item: `${SITE_URL}${HREF}` },
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
            <span className="fn-brand-mark" aria-hidden><img src="/bull.svg" alt="" /></span>
            <span className="fn-brand-name">TORO<span className="fn-accent">·</span>MOVERS</span>
          </Link>
          <a href={PHONE_TEL} className="fn-head-phone">{PHONE_DISPLAY}</a>
        </header>

        <div className="fn-hero-grid">
          <div className="fn-hero-copy">
            <p className="fn-eyebrow">Labor-only · {SERVICE_REGION}</p>
            <h1 className="fn-h1">Labor-Only Moving Help in Central Florida</h1>
            <div className="fn-rule" aria-hidden />
            <p className="fn-sub">Get loading, unloading, stair help, and hourly labor from Toro Movers.</p>
            <ul className="fn-bullets">
              {BULLETS.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div className="fn-trust">
              <span className="fn-stars" aria-hidden>★★★★★</span>
              <span>{GOOGLE_RATING} on Google · Family-owned · Insured · Bilingual</span>
            </div>
            <div className="fn-hero-cta">
              <a href="#lead-form" className="fn-btn fn-btn-primary fn-btn-lg">Get My Hourly Quote</a>
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

      <FaqSection items={FAQS} heading="Labor-only moving — common questions." />

      {/* DARK CTA BAND */}
      <section className="fn-cta-band">
        <h2 className="fn-cta-h2">Need a crew this week?</h2>
        <p>Get your up-front hourly quote in about 30 seconds.</p>
        <div className="fn-cta-band-row">
          <a href="#lead-form" className="fn-btn fn-btn-primary fn-btn-lg">Get Labor Help Now</a>
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
          <span>{BUSINESS_NAME} · Family-owned · Insured · Bilingual</span>
          <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
        </div>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="fn-sticky" role="region" aria-label="Quick contact">
        <CallCta className="fn-sticky-call">📞 Call</CallCta>
        <a href="#lead-form" className="fn-sticky-quote">Check Availability</a>
      </div>
    </main>
  );
}
