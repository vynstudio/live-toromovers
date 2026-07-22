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
const HREF = "/full-service-moving";

// Title ≤60, description ≤155.
const DESCRIPTION =
  "Full-service movers in Central Florida — packing, loading, truck transport & placement. Up-front pricing, bilingual crew. Quote in 60s.";

export const metadata: Metadata = {
  title: { absolute: "Full-Service Movers Orlando | Toro Movers" },
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: "Full-Service Movers Orlando | Toro Movers",
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const BULLETS = [
  "We pack, move, and set up your whole home",
  "Local crew · up-front hourly pricing",
  "Family-owned · bilingual · Central Florida only",
];

const VALUE = [
  { h: "Packing & supplies", p: "We bring boxes and wrap and pack your home room by room — or just the fragile things." },
  { h: "Door to door", p: "An experienced local crew loads, drives, protects, and unloads — you don't lift a box." },
  { h: "Set up & reassembled", p: "Furniture placed where you want it, beds and tables put back together." },
];

const PROOF = REVIEWS.filter((r) =>
  ["Full-service move", "Same-week storage move", "Apartment move", "Kissimmee → Clermont"].includes(r.meta),
).slice(0, 3);

const FAQS = [
  {
    q: "What does full-service moving include?",
    a: "Everything end to end: packing and supplies, loading, transport, unloading, furniture placement, and disassembly/reassembly. You can also pick just the parts you want.",
  },
  {
    q: "Do you only move locally?",
    a: "Yes. Toro Movers is a local Central Florida moving company serving the Orlando metro. We don't do long-distance — staying local lets us schedule fast and price honestly by the hour.",
  },
  {
    q: "How is a full-service move priced?",
    a: "Up front, by the hour — a two-mover crew and our truck (up to 26 ft) with a three-hour minimum, and you can add movers for larger homes. Shrink wrap, furniture blankets, and assembly/disassembly are included; no fuel surcharge, no stair fee. For long-distance moves a per-mile charge applies beyond 100 miles. Send your details and you'll get your exact price in about 60 seconds — confirmed before we start, no surprise add-ons.",
  },
  {
    q: "Do you bring packing supplies?",
    a: "Yes. If you choose packing help, we bring boxes, tape, and protective wrap and handle it for you — fragile items included.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      serviceType: "Full-service local moving",
      name: "Full-service local moving in Central Florida",
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
        { "@type": "ListItem", position: 2, name: "Full-Service Movers", item: `${SITE_URL}${HREF}` },
      ],
    },
  ],
};

export default function FullServiceMovingPage() {
  return (
    <main className="fn-page">
      <FunnelView funnel="full-service" />
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
            <p className="fn-eyebrow">Full-service · {SERVICE_REGION}</p>
            <h1 className="fn-h1">Full-Service Movers in Central Florida</h1>
            <div className="fn-rule" aria-hidden />
            <p className="fn-sub">Packing, loading, transport, and careful local moving from Toro Movers.</p>
            <ul className="fn-bullets">
              {BULLETS.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div className="fn-trust">
              <span className="fn-stars" aria-hidden>★★★★★</span>
              <span>{GOOGLE_RATING} on Google · Family-owned · Bilingual</span>
            </div>
            <div className="fn-hero-cta">
              <a href="#quote" data-open-quote data-source="funnel-fs-hero" data-service="Full-service move" className="fn-btn fn-btn-primary fn-btn-lg">Get My Quote</a>
              <div className="fn-hero-cta-row">
                <CallCta>Call Now</CallCta>
                <TextCta>Text Us</TextCta>
              </div>
            </div>
          </div>

          <div className="fn-card" id="lead-form">
            <p className="fn-card-kicker">Free quote · ~30 seconds</p>
            <StepFunnelForm funnel="full-service" />
          </div>
        </div>
      </section>

      {/* VALUE BULLETS */}
      <section className="fn-section">
        <h2 className="fn-h2">What full-service includes</h2>
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

      <FaqSection items={FAQS} heading="Full-service moving — common questions." />

      {/* DARK CTA BAND */}
      <section className="fn-cta-band">
        <h2 className="fn-cta-h2">Ready for a stress-free move?</h2>
        <p>Get up-front full-service pricing in about 30 seconds.</p>
        <div className="fn-cta-band-row">
          <a href="#quote" data-open-quote data-source="funnel-fs-band" data-service="Full-service move" className="fn-btn fn-btn-primary fn-btn-lg">Request Full-Service Pricing</a>
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
        <a href="#quote" data-open-quote data-source="funnel-fs-sticky" data-service="Full-service move" className="fn-sticky-quote">Check Availability</a>
      </div>
    </main>
  );
}
