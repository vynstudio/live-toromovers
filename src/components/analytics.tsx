import Script from "next/script";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
/** Searchable Analytics browser token (LLM / human visitor correlation) */
const SEARCHABLE_SITE_TOKEN =
  process.env.NEXT_PUBLIC_SEARCHABLE_SITE_TOKEN ||
  "pst_18bcf81295a1c8185e489122";

/** Meta Pixel + GA4 base tags. Each only renders when its env var is set,
 *  so previews / local builds without the IDs stay clean. */
export function Analytics() {
  return (
    <>
      {/* Searchable Analytics — homepage design has this too; needed on SEO pages via hybrid proxy */}
      <Script id="searchable-queue" strategy="beforeInteractive">
        {`window.sa=window.sa||function(){(sa.q=sa.q||[]).push(arguments)}`}
      </Script>
      <Script
        id="searchable-tracker"
        src="https://searchable-tracker.searchable.workers.dev/s.js"
        strategy="afterInteractive"
        data-domain="toromovers.com"
        data-site-token={SEARCHABLE_SITE_TOKEN}
      />

      {PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA4_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
