import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/lang-provider";
import { RevealObserver } from "@/components/reveal-observer";
import { Analytics } from "@/components/analytics";
import { UtmCapture } from "@/components/utm-capture";
import { SERVICE_CITIES, content } from "@/lib/content";
import {
  PHONE_DISPLAY,
  EMAIL,
  LEGAL_NAME,
  BUSINESS_NAME,
  SLOGAN,
  GOOGLE_RATING,
} from "@/lib/contact";

// Minimalist display face — clean modern grotesque replacing the old serif.
// Variable kept as --font-serif to avoid churning ~25 heading rules; it now
// resolves to Schibsted Grotesk everywhere the display face is used.
const serif = Schibsted_Grotesk({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body/UI stays on Inter (optimized for small sizes / readability); the
// Schibsted grotesque is reserved for display headings via --font-serif.
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.netlify.app";

export const metadata: Metadata = {
  title: {
    default:
      "Toro Movers — Orlando & Central Florida Movers · 4.9★ Google",
    template: "%s · Toro Movers",
  },
  description:
    "Insured Orlando movers — local, apartment, loading help & full-service moves across Central Florida. Up-front hourly pricing, bilingual crew. Quote in 60s.",
  keywords: [
    "Orlando movers",
    "Central Florida movers",
    "moving company Orlando",
    "Orlando moving company",
    "Kissimmee movers",
    "Lake Nona movers",
    "Lake Mary movers",
    "Winter Park movers",
    "Clermont movers",
    "labor only movers Orlando",
    "U-Haul loading help Orlando",
    "POD loading help Central Florida",
    "apartment movers Orlando",
    "bilingual movers Orlando",
    "mudanceros Orlando",
    "compañía de mudanzas Florida Central",
    "family-owned movers",
  ],
  authors: [{ name: LEGAL_NAME }],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_US",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title:
      "Toro Movers — Family-owned Movers Orlando & Central Florida · 4.9★ Google",
    description:
      "Insured Orlando moving company. Local moves, loading help, full-service moves with truck. Bilingual crew. Up-front hourly pricing — quote in 60 seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toro Movers — Family-owned Movers Orlando & Central Florida",
    description:
      "Up-front hourly pricing, bilingual crew, 4.9★ on Google. Quote in 60 seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

const movingCompanyJsonLd = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: BUSINESS_NAME,
  legalName: LEGAL_NAME,
  slogan: SLOGAN,
  description:
    "Family-owned Orlando moving company offering local moves, apartment moves, loading help, and full-service moves with truck across Central Florida. Bilingual crew. Up-front hourly pricing — quote in 60 seconds.",
  "@id": `${SITE_URL}/#movingcompany`,
  url: SITE_URL,
  telephone: "+16896002720",
  email: EMAIL,
  image: `${SITE_URL}/opengraph-image`,
  priceRange: "$$",
  knowsLanguage: ["en", "es"],
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Orlando",
    addressRegion: "FL",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.5384,
    longitude: -81.3789,
  },
  areaServed: SERVICE_CITIES.map((name) => ({
    "@type": "City",
    name: `${name}, FL`,
  })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "07:00",
      closes: "19:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: GOOGLE_RATING,
    bestRating: "5",
    ratingCount: "100",
  },
  makesOffer: [
    { "@type": "Offer", name: "Loading help · labor only" },
    { "@type": "Offer", name: "In-town move · labor + truck" },
    { "@type": "Offer", name: "Big-day move · 3 movers + truck" },
    { "@type": "Offer", name: "Packing & unpacking" },
    { "@type": "Offer", name: "Storage moves" },
    { "@type": "Offer", name: "Furniture wrapping & protection" },
  ],
};

// FAQ rich-result schema, sourced from the same copy rendered on the page so
// the two never drift. Eligible for the FAQ snippet in Google search.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: content.en.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        {/* Plain server-rendered JSON-LD (NOT next/script) so the schema lands
            as static HTML in the initial response — the reliable form for
            Google rich results, rather than being injected client-side. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(movingCompanyJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      </head>
      <body>
        <Analytics />
        <UtmCapture />
        <LangProvider>
          {children}
          <RevealObserver />
        </LangProvider>
      </body>
    </html>
  );
}
