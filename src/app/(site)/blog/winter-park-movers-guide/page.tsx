import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FaqSection } from "@/components/faq-section";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";
const HREF = "/blog/winter-park-movers-guide";
const TITLE = "Hiring movers in Winter Park, FL: what to know · Toro Movers";
const H1 = "Hiring movers in Winter Park, FL: what to know";
const DESCRIPTION =
  "What to settle before you book movers in Winter Park: older doors, brick streets, parking, and building rules near Park Avenue and Rollins.";

const FAQS = [
  {
    q: "What should I measure before a Winter Park move?",
    a: "Measure the tightest door, the stair landing, and the turn into the room. Older Winter Park houses near Park Avenue and Hannibal Square often have narrower openings than a newer subdivision. Send a photo of the door and the piece if a sofa or a dresser is close.",
  },
  {
    q: "Where do trucks park in Winter Park?",
    a: "Many streets near Park Avenue, Central Park, and the brick blocks have limited curb space. Tell the crew which side of the house can take a truck and whether the building already assigned a loading spot. A longer carry is planned in the quote when the truck cannot sit at the door.",
  },
  {
    q: "Do Winter Park apartment moves need an elevator window?",
    a: "Buildings around Rollins College and along Aloma often do. Reserve the elevator if the property requires it, and send the window when you book. Toro Movers plans the carry around that window.",
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: HREF },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${HREF}`,
    type: "article",
    locale: "en_US",
    images: [{ url: "https://toromovers.com/og/default.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: H1,
      description: DESCRIPTION,
      datePublished: "2026-10-06",
      dateModified: "2026-10-27",
      author: { "@type": "Organization", name: "Toro Movers" },
      mainEntityOfPage: `${SITE_URL}${HREF}`,
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
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: H1, item: `${SITE_URL}${HREF}` },
      ],
    },
  ],
};

export default function WinterParkMoversGuidePage() {
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
            <p className="city-kicker">Guides / Winter Park</p>
            <h1 className="city-h1">{H1}</h1>
            <p className="city-subline">
              Hiring movers in Winter Park, FL is the practical choice when an
              older house, a condo window, or a narrow street is part of the
              job. For the crew and the neighborhoods, start with{" "}
              <Link href="/winter-park-movers">Winter Park movers</Link>. Then
              use this guide for the door, the parking spot, and the building
              rules before you book. Toro Movers is the hourly Central Florida
              crew for moves in and out of the city. Call or text{" "}
              <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
            </p>
          </div>
        </section>
        <section className="block">
          <div className="block-inner">
            <div className="guide-body">
              <h2 className="block-h2">Older homes, brick streets, and tight doors</h2>
              <p className="guide-p">
                Winter Park houses near Park Avenue, Hannibal Square, and the
                historic blocks are often older than a new subdivision outside
                Orlando. The front door, a side door, and the stair can be
                tighter than the sofa, the bed, or a dresser. Measure the
                tightest opening, or send a photo of the door, the landing, and
                the piece. If a sofa will not fit in one piece, take it apart
                when the hardware allows.
              </p>
              <p className="guide-p">
                A second-floor bedroom up a straight stair is common, including
                houses around Hannibal Square. Brick streets and limited curb
                space near Central Park mean the truck may stop a short walk
                from the door. Say so when you book. The same note applies along
                Aloma and near Rollins College, where apartment elevators and
                loading spots are reserved rather than open all day.
              </p>
              <h2 className="block-h2">Roads and timing</h2>
              <p className="guide-p">
                Winter Park sits on Interstate 4, US 17-92, State Road 426
                (Aloma and Fairbanks), and State Road 527. A local hop to
                Orlando, Maitland, or Fern Park is a normal day. Morning starts
                avoid the I-4 peak. Park Avenue and the streets around Central
                Park are slower when events fill the curbs, so a weekday
                morning is easier than a festival Saturday if the lease allows
                it.
              </p>
              <p className="guide-p">
                The city page for this work is{" "}
                <Link href="/winter-park-movers">Winter Park movers</Link>.
                This guide stays on the house, the door, and the parking spot.
              </p>
            </div>
          </div>
        </section>
        <FaqSection items={FAQS} heading="Winter Park moving questions" />
        <Footer />
      </main>
    </>
  );
}
