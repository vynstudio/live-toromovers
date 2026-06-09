import Link from "next/link";
import { Nav } from "./nav";
import { TrustBand } from "./trust-band";
import { FaqSection } from "./faq-section";
import { ClosingCta } from "./closing-cta";
import { Footer } from "./footer";
import type { GuideData } from "@/lib/guides";
import { BUSINESS_NAME } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function GuidePage({ guide }: { guide: GuideData }) {
  const url = `${SITE_URL}${guide.href}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: guide.metadata.title,
        description: guide.metadata.description,
        datePublished: guide.datePublished,
        dateModified: guide.datePublished,
        mainEntityOfPage: url,
        url,
        image: `${SITE_URL}/opengraph-image`,
        author: {
          "@type": "Organization",
          name: BUSINESS_NAME,
          "@id": `${SITE_URL}/#movingcompany`,
        },
        publisher: {
          "@type": "Organization",
          name: BUSINESS_NAME,
          "@id": `${SITE_URL}/#movingcompany`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Moving Guides", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: guide.h1, item: url },
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
        <article>
          <section className="city-hero">
            <div className="city-hero-inner">
              <p className="city-kicker">moving guide</p>
              <h1 className="city-h1">{guide.h1}</h1>
              <p className="guide-meta">
                {fmtDate(guide.datePublished)} · {guide.readMins} min read ·{" "}
                <Link href="/blog">Toro Movers guides</Link>
              </p>
              <p className="city-subline">{guide.intro}</p>
              <div className="city-hero-cta">
                <Link href="/quote" className="btn btn-primary">
                  Get my free estimate
                  <span className="arrow" aria-hidden />
                </Link>
              </div>
            </div>
          </section>

          <TrustBand />

          <div className="guide-body">
            {guide.sections.map((s) => (
              <section key={s.h2} className="block guide-section">
                <div className="block-inner">
                  <h2 className="block-h2">{s.h2}</h2>
                  {s.body?.map((p, i) => (
                    <p key={i} className="guide-p">{p}</p>
                  ))}
                  {s.bullets && (
                    <ul className="guide-list">
                      {s.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>

          <FaqSection items={guide.faqs} heading="Moving in Orlando — common questions." />

          {/* Internal links */}
          <section className="block">
            <div className="block-inner">
              <div className="block-eyebrow">ready to move?</div>
              <h2 className="block-h2" style={{ marginBottom: 28 }}>
                Local Orlando movers, up-front pricing.
              </h2>
              <div className="city-others">
                <Link href="/orlando-movers" className="city-other">
                  <span className="city-other-url">/orlando-movers</span>
                  <h3 className="city-other-name">Orlando movers</h3>
                  <p className="city-other-desc">Local moves across Orlando and Orange County.</p>
                </Link>
                <Link href="/apartment-movers" className="city-other">
                  <span className="city-other-url">/apartment-movers</span>
                  <h3 className="city-other-name">Apartment movers</h3>
                  <p className="city-other-desc">Stairs, elevators, and tight complex windows, by the hour.</p>
                </Link>
                <Link href="/packing-services" className="city-other">
                  <span className="city-other-url">/packing-services</span>
                  <h3 className="city-other-name">Packing services</h3>
                  <p className="city-other-desc">Full or partial packing, done fast and carefully.</p>
                </Link>
                <Link href="/central-florida-movers" className="city-other">
                  <span className="city-other-url">/central-florida-movers</span>
                  <h3 className="city-other-name">Central Florida movers</h3>
                  <p className="city-other-desc">Our full service area across the Orlando metro.</p>
                </Link>
              </div>
            </div>
          </section>

          <ClosingCta />
        </article>
        <Footer />
      </main>
    </>
  );
}
