import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { TrustBand } from "@/components/trust-band";
import { FeatureQuote } from "@/components/feature-quote";
import { FaqSection } from "@/components/faq-section";
import { ClosingCta } from "@/components/closing-cta";
import { Footer } from "@/components/footer";
import { CITIES } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { PHONE_DISPLAY, PHONE_TEL, BUSINESS_NAME, GOOGLE_RATING } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";
const HREF = "/central-florida-movers";

const TITLE = "Central Florida Movers";
const DESCRIPTION =
  "Local movers serving Orlando & Central Florida. Family-owned, insured, bilingual, up-front hourly pricing — apartments, homes, packing & loading help.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "en_US",
  },
};

const FAQS = [
  {
    q: "What areas does Toro Movers serve?",
    a: "We're a local Central Florida moving company based in the Orlando metro. We serve Orlando and the surrounding cities — Winter Park, Maitland, Oviedo, Winter Garden, Kissimmee, Sanford, Apopka, Altamonte Springs, Lake Mary, Clermont, Davenport, St. Cloud, and Windermere.",
  },
  {
    q: "Do you do long-distance or out-of-state moves?",
    a: "No. Toro Movers focuses on local moves across the Orlando metro and Central Florida. We don't offer long-distance or interstate moving — keeping our crews local is what lets us schedule fast and price honestly by the hour.",
  },
  {
    q: "How do you price a move?",
    a: "Up-front hourly pricing with the rate and crew size agreed before the day — no hidden fees, no per-mile charge, no fuel surcharge. You only pay for the time the move actually takes.",
  },
  {
    q: "Do you have a bilingual crew?",
    a: "Yes — our crews are bilingual (English / Spanish), so we can quote, schedule, and run your full move in whichever you prefer. Hablamos español.",
  },
  {
    q: "Can you move on short notice or the same week?",
    a: "Often, yes. We keep same-week availability across the metro and can frequently fit in next-day or weekend moves. Call us with your date and we'll tell you honestly what's open.",
  },
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MovingCompany",
        "@id": `${SITE_URL}${HREF}#business`,
        name: `${BUSINESS_NAME} — Central Florida`,
        url: `${SITE_URL}${HREF}`,
        telephone: PHONE_DISPLAY,
        areaServed: { "@type": "AdministrativeArea", name: "Central Florida" },
        parentOrganization: {
          "@type": "MovingCompany",
          name: BUSINESS_NAME,
          "@id": `${SITE_URL}/#movingcompany`,
        },
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
            name: "Central Florida Movers",
            item: `${SITE_URL}${HREF}`,
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
            <p className="city-kicker">central florida</p>
            <h1 className="city-h1">Central Florida Movers</h1>
            <p className="city-subline">
              Family-owned, insured, bilingual movers serving Orlando and the
              surrounding Central Florida cities. Local moves only — apartments,
              homes, offices, packing, and loading help, all at up-front hourly
              pricing with no hidden fees.
            </p>
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

        {/* Services offered */}
        <section className="block">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">what we move</div>
                <h2 className="block-h2">Local moving services.</h2>
              </div>
              <p className="city-lead">
                One local crew for the whole job — billed by the hour, fully
                insured, with no surprise charges.
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

        {/* Cities served */}
        <section className="block city-hoods-section">
          <div className="block-inner">
            <div className="city-two-col city-two-col--mb">
              <div>
                <div className="block-eyebrow">service area</div>
                <h2 className="block-h2">Cities we serve.</h2>
              </div>
              <p className="city-lead">
                We work the whole Orlando metro full-time. Pick your city for
                local neighborhoods, access notes, and details.
              </p>
            </div>
            <div className="city-others">
              {CITIES.map((c) => (
                <Link key={c.slug} href={c.href} className="city-other">
                  <span className="city-other-url">{c.href}</span>
                  <h3 className="city-other-name">{c.name}</h3>
                  <p className="city-other-desc">
                    Local movers serving {c.name} and nearby Central Florida.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FeatureQuote />

        <FaqSection items={FAQS} heading="Central Florida moving — common questions." />

        <ClosingCta />
        <Footer />
      </main>
    </>
  );
}
