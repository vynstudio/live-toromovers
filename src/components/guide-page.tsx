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
  { href: "/apartment-movers", name: "Apartment movers", desc: "Stairs, elevators, and tight complex windows, by the hour." },
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
    { href: "/apartment-movers", name: "Apartment movers", desc: "Stairs, elevators, and tight complex windows, by the hour." },
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
};

export function GuidePage({ guide }: { guide: GuideData }) {
  const url = `${SITE_URL}${guide.href}`;
  const related = RELATED_BY_SLUG[guide.slug] ?? DEFAULT_RELATED;

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
