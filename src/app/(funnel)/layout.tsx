import type { Metadata } from "next";
import Script from "next/script";
import "./gmp.css";
import { UtmCapture } from "@/components/utm-capture";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const SEARCHABLE_SITE_TOKEN =
  process.env.NEXT_PUBLIC_SEARCHABLE_SITE_TOKEN ||
  "pst_18bcf81295a1c8185e489122";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  // Deliberately noindex (paid traffic only), but the URL still gets pasted
  // into texts and DMs — without these it unfurls as a bare link with no card.
  title: "Get your price — Toro Movers",
  description:
    "Tell us the move, get an up-front hourly price. Orlando and Central Florida.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toromovers.com/get-my-price",
    siteName: "Toro Movers",
    title: "Get your price in 60 seconds — Toro Movers",
    description:
      "Tell us the move, get an up-front hourly price. No hidden fees.",
    images: [
      {
        url: "https://toromovers.com/og/get-my-price.jpg",
        width: 1200,
        height: 630,
        alt: "Toro Movers — get your price in 60 seconds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get your price in 60 seconds — Toro Movers",
    description: "Tell us the move, get an up-front hourly price.",
    images: ["https://toromovers.com/og/get-my-price.jpg"],
  },
};

/**
 * Paid funnel shell — no Google fonts, no full-site CSS, no QuoteModal.
 * Analytics load after the page is interactive so the form paints first.
 */
export default function FunnelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Critical path: form + UTM only */}
      <UtmCapture />
      {children}

      {/* Searchable Analytics */}
      <Script id="searchable-queue-funnel" strategy="lazyOnload">
        {`window.sa=window.sa||function(){(sa.q=sa.q||[]).push(arguments)}`}
      </Script>
      <Script
        id="searchable-tracker-funnel"
        src="https://searchable-tracker.searchable.workers.dev/s.js"
        strategy="lazyOnload"
        data-domain="toromovers.com"
        data-site-token={SEARCHABLE_SITE_TOKEN}
      />

      {/* Tracking last — lazy so it doesn't block first paint / TTI */}
      {PIXEL_ID && (
        <Script id="meta-pixel-funnel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="lazyOnload"
          />
          <Script id="ga4-funnel" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA4_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
