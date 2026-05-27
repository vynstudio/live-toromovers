import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LangProvider } from "@/components/lang-provider";
import { RevealObserver } from "@/components/reveal-observer";
import { Analytics } from "@/components/analytics";
import { UtmCapture } from "@/components/utm-capture";
import { SERVICE_CITIES } from "@/lib/content";
import {
  PHONE_DISPLAY,
  EMAIL,
  LEGAL_NAME,
  BUSINESS_NAME,
  SLOGAN,
  GOOGLE_RATING,
} from "@/lib/contact";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

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
      "Toro Movers — Family-owned Movers Orlando & Central Florida · 4.9★ Google",
    template: "%s · Toro Movers",
  },
  description:
    "Insured Orlando moving company offering local moves, apartment moves, loading help, and full-service moves with truck across Central Florida. Up-front hourly pricing — quote in 60 seconds. Bilingual crew. 4.9★ on Google. (689) 600-2720.",
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
  url: SITE_URL,
  telephone: "+16896002720",
  email: EMAIL,
  image: `${SITE_URL}/opengraph-image`,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Orlando",
    addressRegion: "FL",
    addressCountry: "US",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <Script
          id="ld-moving-company"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(movingCompanyJsonLd),
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
