import type { Metadata } from "next";
import Script from "next/script";
import "./gmp.css";
import { UtmCapture } from "@/components/utm-capture";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
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
