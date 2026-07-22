import type { Metadata } from "next";
import Link from "next/link";
import { LeadMagnetForm } from "@/components/lead-magnet-form";
import { PdfDownloadButton } from "@/components/checklist-tracking";
import { StickyCta } from "@/components/sticky-cta";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
  GOOGLE_RATING,
  SERVICE_REGION,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";
const HREF = "/central-florida-moving-checklist";

// Title uses template → final "… | Toro Movers"; keep segment short (≤45).
const TITLE = "Free Central Florida Moving Checklist";
// 141 chars
const DESCRIPTION =
  "Free moving checklist for Orlando & Central Florida — plan, pack faster, beat the heat, and prep for an accurate full-service quote.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: "Free Central Florida Moving Checklist | Toro Movers",
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const BENEFITS = [
  "Pre-made checklist for Orlando and Central Florida",
  "Apartment and residential move tips",
  "Florida heat, parking, and elevator tips",
  "What to have ready for a fast, accurate quote",
];

const PREVIEW = [
  "1 week out: reserve your building's elevator and a loading zone.",
  "Confirm utility transfer dates at both addresses (FL power gets booked up).",
  "Pack a heat-day kit: water, fans, and a cooler — Central Florida moves run hot.",
  "Label every box: room + two words of contents.",
  "Set aside a valuables box you carry yourself (documents, meds, chargers).",
];

const WHATS_INSIDE = [
  {
    h: "A week-by-week timeline",
    p: "Exactly what to do 1 week, 3 days, the day before, and the morning of — so nothing gets missed.",
  },
  {
    h: "Apartment-move section",
    p: "Elevator reservations, COI requests, parking and loading-zone tips for Orlando-area complexes.",
  },
  {
    h: "Florida-heat planning",
    p: "How to protect electronics, plants, and yourself when you're moving in 90°+ humidity.",
  },
  {
    h: "Quote-ready prep",
    p: "The exact details to have on hand so we can give you an accurate hourly price fast.",
  },
];

const TRUST = [
  ["Family-owned", "Local Central Florida crew — not a national chain."],
  ["No hidden fees", "No fuel surcharges, stair fees, or weekend premiums — ever."],
  ["Bilingual", "Hablamos español — English & Spanish crews."],
  ["Up-front pricing", "Honest hourly rate. No surprise add-ons."],
];

const FAQS = [
  {
    q: "Is the Central Florida moving checklist really free?",
    a: "Yes. Enter your name and email and we'll send the checklist instantly — as a downloadable PDF and an interactive web version. No cost, no obligation.",
  },
  {
    q: "Does the checklist work for apartment moves in Orlando?",
    a: "Absolutely. It has a dedicated apartment section covering elevator reservations, certificates of insurance (COI), parking, and loading-zone tips for Orlando-area complexes.",
  },
  {
    q: "Do I have to book a move to get the checklist?",
    a: "No. The checklist is a free planning tool. When you're ready for an up-front hourly quote, you can request one — but it's entirely optional.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}${HREF}#service`,
      serviceType: "Local moving",
      name: "Central Florida & Orlando local moving",
      description: DESCRIPTION,
      areaServed: { "@type": "AdministrativeArea", name: SERVICE_REGION },
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Central Florida Moving Checklist",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function ChecklistLandingPage() {
  return (
    <main className="magnet-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="intake-header">
        <Link href="/" className="brand" aria-label={`${BUSINESS_NAME} — Home`}>
          <span className="brand-mark" aria-hidden>
            <img src="/bull.svg" alt="" />
          </span>
          <span className="brand-name">
            TORO<span className="accent">·</span>MOVERS
          </span>
        </Link>
        <a href={PHONE_TEL} className="nav-phone">
          <span className="nav-phone-dot" aria-hidden />
          {PHONE_DISPLAY}
        </a>
      </header>

      {/* HERO + form */}
      <section className="magnet-hero">
        <div className="magnet-hero-copy">
          <p className="intake-eyebrow">Free download · {SERVICE_REGION}</p>
          <h1 className="magnet-h1">The Central Florida Moving Checklist</h1>
          <p className="magnet-sub">Plan Your Move, Pack Faster, Get an Accurate Quote.</p>
          <ul className="magnet-benefits">
            {BENEFITS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="magnet-hero-meta">
            <span className="magnet-stars" aria-hidden>★★★★★</span>
            <span>
              {GOOGLE_RATING} on Google · Family-owned · Bilingual
            </span>
          </div>
        </div>

        <div className="magnet-card" id="get-checklist">
          <h2 className="magnet-card-title">Get My Free Checklist</h2>
          <LeadMagnetForm />
        </div>
      </section>

      {/* CHECKLIST PREVIEW */}
      <section className="magnet-section">
        <h2 className="magnet-h2">A look inside the checklist</h2>
        <ul className="magnet-preview">
          {PREVIEW.map((p) => (
            <li key={p}>
              <span className="magnet-tick" aria-hidden>
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
        <div className="magnet-preview-cta">
          <PdfDownloadButton variant="outline" label="Preview / download the PDF" />
          <span>Or enter your email above and we’ll send it instantly.</span>
        </div>
      </section>

      {/* WHAT'S INSIDE / BENEFITS */}
      <section className="magnet-section magnet-section-alt">
        <h2 className="magnet-h2">What’s inside</h2>
        <div className="magnet-grid">
          {WHATS_INSIDE.map((c) => (
            <div key={c.h} className="magnet-grid-item">
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="magnet-section">
        <h2 className="magnet-h2">Why Central Florida trusts Toro Movers</h2>
        <div className="magnet-trust">
          {TRUST.map(([h, p]) => (
            <div key={h} className="magnet-trust-item">
              <strong>{h}</strong>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="magnet-cta-band">
        <h2 className="magnet-h2">Ready when you are</h2>
        <p>Grab the free checklist, or get an up-front hourly price for your move.</p>
        <div className="magnet-cta-row">
          <a href="#get-checklist" className="btn btn-primary">
            Get My Free Checklist
            <span className="arrow" aria-hidden />
          </a>
          <Link href="/quote" className="btn btn-outline">
            Get My Price
          </Link>
        </div>
        <p className="magnet-cta-links">
          New to moving in the area? Read our{" "}
          <Link href="/central-florida-movers">Central Florida movers guide</Link> or{" "}
          <Link href="/apartment-movers-orlando-fl">apartment moving services</Link>.
        </p>
        <p className="magnet-cta-links">
          Two move-day must-dos beyond the boxes: file your{" "}
          <a href="https://www.usps.com/manage/forward.htm">USPS change of address</a>{" "}
          and, if you&rsquo;re new to the state, update your license and registration
          with the{" "}
          <a href="https://www.flhsmv.gov/new-resident/">Florida DHSMV</a>.
        </p>
      </section>

      <StickyCta />
    </main>
  );
}
