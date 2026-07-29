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
import { faq } from "@/lib/home-kit-content";
import { googleReviews } from "@/lib/home-kit-reviews";
import {
  GOOGLE_RATING,
  REVIEW_COUNT,
  BUSINESS_NAME,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";

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
      {/* SEO internal-link strip — mono, below design footer visual */}
      <nav
        className="full-bleed border-t border-border bg-white px-[var(--container-pad)] py-10"
        aria-label="Site links"
      >
        <div className="site-container grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Services
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a className="underline-offset-2 hover:underline" href="/full-service-moving">
                  Full-service moving
                </a>
              </li>
              <li>
                <a className="underline-offset-2 hover:underline" href="/labor-only-moving">
                  Labor-only moving
                </a>
              </li>
              <li>
                <a
                  className="underline-offset-2 hover:underline"
                  href="/apartment-movers-orlando-fl"
                >
                  Apartment movers
                </a>
              </li>
              <li>
                <a className="underline-offset-2 hover:underline" href="/blog">
                  Moving guides
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Areas
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a className="underline-offset-2 hover:underline" href="/orlando-movers">
                  Orlando movers
                </a>
              </li>
              <li>
                <a className="underline-offset-2 hover:underline" href="/kissimmee-movers">
                  Kissimmee movers
                </a>
              </li>
              <li>
                <a className="underline-offset-2 hover:underline" href="/winter-park-movers">
                  Winter Park movers
                </a>
              </li>
              <li>
                <a className="underline-offset-2 hover:underline" href="/service-areas">
                  All service areas
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Next step
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a className="underline-offset-2 hover:underline" href="/get-my-price">
                  Get a free quote
                </a>
              </li>
              <li>
                <a className="underline-offset-2 hover:underline" href="/book">
                  Book online
                </a>
              </li>
              <li>
                <a
                  className="underline-offset-2 hover:underline"
                  href="/central-florida-moving-checklist"
                >
                  Moving checklist
                </a>
              </li>
              <li>
                <a className="underline-offset-2 hover:underline" href="/privacy">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Footer />
      {/* Sticky rendered once via layout (kit); avoid double dock on home */}
    </div>
  );
}
