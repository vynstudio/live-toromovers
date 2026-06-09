import Link from "next/link";
import { Nav } from "./nav";
import { TrustBand } from "./trust-band";
import { ClosingCta } from "./closing-cta";
import { Footer } from "./footer";
import { FaqSection } from "./faq-section";
import { otherCities, type CityData } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
  GOOGLE_RATING,
} from "@/lib/contact";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CityPage({ city }: { city: CityData }) {
  const others = otherCities(city.slug);

  // One business, many service areas. The rating lives ONLY on the canonical
  // homepage MovingCompany entity (#movingcompany) — we do NOT repeat an
  // aggregateRating per city, which would duplicate one rating across 12
  // "businesses" and read as fabricated review counts to Google. Each city
  // node links back to the parent via parentOrganization, plus a breadcrumb.
  const graph: Record<string, unknown>[] = [
    {
      "@type": "MovingCompany",
      "@id": `${SITE_URL}${city.href}#business`,
      name: `${BUSINESS_NAME} — ${city.name}`,
      url: `${SITE_URL}${city.href}`,
      telephone: PHONE_DISPLAY,
      areaServed: { "@type": "City", name: `${city.name}, FL` },
      parentOrganization: {
        "@type": "MovingCompany",
        name: BUSINESS_NAME,
        "@id": `${SITE_URL}/#movingcompany`,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.schema.lat,
        longitude: city.schema.lng,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: `${city.name} Movers`,
          item: `${SITE_URL}${city.href}`,
        },
      ],
    },
  ];
  if (city.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: city.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

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
            <p className="city-kicker">{city.name.toLowerCase()}</p>
            <h1 className="city-h1">{city.h1}</h1>
            <p className="city-subline">{city.subline}</p>
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

        {/* About */}
        <section className="block">
          <div className="block-inner city-two-col">
            <div>
              <div className="block-eyebrow">about</div>
              <h2 className="block-h2">{city.about.h2}</h2>
            </div>
            <p className="city-lead">{city.about.lead}</p>
          </div>
        </section>

        {/* Neighborhoods */}
        <section className="block city-hoods-section">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">neighborhoods served</div>
                <h2 className="block-h2">{city.name} areas we cover.</h2>
              </div>
              <p className="city-lead">
                We work {city.name} full-time. These are the neighborhoods our crews
                know by name — buildings, streets, parking patterns, the works.
              </p>
            </div>
            <div className="city-hoods">
              {city.neighborhoods.map((hood) => (
                <div key={hood} className="city-hood">
                  <span className="city-hood-pin" aria-hidden><PinIcon /></span>
                  <span>{hood}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Unique angle */}
        <section className="city-angle">
          <div className="block-inner">
            <div className="city-angle-body">
              <div className="block-eyebrow city-eyebrow--light">{city.uniqueAngle.eyebrow}</div>
              <h2 className="city-angle-h2">{city.uniqueAngle.h2}</h2>
              <p className="city-angle-text">{city.uniqueAngle.body}</p>
            </div>
          </div>
        </section>

        {/* Moving services — internal links */}
        <section className="block">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">services</div>
                <h2 className="block-h2">{city.name} moving services.</h2>
              </div>
              <p className="city-lead">
                Whatever your {city.name} move needs — one local crew, billed by
                the hour, fully insured.
              </p>
            </div>
            <div className="city-others">
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

        {/* City FAQ */}
        {city.faqs?.length ? (
          <FaqSection
            items={city.faqs}
            heading={`${city.name} movers — common questions.`}
          />
        ) : null}

        {/* Other cities */}
        {others.length > 0 && (
          <section className="block">
            <div className="block-inner">
              <div className="city-two-col city-two-col--mb">
                <div>
                  <div className="block-eyebrow">service areas</div>
                  <h2 className="block-h2">Also serving nearby cities.</h2>
                </div>
                <p className="city-lead">
                  {BUSINESS_NAME} works the same neighborhoods, the same process,
                  across Central Florida.
                </p>
              </div>
              <div className="city-others">
                {others.map((other) => (
                  <Link key={other.slug} href={other.href} className="city-other">
                    <span className="city-other-url">{other.href}</span>
                    <h3 className="city-other-name">{other.name}</h3>
                    <p className="city-other-desc">
                      Movers serving {other.name} and surrounding areas in Central Florida.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <ClosingCta />
        <Footer />
      </main>
    </>
  );
}
