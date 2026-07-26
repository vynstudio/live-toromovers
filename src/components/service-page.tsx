import Link from "next/link";
import { Nav } from "./nav";
import { TrustBand } from "./trust-band";
import { ClosingCta } from "./closing-cta";
import { Footer } from "./footer";
import { FaqSection } from "./faq-section";
import { otherServices, type ServiceData } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME, GOOGLE_RATING } from "@/lib/contact";
import { BOOK_PATH } from "@/lib/open-quote";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

/** High-intent LPs that should surface deposit booking next to quote. */
const BOOK_DEPOSIT_SLUGS = new Set(["labor-only-moving", "full-service-moving"]);

export function ServicePage({ service }: { service: ServiceData }) {
  const others = otherServices(service.slug);
  const showBookDeposit = BOOK_DEPOSIT_SLUGS.has(service.slug);
  const bookHref =
    service.slug === "labor-only-moving"
      ? `${BOOK_PATH}?service=labor`
      : BOOK_PATH;
  // Outbound authoritative citation(s), woven inline below. Falls back to the
  // FMCSA mover-rights guide so every service page carries an external link.
  const refs = service.references?.length
    ? service.references
    : [{ label: "the FMCSA's guide to your rights as a mover", href: "https://www.fmcsa.dot.gov/protect-your-move" }];

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
              <a
                href="/get-my-price"
                data-open-quote
                data-source={`service-hero-${service.slug}`}
                className="btn btn-primary"
              >
                Get my free estimate
                <span className="arrow" aria-hidden />
              </a>
              {showBookDeposit ? (
                <Link
                  href={bookHref}
                  className="btn btn-outline"
                  data-source={`service-book-${service.slug}`}
                >
                  Book &amp; pay deposit
                </Link>
              ) : (
                <a href={PHONE_TEL} className="btn btn-outline">
                  Call {PHONE_DISPLAY}
                </a>
              )}
            </div>
            <div className="city-hero-meta">
              <span className="city-stars" aria-hidden>★★★★★</span>
              <span>
                {GOOGLE_RATING} on Google · Family-owned · No hidden fees
                {showBookDeposit ? (
                  <>
                    {" · "}
                    <a href={PHONE_TEL} style={{ color: "inherit", fontWeight: 600 }}>
                      Call {PHONE_DISPLAY}
                    </a>
                  </>
                ) : null}
              </span>
            </div>
          </div>
        </section>

        <TrustBand />

        {/* Intro */}
        <section className="block">
          <div className="block-inner">
            <div className="city-two-col">
              <div>
                <div className="block-eyebrow">{service.name.toLowerCase()}</div>
                <h2 className="block-h2">{service.intro.h2}</h2>
              </div>
              <p className="city-lead">{service.intro.lead}</p>
            </div>
            <p className="city-lead" style={{ marginTop: 16 }}>
              Planning ahead?{" "}
              <Link href="/central-florida-moving-checklist">
                Download the free Central Florida moving checklist
              </Link>{" "}
              — a week-by-week guide that covers packing, utility transfers, and
              move-day prep. Before move day it also helps to skim{" "}
              {refs.map((r, i) => (
                <span key={r.href}>
                  {i === 0 ? "" : i === refs.length - 1 ? " and " : ", "}
                  <a href={r.href}>{r.label}</a>
                </span>
              ))}
              .
            </p>
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
              or interstate moving.{" "}
              <Link href="/blog">Moving tips and local guides</Link>.
            </p>
          </div>
        </section>

        {showBookDeposit && (
          <section className="block closing" aria-label="Book with deposit">
            <div className="block-inner">
              <div className="block-eyebrow reveal">ready to lock a date?</div>
              <h2 className="block-h2 reveal reveal-d1">
                Book online &amp; <em>pay your deposit</em>
              </h2>
              <p className="block-sub reveal reveal-d2">
                Pick a start window in our Square calendar. Your deposit holds the
                date and applies to your move total. Prefer to talk price first?
                Get a free estimate instead.
              </p>
              <div className="closing-cta-row reveal reveal-d3">
                <Link href={bookHref} className="btn btn-primary">
                  Book &amp; pay deposit
                  <span className="arrow" aria-hidden />
                </Link>
                <a
                  href="/get-my-price"
                  data-open-quote
                  data-source={`service-closing-quote-${service.slug}`}
                  className="btn btn-outline"
                >
                  Get free estimate
                </a>
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
