import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BUSINESS_NAME } from "@/lib/contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";
const HREF = "/orlando-movers-gallery";
const TITLE = "Photo and Illustration Gallery | Toro Movers";
const DESCRIPTION =
  "Photos and illustrations from Toro Movers, a family-owned moving company in Orlando, Florida.";

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
    images: [
      {
        url: "https://toromovers.com/og/default.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: { index: true, follow: true },
};

const IMAGES = [
  {
    src: "/city/orlando-apartment-move.webp",
    alt: "Furniture carried through an apartment doorway on a local move",
    href: "/apartment-movers-orlando-fl",
    caption: "apartment movers in Orlando",
  },
  {
    src: "/city/central-florida-local-move.webp",
    alt: "Household items loaded for a local house move",
    href: "/full-service-moving",
    caption: "full-service movers in Orlando",
  },
  {
    src: "/ads/labor-rental-truck-help.png",
    alt: "A rental truck open while furniture is loaded at the curb",
    href: "/labor-only-moving",
    caption: "labor-only movers in Orlando",
  },
  {
    src: "/city/orlando-movers-hero.webp",
    alt: "Wrapped furniture and boxes staged before they leave the room",
    href: "/packing-services-orlando",
    caption: "packing services in Orlando",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ImageGallery",
      "@id": `${SITE_URL}${HREF}#gallery`,
      name: "Toro Movers gallery",
      url: `${SITE_URL}${HREF}`,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#movingcompany` },
      image: IMAGES.map((img) => ({
        "@type": "ImageObject",
        contentUrl: `${SITE_URL}${img.src}`,
        description: img.alt,
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Gallery",
          item: `${SITE_URL}${HREF}`,
        },
      ],
    },
  ],
};

export default function OrlandoMoversGalleryPage() {
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
            <p className="city-kicker">{BUSINESS_NAME}</p>
            <h1 className="city-h1">Toro Movers gallery</h1>
            <p className="city-subline">{DESCRIPTION}</p>
          </div>
        </section>

        <section className="block">
          <div className="block-inner">
            <div className="city-hoods">
              {IMAGES.map((img) => (
                <figure key={img.href} className="city-hood">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    width={640}
                    height={480}
                    style={{ width: "100%", height: "auto" }}
                  />
                  <figcaption style={{ marginTop: 8 }}>
                    <Link href={img.href}>{img.caption}</Link>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
