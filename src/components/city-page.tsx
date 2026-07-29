import Link from "next/link";
import {
  CityPageLayout,
  CitySection,
  CityHero,
  CityImage,
  NeighborhoodStrip,
  ServiceGrid,
  TestimonialGrid,
  StepsHowItWorks,
  FAQAccordion,
  QuoteFormCard,
} from "@/components/city";
import { otherCities, type CityData } from "@/lib/cities";
import { getCityImages } from "@/lib/city-images";
import { REVIEWS } from "@/lib/content";
import {
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_NAME,
  EMAIL,
  GOOGLE_RATING,
  SERVICE_BASE_LOCALITY,
  SERVICE_REGION,
} from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";
const PHONE_E164 = PHONE_TEL.replace(/^tel:/, "");

function buildServices(city: CityData) {
  const n = city.name;
  const isOrlando = city.slug === "orlando-movers";
  return [
    {
      title: isOrlando ? "Apartment movers in Orlando" : "Apartment & condo moves",
      description: isOrlando
        ? `Walk-ups, elevators, tight hallways, parking limits, and move-in windows across Orlando apartment communities — careful carries and up-front hourly rates.`
        : `Elevators, walk-ups, loading zones, and move-in windows across ${n} apartment communities — careful carries and clear hourly pricing.`,
      href: "/apartment-movers-orlando-fl",
      meta: "Local apartments & condos",
    },
    {
      title: isOrlando ? "Full-service movers in Orlando" : "Full-service moving",
      description: isOrlando
        ? `Truck plus crew for door-to-door Orlando moves — load, transport, unload, and place with up-front hourly rates.`
        : `Truck plus crew for door-to-door ${n} moves — load, transport, unload, and place with upfront hourly rates.`,
      href: "/full-service-moving",
      meta: "Truck + crew",
    },
    {
      title: isOrlando ? "Labor-only movers in Orlando" : "Labor-only / truck help",
      description: isOrlando
        ? `Already have a U-Haul, POD, or rental truck? Hire labor-only movers in Orlando to load or unload — same careful crew, by the hour.`
        : `Already have a U-Haul, POD, or rental? Hire muscle only to load or unload in ${n} — same careful crew, no truck fee.`,
      href: "/labor-only-moving",
      meta: "U-Haul, PODS & rentals",
    },
    {
      title: "Home & residential moves",
      description: `Single-family homes, townhomes, and HOA neighborhoods in and around ${n}. Pads, wrap, and basic assembly/disassembly included.`,
      href: "/residential-movers",
      meta: "Homes & townhomes",
    },
    {
      title: "Office & commercial",
      description: `Suites, small offices, and after-hours loads near ${n}. We plan dock and elevator access so your team loses less time.`,
      href: "/commercial-movers",
      meta: "Offices & suites",
    },
    {
      title: "Loading & unloading",
      description: `Tight truck packs and careful unloads for storage units and short hops around ${n} and nearby Central Florida.`,
      href: "/loading-unloading",
      meta: "Storage & short hops",
    },
  ];
}

export function CityPage({ city }: { city: CityData }) {
  const others = otherCities(city.slug).slice(0, 6);
  const images = getCityImages(city.slug);
  const refs = city.references?.length
    ? city.references
    : [
        {
          label: "the USPS change-of-address service",
          href: "https://www.usps.com/manage/forward.htm",
        },
      ];

  const heroH1 = city.h1;
  const subhead = city.subline;
  const isOrlando = city.slug === "orlando-movers";

  const businessDescription = isOrlando
    ? "Toro Movers is a family-owned Orlando moving company serving Central Florida with full-service moves, labor-only loading and unloading, apartment moves, bilingual English and Spanish crews, and up-front hourly rates."
    : `${BUSINESS_NAME} is a family-owned moving company serving ${city.name} and ${SERVICE_REGION} with full-service moves, labor-only loading, apartment moves, and up-front hourly rates.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MovingCompany", "LocalBusiness"],
        "@id": `${SITE_URL}${city.href}#business`,
        name: isOrlando ? `${BUSINESS_NAME} — Orlando Movers` : `${BUSINESS_NAME} — ${city.name}`,
        url: `${SITE_URL}${city.href}`,
        telephone: PHONE_E164,
        email: EMAIL,
        description: businessDescription,
        areaServed: [
          { "@type": "City", name: `${city.name}, FL` },
          { "@type": "AdministrativeArea", name: SERVICE_REGION },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: SERVICE_BASE_LOCALITY,
          addressRegion: "FL",
          addressCountry: "US",
        },
        parentOrganization: {
          "@type": "MovingCompany",
          name: BUSINESS_NAME,
          "@id": `${SITE_URL}/#movingcompany`,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: city.schema.lat,
          longitude: city.schema.lng,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: GOOGLE_RATING,
          bestRating: "5",
        },
        knowsLanguage: ["en", "es"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${city.name} moving services`,
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Full-service local moving",
                serviceType: "Full-service moving",
                areaServed: `${city.name}, FL`,
                description:
                  "Loading, transportation, unloading, and placement with a local crew.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Labor-only loading and unloading",
                serviceType: "Labor-only moving",
                areaServed: `${city.name}, FL`,
                description:
                  "Loading and unloading for U-Haul trucks, PODS, trailers, rental trucks, and storage units.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Apartment and condo moving",
                serviceType: "Apartment moving",
                areaServed: `${city.name}, FL`,
                description:
                  "Apartment moves with stairs, elevators, loading zones, and scheduled move-in windows.",
              },
            },
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: `${city.name} Movers`,
            item: `${SITE_URL}${city.href}`,
          },
        ],
      },
      ...(city.faqs?.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: city.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  const testimonials = REVIEWS.slice(0, 3).map((r) => ({
    name: r.name,
    meta: r.meta,
    body: r.body,
  }));

  return (
    <CityPageLayout jsonLd={jsonLd}>
      <CityHero
        cityName={city.name}
        h1={heroH1}
        subhead={subhead}
        imageSrc={images.hero.src}
        imageAlt={images.hero.alt}
      />

      <NeighborhoodStrip
        label={`Serving ${city.name} & nearby`}
        neighborhoods={city.neighborhoods}
      />

      <CitySection>
        <p className="city-sec-kicker">About {city.name.toLowerCase()} moves</p>
        <h2 className="city-sec-title">{city.about.h2}</h2>
        <div className="city-prose">
          <p className="aeo-answer">{city.about.lead}</p>
          {city.sections?.map((sec) => (
            <div key={sec.h2} className="city-seo-block">
              <h2 className="city-sec-title city-seo-h2">{sec.h2}</h2>
              <p className="aeo-answer">{sec.body}</p>
            </div>
          ))}
          <p>
            Prefer a full map of coverage? See all{" "}
            <Link href="/service-areas">service areas</Link>
            {city.slug !== "orlando-movers" ? (
              <>
                {" "}
                or our <Link href="/orlando-movers">Orlando movers</Link> hub
              </>
            ) : null}
            . Ready for a clear estimate?{" "}
            <Link href="/get-my-price">Get my price</Link>.
          </p>
        </div>
      </CitySection>

      <CitySection soft>
        <ServiceGrid
          title={
            isOrlando
              ? "Orlando moving services"
              : `${city.name} moving services`
          }
          lead={
            isOrlando
              ? "Full-service movers, labor-only movers, and apartment movers in Orlando, FL — same up-front hourly model across Central Florida."
              : `Local, apartment, full-service, and labor-only help in ${city.name}, FL — same transparent hourly model across Central Florida.`
          }
          services={buildServices(city)}
        />
        {/* Mid-page contextual image — lazy-loaded, does not change H2/copy order */}
        <div className="city-mid-visual">
          <CityImage
            src={images.mid.src}
            alt={images.mid.alt}
            caption={images.mid.caption}
            aspect="wide"
            width={1200}
            height={900}
            sizes="(min-width: 900px) 50vw, 100vw"
          />
          <div className="city-mid-visual-copy">
            <h3>Built for real {city.name} access</h3>
            <p>
              Stairs, elevators, HOA windows, and tight parking shape the day more
              than a brochure photo. Our crews plan the carry and protect floors
              and furniture — with the same upfront hourly pricing you locked
              before we start.
            </p>
          </div>
        </div>
      </CitySection>

      <CitySection navy>
        <p className="city-sec-kicker">{city.uniqueAngle.eyebrow}</p>
        <h2 className="city-sec-title" style={{ color: "#fff" }}>
          {city.uniqueAngle.h2}
        </h2>
        <p className="city-sec-lead" style={{ color: "rgba(255,255,255,0.85)" }}>
          {city.uniqueAngle.body}
        </p>
        <p className="city-sec-lead" style={{ color: "rgba(255,255,255,0.7)" }}>
          Planning a {city.name} move?{" "}
          <Link
            href="/central-florida-moving-checklist"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Download the free Central Florida moving checklist
          </Link>
          . Settling in? Bookmark{" "}
          {refs.map((r, i) => (
            <span key={r.href}>
              {i === 0 ? "" : i === refs.length - 1 ? " and " : ", "}
              <a
                href={r.href}
                style={{ color: "#fff", textDecoration: "underline" }}
              >
                {r.label}
              </a>
            </span>
          ))}
          .
        </p>
      </CitySection>

      <CitySection>
        <StepsHowItWorks />
      </CitySection>

      <CitySection soft>
        <TestimonialGrid reviews={testimonials} />
      </CitySection>

      {city.faqs?.length ? (
        <CitySection>
          <FAQAccordion
            title={
              isOrlando
                ? "Orlando movers — common questions"
                : `${city.name} movers — common questions`
            }
            items={city.faqs}
          />
        </CitySection>
      ) : null}

      <CitySection soft>
        <QuoteFormCard
          title={
            isOrlando
              ? "Get a moving quote in Orlando"
              : `Get your ${city.name} moving estimate`
          }
          lead={
            isOrlando
              ? "Share your Orlando addresses, home or apartment type, and whether you need full-service or labor-only movers. We’ll explain the up-front hourly rate and crew size — no spam."
              : `Share your ${city.name} addresses and move size. We’ll confirm hourly rate and crew size — no spam, no hidden fees.`
          }
          source={`city-quote-${city.slug}`}
        />
      </CitySection>

      {others.length > 0 ? (
        <CitySection>
          <p className="city-sec-kicker">Nearby cities</p>
          <h2 className="city-sec-title">Also serving Central Florida</h2>
          <p className="city-sec-lead">
            Same family-owned crew, same upfront hourly pricing across the metro.
          </p>
          <div className="city-svc-grid">
            {others.map((o) => (
              <Link key={o.slug} href={o.href} className="city-svc-card">
                <h3>{o.name} movers</h3>
                <p>Local moves in {o.name} and nearby communities.</p>
                <span className="city-svc-meta">{o.href}</span>
              </Link>
            ))}
          </div>
          <p className="city-sec-lead" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
            <Link href="/service-areas">See all Central Florida moving service areas</Link>
          </p>
        </CitySection>
      ) : null}
    </CityPageLayout>
  );
}
