import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { TrustBand } from "@/components/trust-band";
import { ClosingCta } from "@/components/closing-cta";
import { Footer } from "@/components/footer";
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
const HREF = "/apartment-movers-orlando-fl";

const DESCRIPTION =
  "Toro Movers handles apartment moves across Orlando with honest hourly pricing, a bilingual crew, and same-week availability. No fuel surcharges. No stair fees. Get a quote in 60 seconds.";

export const metadata: Metadata = {
  title: { absolute: "Apartment Movers Orlando FL | Toro Movers — Hourly, No Hidden Fees" },
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: "Apartment Movers Orlando FL | Toro Movers — Hourly, No Hidden Fees",
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

// Why apartment moves are different — trust-building, snippet-friendly.
const DIFFERENT = [
  {
    h3: "Stairs, breezeways & elevators",
    body: "Walk-ups, narrow hallways, and a single slow elevator are where apartment moves get slow and furniture gets dinged. We pad and wrap on every tight turn and price by the hour — so a third-floor unit never turns into a surprise stair fee.",
  },
  {
    h3: "We work with your building",
    body: "Most Orlando complexes hold you to a move-in window and ask for a reserved elevator or a certificate of insurance. We're fully insured, send a COI naming your building or HOA on request, and show up inside the window so the leasing office doesn't hold up your day.",
  },
  {
    h3: "The clock stops when the job ends",
    body: "No padded time, no fuel surcharge, no weekend premium. You only pay for the hours your move actually takes, at a rate we agree on up front.",
  },
];

// Apartment-specific service tiers (adapted from the homepage three tiers).
const TIERS = [
  {
    title: "Loading help",
    sub: "Already have a U-Haul, PODS, or rental",
    bullets: ["2 movers, blankets, dollies & shrink wrap", "Load tight so nothing shifts on the road", "Two-hour minimum, billed by the hour"],
  },
  {
    title: "In-town apartment move",
    sub: "Studio to 3-bedroom apartment",
    bullets: ["Truck + 2 movers", "Furniture wrapped & protected", "Disassembly and reassembly included"],
    featured: true,
  },
  {
    title: "Big-day move",
    sub: "Large apartment or same-day full move",
    bullets: ["3 movers + truck", "Packing add-on available", "Same-week and same-day dates when open"],
  },
];

// Three most apartment-relevant Google reviews.
const PROOF = REVIEWS.filter((r) =>
  ["Labor only", "Apartment move", "Kissimmee → Clermont"].includes(r.meta),
).slice(0, 3);

const FAQS = [
  {
    q: "How much do apartment movers cost in Orlando?",
    a: "Apartment moves are billed by the hour, with the rate and crew size agreed up front. A two-mover crew handles most studio-to-2-bedroom apartments quickly, so you only pay for the hours used — no flat-rate padding and no surprise line items.",
  },
  {
    q: "Do you charge stair fees or elevator fees for apartment moves?",
    a: "No. There's no separate stair fee or elevator fee. A higher floor or a walk-up simply takes a little longer, and we tell you up front how that affects the estimate so nothing changes on the invoice.",
  },
  {
    q: "Can you provide a Certificate of Insurance (COI) for my building?",
    a: "Yes. We're fully insured and can send a certificate of insurance naming your building management or HOA ahead of move day — just send us the requirements when you book.",
  },
  {
    q: "How far in advance do I need to book?",
    a: "Sooner is better for a specific date, but because we're a local Central Florida crew we can often fit apartment moves in the same week, and same-day when the schedule is open. Call us to check your date.",
  },
  {
    q: "Do you move apartments to other cities in Florida?",
    a: "Yes, anywhere across the Orlando metro and Central Florida — Kissimmee, Oviedo, Lake Nona, Winter Park, Sanford, Clermont, and beyond. We focus on local moves and don't do long-distance or interstate.",
  },
  {
    q: "¿Hacen mudanzas de apartamentos en español?",
    a: "Sí. Toro Movers tiene una cuadrilla bilingüe — atendemos mudanzas de apartamentos en todo Orlando y Florida Central en inglés y español, con precios por hora y sin cargos sorpresa.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      serviceType: "Apartment moving service",
      name: "Apartment movers in Orlando, FL",
      description: DESCRIPTION,
      url: `${SITE_URL}${HREF}`,
      areaServed: { "@type": "City", name: "Orlando", containedInPlace: { "@type": "AdministrativeArea", name: SERVICE_REGION } },
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
        { "@type": "ListItem", position: 2, name: "Apartment Movers Orlando FL", item: `${SITE_URL}${HREF}` },
      ],
    },
  ],
};

export default function ApartmentMoversOrlandoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        {/* Hero */}
        <section className="city-hero">
          <div className="city-hero-inner">
            <p className="city-kicker">apartment movers · orlando, fl</p>
            <h1 className="city-h1">Apartment Movers in Orlando, FL</h1>
            <p className="city-subline">
              Toro Movers handles apartment moves across Orlando and Central Florida
              with upfront hourly pricing, a bilingual crew, and same-week
              availability. No fuel surcharges. No stair fees. No weekend premiums.
            </p>
            <div className="city-hero-cta">
              <Link href="/quote" className="btn btn-primary">
                Get my quote
                <span className="arrow" aria-hidden />
              </Link>
            </div>
            <div className="city-hero-meta">
              <span className="city-stars" aria-hidden>★★★★★</span>
              <span>{GOOGLE_RATING} on Google</span>
              <span className="sep">·</span>
              <a href={PHONE_TEL} className="city-phone">{PHONE_DISPLAY}</a>
            </div>
          </div>
        </section>

        <TrustBand />

        {/* Why apartment moves are different */}
        <section className="block">
          <div className="block-inner city-two-col city-two-col--mb">
            <div>
              <div className="block-eyebrow">apartment moves</div>
              <h2 className="block-h2">What makes apartment moving different (and how we handle it).</h2>
            </div>
            <p className="city-lead">
              Orlando is packed with apartment and condo communities, and they all
              come with the same friction: tight stairwells, reserved elevators,
              strict move-in windows, and building paperwork. As local{" "}
              <Link href="/">Orlando movers</Link>, apartment moves are what we run
              every week — and we price them honestly by the hour.
            </p>
          </div>
          <div className="block-inner">
            <div className="svc-points">
              {DIFFERENT.map((p) => (
                <div key={p.h3} className="svc-point">
                  <h3 className="svc-point-h3">{p.h3}</h3>
                  <p className="svc-point-body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service tiers */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">apartment moving services in orlando</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Three ways to move your apartment.
            </h2>
            <div className="tiers">
              {TIERS.map((tier) => (
                <article key={tier.title} className={`tier${tier.featured ? " featured" : ""}`}>
                  {tier.featured && <span className="tier-tag">Most popular</span>}
                  <h3 className="tier-title">{tier.title}</h3>
                  <p className="tier-sub">{tier.sub}</p>
                  <ul className="tier-bullets">
                    {tier.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                  <Link
                    href="/quote"
                    className={`btn ${tier.featured ? "btn-primary" : "btn-secondary"}`}
                  >
                    Get a free quote
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Areas served — internal links to city pages */}
        <section className="block city-hoods-section">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">where we work</div>
                <h2 className="block-h2">Orlando neighborhoods & cities we serve.</h2>
              </div>
              <p className="city-lead">
                We move apartments across the full Orlando metro — Lake Nona,
                Oviedo, Winter Park, Lake Mary, Sanford, Clermont, Apopka,
                Altamonte Springs, and 30+ surrounding cities. Moving to a nearby
                suburb? See{" "}
                <Link href="/kissimmee-movers">apartment movers in Kissimmee</Link>{" "}
                and pick your city below.
              </p>
            </div>
            <div className="city-others">
              {CITIES.map((c) => (
                <Link key={c.slug} href={c.href} className="city-other">
                  <span className="city-other-url">{c.href}</span>
                  <h3 className="city-other-name">{c.name}</h3>
                  <p className="city-other-desc">
                    Apartment & home movers in {c.name} and nearby Central Florida.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="block reviews">
          <div className="block-inner">
            <div className="reviews-head">
              <div className="block-eyebrow">what orlando renters say</div>
              <h2 className="block-h2">Apartment moves, done right.</h2>
              <div className="reviews-rating">
                <span className="stars" aria-hidden>★★★★★</span>
                <span>{GOOGLE_RATING} on Google</span>
              </div>
            </div>
            <div className="reviews-grid">
              {PROOF.map((r) => (
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

        {/* FAQ */}
        <FaqSection items={FAQS} heading="Apartment moving — common questions." />

        <ClosingCta />
        <Footer />
      </main>
    </>
  );
}
