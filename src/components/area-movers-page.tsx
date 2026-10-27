import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FaqSection } from "@/components/faq-section";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  PHONE_SMS_HREF,
  BUSINESS_NAME,
  SERVICE_BASE_LOCALITY,
  PHONE_E164,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";

export type AreaFaq = { q: string; a: string };

export type AreaMoversContent = {
  href: string;
  title: string;
  description: string;
  h1: string;
  kicker: string;
  subline: string;
  /** Short answer under the H1. No prices. */
  answer: string;
  planH2: string;
  plan: string[];
  servicesH2: string;
  services: { h3: string; body: string; href: string; anchor: string }[];
  costH2: string;
  /** Cost section body. Dollar amounts belong in the FAQ only. */
  cost: string[];
  neighborhoodsH2: string;
  neighborhoodsLead: string;
  neighborhoods: { name: string; note: string }[];
  nearby: { href: string; label: string }[];
  faqs: AreaFaq[];
  lat: number;
  lng: number;
  areaName: string;
};

export function areaMetadata(content: AreaMoversContent): Metadata {
  return {
    title: { absolute: content.title },
    description: content.description,
    alternates: { canonical: content.href },
    openGraph: {
      title: content.title,
      description: content.description,
      url: `${SITE_URL}${content.href}`,
      type: "website" as const,
      locale: "en_US",
      images: [
        {
          url: "https://toromovers.com/og/default.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
    robots: { index: true, follow: true },
  };
}

export function AreaMoversPage({ content }: { content: AreaMoversContent }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_URL}${content.href}#service`,
        name: content.h1,
        serviceType: "Local moving",
        url: `${SITE_URL}${content.href}`,
        provider: { "@id": `${SITE_URL}/#movingcompany` },
        areaServed: { "@type": "Place", name: content.areaName },
      },
      {
        "@type": ["MovingCompany", "LocalBusiness"],
        "@id": `${SITE_URL}${content.href}#business`,
        name: `${BUSINESS_NAME}, ${content.areaName}`,
        url: `${SITE_URL}${content.href}`,
        telephone: PHONE_E164,
        description: content.description,
        areaServed: { "@type": "Place", name: content.areaName },
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
        geo: {
          "@type": "GeoCoordinates",
          latitude: content.lat,
          longitude: content.lng,
        },
        knowsLanguage: ["en", "es"],
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faqs.map((f) => ({
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
            name: "Orlando movers",
            item: `${SITE_URL}/orlando-movers`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: content.h1,
            item: `${SITE_URL}${content.href}`,
          },
        ],
      },
    ],
  };

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
            <p className="city-kicker">{content.kicker}</p>
            <h1 className="city-h1">{content.h1}</h1>
            <p className="city-subline">{content.subline}</p>
            <p className="city-subline" style={{ marginTop: 12 }}>
              {content.answer}
            </p>
            <div className="city-hero-cta">
              <a
                href="/get-my-price"
                data-open-quote
                data-source="area-hero"
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="btn btn-secondary">
                Call {PHONE_DISPLAY}
              </a>
              <a href={PHONE_SMS_HREF} className="btn btn-outline">
                Text {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        <section className="block">
          <div className="block-inner">
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              {content.planH2}
            </h2>
            <div className="guide-body">
              {content.plan.map((p, i) => (
                <p key={i} className="guide-p">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="block-inner">
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              {content.servicesH2}
            </h2>
            <div className="guide-body">
              {content.services.map((s) => (
                <div key={s.h3}>
                  <h3 className="guide-h3">{s.h3}</h3>
                  <p className="guide-p">
                    {s.body}{" "}
                    <Link href={s.href}>{s.anchor}</Link>.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="block-inner">
            <h2 className="block-h2" style={{ marginBottom: 20 }}>
              {content.costH2}
            </h2>
            <div className="guide-body">
              {content.cost.map((p, i) => (
                <p key={i} className="guide-p">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="block city-hoods-section">
          <div className="block-inner">
            <h2 className="block-h2" style={{ marginBottom: 16 }}>
              {content.neighborhoodsH2}
            </h2>
            <p className="guide-p">{content.neighborhoodsLead}</p>
            <div className="city-hoods">
              {content.neighborhoods.map((n) => (
                <div key={n.name} className="city-hood">
                  <span>
                    <strong>{n.name}</strong>
                    {". "}
                    {n.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="block-inner">
            <p className="guide-p">
              This page sits under the{" "}
              <Link href="/orlando-movers">Orlando movers</Link> hub. Nearby
              city pages:{" "}
              {content.nearby.map((n, i) => (
                <span key={n.href}>
                  {i > 0 ? ", " : null}
                  <Link href={n.href}>{n.label}</Link>
                </span>
              ))}
              .
            </p>
          </div>
        </section>

        <FaqSection
          items={content.faqs}
          heading={`${content.areaName} moving FAQ`}
        />

        <section className="block">
          <div className="block-inner" style={{ textAlign: "center" }}>
            <h2 className="block-h2">Request a quote in {content.areaName}</h2>
            <p className="block-sub">
              Call or text {PHONE_DISPLAY}, or send the date and both addresses
              for a quote.
            </p>
            <div className="city-hero-cta" style={{ justifyContent: "center" }}>
              <a
                href="/get-my-price"
                data-open-quote
                data-source="area-bottom"
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              <a href={PHONE_TEL} className="btn btn-outline">
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
