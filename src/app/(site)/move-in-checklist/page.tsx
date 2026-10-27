import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FaqSection } from "@/components/faq-section";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";
const HREF = "/move-in-checklist";
const TITLE = "Move-in checklist | Toro Movers";
const DESCRIPTION =
  "A free Central Florida move-in checklist: keys, elevator windows, parking, utilities, and what to pack in the open-first box.";

const FAQS = [
  {
    q: "What should I confirm before move-in day in Orlando?",
    a: "Confirm the closing time or the lease start, and the hour you receive keys. Ask the building which hours a move is allowed, which door to use, and where a truck may park. Book the crew inside that window. Toro Movers hours are Sunday through Friday 7:00 AM to 7:00 PM, and Saturday 9:00 AM to 5:00 PM.",
  },
  {
    q: "Do I need to reserve an elevator for an Orlando apartment move-in?",
    a: "If the building requires a reserved elevator, reserve it before the crew is booked and send the window with the quote. Toro Movers plans the carry around the door, the floor, and the time the elevator is actually held.",
  },
  {
    q: "How do I book movers for move-in day?",
    a: `Call or text Toro Movers at ${PHONE_DISPLAY} with the key time, both addresses, and the building rules you already have. Utilities, a USPS mail forward, and an open-first box (medication, chargers, toiletries, a change of clothes) are worth doing before the truck arrives.`,
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
    type: "website",
    locale: "en_US",
    images: [{ url: "https://toromovers.com/og/default.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
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
          name: "Move-in checklist",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

const STEPS = [
  "Confirm the closing time or the lease start, and the hour you receive keys.",
  "Ask the building which hours a move is allowed, which door to use, and whether the elevator must be reserved.",
  "Ask where a truck may park, and for how long. Book the move inside that window.",
  "Start or transfer electric, water, and internet for the day you get keys.",
  "File a mail-forwarding change with USPS.",
  "Measure the tightest doorway and the stair turn if a sofa or a mattress is coming.",
  "Pack an open-first box: medication, chargers, toiletries, a change of clothes, basic tools, snacks, and paperwork.",
  "Label boxes with the destination room. Empty and defrost the refrigerator the day before if it is moving.",
  "Set aside jewelry, documents, and anything you will carry yourself.",
];

export default function MoveInChecklistPage() {
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
            <p className="city-kicker">For clients</p>
            <h1 className="city-h1">Move-in checklist</h1>
            <p className="city-subline">
              A free list for a Central Florida move-in. No email required.
            </p>
          </div>
        </section>
        <section className="block">
          <div className="block-inner">
            <h2 className="block-h2">Before move-in day</h2>
            <ul className="guide-list">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="guide-p">
              Crew hours are Sunday through Friday, 7:00 AM to 7:00 PM, and
              Saturday 9:00 AM to 5:00 PM. Call or text{" "}
              <a href={PHONE_TEL}>{PHONE_DISPLAY}</a> when the window is known.
            </p>
          </div>
        </section>
        <FaqSection items={FAQS} heading="Move-in questions" />
        <Footer />
      </main>
    </>
  );
}
