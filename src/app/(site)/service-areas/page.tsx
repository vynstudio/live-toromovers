import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { TrustBand } from "@/components/trust-band";
import { FaqSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { CITIES } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
  GOOGLE_RATING,
  SERVICE_BASE_LOCALITY,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";
const HREF = "/service-areas";

const TITLE = "Central Florida Moving Service Areas | Toro Movers";
const DESCRIPTION =
  "Toro Movers serves Orlando and 16+ Central Florida cities with local apartment, home, and labor-only moves. Upfront hourly pricing, no hidden fees. Find your city.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

/** Cluster cities grouped for the hub (all linked pages exist). */
const REGIONS: {
  name: string;
  blurb: string;
  cities: { name: string; href: string; note: string }[];
}[] = [
  {
    name: "Orlando metro & Orange County",
    blurb:
      "Core metro coverage — apartments, homes, offices, and short hops across Orlando and nearby Orange County communities.",
    cities: [
      { name: "Orlando", href: "/orlando-movers", note: "Main metro hub and service base" },
      { name: "Apopka", href: "/apopka-movers", note: "Growth corridor, Wekiva, family homes" },
      { name: "Winter Garden", href: "/winter-garden-movers", note: "Horizon West, Hamlin, new builds" },
      { name: "Windermere", href: "/windermere-movers", note: "Gated communities, careful handling" },
      { name: "Maitland", href: "/maitland-movers", note: "Maitland Center, Dommerich, offices" },
    ],
  },
  {
    name: "Seminole County",
    blurb:
      "North metro cities along I-4 and SR 436 — strong apartment density, HOA suburbs, and local office parks.",
    cities: [
      {
        name: "Altamonte Springs",
        href: "/altamonte-springs-movers",
        note: "Uptown, Cranes Roost, apartment moves",
      },
      { name: "Winter Park", href: "/winter-park-movers", note: "Park Avenue, older homes, careful furniture" },
      { name: "Fern Park", href: "/fern-park-movers", note: "17-92 corridor, labor-only & apartments" },
      { name: "Lake Mary", href: "/lake-mary-movers", note: "Heathrow, office parks, planned moves" },
      { name: "Sanford", href: "/sanford-movers", note: "Historic downtown, Lake Monroe, storage" },
      { name: "Oviedo", href: "/oviedo-movers", note: "UCF-area, family homes, East Orlando" },
    ],
  },
  {
    name: "Osceola County & south corridor",
    blurb:
      "Kissimmee and St. Cloud families, apartments, and routes toward Lake Nona and the Orlando metro.",
    cities: [
      { name: "Kissimmee", href: "/kissimmee-movers", note: "Apartments, families, bilingual crew" },
      { name: "St. Cloud", href: "/st-cloud-movers", note: "Residential, Lake Nona corridor" },
    ],
  },
  {
    name: "West & Polk County corridor",
    blurb:
      "Clermont through Lakeland and Winter Haven — larger homes, growth communities, and Orlando-to-regional hops on I-4 and SR 27.",
    cities: [
      { name: "Clermont", href: "/clermont-movers", note: "Lake County homes, Orlando routes" },
      { name: "Davenport", href: "/davenport-movers", note: "ChampionsGate, Four Corners, new builds" },
      { name: "Lakeland", href: "/lakeland-movers", note: "I-4 regional, apartments & homes" },
      { name: "Winter Haven", href: "/winter-haven-movers", note: "Polk expansion, family moves" },
    ],
  },
];

const FAQS = [
  {
    q: "What cities does Toro Movers serve in Central Florida?",
    a: "Toro Movers serves Orlando and surrounding Central Florida cities including Altamonte Springs, Winter Park, Maitland, Fern Park, Lake Mary, Sanford, Oviedo, Apopka, Kissimmee, Winter Garden, Windermere, Clermont, Davenport, Lakeland, Winter Haven, and St. Cloud. Open your city page below for local details, or request an estimate online.",
  },
  {
    q: "Do you have an office in every city you serve?",
    a: "No. Toro is a family-owned Central Florida moving company with a metro service area based in the Orlando region. We dispatch local crews across the cities listed here — we do not invent storefronts in every town. Service-area pages describe where we work, not fake branch addresses.",
  },
  {
    q: "Do you only move locally?",
    a: "Yes. We focus on local and short regional moves across the Orlando metro and Central Florida. We do not market long-distance or interstate van-line freight — staying local is how we keep same-week scheduling and honest hourly pricing.",
  },
  {
    q: "How does pricing work across different cities?",
    a: "The same model everywhere: upfront hourly pricing, crew size agreed before the day, no fuel surcharges, no stair fees, and no material fees. Furniture blankets, shrink wrap, equipment, and basic assembly/disassembly are included. Time on the job depends on home size, access, and preparation — not which city pin you click.",
  },
  {
    q: "How do I get a quote for my city?",
    a: "Use Get my free estimate with your addresses and move details, or call (689) 600-2720. We’ll confirm the hourly rate, minimum, and availability — including same-week dates when open.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["MovingCompany", "LocalBusiness"],
      "@id": `${SITE_URL}${HREF}#business`,
      name: `${BUSINESS_NAME} — Central Florida service areas`,
      url: `${SITE_URL}${HREF}`,
      telephone: PHONE_DISPLAY,
      description: DESCRIPTION,
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Central Florida",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: SERVICE_BASE_LOCALITY,
        addressRegion: "FL",
        addressCountry: "US",
      },
      parentOrganization: {
        "@type": "MovingCompany",
        name: BUSINESS_NAME,
        "@id": `${SITE_URL}/#movingcompany`,
      },
      knowsLanguage: ["en", "es"],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}${HREF}#city-list`,
      name: "Toro Movers local city pages",
      numberOfItems: CITIES.length,
      itemListElement: CITIES.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c.name} Movers`,
        url: `${SITE_URL}${c.href}`,
      })),
    },
    {
      "@type": "FAQPage",
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Service areas",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function ServiceAreasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <section className="city-hero">
          <div className="city-hero-inner">
            <p className="city-kicker">central florida · service areas</p>
            <h1 className="city-h1">Central Florida Moving Service Areas</h1>
            <p className="city-subline">
              Toro Movers is a family-owned local moving company serving Orlando
              and surrounding Central Florida cities — apartments, homes,
              offices, and labor-only help with upfront hourly pricing and no
              hidden fees.
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="service-areas-hero"
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="btn btn-outline">
                Call {PHONE_DISPLAY}
              </a>
            </div>
            <div className="city-hero-meta">
              <span className="city-stars" aria-hidden>
                ★★★★★
              </span>
              <span>
                {GOOGLE_RATING} on Google · Family-owned Central Florida ·
                Background-checked · Bilingual · Same-week · No hidden fees
              </span>
            </div>
          </div>
        </section>

        <TrustBand />

        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">how coverage works</div>
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              One local crew across Central Florida — not a franchise map of fake
              offices
            </h2>
            <div className="guide-body">
              <p className="guide-p">
                Find your city below for local details — apartments, HOAs, traffic,
                and common routes — or start from{" "}
                <Link href="/orlando-movers">Orlando movers</Link> or{" "}
                <Link href="/central-florida-movers">Central Florida movers</Link>{" "}
                if you want the regional overview.
              </p>
              <p className="guide-p">
                We dispatch background-checked, bilingual crews (Hablamos español)
                for local moves only. Same pricing promise everywhere: upfront
                hourly rates, no fuel surcharges, no stair fees, no material fees —
                blankets, shrink wrap, equipment, and basic assembly/disassembly
                included. Same-week scheduling is often available.
              </p>
              <p className="guide-p">
                Need a rate for your addresses?{" "}
                <Link href="/get-my-price">Get my free estimate</Link> or call{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>. For how hourly pricing
                works, see{" "}
                <Link href="/blog/what-youre-paying-for-orlando-movers">
                  Orlando moving rates
                </Link>{" "}
                and{" "}
                <Link href="/blog/hidden-moving-fees-orlando">
                  hidden moving fees
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* City grid by region */}
        {REGIONS.map((region) => (
          <section key={region.name} className="block">
            <div className="block-inner">
              <div className="city-two-col city-two-col--mb">
                <div>
                  <div className="block-eyebrow">cities we serve</div>
                  <h2 className="block-h2">{region.name}</h2>
                </div>
                <p className="city-lead">{region.blurb}</p>
              </div>
              <div className="city-others">
                {region.cities.map((c) => (
                  <Link key={c.href} href={c.href} className="city-other">
                    <span className="city-other-url">{c.href}</span>
                    <h3 className="city-other-name">{c.name} movers</h3>
                    <p className="city-other-desc">{c.note}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* A–Z full list from CITIES data */}
        <section className="block city-hoods-section">
          <div className="block-inner">
            <div className="block-eyebrow">find your city</div>
            <h2 className="block-h2" style={{ marginBottom: 16 }}>
              All cities we serve
            </h2>
            <p className="city-lead" style={{ marginBottom: 24 }}>
              Browse A–Z and open your city for local details, common questions,
              and a free estimate.
            </p>
            <div className="city-hoods">
              {[...CITIES]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <div key={c.slug} className="city-hood">
                    <Link href={c.href}>
                      <strong>{c.name} movers</strong>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="block">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">services</div>
                <h2 className="block-h2">Moving services across every area</h2>
              </div>
              <p className="city-lead">
                Apartment, home, office, full-service, and labor-only moves —
                available across the cities above.
              </p>
            </div>
            <div className="city-others">
              <Link href="/full-service-moving" className="city-other">
                <span className="city-other-url">/full-service-moving</span>
                <h3 className="city-other-name">Full-service moving</h3>
                <p className="city-other-desc">
                  Truck, crew, load, transport, and placement
                </p>
              </Link>
              <Link href="/labor-only-moving" className="city-other">
                <span className="city-other-url">/labor-only-moving</span>
                <h3 className="city-other-name">Labor-only moving</h3>
                <p className="city-other-desc">
                  U-Haul, POD, and rental truck loading help
                </p>
              </Link>
              {SERVICES.map((s) => (
                <Link key={s.slug} href={s.href} className="city-other">
                  <span className="city-other-url">{s.href}</span>
                  <h3 className="city-other-name">{s.name}</h3>
                  <p className="city-other-desc">{s.subline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FaqSection
          items={FAQS}
          heading="Service areas — common questions."
        />

        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Ready to book a Central Florida move?</h2>
            <p className="block-sub">
              Get your free estimate in about 60 seconds. Same-week dates may be
              available.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="service-areas-bottom"
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="btn btn-outline">
                Call {PHONE_DISPLAY}
              </a>
            </div>
            <p className="guide-p" style={{ marginTop: 24 }}>
              Regional overview:{" "}
              <Link href="/central-florida-movers">Central Florida movers</Link>
              {" · "}
              <Link href="/orlando-movers">Orlando movers</Link>
            </p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
