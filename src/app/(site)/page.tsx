import { Nav } from "@/components/home-kit/Nav";
import { Hero } from "@/components/home-kit/Hero";
import { TrustBar } from "@/components/home-kit/TrustBar";
import { FeatureGrid } from "@/components/home-kit/FeatureGrid";
import { Process } from "@/components/home-kit/Process";
import { FeatureAlternating } from "@/components/home-kit/FeatureAlternating";
import { Integrations } from "@/components/home-kit/Integrations";
import { WhyToro } from "@/components/home-kit/WhyToro";
import { Reviews } from "@/components/home-kit/Reviews";
import { Faq } from "@/components/home-kit/Faq";
import { Areas } from "@/components/home-kit/Areas";
import { ClosingCta } from "@/components/home-kit/ClosingCta";
import { Footer } from "@/components/home-kit/Footer";
import type { Metadata } from "next";
import { faq } from "@/lib/home-kit-content";
import { googleReviews } from "@/lib/home-kit-reviews";
import {
  GOOGLE_RATING,
  REVIEW_COUNT,
  BUSINESS_NAME,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";

export const metadata: Metadata = {
  title: {
    absolute: "Trusted Orlando & Central Florida Movers · 4.9★ | Toro Movers",
  },
  description:
    "Trusted Orlando & Central Florida movers — family-owned crew, upfront hourly pricing, bilingual crews, no hidden fees. Apartment, home & office moves. Quote in 60s.",
  alternates: { canonical: "/" },
};

/**
 * Homepage layout matches https://toromovers-com.netlify.app (pure B/W).
 * SEO: preserve homepage schema + FAQ in JSON-LD. Quote CTAs → /get-my-price
 * via QuoteModal (layout) listening for data-open-quote.
 */
const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MovingCompany",
      "@id": `${SITE_URL}/#movingcompany`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: GOOGLE_RATING,
        bestRating: "5",
        reviewCount: REVIEW_COUNT,
      },
      review: googleReviews.map((r) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: r.name },
        reviewBody: r.text,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BUSINESS_NAME,
      url: SITE_URL,
    },
  ],
};

export default function Home() {
  return (
    <div className="home-kit">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Nav />
      <main id="main" className="w-full min-w-0 flex-1">
        <Hero />
        <TrustBar />
        <FeatureGrid />
        <Process />
        <FeatureAlternating />
        <Integrations />
        <WhyToro />
        <Reviews />
        <Faq />
        <Areas />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
