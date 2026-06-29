import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/lang-provider";
import { Analytics } from "@/components/analytics";
import { UtmCapture } from "@/components/utm-capture";
import { ClickTracking } from "@/components/click-tracking";
import { SERVICE_CITIES } from "@/lib/content";
import {
  PHONE_DISPLAY,
  EMAIL,
  LEGAL_NAME,
  BUSINESS_NAME,
  SLOGAN,
  POSTAL_CODE,
  SOCIAL_PROFILES,
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
  // 300 dropped — not referenced anywhere in globals.css or components,
  // so it was a dead font file on every page load.
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

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
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Loading help · labor only" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "In-town move · labor + truck" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Big-day move · 3 movers + truck" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Packing & unpacking" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Storage moves" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Furniture wrapping & protection" } },
  ],
  sameAs: SOCIAL_PROFILES,
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
      </head>
      <body>
        <Analytics />
        <UtmCapture />
        <ClickTracking />
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
