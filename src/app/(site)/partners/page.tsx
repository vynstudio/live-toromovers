import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FaqSection } from "@/components/faq-section";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";
const HREF = "/partners";
const TITLE = "Partners | Toro Movers";
const DESCRIPTION =
  "Toro Movers works with Central Florida realtors, property managers, apartment communities, storage offices, and local referral partners.";

const FAQS = [
  {
    q: "Who can refer a move to Toro Movers?",
    a: "Realtors, home inspectors, property managers, apartment communities, storage facilities, and other local professionals who already help Central Florida households move. Send the customer with the date, both addresses, and what is moving.",
  },
  {
    q: "How does a partner referral get quoted?",
    a: `Toro Movers quotes a referred job the same way it quotes any other local move. Call or text ${PHONE_DISPLAY} with the closing time or lease start, when keys are ready, and any elevator or loading window the building already set.`,
  },
  {
    q: "Do you work with apartment communities in Orlando?",
    a: "Yes. Apartment communities can send the loading door, the reserved elevator, and the move-in day. The crew is scheduled inside that window and inside Toro Movers hours: Sunday through Friday 7:00 AM to 7:00 PM, Saturday 9:00 AM to 5:00 PM.",
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
        { "@type": "ListItem", position: 2, name: "Partners", item: `${SITE_URL}${HREF}` },
      ],
    },
  ],
};

export default function PartnersPage() {
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
            <p className="city-kicker">Central Florida</p>
            <h1 className="city-h1">Partners</h1>
            <p className="city-subline">
              Toro Movers works with people who already help Central Florida
              households move. This page is for realtors, home inspectors,
              property managers, apartment communities, storage facilities, and
              local referral groups.
            </p>
          </div>
        </section>
        <section className="block">
          <div className="block-inner">
            <div className="guide-body">
              <h2 className="block-h2">Who we work with</h2>
              <p className="guide-p">
                The list is the people already in the move: the realtor on the
                contract, the inspector in the house, the manager with the keys,
                the community with the elevator, and the storage office with the
                unit.
              </p>
              <h2 className="block-h2">Referrals</h2>
              <p className="guide-p">
                Send the customer to Toro Movers with the date, both addresses,
                and what is moving. We quote that job the same way we quote any
                other local move. Closings and move-ins need the key time and
                any window the building already set. Crews are bilingual in
                English and Spanish. Call or text{" "}
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>.
              </p>
            </div>
          </div>
        </section>
        <FaqSection items={FAQS} heading="Partner questions" />
        <Footer />
      </main>
    </>
  );
}
