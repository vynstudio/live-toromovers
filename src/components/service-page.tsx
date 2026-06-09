import Link from "next/link";
import { Nav } from "./nav";
import { TrustBand } from "./trust-band";
import { ClosingCta } from "./closing-cta";
import { Footer } from "./footer";
import { FaqSection } from "./faq-section";
import { otherServices, type ServiceData } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME, GOOGLE_RATING } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

export function ServicePage({ service }: { service: ServiceData }) {
  const others = otherServices(service.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_URL}${service.href}#service`,
        name: service.metadata.title,
        serviceType: service.serviceType,
        description: service.metadata.description,
        url: `${SITE_URL}${service.href}`,
        areaServed: { "@type": "AdministrativeArea", name: "Central Florida" },
        provider: {
          "@type": "MovingCompany",
          name: BUSINESS_NAME,
          "@id": `${SITE_URL}/#movingcompany`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faqs.map((f) => ({
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
            name: service.name,
            item: `${SITE_URL}${service.href}`,
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
        {/* Hero */}
        <section className="city-hero">
          <div className="city-hero-inner">
            <p className="city-kicker">{service.name.toLowerCase()}</p>
            <h1 className="city-h1">{service.h1}</h1>
            <p className="city-subline">{service.subline}</p>
            <div className="city-hero-cta">
              <Link href="/quote" className="btn btn-primary">
                Get my free estimate
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

        {/* Intro */}
        <section className="block">
          <div className="block-inner city-two-col">
            <div>
              <div className="block-eyebrow">{service.name.toLowerCase()}</div>
              <h2 className="block-h2">{service.intro.h2}</h2>
            </div>
            <p className="city-lead">{service.intro.lead}</p>
          </div>
        </section>

        {/* Value points */}
        <section className="block">
          <div className="block-inner">
            <div className="svc-points">
              {service.points.map((p) => (
                <div key={p.h3} className="svc-point">
                  <h3 className="svc-point-h3">{p.h3}</h3>
                  <p className="svc-point-body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service areas — internal links to city pages */}
        <section className="block city-hoods-section">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">where we work</div>
                <h2 className="block-h2">Across the Orlando metro.</h2>
              </div>
              <p className="city-lead">
                {service.name} across Orlando and the surrounding Central Florida
                cities — pick yours for local details.
              </p>
            </div>
            <div className="city-others">
              {CITIES.map((c) => (
                <Link key={c.slug} href={c.href} className="city-other">
                  <span className="city-other-url">{c.href}</span>
                  <h3 className="city-other-name">{c.name}</h3>
                  <p className="city-other-desc">
                    {service.name} in {c.name} and nearby Central Florida.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection
          items={service.faqs}
          heading={`${service.name} — common questions.`}
        />

        {/* Other services */}
        <section className="block">
          <div className="block-inner">
            <div className="block-eyebrow">more from toro movers</div>
            <h2 className="block-h2" style={{ marginBottom: 28 }}>
              Other moving services.
            </h2>
            <div className="city-others">
              <Link href="/central-florida-movers" className="city-other">
                <span className="city-other-url">/central-florida-movers</span>
                <h3 className="city-other-name">Central Florida movers</h3>
                <p className="city-other-desc">
                  Our full service area and everything we move across the metro.
                </p>
              </Link>
              {others.map((s) => (
                <Link key={s.slug} href={s.href} className="city-other">
                  <span className="city-other-url">{s.href}</span>
                  <h3 className="city-other-name">{s.name}</h3>
                  <p className="city-other-desc">{s.subline}</p>
                </Link>
              ))}
            </div>
            <p className="svc-disclaimer">
              Toro Movers is a local Central Florida moving company. We focus on
              local moves across the Orlando metro and do not offer long-distance
              or interstate moving.
            </p>
          </div>
        </section>

        <ClosingCta />
        <Footer />
      </main>
    </>
  );
}
