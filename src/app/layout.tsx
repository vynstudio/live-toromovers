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

// SERP limits we respect: title ≤60, meta/OG/Twitter description ≤155.
export const metadata: Metadata = {
  title: {
    // 48 chars — full-service first without overflowing SERP truncation
    default: "Toro Movers — Full-Service Orlando Movers · 4.9★",
    template: "%s | Toro Movers",
  },
  // 132 chars
  description:
    "Full-service Orlando movers — truck, crew & packing. Up-front pricing, no hidden fees. Labor-only if you have a truck. Quote in 60s.",
  keywords: [
    "Orlando movers",
    "Central Florida movers",
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
    // No alternateLocale until a real /es URL exists (hreflang gap).
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    // 48 chars
    title: "Toro Movers — Full-Service Movers Orlando · 4.9★",
    // 128 chars
    description:
      "Full-service Central Florida movers with truck & crew. Up-front pricing. Labor-only when you already have a truck. Quote in 60s.",
    // Explicit OG image so it's INHERITED by child routes. The root
    // opengraph-image.tsx only auto-applies to "/" — once a page sets its own
    // openGraph (every city/service page does), it loses the file-based image.
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Toro Movers — Full-service movers across Central Florida · 4.9★",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // 41 chars
    title: "Toro Movers — Full-Service Orlando Movers",
    // 86 chars
    description:
      "Full-service moves with truck & crew. Labor-only secondary. 4.9★ Google. Quote in 60s.",
    images: ["/opengraph-image"],
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
  // AEO: full-service identity first; labor-only is secondary in offers below.
  description:
    "Family-owned full-service moving company in Orlando and Central Florida. Truck, crew, packing, apartment and home moves first. Labor-only loading available as a secondary option. Bilingual. Up-front hourly pricing — quote in 60 seconds.",
  "@id": `${SITE_URL}/#movingcompany`,
  url: SITE_URL,
  telephone: "+16896002720",
  email: EMAIL,
  image: `${SITE_URL}/opengraph-image`,
  // Real brand mark. A raster logo.webp would be ideal for Google's logo
  // guidelines (min 112×112) — swap the URL once one exists.
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
  // Offer order is AEO hierarchy — full-service first, labor-only last.
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full-service moving · crew + truck" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "In-town residential & apartment moves" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Packing & unpacking" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Furniture wrapping & protection" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Storage moves" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Labor-only loading help · secondary option" } },
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
