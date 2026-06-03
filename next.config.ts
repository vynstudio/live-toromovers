import type { NextConfig } from "next";

// Legacy Meta/PPC landing slugs from the old site, now rebuilt as the dedicated
// paid LP at /ads/meta-orlando-movers (split hero + inline step-1 quote form).
// Previously these 307'd to "/" as a 404 stopgap; now they point at the real ad
// LP so paid traffic keeps message-match and the above-fold form. Still 307
// (temporary) on purpose until Ads Manager Final URLs are updated to the new
// path — then flip to permanent:true (301). Query strings (UTMs/fbclid) are
// preserved. "/orlando-movers" stays out — it is a real indexed SEO city page.
const AD_LP = "/ads/meta-orlando-movers";
const AD_LANDING_PATHS = [
  "/movers-orlando-lp",
  "/loading-help",
  "/lp",
  "/funnel",
  "/move-details",
];

// Older URL pattern (/movers-{city}) from a still-older version of the site.
// 301-redirect to the now-canonical /{city}-movers pages so any backlinks
// pointing at the old pattern transfer link equity.
const CITY_LEGACY_REDIRECTS = [
  { source: "/movers-orlando", destination: "/orlando-movers" },
  { source: "/movers-lake-mary", destination: "/lake-mary-movers" },
  { source: "/movers-winter-park", destination: "/winter-park-movers" },
];

// Legacy content pages from the prior site, now consolidated into homepage
// sections. Redirect (temporary) so old indexed URLs don't 404 — can be
// rebuilt as full pages later (like the /movers-{city} pages) if needed.
// "/thank-you" deliberately removed — it is now a real post-submit landing page
// (see src/app/thank-you/), used as the final funnel-conversion step.
const LEGACY_CONTENT = [
  { source: "/apartment-moves", destination: "/#services" },
  { source: "/home-moves", destination: "/#services" },
  { source: "/commercial-moves", destination: "/#services" },
  { source: "/about", destination: "/#about" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      ...AD_LANDING_PATHS.map((source) => ({
        source,
        destination: AD_LP,
        permanent: false,
      })),
      { source: "/quote-lp/:path*", destination: AD_LP, permanent: false },
      // Quote-intent slug → full wizard (not the ad LP) since intent is explicit.
      { source: "/get-quote", destination: "/quote", permanent: false },
      // Old destinations still live in paused Meta ads (winner "Quote LP"
      // campaign). Without these they 404 on reactivation. Query strings
      // (UTMs/fbclid) are preserved automatically. "/mudanza" is a Spanish ad.
      { source: "/moving", destination: AD_LP, permanent: false },
      { source: "/mudanza", destination: "/es/ads/meta-orlando-movers", permanent: false },
      ...LEGACY_CONTENT.map((r) => ({ ...r, permanent: false })),
      ...CITY_LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true })),
    ];
  },
};

export default nextConfig;