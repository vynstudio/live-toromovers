import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { TrustBand } from "@/components/trust-band";
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
  "Toro Movers handles apartment moves across Orlando with honest hourly pricing, a bilingual crew, and same-week availability. No stair fees. No fuel surcharges. Get a quote in 60 seconds.";

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

// Apartment-specific service tiers.
const TIERS = [
  {
    title: "Loading help",
    sub: "Already have a U-Haul, PODS, or rental",
    body: "You've got the truck — we bring the crew. Two movers load or unload your U-Haul, PODS, or rental truck. Blankets, dollies, and shrink wrap included. Minimum two hours.",
    bestFor: "Renters who already have a truck rented and just need strong, careful hands.",
  },
  {
    title: "In-town apartment move",
    sub: "Studio to 3-bedroom apartment",
    body: "Our truck, our crew, your timeline. Two movers and our truck for studio, one-, two-, and three-bedroom apartments anywhere in Central Florida.",
    bestFor: "The standard apartment-to-apartment move within Orlando or to a nearby city.",
    featured: true,
  },
  {
    title: "Big-day move",
    sub: "Large apartment or same-day full move",
    body: "Three movers and our truck for larger apartments, upper-floor walk-ups, or moves that need to happen fast. Same up-front hourly rate — just more hands.",
    bestFor: "Large apartments, tight move-out windows, or anyone who wants it done in one shot.",
  },
];

const INCLUDED = [
  "Furniture wrapping and blanket protection",
  "Dollies and moving straps",
  "Shrink wrap for upholstered pieces",
  "Bilingual crew",
  "Certificate of Insurance available on request",
  "No fuel surcharges, no stair fees, no elevator fees, no weekend premiums",
];

const ORLANDO_HOODS = [
  "Downtown Orlando", "Lake Nona", "Dr. Phillips", "Hunters Creek", "College Park",
  "Milk District", "Thornton Park", "Azalea Park", "Conway", "Pine Hills",
];

// Three most apartment-relevant Google reviews (Giuseppe = labor-only,
// Kony = Kissimmee apartment, Stael = apartment) — pulled from real data.
const PROOF = REVIEWS.filter((r) =>
  ["Labor only", "Kissimmee → Clermont", "Apartment move"].includes(r.meta),
).slice(0, 3);

const FAQS = [
  {
    q: "How much do apartment movers cost in Orlando?",
    a: "Toro Movers charges an up-front hourly rate with a two-hour minimum. You get your written quote in about 60 seconds before you book — no estimate that balloons on moving day. The exact rate depends on crew size and truck, which we confirm when you submit your move details.",
  },
  {
    q: "Do you charge stair fees or elevator fees for apartment moves?",
    a: "No. Our hourly rate covers everything — stairs, elevators, long carries, heavy furniture. There are no add-on fees for building logistics.",
  },
  {
    q: "Can you provide a Certificate of Insurance (COI) for my building?",
    a: "Yes. Toro Movers is fully insured and can send a certificate of insurance naming your property manager or HOA before your move date — just send us your building's requirements when you book.",
  },
  {
    q: "How far in advance do I need to book?",
    a: "We offer same-week scheduling on most dates. For weekend moves, booking 5–7 days ahead is recommended. Call (689) 600-2720 for last-minute availability.",
  },
  {
    q: "Do you move apartments to other cities in Central Florida?",
    a: "Yes — we move apartments throughout the full Orlando metro including Kissimmee, Sanford, Altamonte Springs, Lake Mary, Oviedo, Clermont, Winter Park, and 30+ surrounding cities. We focus on local moves across Central Florida and don't take long-distance or interstate jobs.",
  },
  {
    q: "¿Hacen mudanzas de apartamentos en español?",
    a: "Sí. Todo nuestro equipo es bilingüe — podemos cotizar, coordinar y completar tu mudanza de apartamento completamente en español, con precios por hora y sin cargos sorpresa.",
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
              with up-front hourly pricing, a bilingual crew, and same-week
              availability. No fuel surcharges. No stair fees. No weekend premiums.
              The clock stops when the job ends.
            </p>
            <div className="city-hero-cta">
              <Link href="/quote" className="btn btn-primary">
                Get my quote
                <span className="arrow" aria-hidden />
              </Link>
              <a href={PHONE_TEL} className="btn btn-secondary">
                Call {PHONE_DISPLAY}
              </a>
            </div>
            <div className="city-hero-meta">
              <span className="city-stars" aria-hidden>★★★★★</span>
              <span>{GOOGLE_RATING} on Google</span>
              <span className="sep">·</span>
              <span>Up-front hourly · 2-hour minimum · Bilingual · Same-week dates</span>
            </div>
          </div>
        </section>

        <TrustBand />

        {/* Why apartment moves are different */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">apartment moves</div>
            <h2 className="block-h2" style={{ marginBottom: 24 }}>
              What makes apartment moving different (and how we handle it).
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Apartment moves come with challenges that house moves don&rsquo;t.
                Narrow hallways, tight stairwells, elevator reservation windows, and
                building-management requirements can turn a simple move into a
                logistical puzzle — if your movers aren&rsquo;t prepared.
              </p>
              <p className="guide-p">
                As local <Link href="/">Orlando movers</Link>, we&rsquo;ve handled
                apartments across Orlando&rsquo;s biggest complexes and smallest
                walk-ups. We coordinate elevator access, work within your
                building&rsquo;s move-in window, and carry a Certificate of Insurance
                your property manager can have on file before moving day.
              </p>
              <p className="guide-p">
                Our crew wraps every piece of furniture before it leaves your
                apartment. Couches go vertical. Mattresses get bagged. Nothing scrapes
                your walls or dings your doorframes — because your security deposit is
                on the line, and we treat it like it&rsquo;s ours.
              </p>
              <p className="guide-p">
                And because we charge by the hour with a two-hour minimum, you only
                pay for the time we actually work. The clock stops when the last box is
                placed.
              </p>
            </div>
          </div>
        </section>

        {/* Service tiers */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">apartment moving services in orlando</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Three ways we can help — all at the same up-front hourly rate.
            </h2>
            <div className="tiers">
              {TIERS.map((tier) => (
                <article key={tier.title} className={`tier${tier.featured ? " featured" : ""}`}>
                  {tier.featured && <span className="tier-tag">Most popular</span>}
                  <h3 className="tier-title">{tier.title}</h3>
                  <p className="tier-sub">{tier.sub}</p>
                  <p className="svc-point-body">{tier.body}</p>
                  <p className="svc-point-body"><strong>Best for:</strong> {tier.bestFor}</p>
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

        {/* What's always included */}
        <section className="block">
          <div className="block-inner city-two-col city-two-col--mb">
            <div>
              <div className="block-eyebrow">every apartment move</div>
              <h2 className="block-h2">What&rsquo;s always included.</h2>
            </div>
            <div className="tier" style={{ margin: 0 }}>
              <ul className="tier-bullets">
                {INCLUDED.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Neighborhoods & cities */}
        <section className="block city-hoods-section">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">where we work</div>
                <h2 className="block-h2">Orlando apartment neighborhoods we serve.</h2>
              </div>
              <p className="city-lead">
                We move apartments throughout the full Orlando metro and surrounding
                cities. If your apartment is in Central Florida, we serve it —{" "}
                <a href={PHONE_TEL}>call {PHONE_DISPLAY}</a> or{" "}
                <Link href="/quote">get a free quote</Link> to confirm your area.
              </p>
            </div>
            <div className="city-hoods">
              {ORLANDO_HOODS.map((hood) => (
                <div key={hood} className="city-hood">
                  <span>{hood}</span>
                </div>
              ))}
            </div>
            <div className="city-others" style={{ marginTop: 28 }}>
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

        {/* Closing CTA */}
        <section className="city-angle">
          <div className="block-inner">
            <div className="city-angle-body">
              <div className="block-eyebrow city-eyebrow--light">ready to move?</div>
              <h2 className="city-angle-h2">Ready to move your apartment?</h2>
              <p className="city-angle-text">
                Get a quote in about 60 seconds. Up-front hourly pricing, no hidden
                fees, same-week dates available. {GOOGLE_RATING} stars on Google ·
                Family-owned · Bilingual crew · Insured.
              </p>
              <div className="city-hero-cta" style={{ marginTop: 24 }}>
                <Link href="/quote" className="btn btn-primary">
                  Get my free quote
                  <span className="arrow" aria-hidden />
                </Link>
                <a href={PHONE_TEL} className="btn btn-secondary">
                  Call {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
