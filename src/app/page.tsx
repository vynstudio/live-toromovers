import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { TrustBand } from "@/components/trust-band";
import { StatsBand } from "@/components/stats-band";
import { Services } from "@/components/services";
import { EditorialQuote } from "@/components/editorial-quote";
import { Process } from "@/components/process";
import { FeatureQuote } from "@/components/feature-quote";
import { Faq } from "@/components/faq";
import { ClosingCta } from "@/components/closing-cta";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { content, REVIEWS } from "@/lib/content";
import { GOOGLE_RATING, REVIEW_COUNT, BUSINESS_NAME } from "@/lib/contact";
import "./home-relume.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

// Homepage-only schema: the rating + reviews and the homepage FAQ live here
// (not in the sitewide layout) so they aren't duplicated onto pages whose
// visible content doesn't include them. The rating attaches to the sitewide
// MovingCompany via its @id.
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
      review: REVIEWS.map((r) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: r.name },
        reviewBody: r.body,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: content.en.faq.items.map((item) => ({
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      {/* .home-relume scopes the Relume layout shell to the homepage only
          so city/service/blog pages keep their existing presentation. */}
      <div className="home-relume">
        <Nav />
        <Hero />
        <TrustBand />
        <Services />
        <EditorialQuote />
        <StatsBand />
        <Process />
        <FeatureQuote />
        <Faq />
        <ClosingCta />
        <Footer />
        <StickyCta />
      </div>
    </>
  );
}
