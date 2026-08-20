import type { Metadata } from "next";
import { Schibsted_Grotesk, Inter } from "next/font/google";
import "../globals.css";
import { LangProvider } from "@/components/lang-provider";
import { Analytics } from "@/components/analytics";
import { UtmCapture } from "@/components/utm-capture";
import { ClickTracking } from "@/components/click-tracking";
import { QuoteModal } from "@/components/quote-modal";
import { StickyCta } from "@/components/sticky-cta";
import { SERVICE_CITIES } from "@/lib/content";
import {
  PHONE_DISPLAY,
  EMAIL,
  LEGAL_NAME,
  BUSINESS_NAME,
  SLOGAN,
  POSTAL_CODE,
  SOCIAL_PROFILES,
  PHONE_E164
} from "@/lib/contact";

const serif = Schibsted_Grotesk({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.com";

export const metadata: Metadata = {
  title: {
    default:
      "Trusted Orlando & Central Florida Movers · 5★ | Toro Movers",
    template: "%s | Toro Movers",
  },
  description:
    "Trusted Orlando & Central Florida movers — family-owned crew, upfront hourly pricing, bilingual crews, no hidden fees. Apartment, home & office moves. Quote in 60s.",
  keywords: [
    "Orlando movers",
    "Central Florida movers",
    "trusted movers Orlando",
    "full service movers Orlando",
    "moving company Orlando",
    "Orlando moving company",
    "full service moving Central Florida",
    "Kissimmee movers",
    "Lake Nona movers",
    "Lake Mary movers",
    "Winter Park movers",
    "Clermont movers",
    "apartment movers Orlando",
    "bilingual movers Orlando",
    "labor only movers Orlando",
    "U-Haul loading help Orlando",
    "POD loading help Central Florida",
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
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: "Trusted Orlando & Central Florida Movers · 5★ | Toro Movers",
    description:
      "Family-owned Orlando movers with truck & crew. Upfront hourly pricing, no hidden fees. Serving Central Florida. Quote in 60s.",
    // Absolute URL on the design host. The /opengraph-image file convention
    // is served by Next at a HASHED path (/opengraph-image-<hash>), so the
    // bare path 404s — and the hashed one isn't in toromovers.com's proxy
    // list either. A static card on the domain that owns DNS is stable.
    images: [
      {
        url: "https://toromovers.com/og/default.jpg",
        width: 1200,
        height: 630,
        alt: "Toro Movers — Orlando and Central Florida movers who quote up front",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trusted Orlando & Central Florida Movers | Toro Movers",
    description:
      "Family-owned Orlando movers. Upfront hourly pricing, no hidden fees. 5★ on Google. Quote in 60s.",
    images: ["https://toromovers.com/og/default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

const movingCompanyJsonLd = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: BUSINESS_NAME,
  legalName: LEGAL_NAME,
  slogan: SLOGAN,
  description:
    "Family-owned full-service moving company in Orlando and Central Florida. Truck, crew, furniture protection, apartment and home moves first. Labor-only loading available as a secondary option. Bilingual. Up-front hourly pricing — quote in 60 seconds.",
  "@id": `${SITE_URL}/#movingcompany`,
  url: SITE_URL,
  telephone: `${PHONE_E164}`,
  email: EMAIL,
  image: `${SITE_URL}/og/default.jpg`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/bull.svg`,
    width: 512,
    height: 512,
  },
  priceRange: "$$",
  knowsLanguage: ["en", "es"],
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Orlando",
    addressRegion: "FL",
    postalCode: POSTAL_CODE,
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
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full-service moving · crew + truck" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "In-town residential & apartment moves" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Furniture wrapping & protection" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Storage moves" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Labor-only loading help · secondary option" } },
  ],
  sameAs: SOCIAL_PROFILES,
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`site-shell ${serif.variable} ${sans.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(movingCompanyJsonLd),
        }}
      />
      <Analytics />
      <UtmCapture />
      <ClickTracking />
      <LangProvider>
        {children}
        <QuoteModal />
        {/* Mobile: Call + Get Quote after scroll (nav hides at the same threshold) */}
        <StickyCta />
      </LangProvider>
    </div>
  );
}
