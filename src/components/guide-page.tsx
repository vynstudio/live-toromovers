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

// Topic-relevant internal links per guide (additive; falls back to
// DEFAULT_RELATED when a guide has no specific map). All targets are existing
// 200 pages — no new URLs introduced.
type RelatedLink = { href: string; name: string; desc: string };

const DEFAULT_RELATED: RelatedLink[] = [
  { href: "/orlando-movers", name: "Orlando movers", desc: "Local moves across Orlando and Orange County." },
  { href: "/apartment-movers-orlando-fl", name: "Apartment movers", desc: "Stairs, elevators, and tight complex windows, by the hour." },
  { href: "/packing-services", name: "Packing services", desc: "Full or partial packing, done fast and carefully." },
  { href: "/central-florida-movers", name: "Central Florida movers", desc: "Our full service area across the Orlando metro." },
];

const RELATED_BY_SLUG: Record<string, RelatedLink[]> = {
  "how-to-prepare-for-a-local-move-in-orlando": [
    { href: "/labor-only-moving", name: "Labor-only moving", desc: "Loading, unloading & stair help by the hour." },
    { href: "/full-service-moving", name: "Full-service moving", desc: "Packing, loading, transport — you don't lift a box." },
    { href: "/orlando-movers", name: "Orlando movers", desc: "Local moves across Orlando and Orange County." },
    { href: "/central-florida-moving-checklist", name: "Free moving checklist", desc: "Plan your move and get quote-ready fast." },
  ],
  "apartment-moving-checklist-orlando-renters": [
    { href: "/apartment-movers-orlando-fl", name: "Apartment movers", desc: "Stairs, elevators, and tight complex windows, by the hour." },
    { href: "/loading-unloading", name: "Loading & unloading", desc: "U-Haul, PODS & rental trucks loaded tight." },
    { href: "/altamonte-springs-movers", name: "Altamonte Springs movers", desc: "Apartment & condo moves across Seminole County." },
    { href: "/central-florida-moving-checklist", name: "Free moving checklist", desc: "Apartment section: elevators, COI, parking." },
  ],
  "best-time-to-move-central-florida": [
    { href: "/central-florida-movers", name: "Central Florida movers", desc: "Our full service area across the metro." },
    { href: "/orlando-movers", name: "Orlando movers", desc: "Local moves across Orlando and Orange County." },
    { href: "/full-service-moving", name: "Full-service moving", desc: "Packing, loading, transport — handled start to finish." },
  ],
  "how-much-does-a-local-move-cost-orlando": [
    { href: "/labor-only-moving", name: "Labor-only moving", desc: "Lowest-cost option — hourly loading/unloading help." },
    { href: "/full-service-moving", name: "Full-service moving", desc: "Door-to-door move with up-front hourly pricing." },
    { href: "/loading-unloading", name: "Loading & unloading", desc: "You rented the truck; we load it right." },
    { href: "/central-florida-movers", name: "Central Florida movers", desc: "Up-front pricing across the Orlando metro." },
  ],
  "hidden-moving-fees-orlando": [
    { href: "/blog/what-youre-paying-for-orlando-movers", name: "What you're paying for", desc: "Orlando moving rates and what's in the hourly rate." },
    { href: "/orlando-movers", name: "Orlando movers", desc: "Up-front pricing across Orlando and Orange County." },
    { href: "/full-service-moving", name: "Full-service moving", desc: "Packing, loading, transport — no surprise line items." },
    { href: "/central-florida-movers", name: "Central Florida movers", desc: "Transparent, by-the-hour moves across the metro." },
  ],
  "what-youre-paying-for-orlando-movers": [
    { href: "/blog/full-service-vs-labor-only-orlando", name: "Full-service vs. labor-only", desc: "Which option fits your move — with price examples." },
    { href: "/blog/hidden-moving-fees-orlando", name: "Hidden moving fees", desc: "The charges shady movers add — and how to avoid them." },
    { href: "/full-service-moving", name: "Full-service moving", desc: "Truck + crew. Everything included." },
    { href: "/labor-only-moving", name: "Labor-only moving", desc: "You keep the truck; we bring the muscle." },
  ],
  "full-service-vs-labor-only-orlando": [
    { href: "/full-service-moving", name: "Full-service moving", desc: "Truck + crew, door to door." },
    { href: "/labor-only-moving", name: "Labor-only moving", desc: "Crew only, you supply the truck." },
    { href: "/blog/labor-only-moving-orlando", name: "Labor-only guide", desc: "When you've got the truck but need the muscle." },
    { href: "/blog/what-youre-paying-for-orlando-movers", name: "What you're paying for", desc: "How Orlando hourly rates actually work." },
  ],
  "labor-only-moving-orlando": [
    { href: "/labor-only-moving", name: "Labor-only moving", desc: "Book loading/unloading help by the hour." },
    { href: "/loading-unloading", name: "Loading & unloading", desc: "U-Haul, PODS & rental trucks loaded tight." },
    { href: "/blog/full-service-vs-labor-only-orlando", name: "Full-service vs. labor-only", desc: "Compare the two options and costs." },
    { href: "/blog/what-youre-paying-for-orlando-movers", name: "What you're paying for", desc: "Orlando moving rates, explained." },
  ],
};

export function GuidePage({ guide }: { guide: GuideData }) {
  const url = `${SITE_URL}${guide.href}`;
  const related = RELATED_BY_SLUG[guide.slug] ?? DEFAULT_RELATED;

  // Article image(s): the branded OG image plus the featured/inline figures.
  const sectionImages = guide.sections
    .map((s) => s.image?.src)
    .filter((src): src is string => Boolean(src));
  const articleImages = [
    `${SITE_URL}/opengraph-image`,
    ...(guide.image ? [`${SITE_URL}${guide.image.src}`] : []),
    ...sectionImages.map((src) => `${SITE_URL}${src}`),
  ];

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
        image: articleImages,
        author: {
          "@type": "Organization",
          name: BUSINESS_NAME,
          "@id": `${SITE_URL}/#movingcompany`,
        },
        publisher: {
          "@type": "Organization",
          name: BUSINESS_NAME,
          "@id": `${SITE_URL}/#movingcompany`,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/bull.svg`,
          },
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
                <a href="#quote" data-open-quote data-source="guide-hero" className="btn btn-primary">
                  Get my free estimate
                  <span className="arrow" aria-hidden />
                </a>
              </div>
            </div>
          </section>

          <TrustBand />

          <div className="guide-body">
            {guide.lead?.map((p, i) => (
              <section key={`lead-${i}`} className="block guide-section">
                <div className="block-inner">
                  <p className="guide-p">{p}</p>
                </div>
              </section>
            ))}
            {guide.sections.map((s) => (
              <section key={s.h2} className="block guide-section">
                <div className="block-inner">
                  <h2 className="block-h2">{s.h2}</h2>

                  {/* Ordered blocks (richer guides) */}
                  {s.blocks?.map((b, bi) => {
                    switch (b.kind) {
                      case "p":
                        return <p key={bi} className="guide-p">{b.text}</p>;
                      case "h3":
                        return <h3 key={bi} className="guide-h3">{b.text}</h3>;
                      case "ul":
                        return (
                          <ul key={bi} className="guide-list">
                            {b.items.map((it, i) => <li key={i}>{it}</li>)}
                          </ul>
                        );
                      case "ol":
                        return (
                          <ol key={bi} className="guide-questions">
                            {b.items.map((q, i) => (
                              <li key={i}><strong>{q.lead}</strong>{q.body ? ` ${q.body}` : ""}</li>
                            ))}
                          </ol>
                        );
                      case "note":
                        return (
                          <blockquote key={bi} className="guide-note">
                            <strong>
                              {b.note.before}
                              {b.note.href && b.note.linkText ? (
                                <a href={b.note.href}>{b.note.linkText}</a>
                              ) : (
                                b.note.linkText
                              )}
                              {b.note.after}
                            </strong>
                          </blockquote>
                        );
                      case "image":
                        return (
                          <figure key={bi} className="guide-figure">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={b.image.src} alt={b.image.alt} loading="lazy" />
                          </figure>
                        );
                      case "table":
                        return (
                          <div key={bi} className="guide-table-wrap">
                            <table className="guide-table">
                              {b.table.caption && <caption>{b.table.caption}</caption>}
                              <thead>
                                <tr>
                                  {b.table.headers.map((h, i) => <th key={i}>{h}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {b.table.rows.map((row, ri) => (
                                  <tr key={ri}>
                                    {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                    }
                  })}

                  {/* Legacy fixed-order fields (older guides) */}
                  {!s.blocks && s.body?.map((p, i) => (
                    <p key={i} className="guide-p">{p}</p>
                  ))}
                  {!s.blocks && s.bullets && (
                    <ul className="guide-list">
                      {s.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {!s.blocks && s.fees?.map((f) => (
                    <div key={f.name} className="guide-fee">
                      <h3 className="guide-h3">{f.name}</h3>
                      <p className="guide-p">{f.body}</p>
                    </div>
                  ))}
                  {!s.blocks && s.questions && (
                    <ol className="guide-questions">
                      {s.questions.map((q, i) => (
                        <li key={i}>
                          <strong>{q.lead}</strong> {q.body}
                        </li>
                      ))}
                    </ol>
                  )}
                  {!s.blocks && s.note && (
                    <blockquote className="guide-note">
                      <strong>
                        {s.note.before}
                        {s.note.href && s.note.linkText ? (
                          <a href={s.note.href}>{s.note.linkText}</a>
                        ) : (
                          s.note.linkText
                        )}
                        {s.note.after}
                      </strong>
                    </blockquote>
                  )}
                  {!s.blocks && s.image && (
                    <figure className="guide-figure">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.image.src} alt={s.image.alt} loading="lazy" />
                    </figure>
                  )}
                  {!s.blocks && s.trailing?.map((p, i) => (
                    <p key={`tr-${i}`} className="guide-p">{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {guide.cta && (
            <section className="block guide-cta">
              <div className="block-inner">
                <h2 className="block-h2" style={{ marginBottom: 20 }}>
                  {guide.cta.heading}
                </h2>
                {guide.cta.body?.map((p, i) => (
                  <p key={i} className="guide-p">{p}</p>
                ))}
                <p className="guide-p">
                  <a href="#quote" data-open-quote data-source="guide-cta" className="guide-cta-link">
                    {guide.cta.linkText}
                  </a>
                  {guide.cta.after}
                </p>
                <div className="city-hero-cta" style={{ marginTop: 8 }}>
                  <a href="#quote" data-open-quote data-source="guide-cta-btn" className="btn btn-primary">
                    {guide.cta.linkText}
                    <span className="arrow" aria-hidden />
                  </a>
                </div>
              </div>
            </section>
          )}

          <FaqSection items={guide.faqs} heading="Moving in Orlando — common questions." />

          {/* Internal links */}
          <section className="block">
            <div className="block-inner">
              <div className="block-eyebrow">ready to move?</div>
              <h2 className="block-h2" style={{ marginBottom: 28 }}>
                Local Orlando movers, up-front pricing.
              </h2>
              <div className="city-others">
                {related.map((r) => (
                  <Link key={r.href} href={r.href} className="city-other">
                    <span className="city-other-url">{r.href}</span>
                    <h3 className="city-other-name">{r.name}</h3>
                    <p className="city-other-desc">{r.desc}</p>
                  </Link>
                ))}
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
